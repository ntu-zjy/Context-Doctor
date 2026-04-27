# OpenCode / Crush 安装指南

## 安装方式

### 方式一：项目级安装

```bash
# 创建命令目录
mkdir -p .opencode/commands

# 复制命令文件
cp commands/contextdoctor.md .opencode/commands/
cp commands/repair.md .opencode/commands/
```

### 方式二：全局安装

```bash
# 创建全局命令目录
mkdir -p ~/.config/opencode/commands

# 复制命令文件
cp commands/contextdoctor.md ~/.config/opencode/commands/
cp commands/repair.md ~/.config/opencode/commands/
```

### 方式三：JSON 配置

在 `opencode.jsonc` 中添加：

```json
{
  "command": {
    "contextdoctor": {
      "template": "请作为 Context Doctor 分析当前对话上下文...",
      "description": "检查当前上下文的污染，输出HTML可视化报告",
      "agent": "explore",
      "model": "anthropic/claude-3-5-sonnet-20241022",
      "subtask": true
    },
    "repair": {
      "template": "执行完整污染检测并提供修复建议...",
      "description": "检查上下文污染并提供修复方案",
      "agent": "explore"
    }
  }
}
```

## 使用

在 OpenCode TUI 中输入：

```
/contextdoctor
/repair
```

## 注意

OpenCode 项目已归档（2025年9月），建议使用 Crush 作为替代。

Crush 配置方式类似，使用 `.crush/` 目录替代 `.opencode/`。
