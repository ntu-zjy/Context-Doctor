# 🩺 Context Doctor

<p align="center">
  <img src="docs/assets/contextdoctor-logo.svg" width="128" height="128" alt="Context Doctor Logo">
</p>

<p align="center">
  <b>컨텍스트 오염 탐지 및 복구 도구</b>
</p>

<p align="center">
  <a href="README.md">中文</a> |
  <a href="README.en.md">English</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.ko.md">한국어</a>
</p>

---

## 🎯 해결하는 문제

AI Agent(Claude Code, Codex, Cursor 등)를 사용할 때 다음과 같은 경험이 있나요?

1. **프롬프트 모순** - 이전 지시사항이 현재 목표와 충돌하여 AI를 혼란스럽게 함
2. **Skill/Plugin 충돌** - 너무 많은 도구가 로드되어 서로 간섭하거나 기능이 중복됨
3. **오류 누적** - 초기의 작은 오류로 인해 후속 모든 추론이 벗어남

**Context Doctor**는 이러한 "컨텍스트 오염" 문제를 탐지하고 복구합니다.

---

## ✨ 기능

- 🔍 **스마트 탐지** - Skill 충돌, 지시 모순, 오류 누적의 3가지 오염 유형을 자동으로 식별
- 📊 **시각적 보고서** - Starbucks 디자인 시스템을 사용한 아름다운 HTML 보고서
- 🌍 **다국어 지원** - 중국어, 영어, 일본어, 한국어, 보고서 내에서 언어 전환 가능
- 📅 **타임스탬프 관리** - 보고서는 `~/.contextdoctor/reports/`에 자동 저장, 시간순 정렬
- 🔧 **원클릭 복구** - 문제를 탐지할 뿐만 아니라 구체적인 해결책도 제공
- 🚀 **최소 설치** - 하나의 명령으로 지원되는 모든 Agent 프레임워크에 설치
- 🎨 **프레임워크 유연성** - Claude Code, Codex CLI, Cursor, OpenCode/Crush 지원

---

## 📦 설치

### 방법 1: 자동 설치 스크립트

```bash
# 프로젝트를 다운로드한 후 설치 스크립트를 실행
node scripts/install.mjs
```

### 방법 2: 수동 설치

#### Claude Code

```bash
# 스킬 디렉토리 생성
mkdir -p ~/.claude/skills/contextdoctor
mkdir -p ~/.claude/skills/repair

# 스킬 파일 복사 (프로젝트 디렉토리에서 실행)
cp plugins/contextdoctor/skills/contextdoctor/SKILL.md ~/.claude/skills/contextdoctor/
cp plugins/contextdoctor/skills/repair/SKILL.md ~/.claude/skills/repair/
```

#### Codex CLI

```bash
# 글로벌 스킬 디렉토리 생성
mkdir -p ~/.agents/skills/contextdoctor
mkdir -p ~/.agents/skills/repair

# 스킬 파일 복사
cp plugins/contextdoctor/skills/contextdoctor/SKILL.md ~/.agents/skills/contextdoctor/
cp plugins/contextdoctor/skills/repair/SKILL.md ~/.agents/skills/repair/
```

#### Cursor

```bash
# 명령 디렉토리 생성
mkdir -p ~/.cursor/commands

# 명령 설정 복사
cp plugins/contextdoctor/.cursor-plugin/plugin.json ~/.cursor/commands/contextdoctor.json
```

#### OpenCode / Crush

```bash
# 명령 디렉토리 생성
mkdir -p ~/.config/opencode/commands

# 명령 파일 복사
cp plugins/contextdoctor/commands/contextdoctor.md ~/.config/opencode/commands/
```

---

## 🚀 사용법

### 컨텍스트 오염 확인

```bash
/contextdoctor
```

다음을 표시하는 HTML 보고서 생성:
- 종합 건강 점수(0-100)
- 오염 유형 분포
- 구체적인 문제 목록
- 복구 우선순위 권장사항

### 복구 솔루션 받기

```bash
/repair
```

탐지 보고서 외에도 다음을 제공:
- 각 문제에 대한 구체적인 복구 단계
- 복사하여 붙여넣기 가능한 수정 텍스트
- 권장 컨텍스트 정리 전략

---

## 📊 보고서 미리보기

<p align="center">
  <img src="img/Snipaste_2026-04-27_16-49-33.png" width="800" alt="건강 점수 개요">
  <br>
  <em>종합 건강 점수 개요 — 컨텍스트 상태를 한눈에 파악</em>
</p>

<p align="center">
  <img src="img/Snipaste_2026-04-27_16-50-19.png" width="800" alt="다국어 전환">
  <br>
  <em>다국어 인터페이스 — 중국어/영어/일본어/한국어 원클릭 전환</em>
</p>

<p align="center">
  <img src="img/Snipaste_2026-04-27_16-50-33.png" width="800" alt="문제 상세 목록">
  <br>
  <em>문제 상세 목록 — 빨간색(심각), 금색(경고), 녹색(제안) 단계별 표시</em>
</p>

<p align="center">
  <img src="img/Snipaste_2026-04-27_16-50-48.png" width="800" alt="복구 솔루션">
  <br>
  <em>/repair 명령어 — 즉시 사용 가능한 구체적인 복구 솔루션 제공</em>
</p>

보고서 기능:
- 🎨 **Starbucks 디자인 시스템** - 따뜻한 색조, 편안한 읽기 경험
- 🌍 **다국어 인터페이스** - 중국어/영어/일본어/한국어 원클릭 전환
- 📅 **타임스탬프 명명** - `~/.contextdoctor/reports/`에 자동 저장, 이력 추적 용이
- 📱 **반응형 레이아웃** - 데스크톱 및 모바일 장치 지원
- 🌈 **심각도 색상 코딩** - 빨간색(심각), 금색(경고), 녹색(제안)
- 📈 **동적 차트** - 직관적인 문제 분포 시각화

---

## 🏗️ 지원되는 프레임워크

| 프레임워크 | 설치 방법 | 명령어 |
|-----------|----------|--------|
| Claude Code | Skill 시스템 | `/contextdoctor`, `/repair` |
| OpenAI Codex | Skills 시스템 (`.agents/skills/`) | `$contextdoctor`, `$repair` |
| Cursor | Custom Commands | `/contextdoctor`, `/repair` |
| OpenCode | `commands/` 디렉토리 | `/contextdoctor`, `/repair` |
| Crush | JSON 설정 | `contextdoctor`, `repair` |

---

## 📖 문서

- [COMMANDS_REFERENCE.md](docs/COMMANDS_REFERENCE.md) - 프레임워크 명령어 구현 참조
- [DESIGN.md](docs/DESIGN.md) - 보고서 디자인 사양(Starbucks 디자인 시스템)
- [Begin.md](docs/Begin.md) - 프로젝트 요구사항 문서

---

## 🛠️ 개발

```bash
# 저장소 클론
git clone https://github.com/contextdoctor/contextdoctor.git
cd contextdoctor

# 의존성 설치
npm install

# 테스트 실행
npm test

# 플러그인 빌드
npm run build
```

---

## 🤝 기여

코드 기여, Issue 제출, 문서 개선을 환영합니다!

1. 이 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

---

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

---

<p align="center">
  🩺 <b>Context Doctor</b> - 대화 컨텍스트 건강 지킴이
</p>
