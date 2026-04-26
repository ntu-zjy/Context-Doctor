<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="96" alt="Context Doctor logo">
</p>

<h1 align="center">Context Doctor</h1>

<p align="center">
  긴 코딩 에이전트 세션을 위한 <code>/contextdoctor</code> 진단 명령.
  에이전트가 오래된 지시, 잘못된 파일, 이전 실수에 끌려가기 전에 컨텍스트 오염을 찾아냅니다.
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

## 왜 필요한가

긴 세션에서는 실패한 명령, 오래된 파일 경로, 중단된 하위 작업, 충돌하는 요구사항, 관련 없는 스킬, 이미 정정된 잘못된 사실이 컨텍스트에 남습니다. 품질이 떨어지는 것은 느껴지지만, 원인을 정확히 찾기는 어렵습니다.

Context Doctor는 보이지 않는 컨텍스트 오염을 브라우저 리포트로 보여줍니다.

- 0부터 100까지의 health score
- severity가 붙은 finding과 실행 가능한 수정 제안
- user / assistant / tool call / tool result 타임라인
- 8가지 오염 카테고리 필터
- hover로 보는 근거와 진단 이유
- 오프라인에서도 열리는 self-contained HTML

## Demo

```bash
npm run demo
```

리포트는 다음 위치에 생성됩니다.

```text
./.contextdoctor/report-<timestamp>.html
```

미리보기:

![Context Doctor report preview](docs/assets/report-preview.svg)

## Quick Start

```bash
git clone https://github.com/contextdoctor/context-doctor.git
cd context-doctor
npm test
npm run demo
```

명시적인 transcript 분석:

```bash
node plugins/contextdoctor/scripts/contextdoctor.mjs run \
  --transcript fixtures/polluted-session.jsonl \
  --framework=codex \
  --no-open
```

설치 또는 link 이후:

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

## 감지 항목

| Category | 설명 |
|---|---|
| Stale State | 컨텍스트의 파일 또는 코드 상태가 실제 워크스페이스와 맞지 않음 |
| Conflicting Instructions | 이전 요구사항과 현재 요구사항이 충돌 |
| Tool Noise | 실패한 tool call, stack trace, 거대한 로그, 명령 잔여물 |
| Task Drift | 완료되었거나 버려진 하위 작업이 현재 작업을 방해 |
| Hallucinated Facts | 이미 정정된 잘못된 사실이 컨텍스트에 남아 있음 |
| Scope Bloat | 관련 없는 대용량 파일, dependency tree, 생성물, 로그 |
| Persona Drift | 오래된 역할 설정이나 제약이 현재 작업과 맞지 않음 |
| Skill Conflict | 로드된 스킬이 관련 없거나 서로 다른 관례를 지시 |

## 지원 프레임워크

| Framework | Status |
|---|---|
| Codex | plugin manifest, skill, command, transcript locator 포함 |
| Claude Code | plugin metadata와 slash-command 지침 포함 |
| OpenCode | skill 등록 및 명령 지침 주입 plugin hook 포함 |
| Cursor | plugin metadata와 command 지침 포함 |
| Aider / Continue.dev | Planned |

transcript 자동 탐지가 불안정하면 직접 지정하세요.

```bash
CONTEXTDOCTOR_TRANSCRIPT=/path/to/session.jsonl contextdoctor run --framework=auto
```

## 토큰 효율적인 구조

Context Doctor는 모델에게 거대한 HTML을 출력하게 하지 않습니다.

1. template, CSS, script, parser, renderer는 로컬에 있습니다.
2. 모델 판단이 필요할 때도 작은 JSON annotations만 출력합니다.
3. 로컬 renderer가 디스크의 transcript를 읽고 annotations와 합쳐 HTML을 생성합니다.

## Contributing

좋은 첫 기여는 adapter 개선, 테스트 fixture 추가, README 번역입니다. 핵심 약속은 유지해 주세요: local-first, read-only, token-efficient, one-command report.
