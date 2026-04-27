# 🩺 Context Doctor

<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="128" height="128" alt="Context Doctor Logo">
</p>

<p align="center">
  <b>コンテキスト汚染検出・修復ツール</b>
</p>

<p align="center">
  <a href="README.md">中文</a> |
  <a href="README.en.md">English</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

---

## 🎯 解決する問題

AI Agent（Claude Code、Codex、Cursor など）を使用する際、以下のような経験はありませんか：

1. **プロンプトの矛盾** - 以前の指示が現在の目標と衝突し、AI を混乱させる
2. **Skill/Plugin の衝突** - 読み込まれたツールが多すぎて、互いに干渉したり機能が重複したりする
3. **エラーの累積** - 初期の小さなエラーが原因で、後続のすべての推論が逸脱する

**Context Doctor** は、これらの「コンテキスト汚染」問題を検出して修復します。

---

## ✨ 機能

- 🔍 **インテリジェント検出** - Skill 衝突、指示の矛盾、エラー累積の3種類の汚染を自動識別
- 📊 **ビジュアルレポート** - Starbucks デザインシステムを使用した美しい HTML レポート
- 🌍 **多言語サポート** - 中国語、英語、日本語、韓国語
- 🔧 **ワンクリック修復** - 問題を検出するだけでなく、具体的な修正案も提供
- 🚀 **最小限のインストール** - 1つのコマンドですべてのサポートされている Agent フレームワークにインストール
- 🎨 **フレームワークの柔軟性** - Claude Code、Codex CLI、Cursor、OpenCode/Crush をサポート

---

## 📦 インストール

### クイックインストール（推奨）

```bash
curl -fsSL https://contextdoctor.dev/install.sh | bash
```

### 手動インストール

#### Claude Code

```bash
mkdir -p ~/.claude/skills/contextdoctor
curl -o ~/.claude/skills/contextdoctor/SKILL.md \
  https://raw.githubusercontent.com/contextdoctor/contextdoctor/main/plugins/contextdoctor/skills/contextdoctor/SKILL.md
```

#### Codex CLI

```bash
mkdir -p ~/.codex
curl -o ~/.codex/codex.md \
  https://raw.githubusercontent.com/contextdoctor/contextdoctor/main/plugins/contextdoctor/.opencode/INSTALL.md
```

#### Cursor

```bash
mkdir -p ~/.cursor/commands
curl -o ~/.cursor/commands/contextdoctor.json \
  https://raw.githubusercontent.com/contextdoctor/contextdoctor/main/plugins/contextdoctor/.cursor-plugin/contextdoctor.json
```

#### OpenCode / Crush

```bash
mkdir -p ~/.config/opencode/commands
curl -o ~/.config/opencode/commands/contextdoctor.md \
  https://raw.githubusercontent.com/contextdoctor/contextdoctor/main/plugins/contextdoctor/commands/contextdoctor.md
```

---

## 🚀 使用方法

### コンテキスト汚染の検出

```bash
/contextdoctor
```

以下を表示する HTML レポートを生成：
- 総合健康スコア（0-100）
- 汚染タイプの分布
- 具体的な問題リスト
- 修復優先度の推奨

### 修復案の取得

```bash
/repair
```

検出レポートに加えて、以下を提供：
- 各問題の具体的な修復手順
- コピー＆ペースト可能な修正テキスト
- 推奨されるコンテキストクリーンアップ戦略

---

## 📊 レポートプレビュー

<p align="center">
  <img src="docs/assets/report-preview.svg" width="600" alt="Report Preview">
</p>

レポートの特徴：
- 🎨 **Starbucks デザインシステム** - 暖かみのある色調、快適な読書体験
- 📱 **レスポンシブレイアウト** - デスクトップとモバイルデバイスをサポート
- 🌈 **重大度カラーコーディング** - 赤（重大）、金（警告）、緑（提案）
- 📈 **動的チャート** - 直感的な問題分布の視覚化

---

## 🏗️ サポートされているフレームワーク

| フレームワーク | インストール方法 | コマンド |
|--------------|----------------|---------|
| Claude Code | Skill システム | `/contextdoctor`, `/repair` |
| OpenAI Codex | `codex.md` + `agents/` | `/contextdoctor`, `/repair` |
| Cursor | Custom Commands | `/contextdoctor`, `/repair` |
| OpenCode | `commands/` ディレクトリ | `/contextdoctor`, `/repair` |
| Crush | JSON 設定 | `contextdoctor`, `repair` |

---

## 📖 ドキュメント

- [COMMANDS_REFERENCE.md](docs/COMMANDS_REFERENCE.md) - フレームワークコマンド実装リファレンス
- [DESIGN.md](docs/DESIGN.md) - レポートデザイン仕様（Starbucks デザインシステム）
- [Begin.md](docs/Begin.md) - プロジェクト要件ドキュメント

---

## 🛠️ 開発

```bash
# リポジトリをクローン
git clone https://github.com/contextdoctor/contextdoctor.git
cd contextdoctor

# 依存関係をインストール
npm install

# テストを実行
npm test

# プラグインをビルド
npm run build
```

---

## 🤝 貢献

コードの貢献、Issue の提出、ドキュメントの改善を歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. Pull Request を作成

---

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

---

<p align="center">
  🩺 <b>Context Doctor</b> - 対話コンテキストの健康を守る
</p>
