import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  analyzeMessages,
  buildAnnotations,
  computeScore,
  loadConfig,
  readTranscript,
  renderReport,
  scopeMessages,
  tierForScore
} from '../plugins/contextdoctor/scripts/contextdoctor.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('parses JSONL transcripts and detects all required pollution families in a polluted fixture', async () => {
  const config = await loadConfig({});
  const transcript = path.join(repoRoot, 'fixtures', 'polluted-session.jsonl');
  const messages = await readTranscript(transcript);
  const findings = analyzeMessages(messages, config, {});
  const types = new Set(findings.map((finding) => finding.type));

  assert.equal(messages.length, 10);
  assert.ok(types.has('conflicting_instructions'));
  assert.ok(types.has('task_drift'));
  assert.ok(types.has('skill_conflict'));
  assert.ok(types.has('tool_noise'));
  assert.ok(types.has('stale_state'));
  assert.ok(types.has('hallucinated_facts'));
  assert.ok(types.has('scope_bloat'));
  assert.ok(types.has('persona_drift'));
});

test('keeps clean sessions above healthy threshold', async () => {
  const config = await loadConfig({});
  const transcript = path.join(repoRoot, 'fixtures', 'clean-session.jsonl');
  const messages = await readTranscript(transcript);
  const findings = analyzeMessages(messages, config, {});
  const annotations = buildAnnotations(findings, config);

  assert.equal(findings.length, 0);
  assert.equal(annotations.tier, 'healthy');
  assert.equal(annotations.score, 100);
});

test('computes scores from configured severity penalties', async () => {
  const config = await loadConfig({});
  const score = computeScore([
    { severity: 'critical' },
    { severity: 'high' },
    { severity: 'medium' },
    { severity: 'low' }
  ], config);

  assert.equal(score, 49);
  assert.equal(tierForScore(score, config), 'critical');
});

test('recent scope limits inspected messages', async () => {
  const config = await loadConfig({});
  const messages = Array.from({ length: 100 }, (_, index) => ({
    id: `msg_${index}`,
    role: 'user',
    kind: 'user',
    text: `message ${index}`
  }));

  const scoped = scopeMessages(messages, { scope: 'recent', recentTurns: 12 }, config);
  assert.equal(scoped.length, 12);
  assert.equal(scoped[0].id, 'msg_88');
});

test('parses pretty JSON transcript objects without treating them as JSONL', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'contextdoctor-json-'));
  const transcript = path.join(dir, 'session.json');
  await fs.writeFile(transcript, JSON.stringify({
    messages: [
      { id: 'a', role: 'user', content: 'hello' },
      { id: 'b', role: 'assistant', content: 'hi' }
    ]
  }, null, 2));

  const messages = await readTranscript(transcript);
  assert.equal(messages.length, 2);
  assert.equal(messages[0].id, 'a');
  assert.equal(messages[1].role, 'assistant');
});

test('renders self-contained HTML report', async () => {
  const config = await loadConfig({});
  const transcript = path.join(repoRoot, 'fixtures', 'polluted-session.jsonl');
  const messages = await readTranscript(transcript);
  const findings = analyzeMessages(messages, config, {});
  const annotations = buildAnnotations(findings, config);
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'contextdoctor-'));

  const summary = await renderReport(messages, annotations, {
    framework: 'codex',
    path: transcript,
    source: 'test'
  }, {
    noOpen: true,
    output: path.join(dir, 'report.html')
  }, config);

  const html = await fs.readFile(summary.outputPath, 'utf8');
  assert.match(html, /Context Doctor Report/);
  assert.match(html, /__CONTEXT_DOCTOR_DATA__|msg_0006/);
  assert.match(html, /id="languageSelect"/);
  assert.match(html, /简体中文/);
  assert.equal(summary.score, annotations.score);
});
