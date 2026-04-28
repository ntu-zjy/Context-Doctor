---
description: 检查当前上下文的污染，输出HTML可视化报告
agent: explore
subtask: true
---

# Context Doctor 检测指令

## ⚠️ 重要：分析流程

**禁止**直接使用脚本进行自动诊断。你必须：

1. **先自行分析上下文** —— 仔细阅读对话历史，识别真实的污染问题
2. **将分析结果传给脚本** —— 使用 `--data` 参数传递 JSON 格式的分析结果
3. **脚本只负责渲染** —— 脚本仅用于生成 HTML 报告，不做任何自动检测

## 参数

- `$ARGUMENTS` - 可选参数
  - `--lang=zh|en|ja|ko` - 报告语言（默认：zh）
  - `--output=路径` - 自定义输出路径

## 检测维度（你必须手动检查）

### 1. Skill/Plugin 污染 🔌
- **功能重叠**：多个 commands/skills 提供相同或类似功能
- **权限冲突**：不同工具请求互相矛盾的操作权限
- **加载冗余**：不必要的配置增加上下文负担
- **命名空间污染**：变量/命令命名冲突

### 2. 指令矛盾 📝
- **目标漂移**：用户在不同阶段提出了矛盾的目标
- **约束冲突**：前后约束条件互相排斥
- **偏好变更**：用户偏好设置前后不一致

### 3. 错误累积 ⚠️
- **连锁错误**：早期错误导致后续推理全部偏离
- **误解固化**：AI 误解了用户意图且持续基于此误解
- **过度推断**：从有限信息推断出错误结论

## 工作流程

### 第一步：自行分析上下文

仔细阅读整个对话历史，识别：
- 哪些 skills/plugins 被加载
- 用户指令是否存在矛盾
- 推理过程中是否有错误累积

### 第二步：构建分析结果

将你的分析整理为 JSON 格式：

```json
{
  "score": 85,
  "issues": [
    {
      "type": "skill|conflict|error",
      "severity": "critical|warning|suggestion",
      "title": "问题标题",
      "description": "详细描述",
      "location": "问题位置",
      "impact": "影响范围"
    }
  ]
}
```

### 第三步：调用脚本生成报告

```bash
node "$HOME/.contextdoctor/scripts/contextdoctor.mjs" check --lang=<lang> --data='<json>' [--output=<路径>]
```

示例：
```bash
node "$HOME/.contextdoctor/scripts/contextdoctor.mjs" check --lang=zh --data='{"score":85,"issues":[{"type":"skill","severity":"warning","title":"功能重叠","description":"检测到多个相似技能","location":"skills/","impact":"上下文负担"}]}'
```

## 输出要求

- 生成 HTML 可视化报告
- 采用 Starbucks 设计风格（暖色调）
  - 严重问题：Red (`#c82014`)
  - 警告问题：Gold (`#cba258`)
  - 建议优化：Green Accent (`#00754A`)
- 包含综合评分（0-100）
- 按严重/警告/建议三级分类

## 路径规范

- 默认目录：`~/.contextdoctor/reports/`
- 命名格式：`context-doctor-report-{YYYY-MM-DDTHH-mm-ss}-{lang}.html`
- 框架区分：`report`（检测）/ `repair`（修复），其余部分格式相同
- 自定义路径：通过 `--output` 参数指定
