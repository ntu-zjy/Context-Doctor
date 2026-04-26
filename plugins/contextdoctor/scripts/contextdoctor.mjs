#!/usr/bin/env node

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginRoot = path.resolve(__dirname, '..');

const CATEGORIES = {
  stale_state: {
    label: 'Stale State',
    description: 'Code or file states described in context no longer match reality.'
  },
  conflicting_instructions: {
    label: 'Conflicting Instructions',
    description: 'Requirements across turns contradict each other.'
  },
  tool_noise: {
    label: 'Tool Noise',
    description: 'Failed tool calls, oversized output, stack traces, or command residue.'
  },
  task_drift: {
    label: 'Task Drift',
    description: 'Completed or abandoned subtasks still linger in the active context.'
  },
  hallucinated_facts: {
    label: 'Hallucinated Facts',
    description: 'Previously corrected false claims remain in context.'
  },
  scope_bloat: {
    label: 'Scope Bloat',
    description: 'Large dumps, logs, dependency trees, or unrelated files dominate context.'
  },
  persona_drift: {
    label: 'Persona Drift',
    description: 'Earlier role or constraint injections are inconsistent with the current task.'
  },
  skill_conflict: {
    label: 'Skill Conflict',
    description: 'Loaded skills are unrelated, contradictory, or prescribe incompatible conventions.'
  }
};

const SEVERITIES = {
  critical: { label: 'Critical', penalty: 25 },
  high: { label: 'High', penalty: 15 },
  medium: { label: 'Medium', penalty: 8 },
  low: { label: 'Low', penalty: 3 }
};

const DEFAULT_CONFIG_PATH = path.join(pluginRoot, 'contextdoctor.default.json');

const ADAPTERS = {
  codex: {
    label: 'Codex',
    env: ['CONTEXTDOCTOR_TRANSCRIPT', 'CODEX_TRANSCRIPT', 'CODEX_SESSION_FILE'],
    roots: [
      '~/.codex/sessions',
      '~/.codex/threads',
      '~/.codex'
    ],
    extensions: ['.jsonl', '.json']
  },
  claude: {
    label: 'Claude Code',
    env: ['CONTEXTDOCTOR_TRANSCRIPT', 'CLAUDE_TRANSCRIPT', 'CLAUDECODE_TRANSCRIPT_PATH'],
    roots: [
      '~/.claude/projects',
      '~/.claude'
    ],
    extensions: ['.jsonl', '.json']
  },
  opencode: {
    label: 'OpenCode',
    env: ['CONTEXTDOCTOR_TRANSCRIPT', 'OPENCODE_TRANSCRIPT', 'OPENCODE_SESSION_FILE'],
    roots: [
      '~/.local/share/opencode',
      '~/.config/opencode',
      '~/.cache/opencode'
    ],
    extensions: ['.jsonl', '.json']
  },
  cursor: {
    label: 'Cursor',
    env: ['CONTEXTDOCTOR_TRANSCRIPT', 'CURSOR_TRANSCRIPT', 'CURSOR_TRANSCRIPT_PATH'],
    roots: [
      '~/Library/Application Support/Cursor/User/workspaceStorage',
      '~/.cursor'
    ],
    extensions: ['.jsonl', '.json', '.log']
  }
};

function printHelp() {
  console.log(`Context Doctor

Usage:
  contextdoctor run [--framework=auto] [--scope=recent] [--focus=tool_noise] [--no-open]
  contextdoctor analyze --transcript=session.jsonl [--json]
  contextdoctor render --transcript=session.jsonl --annotations=annotations.json [--no-open]
  contextdoctor locate [--framework=codex]
  contextdoctor prompt [--framework=claude]

Flags:
  --transcript=<path>       Explicit transcript path. Also read from CONTEXTDOCTOR_TRANSCRIPT.
  --framework=<name>        auto, codex, claude, opencode, or cursor. Default: auto.
  --scope=<all|recent>      Inspect the whole transcript or the last recentTurns messages.
  --recent-turns=<number>   Recent scope size. Default comes from config.
  --focus=<category>        Restrict findings to one pollution category.
  --annotations=<path|->    JSON annotations from a model or a previous analyze run.
  --report-dir=<path>       Output directory. Default: ./.contextdoctor
  --output=<path>           Exact HTML output path.
  --config=<path>           Optional config override file.
  --no-open                 Generate HTML without opening a browser.
  --json                    Print machine-readable summary.
`);
}

function parseArgs(argv) {
  const result = { command: 'run', positional: [], flags: {} };
  const commands = new Set(['run', 'analyze', 'render', 'locate', 'prompt', 'help']);
  const args = [...argv];
  if (args[0] && commands.has(args[0])) {
    result.command = args.shift();
  }
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      result.positional.push(arg);
      continue;
    }
    const raw = arg.slice(2);
    if (raw.startsWith('no-')) {
      result.flags[toCamel(raw)] = true;
      continue;
    }
    const eq = raw.indexOf('=');
    if (eq === -1) {
      const key = toCamel(raw);
      const next = args[i + 1];
      if (next && !next.startsWith('--') && expectsValue(key)) {
        result.flags[key] = next;
        i += 1;
      } else {
        result.flags[key] = true;
      }
    } else {
      const key = toCamel(raw.slice(0, eq));
      result.flags[key] = raw.slice(eq + 1);
    }
  }
  return result;
}

function expectsValue(key) {
  return new Set([
    'annotations',
    'config',
    'focus',
    'framework',
    'language',
    'output',
    'recentTurns',
    'reportDir',
    'scope',
    'transcript'
  ]).has(key);
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
}

async function loadConfig(flags = {}) {
  const base = await readJsonIfExists(DEFAULT_CONFIG_PATH);
  const cwdConfig = await firstExistingJson([
    flags.config,
    path.join(process.cwd(), 'contextdoctor.config.json'),
    path.join(process.cwd(), '.contextdoctor', 'config.json')
  ]);
  const merged = deepMerge(base || {}, cwdConfig || {});
  if (flags.recentTurns) merged.recentTurns = Number(flags.recentTurns);
  if (flags.language) merged.reportLanguage = flags.language;
  if (flags.focus) merged.focus = String(flags.focus);
  return merged;
}

async function firstExistingJson(paths) {
  for (const candidate of paths.filter(Boolean)) {
    const file = resolvePath(candidate);
    const parsed = await readJsonIfExists(file);
    if (parsed) return parsed;
  }
  return null;
}

async function readJsonIfExists(file) {
  if (!file) return null;
  try {
    const text = await fsp.readFile(file, 'utf8');
    return JSON.parse(text);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw new Error(`Could not read JSON config ${file}: ${error.message}`);
  }
}

function deepMerge(base, override) {
  if (!override) return structuredCloneCompat(base);
  const output = structuredCloneCompat(base);
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' && !Array.isArray(output[key])) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function structuredCloneCompat(value) {
  return JSON.parse(JSON.stringify(value));
}

function resolvePath(input) {
  if (!input) return input;
  const expanded = expandHome(input);
  return path.isAbsolute(expanded) ? expanded : path.resolve(process.cwd(), expanded);
}

function expandHome(input) {
  if (input === '~') return os.homedir();
  if (input.startsWith('~/')) return path.join(os.homedir(), input.slice(2));
  return input;
}

async function locateTranscript(flags = {}) {
  const explicit = flags.transcript || process.env.CONTEXTDOCTOR_TRANSCRIPT;
  if (explicit) {
    const file = resolvePath(explicit);
    await assertReadableFile(file);
    return { framework: flags.framework || 'explicit', path: file, source: 'explicit' };
  }

  const requested = flags.framework || 'auto';
  const adapterEntries = requested === 'auto'
    ? Object.entries(ADAPTERS)
    : Object.entries(ADAPTERS).filter(([name]) => name === requested);

  if (!adapterEntries.length) {
    throw new Error(`Unknown framework "${requested}". Use one of: ${Object.keys(ADAPTERS).join(', ')}, auto.`);
  }

  for (const [name, adapter] of adapterEntries) {
    for (const envName of adapter.env) {
      const envValue = process.env[envName];
      if (!envValue) continue;
      const file = resolvePath(envValue);
      if (await isReadableFile(file)) {
        return { framework: name, path: file, source: `env:${envName}` };
      }
    }
  }

  const candidates = [];
  for (const [name, adapter] of adapterEntries) {
    for (const root of adapter.roots) {
      const expanded = expandHome(root);
      if (!fs.existsSync(expanded)) continue;
      const files = await findRecentFiles(expanded, adapter.extensions, 2500);
      for (const file of files) {
        candidates.push({ framework: name, path: file, source: `scan:${root}`, score: scoreCandidate(file) });
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  if (!candidates[0]) {
    throw new Error('Could not locate an active transcript. Set CONTEXTDOCTOR_TRANSCRIPT or pass --transcript=<path>.');
  }
  return candidates[0];
}

async function assertReadableFile(file) {
  if (!(await isReadableFile(file))) {
    throw new Error(`Transcript is not readable: ${file}`);
  }
}

async function isReadableFile(file) {
  try {
    const stat = await fsp.stat(file);
    return stat.isFile();
  } catch {
    return false;
  }
}

async function findRecentFiles(root, extensions, limit) {
  const out = [];
  const stack = [root];
  const maxVisited = 9000;
  let visited = 0;
  while (stack.length && visited < maxVisited) {
    const current = stack.pop();
    visited += 1;
    let entries;
    try {
      entries = await fsp.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!shouldSkipDir(entry.name)) stack.push(full);
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
        try {
          const stat = await fsp.stat(full);
          if (stat.size > 0) out.push({ file: full, mtimeMs: stat.mtimeMs, size: stat.size });
        } catch {
          // Ignore files that disappear while scanning.
        }
      }
    }
    out.sort((a, b) => b.mtimeMs - a.mtimeMs);
    if (out.length > limit) out.length = limit;
  }
  return out.map((item) => item.file);
}

function shouldSkipDir(name) {
  return [
    'node_modules',
    '.git',
    'Cache',
    'CachedData',
    'GPUCache',
    'Code Cache'
  ].includes(name);
}

function scoreCandidate(file) {
  const stat = fs.statSync(file);
  const cwd = process.cwd();
  const cwdBits = cwd.split(path.sep).filter(Boolean);
  const basename = path.basename(cwd).toLowerCase();
  const normalizedFile = file.toLowerCase();
  let score = stat.mtimeMs;
  if (basename && normalizedFile.includes(basename)) score += 1000 * 60 * 60 * 24 * 5;
  for (const bit of cwdBits.slice(-3)) {
    if (bit.length > 2 && normalizedFile.includes(bit.toLowerCase())) score += 1000 * 60 * 60;
  }
  return score;
}

async function readTranscript(file) {
  const raw = await fsp.readFile(file, 'utf8');
  const ext = path.extname(file).toLowerCase();
  if (ext === '.jsonl' || looksJsonl(raw)) {
    return parseJsonl(raw, file);
  }
  if (ext === '.log') {
    return parseLog(raw, file);
  }
  return parseJson(raw, file);
}

function looksJsonl(raw) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith('[')) return false;
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 1) return false;
  return lines.slice(0, Math.min(lines.length, 5)).every((line) => line.startsWith('{') && line.endsWith('}'));
}

function parseJsonl(raw, file) {
  const messages = [];
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (!line) continue;
    try {
      const record = JSON.parse(line);
      messages.push(normalizeMessage(record, messages.length, file, i + 1));
    } catch {
      messages.push(normalizeMessage({ role: 'unknown', content: line }, messages.length, file, i + 1));
    }
  }
  return messages;
}

function parseJson(raw, file) {
  const parsed = JSON.parse(raw);
  const records = flattenTranscriptRecords(parsed);
  return records.map((record, index) => normalizeMessage(record, index, file, index + 1));
}

function parseLog(raw, file) {
  return raw.split(/\r?\n/).filter(Boolean).map((line, index) => normalizeMessage({
    role: 'tool_result',
    content: line
  }, index, file, index + 1));
}

function flattenTranscriptRecords(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [{ role: 'unknown', content: String(value ?? '') }];
  for (const key of ['messages', 'turns', 'events', 'items', 'records', 'conversation']) {
    if (Array.isArray(value[key])) return value[key];
  }
  if (value.session && typeof value.session === 'object') return flattenTranscriptRecords(value.session);
  return [value];
}

function normalizeMessage(raw, index, file, sourceLine) {
  const item = raw?.item && typeof raw.item === 'object' ? raw.item : null;
  const message = raw?.message && typeof raw.message === 'object' ? raw.message : null;
  const id = String(raw?.id || message?.id || item?.id || raw?.uuid || `msg_${String(index + 1).padStart(4, '0')}`);
  const kind = normalizeKind(raw, message, item);
  const role = normalizeRole(raw, message, item, kind);
  const text = extractText(raw);
  const timestamp = parseTimestamp(raw?.timestamp || raw?.created_at || raw?.createdAt || raw?.time || message?.timestamp || item?.timestamp);
  const toolName = raw?.tool_name || raw?.toolName || raw?.name || item?.name || raw?.function?.name || raw?.tool?.name || null;
  const status = raw?.status || raw?.exit_code || raw?.exitCode || raw?.error?.code || null;
  return {
    id,
    role,
    kind,
    sourceLine,
    timestamp,
    toolName,
    status: status == null ? null : String(status),
    charCount: text.length,
    tokenEstimate: Math.ceil(text.length / 4),
    text,
    source: path.basename(file)
  };
}

function normalizeKind(raw, message, item) {
  const candidates = [
    raw?.kind,
    raw?.type,
    raw?.event,
    raw?.role,
    message?.type,
    message?.role,
    item?.type,
    item?.role
  ].filter(Boolean).map((value) => String(value).toLowerCase());
  const joined = candidates.join(' ');
  if (/tool[_-]?call|function[_-]?call|command_call|exec_call/.test(joined)) return 'tool_call';
  if (/tool[_-]?result|tool[_-]?response|function[_-]?output|command_result|exec_result/.test(joined)) return 'tool_result';
  if (joined.includes('assistant')) return 'assistant';
  if (joined.includes('user')) return 'user';
  if (joined.includes('system')) return 'system';
  if (joined.includes('tool')) return 'tool_result';
  return 'message';
}

function normalizeRole(raw, message, item, kind) {
  if (kind === 'tool_call' || kind === 'tool_result') return kind;
  const role = String(raw?.role || message?.role || item?.role || '').toLowerCase();
  if (['user', 'assistant', 'system'].includes(role)) return role;
  if (role === 'tool') return 'tool_result';
  return kind === 'message' ? 'unknown' : kind;
}

function extractText(value, depth = 0, seen = new WeakSet()) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (depth > 7) return '';
  if (typeof value !== 'object') return '';
  if (seen.has(value)) return '';
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((entry) => extractText(entry, depth + 1, seen)).filter(Boolean).join('\n');
  }

  const priorityKeys = [
    'text',
    'content',
    'message',
    'output',
    'result',
    'error',
    'stderr',
    'stdout',
    'arguments',
    'input',
    'summary'
  ];
  const chunks = [];
  for (const key of priorityKeys) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      chunks.push(extractText(value[key], depth + 1, seen));
    }
  }
  if (chunks.some(Boolean)) return chunks.filter(Boolean).join('\n');

  if (depth === 0) {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return '';
}

function parseTimestamp(value) {
  if (!value) return null;
  if (typeof value === 'number') {
    const ms = value < 10_000_000_000 ? value * 1000 : value;
    return new Date(ms).toISOString();
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function scopeMessages(messages, flags, config) {
  const scope = String(flags.scope || 'all');
  if (scope === 'all') return messages;
  if (scope.startsWith('recent')) {
    const fromScope = scope.includes(':') ? Number(scope.split(':')[1]) : null;
    const count = Number(flags.recentTurns || fromScope || config.recentTurns || 50);
    return messages.slice(-Math.max(1, count));
  }
  return messages;
}

function analyzeMessages(messages, config = {}, flags = {}) {
  const watched = new Set(config.watchedDimensions || Object.keys(CATEGORIES));
  const focus = flags.focus || config.focus;
  if (focus) {
    watched.clear();
    watched.add(String(focus));
  }
  const findings = [];
  const add = (finding) => {
    if (!watched.has(finding.type)) return;
    findings.push(finding);
  };

  detectToolNoise(messages, config, add);
  detectScopeBloat(messages, config, add);
  detectTaskDrift(messages, add);
  detectConflictingInstructions(messages, add);
  detectStaleState(messages, add);
  detectHallucinatedFacts(messages, add);
  detectPersonaDrift(messages, add);
  detectSkillConflict(messages, add);

  const deduped = dedupeFindings(findings);
  return applyFindingLimits(deduped, config);
}

function makeFinding(message, type, severity, reason, fix, evidence = null) {
  return {
    turn_id: message.id,
    type,
    severity,
    reason,
    fix,
    evidence: evidence || compactEvidence(message.text),
    sourceLine: message.sourceLine
  };
}

function compactEvidence(text) {
  return String(text || '').replace(/\s+/g, ' ').trim().slice(0, 280);
}

function detectToolNoise(messages, config, add) {
  const longToolOutputChars = Number(config.longToolOutputChars || 12000);
  const failurePattern = /(traceback|exception|command failed|exit code[:=\s]+[1-9]|enoent|eacces|syntaxerror|typeerror|referenceerror|failed with|non-zero|segmentation fault|panic:)/i;
  for (const message of messages) {
    if (!['tool_result', 'tool_call'].includes(message.kind) && message.role !== 'tool_result') continue;
    const text = message.text || '';
    if (failurePattern.test(text) || /^[1-9]\d*$/.test(String(message.status || ''))) {
      const severity = /traceback|panic|segmentation fault|exit code[:=\s]+(127|126)|eacces|enoent/i.test(text) ? 'high' : 'medium';
      add(makeFinding(
        message,
        'tool_noise',
        severity,
        'A failed or noisy tool result remains in the active context and can anchor future reasoning on error residue.',
        'Restate the current known-good state and ignore the failed command output unless it is still the active debugging target.'
      ));
    } else if (text.length > longToolOutputChars) {
      add(makeFinding(
        message,
        'tool_noise',
        'medium',
        `This tool output is ${text.length.toLocaleString()} characters, which is large enough to distract later reasoning.`,
        'Collapse or summarize the command output; keep only the few lines needed for the current task.'
      ));
    }
  }
}

function detectScopeBloat(messages, config, add) {
  const scopeBloatChars = Number(config.scopeBloatChars || 20000);
  const dependencyDump = /(node_modules\/|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|dist\/|build\/|coverage\/|vendor\/)/i;
  for (const message of messages) {
    const text = message.text || '';
    if (text.length > scopeBloatChars) {
      add(makeFinding(
        message,
        'scope_bloat',
        message.kind === 'tool_result' ? 'medium' : 'low',
        `A ${text.length.toLocaleString()} character message is likely bloating the useful working context.`,
        'Replace the dump with a focused summary or rerun a narrower command that returns only relevant lines.'
      ));
    } else if (dependencyDump.test(text) && text.split(/\r?\n/).length > 60) {
      add(makeFinding(
        message,
        'scope_bloat',
        'medium',
        'The context includes a large generated or dependency-tree listing that is unlikely to be useful for the current task.',
        'Summarize the dependency signal and drop the raw tree from the working handoff.'
      ));
    }
  }
}

function detectTaskDrift(messages, add) {
  const driftPattern = /(switch(ing)? tasks?|new task|different task|never mind|ignore (the )?(previous|above)|start over|instead\b|actually\b|unrelated)/i;
  for (let i = 2; i < messages.length; i += 1) {
    const message = messages[i];
    if (message.role !== 'user') continue;
    if (!driftPattern.test(message.text || '')) continue;
    add(makeFinding(
      message,
      'task_drift',
      /ignore|start over|never mind/i.test(message.text) ? 'medium' : 'low',
      'This turn appears to redirect the session, leaving earlier task details available to interfere with the new objective.',
      'Begin the next response with a compact restatement of the current task and explicitly mark prior subtasks as out of scope.'
    ));
  }
}

function detectConflictingInstructions(messages, add) {
  const seen = [];
  const patterns = [
    { key: 'tests', positive: /\b(run|add|write|create)\b[^.\n]{0,40}\btests?\b/i, negative: /\b(no|skip|without|do not|don't|never)\b[^.\n]{0,40}\btests?\b/i },
    { key: 'web', positive: /\b(search|browse|look up|use web|internet)\b/i, negative: /\b(no web|offline|do not browse|don't browse|without browsing|never search)\b/i },
    { key: 'edits', positive: /\b(edit|modify|change|patch|write)\b/i, negative: /\b(read-only|do not edit|don't edit|no changes|do not modify)\b/i },
    { key: 'open_report', positive: /\b(open|auto-open|launch)\b[^.\n]{0,40}\b(browser|report|html)\b/i, negative: /\bno-open|do not open|don't open\b/i }
  ];
  for (const message of messages) {
    if (!['user', 'system'].includes(message.role)) continue;
    const text = message.text || '';
    for (const pattern of patterns) {
      const polarity = pattern.negative.test(text) ? 'negative' : pattern.positive.test(text) ? 'positive' : null;
      if (!polarity) continue;
      const previous = seen.find((entry) => entry.key === pattern.key && entry.polarity !== polarity);
      if (previous) {
        add(makeFinding(
          message,
          'conflicting_instructions',
          message.role === 'system' || previous.role === 'system' ? 'critical' : 'high',
          `This ${polarity} instruction about ${pattern.key} conflicts with an earlier ${previous.polarity} instruction.`,
          'Ask for or state the currently binding instruction before continuing; discard the superseded requirement from the working summary.'
        ));
      }
      seen.push({ key: pattern.key, polarity, role: message.role });
    }
    for (const match of text.matchAll(/\b(?:do not|don't|never)\s+(?:use|run|call)\s+([a-z0-9_.:/-]+)/gi)) {
      seen.push({ key: `tool:${match[1].toLowerCase()}`, polarity: 'negative', role: message.role });
    }
    for (const match of text.matchAll(/\b(?:use|run|call)\s+([a-z0-9_.:/-]+)/gi)) {
      const key = `tool:${match[1].toLowerCase()}`;
      const previous = seen.find((entry) => entry.key === key && entry.polarity === 'negative');
      if (previous) {
        add(makeFinding(
          message,
          'conflicting_instructions',
          'high',
          `A later instruction asks to use ${match[1]}, but an earlier instruction prohibited it.`,
          'Clarify whether the newer tool instruction supersedes the older prohibition before acting on it.'
        ));
      }
      seen.push({ key, polarity: 'positive', role: message.role });
    }
  }
}

function detectStaleState(messages, add) {
  const cwd = process.cwd();
  const pathPattern = /`([^`]+\.[a-zA-Z0-9]{1,8})`|\b((?:\.{1,2}\/|\/)?(?:[\w.-]+\/)+[\w.-]+\.[a-zA-Z0-9]{1,8})\b/g;
  const stalePhrase = /\b(file|path|module|script|component|config|currently|latest|contains|exists|opened|read)\b/i;
  const missingFilePattern = /(no such file or directory|cannot find module|file not found|path does not exist|not found)/i;
  let emitted = 0;
  for (const message of messages) {
    const text = message.text || '';
    if (missingFilePattern.test(text)) {
      add(makeFinding(
        message,
        'stale_state',
        message.kind === 'tool_result' ? 'medium' : 'low',
        'The context contains a missing-file or missing-module result, which can keep steering the session toward stale paths.',
        'Replace the stale path assumption with a fresh file listing or explicit current path.'
      ));
      continue;
    }
    if (!stalePhrase.test(text) || emitted >= 5) continue;
    for (const match of text.matchAll(pathPattern)) {
      const rawPath = (match[1] || match[2] || '').trim();
      if (!rawPath || rawPath.includes('://') || rawPath.includes('node_modules/')) continue;
      const file = path.isAbsolute(rawPath) ? rawPath : path.resolve(cwd, rawPath);
      if (!fs.existsSync(file)) {
        emitted += 1;
        add(makeFinding(
          message,
          'stale_state',
          'medium',
          `The context references ${rawPath}, but that path is not present on disk from the current workspace.`,
          'Refresh the file map and restate the correct path before relying on this turn.'
        ));
        break;
      }
      if (message.timestamp && /\b(current|currently|latest|now)\b/i.test(text)) {
        try {
          const mtime = fs.statSync(file).mtime.getTime();
          const msgTime = new Date(message.timestamp).getTime();
          if (mtime > msgTime + 5 * 60 * 1000) {
            emitted += 1;
            add(makeFinding(
              message,
              'stale_state',
              'low',
              `${rawPath} changed after this message described it as current.`,
              'Re-read the file before making decisions based on this earlier description.'
            ));
            break;
          }
        } catch {
          // Ignore race conditions and unreadable files.
        }
      }
    }
  }
}

function detectHallucinatedFacts(messages, add) {
  const correctionByUser = /(that's wrong|that is wrong|not true|you made that up|hallucinated|actually[, ]+.*(wrong|not)|there is no|does not exist|doesn't exist|you misread)/i;
  const correctionByAssistant = /(i was wrong|you're right|you are right|my mistake|i incorrectly|i misread|i hallucinated)/i;
  for (const message of messages) {
    const text = message.text || '';
    if (message.role === 'user' && correctionByUser.test(text)) {
      add(makeFinding(
        message,
        'hallucinated_facts',
        'high',
        'The user corrected a false or invented claim, and that incorrect claim may still remain nearby in context.',
        'Carry forward the correction explicitly and avoid citing the corrected claim again.'
      ));
    } else if (message.role === 'assistant' && correctionByAssistant.test(text)) {
      add(makeFinding(
        message,
        'hallucinated_facts',
        'medium',
        'The assistant acknowledged a prior factual error that can still contaminate future reasoning.',
        'Summarize the corrected fact in one sentence and ignore the earlier mistaken statement.'
      ));
    }
  }
}

function detectPersonaDrift(messages, add) {
  const currentTask = lastUserText(messages);
  const personaPattern = /(act as|pretend to be|roleplay|you are now|ignore (all|previous) instructions|persona|jailbreak|DAN\b|always answer as)/i;
  const early = messages.slice(0, Math.min(20, messages.length));
  for (const message of early) {
    if (!['user', 'system'].includes(message.role)) continue;
    const text = message.text || '';
    if (!personaPattern.test(text)) continue;
    if (overlapsMeaningfully(text, currentTask)) continue;
    add(makeFinding(
      message,
      'persona_drift',
      /ignore (all|previous) instructions|jailbreak|DAN\b/i.test(text) ? 'medium' : 'low',
      'An early persona or role constraint appears unrelated to the current task but remains in the active context.',
      'Restate the current operating mode and disregard the old persona constraint unless the user renews it.'
    ));
  }
}

function detectSkillConflict(messages, add) {
  const currentTask = lastUserText(messages);
  const skillMentions = [];
  const skillPattern = /\b(?:using|loaded|load|use)\s+(?:the\s+)?([a-z0-9_.-]+)\s+skill\b|\/skills\/([a-z0-9_.-]+)\/SKILL\.md|skills\/([a-z0-9_.-]+)\/SKILL\.md/gi;
  for (const message of messages) {
    for (const match of (message.text || '').matchAll(skillPattern)) {
      const name = (match[1] || match[2] || match[3] || '').toLowerCase();
      if (name && !skillMentions.some((entry) => entry.name === name && entry.turn_id === message.id)) {
        skillMentions.push({ name, message });
      }
    }
    if (/(skill conflict|conflicting skills|contradict(?:s|ory)? .*skill|different conventions)/i.test(message.text || '')) {
      add(makeFinding(
        message,
        'skill_conflict',
        'medium',
        'This turn explicitly mentions skill-level conflict or incompatible conventions.',
        'Choose the single skill that matches the current task and state which skill instructions are superseded.'
      ));
    }
  }
  if (skillMentions.length <= 1) return;
  const unrelated = skillMentions.filter((entry) => !skillRelevantToTask(entry.name, currentTask));
  if (unrelated.length >= 2) {
    const target = unrelated.at(-1).message;
    add(makeFinding(
      target,
      'skill_conflict',
      unrelated.length > 3 ? 'medium' : 'low',
      `${unrelated.length} loaded skills appear weakly related to the current task.`,
      'Name the one active skill, if any, and treat the others as historical context rather than current instructions.',
      unrelated.map((entry) => entry.name).join(', ')
    ));
  }
}

function lastUserText(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === 'user') return messages[i].text || '';
  }
  return '';
}

function overlapsMeaningfully(a, b) {
  const wordsA = significantWords(a);
  const wordsB = significantWords(b);
  if (!wordsA.size || !wordsB.size) return false;
  let hits = 0;
  for (const word of wordsA) if (wordsB.has(word)) hits += 1;
  return hits >= 3;
}

function significantWords(text) {
  const stop = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'you', 'are', 'from', 'have', 'into', 'your', 'when', 'then', 'than', 'will', 'just']);
  return new Set(String(text || '').toLowerCase().match(/[a-z][a-z0-9_-]{3,}/g)?.filter((word) => !stop.has(word)) || []);
}

function skillRelevantToTask(skill, task) {
  const lower = String(task || '').toLowerCase();
  const map = {
    pdf: ['pdf', 'document', 'paper'],
    playwright: ['browser', 'ui', 'web', 'screenshot', 'playwright', 'page'],
    'playwright-interactive': ['browser', 'ui', 'web', 'screenshot', 'playwright', 'page'],
    'vercel-deploy': ['deploy', 'vercel', 'preview', 'live'],
    'plugin-creator': ['plugin', 'marketplace', 'codex', 'slash command'],
    'skill-creator': ['skill', 'SKILL.md'.toLowerCase()],
    'skill-installer': ['install skill', 'curated skill'],
    imagegen: ['image', 'generate', 'picture', 'illustration']
  };
  const keywords = map[skill] || skill.split(/[-_.]/).filter((part) => part.length > 3);
  return keywords.some((keyword) => lower.includes(keyword));
}

function dedupeFindings(findings) {
  const severityRank = { critical: 4, high: 3, medium: 2, low: 1 };
  const byKey = new Map();
  for (const finding of findings) {
    const normalized = normalizeFinding(finding);
    const key = `${normalized.turn_id}:${normalized.type}`;
    const previous = byKey.get(key);
    if (!previous || severityRank[normalized.severity] > severityRank[previous.severity]) {
      byKey.set(key, normalized);
    }
  }
  return [...byKey.values()];
}

function applyFindingLimits(findings, config) {
  const limit = Number(config.maxFindingsPerCategory || 12);
  const counts = new Map();
  return findings.filter((finding) => {
    const next = (counts.get(finding.type) || 0) + 1;
    counts.set(finding.type, next);
    return next <= limit;
  });
}

function normalizeFinding(finding) {
  const type = CATEGORIES[finding.type] ? finding.type : 'tool_noise';
  const severity = SEVERITIES[finding.severity] ? finding.severity : 'low';
  return {
    turn_id: String(finding.turn_id || finding.id || ''),
    type,
    severity,
    reason: String(finding.reason || 'Flagged by Context Doctor.'),
    fix: String(finding.fix || 'Restate the current source of truth before continuing.'),
    evidence: finding.evidence ? String(finding.evidence) : '',
    sourceLine: finding.sourceLine || null
  };
}

function buildAnnotations(findings, config) {
  const normalizedFindings = findings.map(normalizeFinding).filter((finding) => finding.turn_id);
  const score = computeScore(normalizedFindings, config);
  return {
    score,
    tier: tierForScore(score, config),
    findings: normalizedFindings
  };
}

function computeScore(findings, config = {}) {
  const penalties = config.severityPenalty || {};
  const total = findings.reduce((sum, finding) => {
    return sum + Number(penalties[finding.severity] ?? SEVERITIES[finding.severity]?.penalty ?? 0);
  }, 0);
  return Math.max(0, 100 - total);
}

function tierForScore(score, config = {}) {
  const thresholds = config.tierThresholds || {};
  if (score >= Number(thresholds.healthy ?? 80)) return 'healthy';
  if (score >= Number(thresholds.caution ?? 50)) return 'caution';
  return 'critical';
}

async function readAnnotations(flags, findings, config) {
  if (!flags.annotations) return buildAnnotations(findings, config);
  const source = String(flags.annotations).trim();
  const raw = source === '-' ? await readStdin() : await fsp.readFile(resolvePath(source), 'utf8');
  const parsed = JSON.parse(raw);
  const candidateFindings = Array.isArray(parsed) ? parsed : parsed.findings || [];
  return buildAnnotations(candidateFindings, config);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => data += chunk);
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

function summarize(messages, annotations, locator, flags, config) {
  const findingByTurn = new Map(annotations.findings.map((finding) => [finding.turn_id, finding]));
  const countsByCategory = Object.fromEntries(Object.keys(CATEGORIES).map((key) => [key, 0]));
  const countsBySeverity = Object.fromEntries(Object.keys(SEVERITIES).map((key) => [key, 0]));
  for (const finding of annotations.findings) {
    countsByCategory[finding.type] = (countsByCategory[finding.type] || 0) + 1;
    countsBySeverity[finding.severity] = (countsBySeverity[finding.severity] || 0) + 1;
  }
  return {
    version: '0.1.0',
    generatedAt: new Date().toISOString(),
    cwd: process.cwd(),
    framework: locator.framework,
    frameworkLabel: ADAPTERS[locator.framework]?.label || locator.framework,
    transcriptPath: locator.path,
    transcriptSource: locator.source,
    reportLanguage: config.reportLanguage || 'en',
    scope: flags.scope || 'all',
    focus: flags.focus || config.focus || null,
    score: annotations.score,
    tier: annotations.tier,
    countsByCategory,
    countsBySeverity,
    categories: CATEGORIES,
    severities: SEVERITIES,
    messages: messages.map((message) => ({
      ...message,
      finding: findingByTurn.get(message.id) || null
    }))
  };
}

async function renderReport(messages, annotations, locator, flags, config) {
  const reportData = summarize(messages, annotations, locator, flags, config);
  const templatePath = path.join(pluginRoot, 'assets', 'report-template.html');
  const template = await fsp.readFile(templatePath, 'utf8');
  const html = template.replace('__CONTEXT_DOCTOR_DATA__', safeJsonForHtml(reportData));
  const output = resolveOutputPath(flags);
  await fsp.mkdir(path.dirname(output), { recursive: true });
  await fsp.writeFile(output, html, 'utf8');
  if (!flags.noOpen && config.autoOpen !== false) {
    await openInBrowser(output).catch(() => null);
  }
  return { ...reportData, outputPath: output };
}

function safeJsonForHtml(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/-->/g, '--\\u003e');
}

function resolveOutputPath(flags) {
  if (flags.output) return resolvePath(flags.output);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportDir = flags.reportDir ? resolvePath(flags.reportDir) : path.join(process.cwd(), '.contextdoctor');
  return path.join(reportDir, `report-${stamp}.html`);
}

function openInBrowser(file) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', file] : [file];
  return new Promise((resolve, reject) => {
    execFile(command, args, (error) => error ? reject(error) : resolve());
  });
}

function printSummary(summary, asJson = false) {
  const compact = {
    score: summary.score,
    tier: summary.tier,
    findings: summary.messages.filter((message) => message.finding).length,
    outputPath: summary.outputPath,
    transcriptPath: summary.transcriptPath,
    framework: summary.framework
  };
  if (asJson) {
    console.log(JSON.stringify(compact, null, 2));
    return;
  }
  console.log(`Context Doctor: ${compact.score}/100 (${compact.tier})`);
  console.log(`Findings: ${compact.findings}`);
  console.log(`Report: ${compact.outputPath}`);
  console.log(`Transcript: ${compact.transcriptPath}`);
}

function buildModelPrompt(flags = {}) {
  const framework = flags.framework || 'auto';
  const focusLine = flags.focus ? `Focus only on "${flags.focus}".` : 'Evaluate all eight categories.';
  const sampleType = CATEGORIES[flags.focus] ? flags.focus : 'tool_noise';
  return `You are Context Doctor. Diagnose only the current conversation context already visible to you.

Do not emit a full HTML report and do not quote the raw transcript. Emit compact JSON annotations only.

Categories:
${Object.entries(CATEGORIES).map(([key, value]) => `- ${key}: ${value.description}`).join('\n')}

Severity:
- critical: likely to cause outright task failure
- high: already degrading output quality
- medium: manageable now, will compound in long sessions
- low: advisory; no current impact

${focusLine}

Return this exact JSON shape:
{
  "findings": [
    {
      "turn_id": "msg_0042",
      "type": "${sampleType}",
      "severity": "medium",
      "reason": "Short diagnostic reasoning.",
      "fix": "Directly executable remediation."
    }
  ]
}

After producing annotations, render locally with:
contextdoctor render --framework=${framework} --annotations=<annotations.json>${flags.noOpen ? ' --no-open' : ''}
`;
}

async function main(argv = process.argv.slice(2)) {
  const { command, flags } = parseArgs(argv);
  if (command === 'help' || flags.help) {
    printHelp();
    return;
  }
  if (command === 'prompt') {
    console.log(buildModelPrompt(flags));
    return;
  }

  const config = await loadConfig(flags);
  const locator = await locateTranscript(flags);

  if (command === 'locate') {
    const payload = { framework: locator.framework, source: locator.source, transcriptPath: locator.path };
    console.log(flags.json ? JSON.stringify(payload, null, 2) : locator.path);
    return;
  }

  const allMessages = await readTranscript(locator.path);
  const messages = scopeMessages(allMessages, flags, config);
  const findings = command === 'render' && flags.annotations
    ? []
    : analyzeMessages(messages, config, flags);
  const annotations = await readAnnotations(flags, findings, config);

  if (command === 'analyze' && !flags.render) {
    const payload = { ...annotations, transcriptPath: locator.path, framework: locator.framework };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const summary = await renderReport(messages, annotations, locator, flags, config);
  printSummary(summary, flags.json);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  main().catch((error) => {
    console.error(`Context Doctor error: ${error.message}`);
    process.exitCode = 1;
  });
}

export {
  ADAPTERS,
  CATEGORIES,
  SEVERITIES,
  analyzeMessages,
  buildAnnotations,
  buildModelPrompt,
  computeScore,
  loadConfig,
  locateTranscript,
  normalizeMessage,
  readTranscript,
  renderReport,
  scopeMessages,
  tierForScore
};
