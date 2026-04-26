<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="96" alt="Context Doctor 标志">
</p>

<h1 align="center">Context Doctor</h1>

<p align="center">
  一个本地 <code>/contextdoctor</code> 命令，专门发现 Coding Agent 会话里的<strong>上下文污染</strong>。
  它会告诉你：哪些旧消息、失败工具、过期文件路径或冲突指令正在误导 Agent。
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

<p align="center">
  <img alt="Node 18.18+" src="https://img.shields.io/badge/node-18.18%2B-339933">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="上下文污染" src="https://img.shields.io/badge/solves-%E4%B8%8A%E4%B8%8B%E6%96%87%E6%B1%A1%E6%9F%93-f97316">
  <img alt="Local first" src="https://img.shields.io/badge/local--first-no%20cloud%20upload-0f766e">
  <img alt="Frameworks" src="https://img.shields.io/badge/Codex%20%7C%20Claude%20Code%20%7C%20OpenCode%20%7C%20Cursor-supported-7c3aed">
</p>

---

## 它解决的是上下文污染

上下文污染指的是：一段 Code Agent 会话里，留下了太多对当前任务没帮助、甚至会误导 Agent 的旧信息。

它可能是旧需求、失败命令的输出、过期文件路径、已经纠正过的错误、无关 skill，或者上一个任务留下来的描述。

这些内容还在当前对话里时，Agent 可能会把它们当成仍然正确的信息来使用。

## 上下文污染通常长什么样？

你很可能遇到过这种情况：

- 你刚调完一个 bug，又切去做新功能。
- 某个命令失败了，但长长的报错还留在聊天里。
- 你纠正过 Agent 一次，但错误假设还在上下文附近。
- 你为上一个任务加载了某个 skill，现在 Agent 还在照着它做新任务。
- 聊了一个小时后，Agent 开始改错文件，或者重复你已经修好的问题。

Context Doctor 检查的不是代码，而是“这段会话本身”。它读取本地 transcript，找出最可能污染当前任务的消息，然后生成一份浏览器报告。

这份报告回答三个简单问题：

- 现在是什么在污染这段会话？
- 问题有多严重？
- 我应该重述什么、忽略什么，还是开新会话？

## 你会得到什么

- 当前 Agent 会话的 0-100 健康分
- 用户消息、助手回复、工具调用、工具结果的时间线
- 对可疑消息标红、标橙、标黄
- 用普通语言解释原因，并给出修复建议
- 可以按失败命令、过期文件路径、旧任务、冲突指令等问题筛选
- 离线可打开的自包含 HTML 文件

## 什么时候该运行

适合在这些时候运行 `/contextdoctor`：

- Agent 一直提到旧文件或旧任务
- 长会话后回答质量突然变差
- 多个工具调用失败，聊天里全是噪音
- 你在同一个会话里切换了任务
- Agent 看起来没有听最新指令

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
