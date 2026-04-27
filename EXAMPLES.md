# Context Doctor 使用示例

## 快速开始

### 1. 安装 Context Doctor

```bash
# 克隆或下载项目后
cd Context-Doctor

# 运行自动安装脚本
node scripts/install.mjs
```

### 2. 基本使用

#### 检测上下文污染

```bash
# 在 Claude Code 中
/contextdoctor

# 在 Codex CLI 中
codex /contextdoctor

# 在 Cursor 中
/contextdoctor

# 在 OpenCode/Crush 中
/contextdoctor
```

**预期输出**：
- 生成 `context-doctor-report.html`
- 显示综合评分（0-100）
- 列出发现的问题

#### 获取修复方案

```bash
/repair
```

**预期输出**：
- 执行完整检测
- 提供具体修复建议
- 生成 `context-doctor-repair-{timestamp}-{lang}.html`

---

## 高级用法

### 多语言报告

```bash
# 生成英文报告
/contextdoctor --lang=en

# 生成日文报告
/contextdoctor --lang=ja

# 生成韩文报告
/contextdoctor --lang=ko

# Repair 也支持多语言
/repair --lang=en
```

**报告位置**：`~/.contextdoctor/reports/`
- 文件名格式：`context-doctor-report-2025-01-15T10-30-00-zh.html`
- 历史报告自动按时间戳排序

### 自定义输出路径

```bash
# 指定自定义路径（优先级高于默认路径）
/contextdoctor --output=./my-project-report.html

# 结合语言参数
/contextdoctor --lang=en --output=./docs/context-report.html
```

### 查看历史报告

```bash
# 列出所有历史报告
ls -la ~/.contextdoctor/reports/

# 查看最新报告
open ~/.contextdoctor/reports/$(ls -t ~/.contextdoctor/reports/ | head -1)
```

---

## 场景示例

### 场景 1：检测 Skill 冲突

**背景**：你在项目中同时加载了多个代码格式化相关的 Skills。

**操作**：
```bash
/contextdoctor
```

**预期检测结果**：
```
⚠️ Warning: Skill Conflict Detected
- Skill "prettier-format" and "eslint-format" both handle code formatting
- Recommendation: Disable one of them to avoid conflicts
```

---

### 场景 2：修复指令矛盾

**背景**：你先要求 AI "使用 React"，后来又要求 "使用 Vue"。

**操作**：
```bash
/repair
```

**预期修复建议**：
```
🔧 Repair Suggestion:
请澄清前端框架选择：
"请统一使用 React 作为前端框架，之前提到的 Vue 要求取消。"
```

---

### 场景 3：检测错误累积

**背景**：AI 误解了你的数据库表结构，后续的 API 设计都基于错误的假设。

**操作**：
```bash
/contextdoctor --output=db-analysis.html
```

**预期检测结果**：
```
❌ Critical: Error Accumulation Detected
- Misunderstanding: "users" table structure
- Affected: 15 subsequent API designs
- Suggested rollback point: Message #23
```

---

## 高级用法

### 指定输出路径

```bash
# Claude Code
/contextdoctor ./reports/my-report.html

# 带参数
/repair ./reports/fix.html --auto-fix
```

### 多语言报告

```bash
# 生成英文报告
/contextdoctor --lang=en

# 生成日文报告
/contextdoctor --lang=ja
```

### CI/CD 集成

```yaml
# .github/workflows/context-doctor.yml
name: Context Health Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check Context Health
        run: |
          npx context-doctor --lang=en
          # 获取最新生成的报告进行评分检查
          REPORT=$(ls -t ~/.contextdoctor/reports/context-doctor-report-*.html | head -1)
          echo "Generated report: $REPORT"
```

---

## 报告解读

### 评分等级

| 分数 | 等级 | 含义 | 建议 |
|------|------|------|------|
| 90-100 | 🟢 优秀 | 上下文健康 | 保持良好习惯 |
| 70-89 | 🟡 良好 | 轻微污染 | 定期关注 |
| 50-69 | 🟠 一般 | 中度污染 | 建议优化 |
| 30-49 | 🔴 较差 | 重度污染 | 需要修复 |
| 0-29 | ⛔ 严重 | 严重污染 | 立即处理 |

### 问题类型图标

| 图标 | 类型 | 说明 |
|------|------|------|
| 🔌 | Skill | Skill/Plugin 相关问题 |
| 📝 | Conflict | 指令矛盾 |
| ⚠️ | Error | 错误累积 |

### 严重等级颜色

- 🔴 **红色** - Critical（严重）：影响核心功能
- 🟡 **金色** - Warning（警告）：建议关注
- 🟢 **绿色** - Suggestion（建议）：优化机会

---

## 常见问题

### Q: 报告生成失败怎么办？

检查：
1. 是否有写入权限
2. 磁盘空间是否充足
3. 输出路径是否存在

### Q: 检测结果不准确？

建议：
1. 提供更完整的上下文
2. 运行 `/repair` 获取更详细的分析
3. 手动检查报告中的引用位置

### Q: 如何清除历史检测记录？

```bash
# 删除所有历史报告
rm ~/.contextdoctor/reports/*.html

# 或删除特定日期的报告
rm ~/.contextdoctor/reports/context-doctor-report-2025-01-15*.html

# 清空整个报告目录
rm -rf ~/.contextdoctor/reports/*
```

---

## 最佳实践

1. **定期检测**
   - 每 50 轮对话运行一次 `/contextdoctor`
   - 重要决策前运行检测

2. **及时修复**
   - Critical 问题立即处理
   - Warning 问题当天处理

3. **利用时间戳管理历史**
   ```bash
   # 查看历史报告趋势
   ls -lt ~/.contextdoctor/reports/
   
   # 对比不同时期的报告
   diff ~/.contextdoctor/reports/context-doctor-report-2025-01-14T*.html \
         ~/.contextdoctor/reports/context-doctor-report-2025-01-15T*.html
   ```

4. **多语言团队协作**
   - 根据团队成员语言偏好生成报告
   - 在报告页面点击语言按钮切换界面语言
   - 分享报告时注明语言版本

5. **归档重要报告**
   ```bash
   # 项目里程碑时保存报告
   cp ~/.contextdoctor/reports/$(ls -t ~/.contextdoctor/reports/*.html | head -1) \
      ./docs/milestone-v1.0-context-report.html
   ```

6. **团队协作**
   - 共享报告帮助团队理解上下文
   - 在 PR 描述中附上下文健康评分
   - 将报告链接添加到项目文档

---

**更多帮助**：运行 `/contextdoctor --help` 查看完整选项
