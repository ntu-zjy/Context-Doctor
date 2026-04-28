#!/usr/bin/env node

/**
 * Context Doctor CLI
 * 上下文污染检测与修复工具
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 报告保存目录
const REPORTS_DIR = resolve(homedir(), '.contextdoctor/reports');

// 确保报告目录存在
function ensureReportsDir() {
  if (!existsSync(REPORTS_DIR)) {
    mkdirSync(REPORTS_DIR, { recursive: true });
  }
  return REPORTS_DIR;
}

// 生成带时间戳的文件名
function generateReportFilename(command, lang) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const type = command === 'repair' ? 'repair' : 'report';
  return `context-doctor-${type}-${timestamp}-${lang}.html`;
}

// 国际化文本
const i18n = {
  zh: {
    title: '上下文污染检测报告',
    subtitle: '生成时间',
    summaryTitle: '检测概览',
    issuesLabel: '个问题',
    criticalLabel: '严重',
    warningLabel: '警告',
    suggestionLabel: '建议',
    trendLabel: '健康趋势',
    distributionTitle: '问题分布',
    issuesTitle: '问题详情',
    emptyTitle: '未发现污染问题',
    emptyText: '您的上下文健康状况良好，继续保持！',
    repairTitle: '修复方案',
    recommendationsTitle: '优化建议',
    breakdownLabel: '扣分明细:',
    footerText: 'Context Doctor - 守护您的对话上下文健康',
    scoreLabels: {
      excellent: '优秀',
      good: '良好',
      fair: '一般',
      poor: '较差',
      critical: '严重'
    }
  },
  en: {
    title: 'Context Pollution Report',
    subtitle: 'Generated at',
    summaryTitle: 'Summary',
    issuesLabel: 'issues',
    criticalLabel: 'Critical',
    warningLabel: 'Warning',
    suggestionLabel: 'Suggestion',
    trendLabel: 'Health Trend',
    distributionTitle: 'Distribution',
    issuesTitle: 'Issues',
    emptyTitle: 'No pollution detected',
    emptyText: 'Your context is healthy. Keep it up!',
    repairTitle: 'Repair Solutions',
    recommendationsTitle: 'Recommendations',
    breakdownLabel: 'Score deductions:',
    footerText: 'Context Doctor - Guarding your conversation context health',
    scoreLabels: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      critical: 'Critical'
    }
  },
  ja: {
    title: 'コンテキスト汚染検出レポート',
    subtitle: '生成日時',
    summaryTitle: '検出概要',
    issuesLabel: '件の問題',
    criticalLabel: '重大',
    warningLabel: '警告',
    suggestionLabel: '提案',
    trendLabel: '健康トレンド',
    distributionTitle: '問題分布',
    issuesTitle: '問題詳細',
    emptyTitle: '問題は検出されませんでした',
    emptyText: 'コンテキストは健康な状態です！',
    repairTitle: '修正案',
    recommendationsTitle: '最適化提案',
    breakdownLabel: '減点内訳:',
    footerText: 'Context Doctor - 対話コンテキストの健康を守る',
    scoreLabels: {
      excellent: '優秀',
      good: '良好',
      fair: '普通',
      poor: '不良',
      critical: '重大'
    }
  },
  ko: {
    title: '컨텍스트 오염 탐지 보고서',
    subtitle: '생성 시간',
    summaryTitle: '탐지 개요',
    issuesLabel: '개 문제',
    criticalLabel: '심각',
    warningLabel: '경고',
    suggestionLabel: '제안',
    trendLabel: '건강 트렌드',
    distributionTitle: '문제 분포',
    issuesTitle: '문제 상세',
    emptyTitle: '문제가 발견되지 않았습니다',
    emptyText: '컨텍스트가 건강한 상태입니다!',
    repairTitle: '수정 방안',
    recommendationsTitle: '최적화 제안',
    breakdownLabel: '감점 내역:',
    footerText: 'Context Doctor - 대화 컨텍스트 건강 지킴이',
    scoreLabels: {
      excellent: '우수',
      good: '양호',
      fair: '보통',
      poor: '불량',
      critical: '심각'
    }
  }
};

// 污染检测器
class ContextDoctor {
  constructor(options = {}) {
    this.lang = options.lang || 'zh';
    this.text = i18n[this.lang] || i18n.zh;
    this.issues = [];
    this.score = 100;
  }

  // 添加问题
  addIssue(type, severity, title, description, location = '', impact = '') {
    this.issues.push({
      type,
      typeLabel: this.getTypeLabel(type),
      severity,
      severityLabel: this.text.scoreLabels[severity] || severity,
      title,
      description,
      location,
      impact,
      impactLabel: this.lang === 'zh' ? '影响' :
                   this.lang === 'en' ? 'Impact' :
                   this.lang === 'ja' ? '影響' : '영향'
    });
  }

  // 获取类型标签
  getTypeLabel(type) {
    const labels = {
      zh: { skill: '技能', conflict: '冲突', error: '错误' },
      en: { skill: 'Skill', conflict: 'Conflict', error: 'Error' },
      ja: { skill: 'スキル', conflict: '衝突', error: 'エラー' },
      ko: { skill: '스킬', conflict: '충돌', error: '오류' }
    };
    return (labels[this.lang] || labels.zh)[type] || type;
  }

  // 计算分数
  calculateScore() {
    const weights = { critical: 30, warning: 15, suggestion: 5 };
    let deduction = 0;

    for (const issue of this.issues) {
      deduction += weights[issue.severity] || 5;
    }

    this.score = Math.max(0, Math.min(100, 100 - deduction));
    return this.score;
  }

  // 获取分数等级
  getScoreClass() {
    if (this.score >= 90) return 'excellent';
    if (this.score >= 70) return 'good';
    if (this.score >= 50) return 'fair';
    if (this.score >= 30) return 'poor';
    return 'critical';
  }

  // 获取分数偏移量（用于 SVG 圆环）
  getScoreOffset() {
    const circumference = 2 * Math.PI * 52;
    return circumference * (1 - this.score / 100);
  }

  // 为指定语言生成 issues 列表（带翻译标签）
  getIssuesForLang(lang) {
    const langText = i18n[lang] || i18n.zh;
    const typeLabels = {
      zh: { skill: '技能', conflict: '冲突', error: '错误' },
      en: { skill: 'Skill', conflict: 'Conflict', error: 'Error' },
      ja: { skill: 'スキル', conflict: '衝突', error: 'エラー' },
      ko: { skill: '스킬', conflict: '충돌', error: '오류' }
    };
    const impactLabel = lang === 'zh' ? '影响' : lang === 'en' ? 'Impact' : lang === 'ja' ? '影響' : '영향';
    return this.issues.map(issue => ({
      ...issue,
      typeLabel: (typeLabels[lang] || typeLabels.zh)[issue.type] || issue.type,
      severityLabel: langText.scoreLabels[issue.severity] || issue.severity,
      impactLabel
    }));
  }

  // 为指定语言生成修复方案
  getFixesForLang(lang) {
    const langIssues = this.getIssuesForLang(lang);
    const codeComment = lang === 'zh' ? '// 建议重置相关上下文段落\n// 位置: ' :
                        lang === 'en' ? '// Recommended: reset the related context segment\n// Location: ' :
                        lang === 'ja' ? '// 関連するコンテキストセグメントのリセットを推奨\n// 場所: ' :
                        '// 관련 컨텍스트 세그먼트 재설정 권장\n// 위치: ';
    return langIssues.map((issue, index) => ({
      number: index + 1,
      title: `${issue.title} - ${issue.severityLabel}`,
      description: issue.description,
      code: issue.severity === 'critical' ? `${codeComment}${issue.location}` : null
    }));
  }

  // 为指定语言生成优化建议
  getRecommendationsForLang(lang) {
    const recs = [];
    if (this.issues.length === 0) {
      recs.push({
        number: 1,
        title: lang === 'zh' ? '保持良好习惯' : lang === 'en' ? 'Maintain good practices' : lang === 'ja' ? '良い習慣を保つ' : '좋은 습관 유지',
        description: lang === 'zh' ? '定期使用 /contextdoctor 检查上下文健康状况' :
                     lang === 'en' ? 'Regularly use /contextdoctor to check context health' :
                     lang === 'ja' ? '定期的に /contextdoctor を使用してコンテキストの健康状態を確認する' :
                     '정기적으로 /contextdoctor를 사용하여 컨텍스트 건강 상태를 확인하세요'
      });
    } else {
      recs.push({
        number: 1,
        title: lang === 'zh' ? '优先处理严重问题' : lang === 'en' ? 'Prioritize critical issues' : lang === 'ja' ? '重大な問題を優先的に処理する' : '심각한 문제 우선 처리',
        description: lang === 'zh' ? '首先解决标记为"严重"的污染问题' :
                     lang === 'en' ? 'First resolve issues marked as "critical"' :
                     lang === 'ja' ? '「重大」とマークされた問題を最初に解決する' :
                     '"심각"으로 표시된 문제를 먼저 해결하세요'
      });
      recs.push({
        number: 2,
        title: lang === 'zh' ? '定期清理冗余配置' : lang === 'en' ? 'Regularly clean up redundant configs' : lang === 'ja' ? '冗長な設定を定期的に清理する' : '정기적으로 중복 구성 정리',
        description: lang === 'zh' ? '移除不再使用的技能和插件' :
                     lang === 'en' ? 'Remove unused skills and plugins' :
                     lang === 'ja' ? '使用していないスキルとプラグインを削除する' :
                     '사용하지 않는 스킬과 플러그인을 제거하세요'
      });
    }
    return recs;
  }

  // 生成报告
  generateReport(isRepair = false) {
    this.calculateScore();

    const criticalCount = this.issues.filter(i => i.severity === 'critical').length;
    const warningCount = this.issues.filter(i => i.severity === 'warning').length;
    const suggestionCount = this.issues.filter(i => i.severity === 'suggestion').length;
    const totalIssues = this.issues.length;

    const maxCount = Math.max(criticalCount, warningCount, suggestionCount, 1);
    const supportedLangs = ['zh', 'en', 'ja', 'ko'];

    // 构建客户端多语言数据
    const i18nForClient = {};
    supportedLangs.forEach(lang => {
      const t = i18n[lang];
      i18nForClient[lang] = {
        headerTitle: t.title,
        headerSubtitle: `${t.subtitle}: ${new Date().toLocaleString()}`,
        scoreLabel: t.scoreLabels[this.getScoreClass()],
        summaryTitle: t.summaryTitle,
        issuesLabel: t.issuesLabel,
        criticalLabel: t.criticalLabel,
        warningLabel: t.warningLabel,
        suggestionLabel: t.suggestionLabel,
        trendLabel: t.trendLabel,
        distributionTitle: t.distributionTitle,
        issuesTitle: t.issuesTitle,
        emptyTitle: t.emptyTitle,
        emptyText: t.emptyText,
        repairTitle: t.repairTitle,
        recommendationsTitle: t.recommendationsTitle,
        breakdownLabel: t.breakdownLabel,
        footerText: t.footerText
      };
    });

    const issuesByLang = {};
    const fixesByLang = {};
    const recommendationsByLang = {};
    supportedLangs.forEach(lang => {
      issuesByLang[lang] = this.getIssuesForLang(lang);
      fixesByLang[lang] = this.getFixesForLang(lang);
      recommendationsByLang[lang] = this.getRecommendationsForLang(lang);
    });

    const reportDataJSON = JSON.stringify({
      defaultLang: this.lang,
      i18n: i18nForClient,
      issuesByLang,
      fixesByLang,
      recommendationsByLang
    });

    const template = {
      lang: this.lang,
      title: this.text.title,
      headerTitle: this.text.title,
      headerSubtitle: `${this.text.subtitle}: ${new Date().toLocaleString()}`,
      score: Math.round(this.score),
      scoreClass: this.getScoreClass(),
      scoreOffset: this.getScoreOffset(),
      scoreLabel: this.text.scoreLabels[this.getScoreClass()],

      summaryTitle: this.text.summaryTitle,
      totalIssues,
      issuesLabel: this.text.issuesLabel,
      criticalCount,
      warningCount,
      suggestionCount,
      criticalLabel: this.text.criticalLabel,
      warningLabel: this.text.warningLabel,
      suggestionLabel: this.text.suggestionLabel,
      breakdownLabel: this.text.breakdownLabel,

      distributionTitle: this.text.distributionTitle,
      criticalHeight: (criticalCount / maxCount) * 100,
      warningHeight: (warningCount / maxCount) * 100,
      suggestionHeight: (suggestionCount / maxCount) * 100,

      issuesTitle: this.text.issuesTitle,
      hasIssues: totalIssues > 0,
      issues: this.getIssuesForLang(this.lang),
      emptyTitle: this.text.emptyTitle,
      emptyText: this.text.emptyText,

      isRepairReport: isRepair,
      repairTitle: this.text.repairTitle,
      fixes: this.getFixesForLang(this.lang),

      recommendationsTitle: this.text.recommendationsTitle,
      recommendations: this.getRecommendationsForLang(this.lang),

      footerText: this.text.footerText,
      reportDataJSON
    };

    return template;
  }
}

// CLI 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';

  // 解析参数
  const lang = args.find(a => a.startsWith('--lang='))?.split('=')[1] ||
               args.find(a => a.startsWith('-l='))?.split('=')[1] || 'zh';
  const customOutput = args.find(a => a.startsWith('--output='))?.split('=')[1] ||
                       args.find(a => a.startsWith('-o='))?.split('=')[1];
  const autoFix = args.includes('--auto-fix') || args.includes('-f');

  // 确保报告目录存在
  ensureReportsDir();

  // 生成报告文件路径
  const filename = customOutput || generateReportFilename(command, lang);
  const outputPath = customOutput ? resolve(customOutput) : resolve(REPORTS_DIR, filename);

  const options = {
    lang,
    output: outputPath,
    autoFix
  };

  const doctor = new ContextDoctor(options);

  // 模拟检测（实际实现中这里会分析真实上下文）
  // doctor.addIssue('skill', 'warning', '示例问题', '这是一个示例问题描述', 'location', '影响范围');

  const report = doctor.generateReport(command === 'repair');

  // 生成 HTML
  const html = generateHTML(report);

  // 保存报告
  writeFileSync(outputPath, html);

  console.log(`✅ Report generated: ${outputPath}`);
  console.log(`   Language: ${lang}`);
  console.log(`   Score: ${report.score}/100 (${report.scoreLabel})`);
  console.log(`   Issues: ${report.totalIssues}`);
  console.log(`\n📊 View report: file://${outputPath}`);
}

// 模板引擎：支持 {{key}}、{{#if key}}...{{else}}...{{/if}}、{{#each array}}...{{/each}}
function renderTemplate(template, data) {
  // 处理 {{#each array}}...{{/each}}
  template = template.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, block) => {
    const arr = data[key];
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return arr.map(item => renderTemplate(block, item)).join('');
  });

  // 处理 {{#if key}}...{{else}}...{{/if}}
  template = template.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, truePart, falsePart) => {
    return data[key] ? renderTemplate(truePart, data) : renderTemplate(falsePart, data);
  });

  // 处理 {{#if key}}...{{/if}} (无 else)
  template = template.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, block) => {
    return data[key] ? renderTemplate(block, data) : '';
  });

  // 处理 {{key}} 变量替换（reportDataJSON 直接插入，其余转义）
  template = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (data[key] === undefined) return match;
    if (key === 'reportDataJSON') return data[key]; // raw JSON, no escaping
    const val = data[key];
    if (typeof val === 'object') return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  });

  return template;
}

// 生成 HTML
function generateHTML(data) {
  // 查找模板：优先相对路径（开发环境），回退到 ~/.contextdoctor/assets/（安装后）
  const candidatePaths = [
    resolve(__dirname, '../assets/report-template.html'),
    resolve(homedir(), '.contextdoctor/assets/report-template.html')
  ];

  for (const templatePath of candidatePaths) {
    if (existsSync(templatePath)) {
      const template = readFileSync(templatePath, 'utf-8');
      return renderTemplate(template, data);
    }
  }

  // 回退到简单 HTML
  return `<!DOCTYPE html>
<html>
<head><title>${data.title}</title></head>
<body>
  <h1>${data.headerTitle}</h1>
  <p>Score: ${data.score}/100</p>
</body>
</html>`;
}

main().catch(console.error);
