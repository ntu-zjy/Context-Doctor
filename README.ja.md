<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="96" alt="Context Doctor logo">
</p>

<h1 align="center">Context Doctor</h1>

<p align="center">
  コーディングエージェントが古いタスク、間違ったファイル、失敗したコマンドを混ぜ始めたら、
  <code>/contextdoctor</code> で会話のどこが邪魔をしているか確認できます。
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
  <img alt="Local first" src="https://img.shields.io/badge/local--first-no%20cloud%20upload-0f766e">
  <img alt="Frameworks" src="https://img.shields.io/badge/Codex%20%7C%20Claude%20Code%20%7C%20OpenCode%20%7C%20Cursor-supported-7c3aed">
</p>

---

## どんな問題を解決するか

こんな経験はありませんか。

- あるバグをデバッグしたあと、同じ会話で別の機能に切り替えた。
- コマンドが失敗し、長いエラーログがチャットに残ったままになっている。
- 一度エージェントを訂正したのに、古い誤解がまだ近くに残っている。
- 前の作業で読み込んだ skill を、今の作業にも使い続けている。
- 1 時間ほど経つと、エージェントが間違ったファイルを編集し始める。

Context Doctor が調べるのはコードではなく、この会話そのものです。ローカルの transcript を読み、エージェントを混乱させそうなメッセージを見つけて、ブラウザレポートにします。

レポートは次の 3 つに答えます。

- 何がこのセッションを邪魔しているのか
- どれくらい深刻なのか
- 何を言い直し、何を無視し、いつ新しい会話に移るべきか

## 得られるもの

- 現在のエージェントセッションの 0-100 ヘルススコア
- user / assistant / tool call / tool result のタイムライン
- 怪しいメッセージへの赤、オレンジ、黄色のマーカー
- 分かりやすい理由と修正案
- 失敗コマンド、古いファイルパス、古いタスク、矛盾した指示などでのフィルタ
- オフラインで開ける自己完結 HTML

## いつ使うか

次のようなときに `/contextdoctor` を実行してください。

- エージェントが古いファイルやタスクを参照し続ける
- 長い会話のあと、急に回答の質が落ちた
- 失敗した tool call が多く、チャットがノイズだらけになった
- 同じ会話で作業内容を切り替えた
- 最新の指示が無視されているように見える

## Demo

```bash
npm run demo
```

レポートは次に生成されます。

```text
./.contextdoctor/report-<timestamp>.html
```

プレビュー:

![Context Doctor report preview](docs/assets/report-preview.svg)

## Quick Start

```bash
git clone https://github.com/contextdoctor/context-doctor.git
cd context-doctor
npm test
npm run demo
```

明示的な transcript を分析する場合:

```bash
node plugins/contextdoctor/scripts/contextdoctor.mjs run \
  --transcript fixtures/polluted-session.jsonl \
  --framework=codex \
  --no-open
```

インストールまたは link 後:

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

## 検出カテゴリ

| Category | 内容 |
|---|---|
| Stale State | コンテキスト内のファイルやコード状態が実際のワークスペースと一致しない |
| Conflicting Instructions | 過去の要求と現在の要求が矛盾している |
| Tool Noise | 失敗した tool call、スタックトレース、巨大ログ、コマンド残骸 |
| Task Drift | 完了または放棄されたサブタスクが現在の作業に影響している |
| Hallucinated Facts | 訂正済みの誤情報がまだコンテキストに残っている |
| Scope Bloat | 無関係な巨大ファイル、依存ツリー、生成物、ログ |
| Persona Drift | 古い役割設定や制約が現在のタスクに合っていない |
| Skill Conflict | 読み込まれたスキルが無関係、または互いに矛盾している |

## 対応フレームワーク

| Framework | Status |
|---|---|
| Codex | plugin manifest、skill、command、transcript locator を同梱 |
| Claude Code | plugin metadata と slash-command 指示を同梱 |
| OpenCode | skill 登録とコマンド指示注入の plugin hook を同梱 |
| Cursor | plugin metadata と command 指示を同梱 |
| Aider / Continue.dev | Planned |

transcript の自動検出が難しい場合:

```bash
CONTEXTDOCTOR_TRANSCRIPT=/path/to/session.jsonl contextdoctor run --framework=auto
```

## Token 効率のよい設計

Context Doctor は、モデルに巨大な HTML を出力させません。

1. テンプレート、CSS、スクリプト、parser、renderer はローカルにあります。
2. モデル判断が必要な場合も、小さな JSON annotations だけを出力します。
3. ローカル renderer が disk 上の transcript を読み、annotations と統合して HTML を生成します。

## Contributing

最初の貢献としておすすめなのは、adapter の改善、テスト fixture の追加、README 翻訳です。Local-first、read-only、token-efficient、one-command report という約束を保ってください。
