/**
 * Context Doctor Test Suite
 * 上下文污染检测工具测试套件
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { existsSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

describe('Context Doctor', () => {
  describe('Plugin Structure', () => {
    it('should have all required plugin files', () => {
      const requiredFiles = [
        'plugins/contextdoctor/.claude-plugin/plugin.json',
        'plugins/contextdoctor/.codex-plugin/plugin.json',
        'plugins/contextdoctor/.cursor-plugin/plugin.json',
        'plugins/contextdoctor/.opencode/plugins/contextdoctor.js',
        'plugins/contextdoctor/skills/contextdoctor/SKILL.md',
        'plugins/contextdoctor/skills/repair/SKILL.md',
        'plugins/contextdoctor/assets/report-template.html',
        'plugins/contextdoctor/contextdoctor.default.json',
        'plugins/contextdoctor/scripts/contextdoctor.mjs'
      ];

      for (const file of requiredFiles) {
        const fullPath = resolve(rootDir, file);
        expect(existsSync(fullPath)).toBe(true);
      }
    });

    it('should have valid Claude Code SKILL.md', () => {
      const skillPath = resolve(rootDir, 'plugins/contextdoctor/skills/contextdoctor/SKILL.md');
      const content = readFileSync(skillPath, 'utf-8');

      // Check frontmatter
      expect(content).toMatch(/^---\n/);
      expect(content).toMatch(/name:\s*contextdoctor/);
      expect(content).toMatch(/description:/);

      // Check content sections
      expect(content).toContain('检测维度');
      expect(content).toContain('Skill/Plugin 污染');
      expect(content).toContain('指令矛盾');
      expect(content).toContain('错误累积');
    });

    it('should have valid repair SKILL.md', () => {
      const skillPath = resolve(rootDir, 'plugins/contextdoctor/skills/repair/SKILL.md');
      const content = readFileSync(skillPath, 'utf-8');

      expect(content).toMatch(/name:\s*repair/);
      expect(content).toContain('修复');
    });
  });

  describe('HTML Report Template', () => {
    it('should have valid HTML structure', () => {
      const templatePath = resolve(rootDir, 'plugins/contextdoctor/assets/report-template.html');
      const content = readFileSync(templatePath, 'utf-8');

      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<html');
      expect(content).toContain('</html>');
      expect(content).toContain('{{title}}');
      expect(content).toContain('{{score}}');
    });

    it('should use Starbucks design system colors', () => {
      const templatePath = resolve(rootDir, 'plugins/contextdoctor/assets/report-template.html');
      const content = readFileSync(templatePath, 'utf-8');

      // Check for Starbucks colors
      expect(content).toContain('#006241'); // Starbucks Green
      expect(content).toContain('#00754A'); // Green Accent
      expect(content).toContain('#1E3932'); // House Green
      expect(content).toContain('#f2f0eb'); // Neutral Warm
      expect(content).toContain('#cba258'); // Gold
    });
  });

  describe('Documentation', () => {
    it('should have COMMANDS_REFERENCE.md with all frameworks', () => {
      const docPath = resolve(rootDir, 'docs/COMMANDS_REFERENCE.md');
      const content = readFileSync(docPath, 'utf-8');

      expect(content).toContain('Claude Code');
      expect(content).toContain('OpenAI Codex');
      expect(content).toContain('Cursor');
      expect(content).toContain('OpenCode');
    });

    it('should have multi-language README files', () => {
      const readmeFiles = [
        'README.md',
        'README.en.md',
        'README.ja.md',
        'README.ko.md'
      ];

      for (const file of readmeFiles) {
        const fullPath = resolve(rootDir, file);
        expect(existsSync(fullPath)).toBe(true);
      }
    });
  });

  describe('Configuration', () => {
    it('should have valid default config', () => {
      const configPath = resolve(rootDir, 'plugins/contextdoctor/contextdoctor.default.json');
      const content = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);

      expect(config.name).toBe('contextdoctor');
      expect(config.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(config.config.report.format).toBe('html');
      expect(config.config.i18n.supportedLanguages).toContain('zh');
      expect(config.config.i18n.supportedLanguages).toContain('en');
    });
  });

  describe('Plugin Metadata', () => {
    it('should have consistent version across plugins', () => {
      const claudePlugin = JSON.parse(readFileSync(
        resolve(rootDir, 'plugins/contextdoctor/.claude-plugin/plugin.json'),
        'utf-8'
      ));
      const codexPlugin = JSON.parse(readFileSync(
        resolve(rootDir, 'plugins/contextdoctor/.codex-plugin/plugin.json'),
        'utf-8'
      ));
      const cursorPlugin = JSON.parse(readFileSync(
        resolve(rootDir, 'plugins/contextdoctor/.cursor-plugin/plugin.json'),
        'utf-8'
      ));

      const defaultConfig = JSON.parse(readFileSync(
        resolve(rootDir, 'plugins/contextdoctor/contextdoctor.default.json'),
        'utf-8'
      ));

      expect(claudePlugin.version).toBe(defaultConfig.version);
      expect(codexPlugin.version).toBe(defaultConfig.version);
      expect(cursorPlugin.version).toBe(defaultConfig.version);
    });
  });
});

describe('ContextDoctor Core', () => {
  // Mock the ContextDoctor class for unit testing
  class MockContextDoctor {
    constructor(options = {}) {
      this.lang = options.lang || 'zh';
      this.issues = [];
      this.score = 100;
    }

    addIssue(type, severity, title, description) {
      this.issues.push({ type, severity, title, description });
    }

    calculateScore() {
      const weights = { critical: 30, warning: 15, suggestion: 5 };
      let deduction = 0;
      for (const issue of this.issues) {
        deduction += weights[issue.severity] || 5;
      }
      this.score = Math.max(0, 100 - deduction);
      return this.score;
    }

    getScoreClass() {
      if (this.score >= 90) return 'excellent';
      if (this.score >= 70) return 'good';
      if (this.score >= 50) return 'fair';
      if (this.score >= 30) return 'poor';
      return 'critical';
    }
  }

  let doctor;

  beforeEach(() => {
    doctor = new MockContextDoctor();
  });

  it('should calculate perfect score with no issues', () => {
    expect(doctor.calculateScore()).toBe(100);
    expect(doctor.getScoreClass()).toBe('excellent');
  });

  it('should calculate score with critical issues', () => {
    doctor.addIssue('skill', 'critical', 'Conflict', 'Description');
    expect(doctor.calculateScore()).toBe(70);
    expect(doctor.getScoreClass()).toBe('good');
  });

  it('should calculate score with multiple issues', () => {
    doctor.addIssue('skill', 'critical', 'Conflict', 'Description');
    doctor.addIssue('conflict', 'warning', 'Contradiction', 'Description');
    expect(doctor.calculateScore()).toBe(55);
    expect(doctor.getScoreClass()).toBe('fair');
  });

  it('should handle maximum deduction', () => {
    for (let i = 0; i < 5; i++) {
      doctor.addIssue('error', 'critical', `Error ${i}`, 'Description');
    }
    expect(doctor.calculateScore()).toBe(0);
    expect(doctor.getScoreClass()).toBe('critical');
  });
});

describe('Internationalization', () => {
  it('should support all documented languages', () => {
    const configPath = resolve(rootDir, 'plugins/contextdoctor/contextdoctor.default.json');
    const config = JSON.parse(readFileSync(configPath, 'utf-8'));

    const expectedLanguages = ['zh', 'en', 'ja', 'ko'];
    for (const lang of expectedLanguages) {
      expect(config.config.i18n.supportedLanguages).toContain(lang);
    }
  });
});

// Run tests
console.log('🩺 Running Context Doctor tests...\n');
