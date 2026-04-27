<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="96" alt="Context Doctor logo">
</p>

<h1 align="center">Context Doctor</h1>

<p align="center">
  코딩 에이전트 대화의 <strong>context pollution</strong>을 찾는
  로컬 <code>/contextdoctor</code> 명령입니다.
  오래된 메시지, 실패한 도구, 낡은 파일 경로, 충돌하는 지시가 에이전트를 헷갈리게 하는지 보여줍니다.
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
  <img alt="Context pollution" src="https://img.shields.io/badge/solves-context%20pollution-f97316">
  <img alt="Local first" src="https://img.shields.io/badge/local--first-no%20cloud%20upload-0f766e">
  <img alt="Frameworks" src="https://img.shields.io/badge/Codex%20%7C%20Claude%20Code%20%7C%20OpenCode%20%7C%20Cursor-supported-7c3aed">
</p>

---

## 해결하는 문제는 Context Pollution입니다

Context pollution은 코딩 에이전트 대화 안에 현재 작업에 도움이 되지 않거나 오히려 방해되는 정보가 너무 많이 남아 있는 상태입니다.

오래된 요구사항, 실패한 명령 출력, 낡은 파일 경로, 이미 정정한 오해, 관련 없는 skill, 이전 작업 설명 등이 원인이 될 수 있습니다.

이런 내용이 대화에 남아 있으면 에이전트가 아직 유효한 정보처럼 사용해 버릴 수 있습니다.

## 어떤 모습으로 나타나나요?

이런 상황을 겪어본 적이 있을 겁니다.

- 버그 하나를 디버깅한 뒤, 같은 대화에서 새 기능 작업으로 넘어갔습니다.
- 명령이 실패했고 긴 에러 로그가 아직 채팅에 남아 있습니다.
- 에이전트를 한 번 정정했지만, 잘못된 가정이 여전히 근처에 있습니다.
- 이전 작업에서 로드한 skill을 지금 작업에도 계속 따르고 있습니다.
- 한 시간쯤 지나면 에이전트가 잘못된 파일을 수정하기 시작합니다.

Context Doctor는 코드를 검사하는 도구가 아니라, 이 대화 자체를 검사하는 도구입니다. 로컬 transcript를 읽고 현재 작업을 오염시킬 가능성이 높은 메시지를 찾아 브라우저 리포트로 보여줍니다.

리포트는 세 가지 질문에 답합니다.

- 지금 세션을 방해하는 것은 무엇인가?
- 얼마나 심각한가?
- 무엇을 다시 말하고, 무엇을 무시하고, 언제 새 대화로 옮겨야 하는가?

## 무엇을 얻나요?

- 현재 에이전트 세션의 0-100 health score
- user / assistant / tool call / tool result 타임라인
- 의심스러운 메시지에 빨간색, 주황색, 노란색 표시
- 이해하기 쉬운 이유와 수정 제안
- 실패한 명령, 오래된 파일 경로, 이전 작업, 충돌하는 지시 등으로 필터링
- 오프라인에서도 열리는 self-contained HTML

## 언제 실행하나요?

다음과 같은 상황에서 `/contextdoctor`를 실행하세요.

- 에이전트가 계속 오래된 파일이나 작업을 언급할 때
- 긴 대화 뒤 갑자기 답변 품질이 떨어질 때
- 실패한 tool call이 많아 채팅이 시끄러워졌을 때
- 같은 대화에서 작업을 전환했을 때
- 최신 지시가 무시되는 것처럼 보일 때

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

## 프레임워크별 설치

먼저 repository root에서 CLI를 `PATH`에서 사용할 수 있게 합니다.

```bash
npm link
```

Codex local plugin:

```bash
# .agents/plugins/marketplace.json이 ./plugins/contextdoctor를 가리키도록 둡니다
contextdoctor run --framework=codex
```

Claude Code slash command:

```bash
mkdir -p .claude/commands
ln -sf "$PWD/plugins/contextdoctor/commands/contextdoctor.md" \
  .claude/commands/contextdoctor.md
contextdoctor run --framework=claude
```

OpenCode plugin:

```json
{
  "plugin": ["contextdoctor@git+file:///absolute/path/to/Context-Doctor/plugins/contextdoctor"]
}
```

```bash
contextdoctor run --framework=opencode
```

Cursor 또는 transcript-first agent:

```bash
contextdoctor run \
  --framework=cursor \
  --transcript /path/to/session.jsonl
```

직접 만든 agent 또는 multi-agent system은 agent마다 transcript를 따로 쓰고 명시적으로 진단하는 방식을 권장합니다.

```bash
contextdoctor run --framework=auto --transcript ./logs/planner.jsonl
contextdoctor run --framework=auto --transcript ./logs/coder.jsonl
contextdoctor run --framework=auto --transcript ./logs/reviewer.jsonl
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
