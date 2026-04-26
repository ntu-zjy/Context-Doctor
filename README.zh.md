<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="96" alt="Context Doctor 标志">
</p>

<h1 align="center">Context Doctor</h1>

<p align="center">
  面向长时间 Code Agent 会话的 <code>/contextdoctor</code> 诊断命令。
  在 Agent 开始改错文件、沿用过期指令、重复旧错误之前，先发现上下文腐化。
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <img alt="Node >=18.18" src="https://img.shields.io/badge/node-%3E%3D18.18-339933">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="Local first" src="https://img.shields.io/badge/local--first-no%20cloud%20upload-0f766e">
  <img alt="Frameworks" src="https://img.shields.io/badge/Codex%20%7C%20Claude%20Code%20%7C%20OpenCode%20%7C%20Cursor-supported-7c3aed">
</p>

---

## 为什么需要它

长会话里的 Coding Agent 很容易变“怪”：失败命令、过期路径、被放弃的子任务、互相矛盾的要求、无关技能、已纠正的幻觉事实，都会悄悄留在上下文里。人能感觉到质量下降，但很难指出污染源。

Context Doctor 会把这些不可见的上下文污染变成浏览器报告：

- 0 到 100 的健康分
- 带严重等级的发现和可执行修复建议
- 用户、助手、工具调用、工具结果的完整时间线
- 8 类污染维度筛选
- 鼠标悬停查看证据和原因
- 离线可打开的自包含 HTML

## 快速体验

```bash
npm run demo
```

生成报告：

```text
./.contextdoctor/report-<timestamp>.html
```

报告预览：

![Context Doctor 报告预览](docs/assets/report-preview.svg)

## 快速开始

```bash
git clone https://github.com/contextdoctor/context-doctor.git
cd context-doctor
npm test
npm run demo
```

分析指定 transcript：

```bash
node plugins/contextdoctor/scripts/contextdoctor.mjs run \
  --transcript fixtures/polluted-session.jsonl \
  --framework=codex \
  --no-open
```

安装或 link 后：

```bash
contextdoctor run --framework=auto --scope=recent
```

## Slash Command

```text
/contextdoctor
/contextdoctor --scope=recent
/contextdoctor --focus=tool_noise
/contextdoctor --no-open
```

## 检测维度

| 类别 | 说明 |
|---|---|
| Stale State | 上下文中的文件或代码状态已经和真实工作区不一致 |
| Conflicting Instructions | 不同轮次的需求互相冲突 |
| Tool Noise | 失败工具调用、堆栈、超长日志、命令残留 |
| Task Drift | 已完成或放弃的子任务继续干扰当前任务 |
| Hallucinated Facts | 已被纠正的错误事实仍留在上下文里 |
| Scope Bloat | 大量无关文件、依赖树、生成文件或日志占据上下文 |
| Persona Drift | 早期角色设定或约束已经不适合当前任务 |
| Skill Conflict | 加载的技能无关、冲突，或要求不同的约定 |

## 评分

```text
score = max(0, 100 - sum(severity penalties))
```

| 分数 | 等级 |
|---:|---|
| 80-100 | Healthy |
| 50-79 | Caution |
| 0-49 | Critical |

## 支持框架

| 框架 | 状态 |
|---|---|
| Codex | 已包含插件 manifest、skill、command 和 transcript locator |
| Claude Code | 已包含插件元数据和 slash-command 说明 |
| OpenCode | 已包含插件 hook，可注册 skill 并注入命令说明 |
| Cursor | 已包含插件元数据和命令说明 |
| Aider / Continue.dev | 计划中，欢迎贡献 adapter |

如果框架无法稳定暴露当前 transcript 路径，可以显式传入：

```bash
CONTEXTDOCTOR_TRANSCRIPT=/path/to/session.jsonl contextdoctor run --framework=auto
```

## Token 友好的架构

Context Doctor 不要求模型输出巨大的 HTML。

1. 模板、CSS、脚本、解析器和渲染器都在本地。
2. 需要模型判断时，只输出很小的 JSON annotations。
3. 本地 renderer 从磁盘读取完整 transcript，并合并 annotations 生成报告。

## 配置

复制 `contextdoctor.config.example.json` 为 `contextdoctor.config.json` 或 `./.contextdoctor/config.json`：

```json
{
  "recentTurns": 60,
  "reportLanguage": "en",
  "autoOpen": true
}
```

## 贡献

最适合的第一类贡献是：改进框架 adapter、补充测试样例、维护更多语言的 README。请保持核心承诺：本地优先、只读、低 token 开销、一条命令就能得到有用报告。
