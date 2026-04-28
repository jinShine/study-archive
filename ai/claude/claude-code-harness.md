# 클로드 코드 실전 활용 — Harness Engineering

> **AI가 잘 일하는 환경을 설계하는 기술.**
> 기본 개념·명령어는 → [claude-code.md](./claude-code.md) / 여기는 실전 운영 + Harness 30일 가이드.

---

## 📚 목차

- [1장. Harness란 무엇인가](#1장-harness란-무엇인가)
  - [1.1 왜 지금 Harness인가](#11-왜-지금-harness인가)
  - [1.2 Harness Engineering 정의](#12-harness-engineering-정의)
  - [1.3 6개 축 — 환경 설계의 틀](#13-6개-축--환경-설계의-틀)
- [2장. 구조 (Scaffolding)](#2장-구조-scaffolding)
  - [2.1 표준 폴더 구조](#21-표준-폴더-구조)
  - [2.2 사람의 문서 vs AI의 문서](#22-사람의-문서-vs-ai의-문서)
  - [2.3 AI의 5가지 도구 — Skills/Agents/Plugins/Hooks/MCP](#23-ai의-5가지-도구--skillsagentspluginshooksmcp)
- [3장. 맥락 (Context)](#3장-맥락-context)
  - [3.1 CLAUDE.md 3단 상속](#31-claudemd-3단-상속)
  - [3.2 Progressive Disclosure](#32-progressive-disclosure)
  - [3.3 세션 관리 — 쌓이면 비워라](#33-세션-관리--쌓이면-비워라)
- [4장. 계획 (Planning)](#4장-계획-planning)
  - [4.1 "해줘"의 함정](#41-해줘의-함정)
  - [4.2 AskUserQuestion 패턴](#42-askuserquestion-패턴)
  - [4.3 커스텀 Plan 스킬](#43-커스텀-plan-스킬)
- [5장. 실행 (Orchestration)](#5장-실행-orchestration)
  - [5.1 슬래시 명령어 — 워크플로우 자동화](#51-슬래시-명령어--워크플로우-자동화)
  - [5.2 서브에이전트 — 가상 팀원](#52-서브에이전트--가상-팀원)
  - [5.3 스킬 (Agent Skill)](#53-스킬-agent-skill)
  - [5.4 MCP — 외부 도구 연결](#54-mcp--외부-도구-연결)
  - [5.5 3가지 실행 패턴 (Single/Subagent/Team)](#55-3가지-실행-패턴-singlesubagentteam)
  - [5.6 Ralph Loop — 될 때까지 반복](#56-ralph-loop--될-때까지-반복)
- [6장. 검증 (Verification)](#6장-검증-verification)
  - [6.1 Sprint Contract — 기준이 있어야 검증 가능](#61-sprint-contract--기준이-있어야-검증-가능)
  - [6.2 Generator/Evaluator 분리](#62-generatorevaluator-분리)
  - [6.3 Hooks — 행동 강제 자동화](#63-hooks--행동-강제-자동화)
  - [6.4 안전장치 3종](#64-안전장치-3종)
- [7장. 개선 (Compound)](#7장-개선-compound)
  - [7.1 3번 법칙](#71-3번-법칙)
  - [7.2 플러그인 & 마켓플레이스](#72-플러그인--마켓플레이스)
  - [7.3 단순화 — 좋은 Harness는 작아진다](#73-단순화--좋은-harness는-작아진다)
- [8장. 30일 실전 가이드](#8장-30일-실전-가이드)
- [9장. 자가 진단 체크리스트](#9장-자가-진단-체크리스트)
- [10장. 실전 도구 레퍼런스](#10장-실전-도구-레퍼런스)

---

## 1장. Harness란 무엇인가

### 1.1 왜 지금 Harness인가

#### 문제: 프롬프트로는 한계가 있다

같은 모델, 같은 사람이 시켰는데 어떤 날은 한 번에 끝나고 어떤 날은 열 번을 다시 시켜도 결과가 엉망이다. 왜?

> **프롬프트로 해결할 수 없는 영역이 있다.**
>
> - AI가 커밋 전 반드시 테스트를 돌리게 만드는 것
> - AI가 `git push --force`를 절대 실행하지 못하게 막는 것
> - AI가 실수해도 메인 브랜치에 영향이 가지 않도록 격리
> - 여러 AI가 다른 관점에서 병렬 검증

이런 건 "하지 마"라고 말한다고 해결되지 않는다. **환경**이 필요하다.

#### 업계의 신호 (2025~2026)

| 회사 | 사례 |
| --- | --- |
| **LangChain** | 같은 모델로 4주만에 Terminal-Bench 30위 → Top 5. **하네스만** 바꿈. |
| **OpenAI** | 엔지니어 3~7명이 5개월간 100만 줄 코드 — 인간 작성 **0줄**. 5개월 동안 한 일은 "코딩"이 아니라 "AI가 코딩할 환경 설계" |
| **Anthropic** | 싱글 에이전트 $9 (실패) → 3-에이전트 하네스 $200 (완전 동작). 비용 줄이려면 "더 싼 모델"이 아니라 "더 나은 하네스" |
| **Stripe** | 주당 1,000개 PR이 완전 무인 자동 머지. **촘촘한 하네스** 덕분 |

> 🎯 **공통 메시지: 모델 교체 5% 개선보다, 하네스 설계 15% 개선이 현실적.**

#### 진화의 3단계

```text
Level 1: Prompt Engineering — "이렇게 말해봐"
                              (2023~2024 화두, 한계 명확)
              ↓
Level 2: Context Engineering — "이런 배경지식을 줘봐"
                               (시스템 프롬프트, RAG, 프로젝트 문서)
              ↓
Level 3: Harness Engineering — "환경 자체를 설계하자"
                               (도구·규칙·경계·검증·개선 루프 모두)
```

세 단계는 **대체가 아니라 축적**. Harness는 Prompt와 Context 위에 쌓아 올리는 것.

---

### 1.2 Harness Engineering 정의

> **AI가 혼자서도 잘 일할 수 있는 작업 환경을 만들어주는 것.**

#### 비유 — 신입사원이 들어왔을 때

신입에게 우리가 준비하는 것들:

| 무엇 | Harness 용어 |
| --- | --- |
| 책상·노트북 | **도구** |
| 회사 위키 | **맥락** |
| 코딩 컨벤션 | **규칙** |
| "이건 선임 승인받고" 체크리스트 | **경계** |
| 코드 리뷰 프로세스 | **검증** |
| 매주 회고 | **개선** |

신입이 아무리 똑똑해도 환경 없으면 헤맨다. 있으면 처음 보는 일도 처리한다. **AI도 똑같다.**

#### 사람의 역할 변화

| | 예전 | 지금 |
| --- | --- | --- |
| 개발자 가치 | 코드를 잘 쓰는 능력 | 잘 일하는 환경 설계 |
| 일하는 방식 | 직접 하는 것 | 잘 하게 만드는 것 |

> **AI가 코드를 쓰는 시대, 사람의 역할은 "잘 짜기"에서 "잘 일하는 환경을 만들기"로 바뀐다.**

---

### 1.3 6개 축 — 환경 설계의 틀

```text
┌──────────┐    ┌──────────┐    ┌──────────┐
│  구조    │ ─▶ │  맥락    │ ─▶ │  계획    │
│Scaffold  │    │ Context  │    │ Planning │
│뭘 깔아두나│    │뭘 아는가 │    │뭘 정하나 │
└──────────┘    └──────────┘    └──────────┘
                                     │
                                     ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│  개선    │ ◀─ │  검증    │ ◀─ │  실행    │
│Compound  │    │ Verify   │    │ Execute  │
│어떻게    │    │어떻게    │    │어떻게    │
│나아지나  │    │믿는가   │    │시키는가  │
└──────────┘    └──────────┘    └──────────┘
     ▲
     └─── 다시 구조로 (순환) ───┘
```

| 축 | 역할 | 키 도구 |
| --- | --- | --- |
| **구조** (Scaffolding) | 폴더링·도구 배치·경계 설정 | 폴더 구조, `.claude/`, settings.json |
| **맥락** (Context) | AI가 무엇을 알고 일하는가 | CLAUDE.md, rules/, docs/ |
| **계획** (Planning) | 일 시키기 전 무엇을 할지 정함 | `/specify`, AskUserQuestion |
| **실행** (Execution) | 누가 할지·어떻게 시킬지 | Skills, Subagents, MCP |
| **검증** (Verification) | 결과를 어떻게 믿는가 | Hooks, Sprint Contract, Evaluator |
| **개선** (Compound) | 어떻게 계속 나아지나 | 3번 법칙, session-wrap |

> 💡 **순환 구조**: 개선 단계 인사이트 → 다시 구조로 반영. 돌면 돌수록 AI가 잘 일함 = **Compound Effect**.

---

## 2장. 구조 (Scaffolding)

### 2.1 표준 폴더 구조

#### 비유 — 두 프로젝트

**A**: `src/` 하나에 파일 100개 평면 나열. 비즈니스 로직과 유틸리티가 뒤섞임.
**B**: `src/domain`, `src/services`, `src/infrastructure` 레이어 분리. 테스트는 `tests/`에.

A에서 AI는 추측한다 → 일관성 깨짐 → 시간이 갈수록 엉망.
B에서 AI는 즉시 안다 → 기존 패턴 복제 → 일관된 코드.

> **3개월 뒤 AI 품질 — 구조 없음: 30%, 클린 아키텍처: 85%. 55%p 차이는 모델이 아니라 구조의 차이.**

#### 표준 구조

```text
my-project/
├── src/           # 비즈니스 로직
├── docs/          # AI의 참고 문서 (사람이 관리)
├── tests/         # 검증 인프라
├── .dev/          # AI 작업 흔적 (learnings, troubleshooting)
├── .claude/       # AI 설정
│   ├── rules/     # 상황별 규칙
│   ├── skills/    # 반복 작업 레시피
│   ├── agents/    # 전문가 에이전트
│   ├── hooks/     # 안전장치
│   └── commands/  # 슬래시 명령어
├── out/           # 빌드 산출물 (gitignore)
└── CLAUDE.md      # 프로젝트 지도
```

#### 각 폴더의 책임

| 폴더 | 누가 관리 | 무엇을 담나 |
| --- | --- | --- |
| `src/` | 사람+AI | 실제 비즈니스 로직 |
| `docs/` | **사람** | 비즈니스 룰, ADR, API 스펙 (사람의 진실) |
| `tests/` | 사람+AI | 테스트 코드 |
| `.dev/` | 주로 AI | learnings, troubleshooting, 실험 기록 |
| `.claude/rules/` | 사람 | AI가 따라야 할 규칙 |
| `.claude/skills/` | 사람+AI | 반복 작업 레시피 |
| `.claude/hooks/` | 사람 | 위험 명령 차단 스크립트 |
| `.claude/agents/` | 사람 | 전문 에이전트 정의 |
| `out/` | 시스템 | 빌드 결과물 (gitignore) |
| `CLAUDE.md` | 사람 | 프로젝트 지도 |

#### 1회 세팅 명령

```bash
# 폴더 일괄 생성
mkdir -p src docs tests .dev out
mkdir -p .claude/{rules,skills,agents,hooks,commands}

# .gitignore 세팅
cat > .gitignore << 'EOF'
out/
dist/
build/
node_modules/
.dev/scratchpad/
.DS_Store
.vscode/
.idea/
EOF

# 빈 CLAUDE.md
touch CLAUDE.md

# 첫 커밋
git add . && git commit -m "scaffold: add Harness folder structure"
```

> ⚠️ **`.claude/`는 `.gitignore`에 넣지 마라**. 팀 공유 자산이다.

---

### 2.2 사람의 문서 vs AI의 문서

#### 가장 흔한 실수 — `docs/`에 다 넣기

```text
❌ 비즈니스 요구사항 + 디버깅 기록 + 실험 노트가 한 폴더에
   → 시간 지나면 "진실"과 "흔적" 구분 불가
```

#### ✅ 분리

| 폴더 | 누가 관리 | 무엇을 담나 |
| --- | --- | --- |
| **`docs/`** | 사람 | 비즈니스의 진실 — 도메인 정의, ADR, API 스펙, 온보딩 |
| **`.dev/`** | AI | 작업의 흔적 — learnings, troubleshooting, 작업 로그, 실험 |

> **사람이 docs를 관리하지 않는 순간, AI도 엉뚱한 맥락으로 일한다.**
> docs는 사람의 책임. 여기가 오염되면 AI 결과물 전체가 오염.

#### 실전 예시 (`team-attention/hoyeon`)

```text
docs/learnings/lessons-learned.md       ← 팀이 공식화한 교훈
.dev/specs/{feature}/context/learnings  ← AI가 작업 중 남긴 learnings
.dev/specs/{feature}/context/decisions  ← AI가 내린 결정 기록
.dev/specs/{feature}/context/issues     ← 발견한 이슈
```

---

### 2.3 AI의 5가지 도구 — Skills/Agents/Plugins/Hooks/MCP

`.claude/` 하위에 들어가는 다섯 가지 도구. 헷갈리기 쉬우니 명확히 구분.

#### Skills — 반복 작업의 레시피

`/commit`, `/review`, `/deploy` 같은 슬래시 명령. **"이 상황에서는 이 순서로 작업하라"**는 매뉴얼.

예: `/bugfix` 스킬 = "진단 → 분석 → 수정 → 검증" 4단계 자동.

→ 5장 실행 (Orchestration)에서 자세히.

#### Agents — 전문가 팀원

서브에이전트 파견용 전문화된 AI. 예: `worker`(구현), `reviewer`(검토), `git-master`(커밋) 등.

#### Plugins — 패키지로 묶어 배포

스킬·에이전트·훅을 하나로 묶어 팀/커뮤니티에 배포하는 단위.

#### Hooks — 자동 안전장치

코드 레벨에서 AI 행동을 가로채는 장치 (Pre/Post/Stop/Notification).

→ 6장 검증에서 자세히.

#### MCP — 외부 시스템 연결

DB, Slack, Linear, Gmail 같은 외부 시스템에 AI가 직접 접근하게 해주는 프로토콜.

→ 5장 실행에서 자세히.

#### 경계 설정 — 이중 안전장치

세 가지 질문으로 설계:

1. **뭘 알려줄까?** → CLAUDE.md, .claude/rules/
2. **어디까지 허용?** → settings.json의 Permission Mode (`plan`/`auto`/`bypass`)
3. **뭘 막을까?** → .claude/hooks/

핵심 원칙: **이중 안전장치**.

```markdown
# CLAUDE.md
## 절대 하지 말 것
- main 브랜치 직접 push 금지
- .env 파일 수정 금지
```

```bash
# .claude/hooks/pre-bash.sh — 코드로 강제 차단
if echo "$COMMAND" | grep -qE "git push.*--force"; then
  echo "❌ Force push blocked" >&2
  exit 1
fi
```

> **말로만 경계 설정하지 말고, 코드로도 경계 설정하라.**
> 말로는 뚫려도 코드로는 안 뚫린다.

---

## 3장. 맥락 (Context)

### 3.1 CLAUDE.md 3단 상속

```text
USER     ~/.claude/CLAUDE.md         나만 적용 · 모든 프로젝트 공통
   ↓ 상속
PROJECT  my-app/CLAUDE.md            팀 공유 · Git 커밋 (이 프로젝트만)
   ↓ 상속 + 오버라이드
FOLDER   src/auth/CLAUDE.md          이 폴더 작업 시만 (특수 규칙)
```

**원리: 하위가 상위를 덮어쓴다. 가장 좁은 범위가 우선.**

#### 실전 예시

| 레벨 | 규칙 |
| --- | --- |
| User | "나는 camelCase를 선호한다" |
| Project | "이 프로젝트는 snake_case를 쓴다" |
| Folder (`src/auth/`) | "auth 모듈은 PascalCase (기존 코드 일관성)" |

→ AI가 `src/auth/`에서 작업하면 **PascalCase**, `src/payment/`에서 **snake_case**, 사이드 프로젝트에서 **camelCase**.

#### 각 레벨에 무엇을 쓸까

**User 레벨 (`~/.claude/CLAUDE.md`)** — 내 작업 습관

```markdown
# 개인 작업 스타일
- 응답은 한국어로
- 코드 주석은 영어로
- 불필요한 설명 최소화, 핵심만
- 실수가 있으면 먼저 인정하고 고치기
```

**Project 레벨 (`./CLAUDE.md`)** — 이 프로젝트의 기술 스택, 컨벤션, 제약

```markdown
# 프로젝트명

## 스택
- Next.js 15 (App Router), TypeScript, Shadcn/ui
- 상태: Zustand, 서버 상태: React Query

## 컨벤션
- 컴포넌트: PascalCase, 훅: useCamelCase
- API는 반드시 React Query로 래핑
- 스타일링: Tailwind only

## 절대 하지 말 것
- main 직접 push 금지
- 테스트 없는 API 함수 추가 금지

## 참고 문서
- 아키텍처: docs/architecture.md
- 디자인 시스템: docs/design-system.md
```

**Folder 레벨 (`src/auth/CLAUDE.md`)** — 특정 모듈의 특수 규칙

```markdown
# auth 모듈
- 모든 토큰 검증은 JwtTokenProvider 경유
- 세션은 Redis에 저장 (로컬 메모리 금지)
- 에러는 AuthError 클래스로 감싸서 반환
```

> 🔴 **중요 원칙: 200줄 이하 유지하며 계속 업데이트.** 너무 길어지면 AI가 핵심을 놓친다.

---

### 3.2 Progressive Disclosure

#### 핵심 원칙

> **한꺼번에 다 주면 AI도 헷갈린다.**
> 인간 엔지니어가 회사 모든 문서를 머리에 담고 일하지 않듯이, AI도 **지금 작업에 필요한 정보**만 필요.

해결: **모든 내용을 SKILL/CLAUDE.md에 넣지 말고, "이 상황에서는 이걸 참고해" 포인터만 두기.**

#### 구조

```markdown
# CLAUDE.md (핵심만 30~50줄)

프로젝트 개요와 절대 규칙만 여기.

## 상황별 참고 문서
- 코드 작성 시 → references/code-style.md
- 테스트 작성 시 → references/testing-guide.md
- API 설계 시 → references/api-convention.md
- 배포 준비 시 → references/deploy-checklist.md
```

```text
my-skill/
├── SKILL.md                    # 30~50줄
└── references/
    ├── code-style.md           # 필요할 때만 로드
    ├── testing-guide.md
    ├── api-convention.md
    └── deploy-checklist.md
```

#### glob 패턴 — 자동화된 조건부 로드

`.claude/rules/`의 진가. 규칙 파일 상단에 glob 패턴 → 매칭 파일 작업 시만 자동 로드.

```text
.claude/rules/
├── code-style.md          # glob 없음 → 항상 로드
├── testing.md             # glob 없음 → 항상 로드
├── react-*.md             # glob: **/*.tsx → tsx 작업 시만
├── api-design.md          # glob: **/routes/** → API 라우트 작업 시만
└── security.md            # glob: **/*.sql, **/auth/** → 보안 민감 영역만
```

```markdown
---
glob: ["**/*.sql", "**/auth/**"]
---

# 보안 규칙
- .env 직접 수정 금지
- SQL은 반드시 parameterized query
- 사용자 입력 검증 없이 DB 전달 금지
- auth 에러 메시지에 내부 정보 노출 금지
```

→ AI가 `src/utils/helper.ts` 편집 시 이 파일 안 로드. `src/auth/login.ts` 편집 시 자동 로드.
**규칙은 세밀해지는데 컨텍스트는 가벼워진다.**

---

### 3.3 세션 관리 — 쌓이면 비워라

#### 사용량 가이드

| 사용량 | 상태 | 권장 |
| --- | --- | --- |
| ~20% | 🟢 쾌적 | 계속 진행 |
| ~50% | 🟡 중간 | `/compact` 고려 |
| ~80% | 🔴 과부하 | `/clear` 또는 새 세션 |

#### 3가지 도구

**`/clear`** — 컨텍스트 완전 초기화. **다른 주제로 전환할 때.**

```text
오전: 인증 로직 작업 → 오후: 디자인 시스템 작업
→ /clear (서로 다른 맥락 섞이면 AI 엉뚱)
```

**`/compact`** — 오래된 대화 요약·압축. **같은 주제 이어갈 때.**

```text
같은 리팩토링 계속, 대화 길어졌다
→ /compact (앞부분 세부 대화 버리고 핵심 결정만)
```

**`handoff`** — 현재 맥락을 파일로 저장 → 새 세션에서 이어받기. **내일 이어서 할 작업.**

```text
복잡한 작업 진행 중 → handoff.md로 저장
다음날 → 새 세션에서 그 파일 읽게
```

> 💡 실전 기준: **20~30% 쯤에서 새로 시작.** 50%, 80%까지 참지 않는다. 빨리 비울수록 좋다.

#### 주기적 점검 — 쌓기만 하지 말고 비우기도

```bash
/context
# Skills, Custom agents 사용량 확인
# 안 쓰는 건 정리 대상
```

CLAUDE.md가 비대해졌다 싶으면 AI에게 진단:

```text
> CLAUDE.md, .claude/rules를 분석해서 논리적으로 문제가 없는지,
  중복되거나 대치되는 내용은 없는지 분석해줘
```

> **쌓는 것만큼 점검하고 비우는 것도 Context Engineering이다.**

---

## 4장. 계획 (Planning)

### 4.1 "해줘"의 함정

```text
❌ "결제 시스템 리팩토링해줘"
   → AI가 알아서 만듦 (자기 해석)
   → 결과: 엉뚱한 방향
   → "아닌데..." 다시 시킴
   → 또 엉뚱
   → 시간만 날림
```

**왜?** 사람은 자기 머릿속의 전제를 프롬프트에 다 담지 못한다.

> "결제 시스템 리팩토링" 뒤의 암묵적 가정:
> - PG사 연동 유지
> - DB 스키마 건드리지 않기
> - 기존 테스트 통과
> - 성능 해치지 않기

**해결: 계획과 실행을 분리하라.**

```text
✅ "결제 시스템 리팩토링할 건데, 같이 계획 세워보자"
   1. AI가 계획 초안 작성
   2. 사람이 검토 + 명시
   3. AI 수정
   4. 사람 승인
   5. 승인된 계획대로 AI 실행
   6. 검수 기준이 명확하니 빠르게 통과
```

> **계획 단계 10분 = 실행 단계 1시간 절약.**

---

### 4.2 AskUserQuestion 패턴

가장 강력한 기법. **AI가 사람에게 질문하게 만들기.**

#### 마법의 한 문장

```text
> 결제 시스템을 리팩토링하려고 해.
  너가 지금 이해한 게 뭔지 정리해주고,
  모호한 점이 없도록 내게 계속 질문해서 명확하게 해줘.
```

#### 흐름

```text
AI: 이해한 것: 결제 모듈 기존 구조 개선

    질문 1: 현재 PG사 연동이 단일인가요, 멀티인가요?
    질문 2: 구독 결제도 포함되나요?
    질문 3: DB 스키마 변경도 허용 범위인가요?

사용자: 멀티 PG, 구독 포함, DB 스키마는 건드리지 마.

AI: 명확해졌습니다. 그러면 계획을 세우겠습니다...
```

> 💡 **진짜 가치: unknown-unknown 발굴.** 내가 놓치고 있는지조차 몰랐던 고려사항이 AI 질문으로 드러난다.

---

### 4.3 커스텀 Plan 스킬

#### `/specify` (harness 플러그인)

목표를 구조화된 구현 계획(`spec.md`)으로 변환. 인터뷰 기반 계획 수립.

```bash
/specify "사용자 인증 시스템 구현"
```

```text
1. 목표 확인     — 사용자 의도 미러링
       ↓
2. 인터뷰        — AskUserQuestion으로 모호함 해소
       ↓
3. 요구사항 도출 — 기능 + 비기능 분리
       ↓
4. 태스크 분해   — 작업 단위, 의존성 명시
       ↓
5. spec.md 파일  — 구조화된 구현 계획 저장
       ↓
   → /execute 명령으로 플랜 기반 실행
```

핵심 전환: **implicit(머릿속) → explicit(플랜 파일)**

| 이전 | 이후 |
| --- | --- |
| 나중에 다시 못 봄 | 다시 볼 수 있다 |
| 팀원과 공유 X | 팀원과 공유 가능 |
| 세션 바뀌면 손실 | 세션 바뀌어도 이어받기 |
| 검증 기준 모호 | 검증 기준 명확 |

#### `/deep-interview` (harness 플러그인)

Socratic 방식의 깊이 있는 요구사항 인터뷰. **Ambiguity Score** 기반으로 모호함을 정량 측정.

```bash
/deep-interview "주제"
```

#### `/clarify` (plugins-for-claude-natives)

객관식 질문으로 애매함 해소 + Before/After 비교.

```text
Before: "Add a login feature"
After:  Goal: Add username/password login with self-registration.
        Scope: Login, logout, registration, password reset.
        Constraints: 24h session, bcrypt, rate limit 5 attempts.
```

> **계획 단계에서 모호함을 줄이는 것이 실행 품질을 결정한다.**

---

## 5장. 실행 (Orchestration)

### 5.1 슬래시 명령어 — 워크플로우 자동화

#### 비유 — 키보드 매크로

```text
매번 "테스트 먼저 짜고, 구현하고, 리뷰해줘" 긴 설명 귀찮다
→ /tdd 한 단어로 대체
```

#### 만드는 법

```text
파일 이름  =  명령어 이름
파일 내용  =  Claude에게 전달할 프롬프트
```

```bash
# 폴더 생성
mkdir -p .claude/commands

# 명령어 생성
echo "이 코드의 성능 문제를 분석하고 최적화 방안 제안" \
  > .claude/commands/optimize.md

# 사용
/optimize
```

#### 저장 위치 (= 범위)

| 위치 | 범위 |
| --- | --- |
| `~/.claude/commands/` | 모든 프로젝트 (개인) |
| `./.claude/commands/` | 이 프로젝트 (팀 공유, Git 커밋) |

#### `$ARGUMENTS` 변수

```markdown
# .claude/commands/explain.md
다음을 비전공자도 이해할 수 있게 설명해줘: $ARGUMENTS

규칙:
- 일상 비유 먼저
- Step 1, 2, 3... 분해
- 반말 톤
```

```bash
/explain @src/auth/login.ts
```

#### 실전 명령어 5선

##### `/review` — 코드 리뷰 자동화

```markdown
방금 작성한 코드를 시니어 개발자 관점에서 리뷰해줘.

체크 항목:
1. 버그/잠재적 오류
2. 성능 이슈
3. 보안 취약점
4. 가독성 (네이밍, 구조)
5. 테스트 커버리지

각 항목마다:
- 발견한 문제 (없으면 "없음")
- 개선 제안 (구체적 코드 예시)

마지막에 종합 점수 (10점 만점)와 한 줄 요약.
```

##### `/commit-kr` — 한국어 커밋 자동 생성

```markdown
스테이징된 변경사항으로 한국어 커밋 메시지 만들어줘.

형식:
- 타입: feat/fix/refactor/docs/test/chore
- 예: `feat: 사용자 로그인 기능 추가`

규칙:
- 제목 50자 이내
- 본문은 "왜"를 설명
- 이모지 금지

메시지 보여주고, OK 하면 커밋 실행.
```

##### `/feature` — 4단계 워크플로우 자동화

```markdown
다음 기능을 개발해줘: $ARGUMENTS

반드시 4단계 워크플로우로 진행:

## 1단계: 탐색
- 관련 파일 찾아서 읽기
- 기존 패턴 파악
- 코드 작성 금지

## 2단계: 계획
- think hard로 구현 전략 수립
- 수정/생성할 파일 리스트
- docs/plans/에 계획 저장

내 승인을 기다린다. "OK"라고 하면 3단계 진행.

## 3단계: 코딩
- 계획대로 구현
- 각 단계마다 검증 (엣지 케이스)
- 테스트도 함께 작성

## 4단계: 커밋
- 한국어 커밋 메시지
- PR 생성 (이유/테스트 방법)
```

##### `/debug` — 체계적 디버깅

```markdown
다음 문제를 체계적으로 디버깅해줘: $ARGUMENTS

순서:
1. **증상 파악**: 정확한 현상
2. **재현 방법**: 어떻게 재현?
3. **로그/에러 확인**: 관련 로그 수집
4. **가설 3개**: 원인 가능성 + 근거
5. **검증**: 각 가설 검증 방법
6. **수정안**: 가장 유력한 원인의 수정 코드

절대 추측만으로 수정 X. 로그·테스트로 원인 확인 후.
```

##### `/onboard` — 새 팀원 온보딩

```markdown
새 팀원이시네요! 프로젝트 온보딩을 도와드릴게요.

순서:
1. @README.md 읽고 프로젝트 개요 요약
2. @CLAUDE.md 읽고 프로젝트 규칙 요약
3. @.claude/rules/ 폴더 규칙 파일들 요약
4. src/ 폴더 구조 설명 (핵심 폴더 중심)
5. 주요 기술 스택과 역할 설명
6. 빌드/테스트 명령어 정리

마지막:
- "첫 번째로 해볼만한 간단한 작업" 제안
- "주의해야 할 점" 정리
```

#### 명령어 조합 — 안전 커밋

```markdown
# .claude/commands/safe-commit.md
안전한 커밋 절차:
1. /review 실행해서 코드 리뷰
2. CRITICAL 이슈 있으면 → 중단
3. 없으면 /commit-kr 실행
4. git push
```

---

### 5.2 서브에이전트 — 가상 팀원

#### 비유

```text
나 (메인 Claude):
  "로그인 만들어줘"
  → 기획·개발·리뷰·테스트 다 혼자 함
  → 컨텍스트 금방 꽉 참

메인 + 서브에이전트:
  "로그인 만들고, @code-reviewer로 리뷰 시켜"
  메인: 개발만
  code-reviewer: 리뷰만
  → 메인 컨텍스트 깨끗 유지!
```

#### 3대 장점

1. **컨텍스트 격리** — 서브에이전트는 독립 컨텍스트 → 메인 깨끗 유지
2. **전문화** — 역할별 최적화 프롬프트 → 더 정확
3. **병렬 처리** — 여러 에이전트 동시 실행 → 빠름

#### 만드는 법

```text
~/.claude/agents/이름.md       (전역)
./.claude/agents/이름.md       (프로젝트, Git 공유)
```

#### 실전 에이전트 — code-reviewer

```markdown
---
name: code-reviewer
description: 코드 작성 완료 후 품질/버그/보안 리뷰. 시니어 관점.
tools: Read, Grep, Glob
---

# 코드 리뷰어

너는 10년차 시니어 개발자다.

## 체크 항목

1. **버그**
   - null/undefined 처리
   - 엣지 케이스
   - 비동기 처리 누락

2. **성능**
   - 불필요한 반복
   - 메모리 누수
   - DB N+1 쿼리

3. **보안**
   - SQL 인젝션
   - XSS 취약점
   - 하드코딩 시크릿

4. **가독성**
   - 네이밍
   - 함수 크기 (30줄 초과 지적)
   - 중복 코드

## 출력
🔴 CRITICAL: 즉시 수정 필요
🟡 MEDIUM: 개선 권장
🟢 LOW: 참고

각 이슈는 구체적 코드 예시 + 개선안.
마지막에 10점 만점 종합 평가.

## 금지
- 애매한 피드백 ("좀 더 좋게")
- 직접 코드 수정 (제안만)
```

#### 실전 에이전트 — security-reviewer

```markdown
---
name: security-reviewer
description: OWASP Top 10 기반 보안 취약점 검사
tools: Read, Grep, Glob
---

# 보안 검토자

OWASP Top 10 기반으로 취약점 찾기.

## 검사 항목
1. Injection (SQL, NoSQL, Command)
2. 인증/인가 (패스워드 평문, JWT 만료)
3. 민감 정보 노출 (API 키 하드코딩)
4. XSS / CSRF
5. 의존성 취약점

## 출력
🔴 CRITICAL: 즉시 수정
🟡 HIGH: 빠른 수정 권장
🟢 INFO: 참고

각 이슈:
- 발견 위치 (파일:라인)
- 공격 시나리오
- 수정 방법 (코드 예시)
```

#### 사용

```bash
# 명시적 호출
"@code-reviewer 에이전트로 방금 작성한 코드 리뷰해줘"

# 또는
"코드 리뷰 전문 에이전트로 @src/auth/login.ts 검토해줘"
```

#### 조합 — 순차 파이프라인

```text
explorer → planner → 메인 (구현) → code-reviewer → test-writer

1. explorer: 관련 파일 탐색
2. planner: 계획 수립
3. 메인: 계획대로 구현
4. code-reviewer: 리뷰
5. test-writer: 테스트 작성
```

#### 조합 — 병렬 검증

```text
구현 완료 ─┬─→ code-reviewer       ─┐
            └─→ security-reviewer  ─┴─ 종합 판단
```

---

### 5.3 스킬 (Agent Skill)

CLAUDE.md가 **프로젝트 전체에 깔리는 지침**이라면, **Skill은 특정 작업 전용 미니 에이전트.**

#### 호출 3가지 방식

| 방식 | 설명 |
| --- | --- |
| 자동 로드 | 클로드가 맥락 분석해 스스로 필요하다고 판단하면 참조 |
| `@`멘션 | `@skill-name`으로 즉시 로드 |
| 슬래시 호출 | `/skill-name`으로 사용자 직접 호출 |

#### SKILL.md 구조

```markdown
---                                          ← 메타데이터 (YAML Front Matter)
name: my-skill-name
description: 이 Skill이 무엇을 하고 언제 사용하는지 명확하게.
allowed-tools: Bash(npm run:*), Read, Write
---                                          ← 여기까지 메타데이터

# My Skill Name                              ← 본문
Skill의 목적과 핵심 원칙을 한두 문장으로.

## 이 Skill을 사용할 때
- 사용 케이스 1
- 사용 케이스 2

## Instructions
[클로드가 따라야 할 구체적인 단계와 규칙]

## Examples
[실제 사용 예시]
```

#### 메타데이터 필드

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `name` | ✅ | Skill 고유 이름 (소문자+하이픈) |
| `description` | ✅ | 용도 설명 — **자동 로드 판단 시 참조** |
| `allowed-tools` | 선택 | 사용 가능 도구 제한 (보안용) |

#### 권한 모델 4단계

| 권한 모델 | 설정 | 동작 |
| --- | --- | --- |
| 무제한 | `allowed-tools` 미설정 | 모든 도구 |
| 읽기 전용 | `Read, Glob` | 파일 읽기만 |
| 파일 수정 | `Read, Write, Edit` | 코드 생성·수정 |
| 파일+명령어 | `Read, Write, Edit, Bash` | 빌드·테스트도 |

##### `Bash` 전체 허용은 위험 → 세부 제한

```yaml
# ❌ 위험
allowed-tools: Read, Write, Edit, Grep, Glob, Bash

# ✅ 권장 — 필요한 명령만 화이트리스트
allowed-tools: Bash(npm run:*), Bash(git add:*), Bash(git commit:*), Read, Write
```

#### 스킬 저장소 4곳

| 사이트 | 특징 | 링크 |
| --- | --- | --- |
| 앤트로픽 공식 | 10만+ Stars, 공식 문서 Skill 포함 | [github.com/anthropics/skills](https://github.com/anthropics/skills) |
| skill.sh (Vercel) | 9만+ Skills, 원커맨드 설치 | <https://skills.sh> |
| awesome-claude-skills | 4만+ Stars, 9개 카테고리 | [github.com/ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) |
| SkillsMP | 통합 검색 | <https://skillsmp.com> |

#### 설치 방법

```bash
# 마켓플레이스 등록
/plugin marketplace add anthropics/skills

# 플러그인 설치
/plugin install document-skills@anthropic-agent-skills
```

#### CLAUDE.md vs Agent Skill 비교

| 구분 | CLAUDE.md | Agent Skill |
| --- | --- | --- |
| 적용 범위 | 프로젝트 **전체** | **특정 작업** (코드 리뷰, API 설계) |
| 로드 | 세션마다 항상 | 맥락 기반 / 호출 시 |
| 권한 제어 | 없음 | `allowed-tools`로 가능 |
| 분량 | 50~200줄 | 수십 줄~수백 줄 |
| 공유 단위 | 프로젝트·전역 | 프로젝트·전역·마켓플레이스 |

---

### 5.4 MCP — 외부 도구 연결

#### 비유 — 스마트폰 앱 설치

```text
스마트폰 기본:    전화·문자·카메라
앱 설치 후:        배달·은행·내비게이션·...

Claude Code 기본: 파일·터미널·웹 검색
MCP 연결 후:       GitHub·DB·Slack·Figma·Playwright·...
```

#### 정의

**MCP (Model Context Protocol)** = Claude에게 **외부 도구를 연결**해주는 표준 프로토콜.

#### 필수 MCP 4종

##### Context7 — 최신 문서 주입

```bash
claude mcp add --transport http context7 \
  https://mcp.context7.com/mcp --scope project
```

```bash
# 프롬프트에 "use context7" 추가하면 최신 문서 참조
"Next.js 15의 서버 액션 예제 보여줘. use context7"
"Tailwind CSS v4 마이그레이션 방법 알려줘. use context7"
```

##### Playwright — 브라우저 자동화

```bash
claude mcp add playwright npx @playwright/mcp@latest --scope project
```

```bash
# UI 개발 반복
"로그인 페이지 만들고, Playwright로 스크린샷 찍어
디자인이랑 비교해줘"

# E2E 테스트
"회원가입 플로우 전체를 Playwright로 테스트"
```

##### Sequential Thinking — 단계별 사고

```bash
claude mcp add sequential-thinking --scope project \
  -- npx -y @modelcontextprotocol/server-sequential-thinking
```

```bash
"이 401 에러 원인을 sequential thinking으로 단계별 분석"
"모노리스 → MSA 전환을 sequential thinking으로 트레이드오프 검토"
```

##### ShadcnUI MCP — 컴포넌트 라이브러리

```bash
npx shadcn@latest mcp init --client claude
```

```bash
"shadcn의 Dialog 컴포넌트 추가하고, 로그인 모달 예제 만들어줘"
"shadcn 컴포넌트만 써서 대시보드 페이지 만들어줘"
```

#### 추가 추천 MCP

| MCP | 설치 | 활용 |
| --- | --- | --- |
| **GitHub** | `claude mcp add github --scope user` | PR 관리, 이슈 조회 |
| **PostgreSQL** | `claude mcp add postgres --scope project` | DB 직접 조회 |
| **Supabase** | `claude mcp add supabase --scope project` | BaaS 통합 |
| **Sentry** | `claude mcp add sentry --scope project` | 에러 추적 |

#### 스코프 차이

| | `--scope project` | `--scope user` |
| --- | --- | --- |
| 저장 위치 | `.mcp.json` | `~/.claude/settings.json` |
| 공유 | Git 커밋 → 팀 공유 | 나만 |
| 적용 범위 | 이 프로젝트만 | 모든 프로젝트 |

#### 풀스택 프로젝트 세팅 예시

```bash
cd my-project

# 1. Context7 (최신 문서)
claude mcp add --transport http context7 \
  https://mcp.context7.com/mcp --scope project

# 2. Playwright (UI 테스트)
claude mcp add playwright npx @playwright/mcp@latest --scope project

# 3. shadcn/ui
npx shadcn@latest mcp init --client claude

# 4. Supabase
claude mcp add supabase --scope project \
  -- npx -y @supabase/mcp-server-supabase

# 5. GitHub
claude mcp add github --scope user \
  -- npx -y @modelcontextprotocol/server-github

# 확인
claude
/status
```

→ 한 프롬프트로 풀스택 작업:

```bash
"Next.js 15 서버 액션으로 (use context7)
Supabase todos 테이블에 할일 추가 기능을
shadcn Button 컴포넌트로 구현하고,
Playwright로 테스트해줘."
```

#### 토큰 보안 — 환경 변수로

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

```bash
# 각 팀원의 셸 환경 (.zshrc)
export GITHUB_TOKEN="ghp_..."
```

> ⚠️ **절대 토큰을 git에 커밋하지 말 것.** 환경변수(`${VAR}`) 문법 사용.

---

### 5.5 3가지 실행 패턴 (Single/Subagent/Team)

| 패턴 | 구조 | 용도 | 비용 |
| --- | --- | --- | --- |
| **Single** | AI → 결과물 | 일상 코딩, 단순 작업 | 1x |
| **Subagent** | 메인 → (조사/작업/검증) → 종합 | 병렬, 전문 관점 | ~2x |
| **Team Mode** | PM ↔ 개발 ↔ 디자인 ↔ QA (상호 소통) | 다관점 복잡 작업 | **~7x** |

> **90%의 경우는 Single이나 Subagent로 충분.** Team Mode는 진짜 다관점 소통 필요한 경우만.

#### 상황별 오케스트레이션

##### 순차 파이프라인 (Single + TaskCreate)

```text
상황: 블로그 글. 조사 → 초안 → 퇴고 순서.
프롬프트: "AI 트렌드 조사 → 초안 작성 → 퇴고까지 순서대로 진행해줘"
동작: TaskCreate로 체크박스 3개, 직렬 수행
```

##### 병렬 Subagent

```text
상황: 경쟁사 3곳 랜딩 페이지 동시 분석. 서로 독립.
프롬프트: "A사, B사, C사 랜딩 페이지를 각각 에이전트 파견해서
         동시에 분석해줘. 끝나면 비교표 만들어"
동작: Agent 3개 spawn, 병렬 분석, 메인이 결과 취합
```

##### Team Mode (Orchestrator-Worker)

```text
상황: 새 기능 설계 + 구현 + 리뷰까지 동시에. 에이전트끼리 소통 필요.
프롬프트: "Team 켜서 설계자, 구현자, 리뷰어 3명 팀 꾸려줘.
         설계 나오면 구현자가 바로 시작해"
```

`team-attention/hoyeon`의 `/execute` 스킬 = Orchestrator-Worker 정교한 구현:

```text
Orchestrator (reads PLAN.md)
  ├── Parse TODOs → Create Tasks with dependencies
  ├── Parallelize non-blocked Tasks
  └── For each TODO:
      ├── Worker agent (implementation)
      ├── Verify (functional, static, runtime)
      ├── Context save (learnings, decisions)
      └── git-master (atomic commit)
```

핵심 규칙:
- **Orchestrator는 코드 안 쓴다** — 위임 + 검증만
- **플랜 체크박스가 단일 진실 공급원** — AI가 마음대로 해석 X
- **실패 태스크 최대 3번 재시도** — 그 후 reconciliation

---

### 5.6 Ralph Loop — 될 때까지 반복

가장 강력한 실행 패턴. **"뭐가 되면 끝인지"만 정해주면 AI가 알아서 될 때까지 돈다.**

```text
1. 완료 기준 합의 (사람이 한 번만)
       ↓
2. AI가 작업
       ↓
3. 기준 충족?
      ├─ NO → 2번으로
      └─ YES → PASS
```

#### 예시

```text
완료 기준: 모바일 반응형 + Lighthouse 90점 이상 + 카피 3번 이상 퇴고

시도 1: 페이지 완성, Lighthouse 72점 → 미달 → 다시
시도 2: 92점, 모바일 레이아웃 깨짐 → 미달 → 다시
시도 3: 레이아웃 수정, 카피 2회만 퇴고 → 미달 → 다시
시도 4: 전 항목 충족 → PASS ✅
```

사람이 한 일은 **기준 정하기 1번.** 나머지는 AI가 알아서.

> 💡 **비동기성**의 힘: 기준 정하고 Loop 시작 → 커피 마시러 갔다 와도 됨.

#### Auto Research — Ralph Loop 확장판

`karpathy/autoresearch` 같은 자율 실험 프레임워크.

```text
코드 수정(train.py) → 실행(5분 학습) → 평가(성능 비교) → 판단(유지/폐기)
         └─────────────── 자동 반복 ───────────────┘
```

세팅:
1. `program.md`에 연구 방향 작성
2. AI가 `train.py`만 수정
3. 학습 후 성능 비교
4. 개선되면 유지, 아니면 폐기 → 다음 실험

결과: 시간당 ~12개 실험 자율 수행. 밤새 무인 운영. **탐색 공간 10배.**

#### `/ultrawork` — 전체 파이프라인 자동화

`team-attention/hoyeon` 제공.

```bash
/ultrawork feature-name
  → /specify (interview + plan)
  → /open (create Draft PR)
  → /execute (implement all TODOs)
```

Stop hook이 각 단계 종료 감지 → 다음 단계 자동 트리거. 사람은 한 줄 입력 + 9개 HITL 체크포인트만 개입.

> **자동화할 수 있는 전환을 수동으로 돌리는 것이 가장 큰 낭비.**

---

## 6장. 검증 (Verification)

### 6.1 Sprint Contract — 기준이 있어야 검증 가능

#### 문제

> "AI한테 맡겼는데 대충 끝냈다고 하는데, 실제로 보니 엉성해요."

기준 없이 시키면:
1. AI가 끝없이 작업 (어디까지인지 모름)
2. 대충 끝내고 끝났다 함 (기준 없으니)

#### 해결: 작업 전 "뭘 만들고 어떻게 검증할지" 합의

##### 1. 완료 조건을 먼저 정한다

```text
"이 3가지가 되면 끝" — 시작 전 합의
- 테스트 커버리지 80% 이상
- Lighthouse 성능 90 이상
- 피드백 3회 이상 반영
```

##### 2. 측정 가능하게

```text
❌ "잘 되게 해줘"
✅ "테스트 통과 + 빌드 성공 + ESLint 에러 0개"
```

> **측정 가능한 조건이어야 AI가 스스로 판단 가능.** 주관적 조건은 사람이 매번 개입.

##### 3. 미달이면 다시 — Ralph Loop와 연결

명확한 기준 = 자동화의 조건.

#### A-items / H-items 분리

`team-attention/hoyeon`이 구체화한 패턴.

| 항목 | 의미 | 예시 |
| --- | --- | --- |
| **A-items** | Agent 자동 검증 | 테스트 통과, 빌드, typecheck, lint |
| **H-items** | Human 확인 필요 | UX 흐름, 디자인 일관성, 비즈니스 판단 |

PLAN.md 최상단의 Verification Summary 섹션에 명시.
→ A-items는 Ralph Loop 자동 검증, H-items만 사람 개입.

---

### 6.2 Generator/Evaluator 분리

검증의 핵심 중 핵심.

> "자기 작업을 평가하면, quality가 mediocre해도 자신있게 칭찬한다." — Anthropic

AI에게 자기 코드 리뷰시키면 "훌륭합니다"라고 답한다. 왜? **같은 컨텍스트에서 만들고 평가하기 때문.** 자기 결정에 대한 합리화 바이어스.

#### 해결: 물리적으로 분리

| 역할 | 설명 |
| --- | --- |
| **Generator** | 결과물 만드는 AI. 자기 일 열심히. |
| **Evaluator** | 결과물 평가하는 AI. 비판적으로. |

두 에이전트가 **다른 세션, 다른 컨텍스트**에서. Evaluator는 Generator의 고민·제약 모름. 결과물만 보고 판단 → 냉정.

> "만든 AI와 확인하는 AI를 분리하는 것이 **가장 강력한 레버**." — Anthropic
> "Evaluator를 회의적으로 튜닝하는 게 Generator를 자기비판적으로 만드는 것보다 **훨씬 쉽다**."

#### 모델도 분리

| 역할 | 추천 모델 | 이유 |
| --- | --- | --- |
| 코드 리뷰 | Codex | 로직 오류, 보안 취약점 |
| 문서 리뷰 | Gemini | 일관성, 정확성 |
| 복잡한 판단 | Opus | 아키텍처, 긴 맥락 |
| 빠른 확인 | Sonnet | 반복 검증, 비용 효율 |

→ `agent-council` 플러그인: "summon the council"이라고 하면 Gemini·GPT·Codex 병렬 호출 → Claude가 합의안 합성.

#### Evaluator 튜닝 예시

```markdown
# evaluator role

너는 코드 리뷰어다. 다음 원칙을 따른다:

1. **기본 자세는 의심.** 일단 작동하는 것처럼 보여도 엣지 케이스 먼저 생각.
2. **"잘 된 것 같다"는 답변 금지.** 구체적 근거 없이 긍정 평가 X.
3. **보안/성능/가독성/테스트 4가지 관점**에서 각각 지적. 지적할 게 없으면 그 관점은 건너뛰기.
4. **판단 근거는 항상 코드의 구체적 라인**에서 온다.
```

#### 에이전트에게 눈을 달아주기

코드 리뷰만으로 부족한 경우(특히 UI). AI에게 **눈** 필요.

| 도구 | 설명 |
| --- | --- |
| **Browser Agent** (chrome-cdp) | Chrome 제어. DOM, 클릭, 스크린샷, 네비게이션 |
| **Computer Use** (built-in MCP) | 스크린샷 + 마우스/키보드 → 모든 앱 제어 |
| **시각 검증 루프** | 만든다 → 스크린샷 → 판단 → 수정 |

```text
만든다 → 스크린샷 → 보고 판단 → 수정한다
        (generate → screenshot → evaluate)
```

→ 디자인 검수, 레이아웃 확인, 시각적 회귀 테스트 자동화.

---

### 6.3 Hooks — 행동 강제 자동화

> 💡 **한 줄 정의**
>
> Skill이 클로드에게 **"어떻게"** 작업할지 **가르친다면**,
> Hook은 **"언제"** 특정 작업이 **"항상"** 실행되도록 **보장**한다.

LLM은 지시 준수율이 100%가 아니다 (멀티턴 평균 59% 저하). 중요한 규칙은 **코드로 강제**해야.

#### Hook 이벤트 4종

| Hook | 발동 시점 | 용도 |
| --- | --- | --- |
| **PreToolUse** | 도구 사용 직전 | 위험 명령 차단, 사전 검증 |
| **PostToolUse** | 도구 사용 직후 | 자동 포맷, 린트, 테스트 |
| **Stop** | Claude 응답 종료 | 세션 요약, 자동 커밋 체크, 알림 |
| **Notification** | 알림 발생 | 데스크톱 알림, 소리 |

#### 기본 구조

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

#### `matcher` — 도구 이름 패턴

| 패턴 | 의미 |
| --- | --- |
| `"Bash"` | 정확히 일치하는 Bash 도구 |
| `"Edit\|Write"` | Edit 또는 Write |
| `""` 또는 `"*"` | 모든 도구 |

#### 환경 변수

```text
$CLAUDE_FILE_PATH   파일 경로 (Write, Edit)
$CLAUDE_COMMAND     실행할 명령어 (Bash)
$CLAUDE_TOOL_NAME   도구 이름
$CLAUDE_PROJECT_DIR 프로젝트 루트
```

#### 실전 Hook 5선

##### 1. 자동 Prettier 포맷

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

##### 2. 자동 린트

```json
{
  "matcher": "Write|Edit",
  "hooks": [{"type": "command",
    "command": "npx eslint --fix \"$CLAUDE_FILE_PATH\" 2>/dev/null || true"
  }]
}
```

##### 3. 위험 명령 차단

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$CLAUDE_COMMAND\" | grep -qE 'rm -rf /|DROP TABLE|FORCE PUSH'; then echo 'DANGEROUS COMMAND BLOCKED' >&2 && exit 2; fi"
          }
        ]
      }
    ]
  }
}
```

> ⚠️ `exit 2`는 **PreToolUse에서만** 차단으로 동작.

##### 4. 작업 완료 알림 (macOS)

```bash
# 1. 알림 도구 설치
brew install terminal-notifier

# 2. ~/.claude/settings.json에 추가
```

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "terminal-notifier -message '작업이 완료되었습니다' -title '클로드 코드' -sound Glass"
          }
        ]
      }
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "terminal-notifier -message '입력을 기다리고 있습니다' -title '클로드 코드' -sound Ping"
          }
        ]
      }
    ]
  }
}
```

##### 5. 슬랙 연동

```bash
# .claude/hooks/notify-slack.sh
#!/bin/bash
set -euo pipefail

SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
[[ -z "$SLACK_WEBHOOK_URL" ]] && exit 0

INPUT=$(cat)
PROJECT_DIR=$(basename "${CLAUDE_PROJECT_DIR:-$(pwd)}")

PAYLOAD=$(jq -n \
  --arg text "✅ 클로드 코드 작업 완료\n프로젝트: \`${PROJECT_DIR}\`" \
  '{blocks: [{type: "section", text: {type: "mrkdwn", text: $text}}]}')

curl -s -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "$PAYLOAD" 2>/dev/null || true
exit 0
```

#### 도입 권장 순서

```text
1. 알림 Hook (Stop/Notification)   ← 안전, 부작용 없음
       ↓
2. 포매팅 Hook (PostToolUse)       ← 파일 수정, 빈도 높음
       ↓
3. 린트 Hook (PostToolUse)         ← 피드백 루프
       ↓
4. 보안 정책 Hook (PreToolUse)     ← exit 2 차단, 신중히
```

#### Hook 주의사항

##### 종료 코드 의미

| 코드 | 의미 | 동작 |
| --- | --- | --- |
| `0` | 성공 | 정상 진행 |
| `2` | 차단 | **PreToolUse만** 차단. stderr가 클로드에게 전달 |
| 그 외 | 오류 | 비차단 오류 |

##### 무한 루프 방지

```text
✅ 안전: PostToolUse에서 Prettier → 파일 변경 없음 → 재트리거 X
❌ 위험: Stop Hook에서 exit 2 → 작업 완료 못 함 → 무한 재시도
```

##### 보안

- 🔒 입력값 반드시 검증 (조작 가능)
- 🔒 `[프로젝트]/.claude/settings.json`은 Git 커밋됨 → 비밀값 환경 변수로
- 🔒 1초 이내로 빨라야 (매번 실행됨)

##### 디버깅

```bash
# 1. 디버그 모드
claude --debug

# 2. Hook 설정 확인
/hooks

# 3. 설정 직접 확인
cat ~/.claude/settings.json | jq '.hooks'

# 4. Hook 단독 테스트
echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf /"}}' \
  | .claude/hooks/block-dangerous.sh
echo "Exit code: $?"   # 2면 차단 성공
```

---

### 6.4 안전장치 3종

검증 실패 시를 대비. **실수를 막는 게 아니라, 실수해도 괜찮은 구조.**

#### 1. 되돌릴 수 있는 환경

```bash
git worktree add ../my-project-ai-branch feature/ai-task
# AI는 이 워크트리에서만 작업 → 메인은 안전
```

`team-attention/hoyeon`의 `hy` CLI:

```bash
hy create auth         # 워크트리 생성 + spec 이동
hy go auth             # 워크트리 이동 + Claude 실행
hy status              # 모든 워크트리 진행률 + PR 상태
hy cleanup auth        # 워크트리 제거 + 브랜치 정리
```

#### 2. 위험한 건 사람이 확인

삭제·배포·외부 발송 같은 **비가역 작업은 반드시 사람 승인**. Runtime Gate 패턴.

hoyeon은 9개 HITL 체크포인트로 강제. HIGH risk(DB 스키마, 인증, breaking API)는 사용자 승인 + rollback 전략 필수.

#### 3. Dry-run 먼저

DB 마이그레이션, 대량 리팩토링 같은 작업은 **실행 전 영향 범위 시뮬레이션**.

> **실수를 0으로 만들려는 시도는 실패한다. 중요한 건 실수의 비용을 낮추는 구조.**
> 되돌릴 수 있으면 실수는 학습 기회.

---

## 7장. 개선 (Compound)

### 7.1 3번 법칙

```text
작업 → 관측(세션+사용 패턴) → 패턴 발견 → Skill 또는 Rule → 더 나은 작업
```

#### 법칙 1: 같은 작업 3번 → Skill로

> 한 번은 우연, 두 번은 징조, **세 번은 패턴**.

예: PR 만들 때마다 체크리스트 — 코드 변경사항 요약, 테스트 결과 첨부, 관련 이슈 링크, 리뷰어 태그.

세 번째에 `/pr-checklist` 스킬로 만들기.

#### 법칙 2: 같은 실수 3번 → Rule로

AI가 자꾸 같은 실수? **AI 문제가 아니라 규칙이 없는 것.**

예: AI가 자꾸 `any` 타입 남발 →

```markdown
# .claude/rules/typescript.md
---
glob: ["**/*.ts", "**/*.tsx"]
---

## 타입 규칙
- `any` 타입 사용 금지. 정 모르면 `unknown` 후 타입 가드.
- 외부 라이브러리 타입 부족하면 별도 `.d.ts` 정의
```

> **실수가 규칙이 되는 순간, 개선 루프가 돌기 시작한다.**

---

### 7.2 플러그인 & 마켓플레이스

#### 플러그인 = "포장지"

```text
지금까지 배운 것들:
📋 CLAUDE.md  ⚡ Skills  🪝 Hooks  🤖 Agents  🔌 MCP  🔧 Commands

⬇️ 묶어서 한 번에 배포 ⬇️

📦 Plugin = 위 6가지를 한 폴더에 묶은 설치 가능한 패키지

→ git clone 한 번 → 팀 전체에 모든 환경 동시 배포!
```

#### 계층 정리

| 단위 | 비유 |
| --- | --- |
| Skill | 하나의 기능 |
| Plugin | 하나의 앱 |
| Marketplace | 앱스토어 |

#### 핵심 명령어

```bash
# 마켓플레이스 추가 (구독)
/plugin marketplace add <github-owner/repo>

# 플러그인 설치
/plugin install <plugin-name>@<marketplace-name>

# 관리 UI
/plugin

# 마켓플레이스 제거
/plugin marketplace remove <name>
```

#### 추천 시작

```bash
# 1. Vercel 스킬 마켓플레이스
/plugin marketplace add vercel-labs/skills

# 2. find-skills 설치 (1.1M+ 설치, 다른 스킬 검색용)
/plugin install find-skills@vercel-labs

# 3. 사용
/find-skills react
```

#### 인기 플러그인 TOP

| 플러그인 | 설명 | 추천 대상 |
| --- | --- | --- |
| **vercel-labs/skills** | `find-skills` 1.1M+ 설치 | 모든 사용자 (시작점) |
| **anthropics/claude-code** | 공식 저장소 | 공식 가이드 참조 |
| **45ck/claude-sdlc-plugin** | SDLC 워크플로우 자동화 | 팀 PR 자동화 |
| **AlexGladkov/claude-code-agents** | 서브에이전트 모음 | 에이전트 라이브러리 |
| **0xdesign/design-plugin** | 디자인 자동화 | 프론트엔드 |
| **AgentSecOps/SecOpsAgentKit** | 보안/SecOps | 보안 검토 자동화 |

#### 팀 전용 플러그인 만들기

```text
GitHub: company-org/claude-code-plugin

├── .claude-plugin/plugin.json
├── skills/
│   ├── company-style/        ← 회사 코딩 스타일
│   ├── api-design/           ← API 규칙
│   └── security-review/      ← 보안 검토
├── commands/
│   ├── pr-checklist.md
│   ├── deploy.md
│   └── onboard.md
├── agents/
│   ├── code-reviewer.md
│   └── security-checker.md
└── hooks/
    └── post-commit-validate.sh
```

새 팀원 온보딩:

```bash
1. claude 실행
2. /plugin marketplace add company-org/claude-code-plugin
3. /plugin install all-skills@company-org
→ 한 줄로 회사 표준 환경 적용 완료!
```

> 💡 **GitHub Private repo도 가능** — 사내 전용 운영.

---

### 7.3 단순화 — 좋은 Harness는 작아진다

> **좋은 Harness는 점점 단순해진다.**

대부분의 시스템은 시간이 갈수록 복잡해진다. Harness는 반대여야.

#### 신호 1: 안 쓰는 건 치운다

한 달간 한 번도 안 쓴 Skill·MCP·Rule은 **즉시 삭제**. 쌓이면 AI slop. 컨텍스트 공간 차지 + AI 판단 흐림.

#### 신호 2: 모델이 좋아지면 Harness 재평가

예전엔 필요했던 가드레일이 새 모델에선 불필요할 수 있음. **모델 업그레이드되면 Harness 다이어트.**

#### 신호 3: 과설계 신호 인식

Skill 30개 넘으면? Rule 50개 넘으면? **과설계.** 일상 작업에 쓰는 스킬은 사실 **5~10개로 충분.** 나머지는 쓰레기.

> **"Harness 공간은 모델이 좋아져도 줄어들지 않는다. 이동할 뿐이다." — Anthropic**

#### `session-wrap` — 개선 자동화

`plugins-for-claude-natives`의 `session-wrap` 플러그인. **2단계 멀티 에이전트 파이프라인.**

```text
Phase 1: 병렬 분석
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ doc-updater  │ automation-  │ learning-    │ followup-    │
│ 문서 갱신    │ scout        │ extractor    │ suggester    │
│ 항목 감지    │ 자동화 기회  │ 인사이트 추출│ 후속 작업    │
└──────────────┴──────────────┴──────────────┴──────────────┘
                            ▼
Phase 2: 검증 (duplicate-checker)
                            ▼
                    사용자 최종 선택
```

```bash
/wrap [commit message]    # 세션 종료 시 전체 파이프라인
/history-insight          # 세션 히스토리 분석
/session-analyzer         # SKILL.md 명세 준수 사후 검증
```

> 사람이 할 일은 **"제안을 받아들일지 말지 결정"** 하나뿐.
> 세션 하나하나가 다음 세션을 더 잘 만드는 연료가 된다 = **진짜 Compound Effect.**

---

## 8장. 30일 실전 가이드

> 이호연 (Team Attention)의 강의 기반 — 초보자가 따라할 수 있는 단계별 가이드.

### 마음가짐 3가지

1. **한꺼번에 다 하려 하지 마세요.** 하루에 한 단계씩.
2. **처음부터 완벽한 Harness는 없습니다.** 쓰면서 다듬는다.
3. **실험용 프로젝트에서 먼저 해보세요.** 실전 프로젝트는 2주차 이후.

### 전체 여정 한눈에

```text
Week 1  [기초 세팅]
Day 0   준비 - 실험용 프로젝트 만들기
Day 1   구조 - 폴더 구조 깔기
Day 2   맥락 1 - User CLAUDE.md
Day 3   맥락 2 - Project CLAUDE.md
Day 4   맥락 3 - 첫 Rule 파일
Day 5   경계 - 간단한 Hook 1개
Day 6~7 복습 + 실제로 써보기

Week 2  [커뮤니티 도구]
Day 8    Harness 플러그인 설치
Day 9    /scaffold, /check-harness 체험
Day 10~11 superpowers/gstack 등 탐색
Day 12~14 실험 프로젝트에서 실전 감 잡기

Week 3  [내 것으로 만들기]
Day 15  내 반복 작업 3개 찾기
Day 16  첫 Skill 만들기
Day 17  계획 스킬 (/specify 패턴)
Day 18~21 실전 프로젝트에 조심스럽게 적용

Week 4+ [개선 루프]
Day 22  session-wrap 설치
Day 23~ 주간 점검 루틴 정착
Day 30  자가 진단
```

---

### Week 1: 기초 세팅

#### Day 0 — 준비 (30분)

**왜 실험용 프로젝트로 시작하나**: 처음 세팅할 때 반드시 실수한다. 규칙 잘못 쓰거나, 폴더 구조 바꿔야 하거나, Hook이 의도치 않게 발동. 실전 프로젝트에서 벌어지면 스트레스만.

```bash
mkdir ~/harness-practice
cd ~/harness-practice
git init
echo "# Harness Practice" > README.md
npm init -y
git add .
git commit -m "initial commit"
claude        # Claude Code 실행 확인
```

**체크포인트:**
- `harness-practice` 폴더가 있다
- `git log`에 첫 커밋이 있다
- 이 폴더에서 Claude Code가 정상 실행된다

#### Day 1 — 구조 (1시간)

```bash
cd ~/harness-practice
mkdir -p src docs tests .dev out
mkdir -p .claude/{rules,skills,hooks,agents,commands}

# .gitkeep 추가
touch src/.gitkeep docs/.gitkeep tests/.gitkeep
touch .dev/.gitkeep out/.gitkeep
touch .claude/rules/.gitkeep .claude/skills/.gitkeep
touch .claude/hooks/.gitkeep .claude/agents/.gitkeep .claude/commands/.gitkeep

touch CLAUDE.md

cat > .gitignore << 'EOF'
out/
dist/
build/
node_modules/
.dev/scratchpad/
.DS_Store
.vscode/
.idea/
EOF

git add . && git commit -m "scaffold: add Harness folder structure"
```

> ⚠️ 흔한 실수:
> - ❌ `docs/`에 모든 걸 다 넣기 → docs는 사람, .dev는 AI
> - ❌ `.claude/`를 `.gitignore`에 → 팀 공유해야 함
> - ❌ 폴더만 만들고 끝 → 내일 CLAUDE.md 작성 전엔 AI가 이 구조를 모름

#### Day 2 — User CLAUDE.md (30분)

`~/.claude/CLAUDE.md` 작성:

```markdown
# 내 작업 스타일

## 커뮤니케이션
- 응답은 한국어로
- 코드 주석은 영어로
- 불필요한 설명 최소화. 내가 물어본 것만 답하기.
- 확실하지 않으면 "확실하지 않음"이라고 명시

## 코딩 일반
- 함수는 짧게 (20줄 이내 권장)
- 변수명은 축약하지 말고 의미 드러나게
- 주석은 "왜"를 쓰지 "무엇"을 쓰지 말 것

## 커밋
- Conventional Commits 스타일 (feat:, fix:, refactor: 등)
- 제목 50자 이내, 한글 가능

## 디버깅 태도
- 증상만 고치지 말고 원인 찾기
- "일단 됩니다" 금지

## 절대 하지 말 것
- 내 승인 없이 main 브랜치에 직접 push
- .env 파일 내용을 로그/응답에 출력
- 확인 없이 rm -rf 실행
```

**확인:** 새 터미널 / 아무 폴더에서 `claude` 실행 → 응답이 한국어로 오는지.

#### Day 3 — Project CLAUDE.md (1시간)

`harness-practice/CLAUDE.md`:

```markdown
# Harness Practice

## 이 프로젝트란
실험용 프로젝트. Harness 세팅 연습.

## 스택
- Node.js 20, JavaScript

## 폴더 구조
- `src/` — 소스 코드
- `docs/` — 비즈니스 문서 (사람 관리)
- `.dev/` — AI 작업 흔적
- `tests/` — 테스트 코드
- `.claude/` — AI 설정 (rules, skills, hooks)

## 컨벤션
- 파일명: kebab-case
- 함수명: camelCase
- 상수: UPPER_SNAKE_CASE
- 테스트: `*.test.js`

## 작업 방식
- 새 기능 추가 전에 `docs/adr/`에 ADR 작성
- 모든 함수에 최소 1개 테스트
- 커밋 전에 `npm test` 통과 확인

## 절대 하지 말 것
- main 브랜치 직접 push 금지 (PR 필수)
- 테스트 없는 함수 커밋 금지
- `.env` 파일 수정 금지

## Quick Start
\```bash
npm install
npm test
npm run dev
\```
```

**테스트:** `claude` 실행 → "간단한 utility 함수 하나 만들어서 src/에 저장해줘"

확인: 파일명 kebab-case? 함수명 camelCase? 테스트 파일 `*.test.js`?

#### Day 4 — 첫 Rule 파일 (30분)

`.claude/rules/code-style.md`:

```markdown
# 코드 스타일 규칙

## 함수
- 20줄 이내 권장
- 파라미터 3개 이하 권장
- 순수 함수 우선

## 네이밍
- boolean은 `is`, `has`, `should` 접두사
- 동사로 시작하는 함수명
- 축약 금지 (usr ✗ → user ✓)

## 주석
- "왜"를 쓰기. "무엇"은 코드가 말한다.
- TODO는 담당자와 날짜 포함

## 에러 처리
- try-catch는 의미 있는 복구가 가능할 때만
- 의미 없이 catch해서 console.log만 찍는 것 금지
```

`.claude/rules/testing.md`:

```markdown
---
glob: ["**/*.test.js", "**/*.spec.js", "**/tests/**"]
---

# 테스트 작성 규칙

## 구조
- Arrange-Act-Assert 패턴
- 각 테스트는 독립적

## 이름
- `it('should ... when ...')` 형식

## 어설션
- 구체적 matcher 사용 (toBe 대신 toBeGreaterThan, toEqual, toContain)

## 금지
- 실제 네트워크 호출 (mock)
- 실제 DB 접근
```

`.claude/rules/security.md`:

```markdown
---
glob: ["**/auth/**", "**/*.sql", "**/routes/**"]
---

# 보안 규칙

## 인증
- 토큰은 httpOnly 쿠키
- 비밀번호는 로그에 절대 X
- 인증 실패에 "user not found" vs "wrong password" 구분 X

## 입력 검증
- 사용자 입력 무조건 검증
- SQL은 parameterized query (concat 금지)

## 민감 정보
- .env 직접 수정 금지
- API 키 코드에 하드코딩 금지
```

**테스트:** `/context` 명령으로 현재 로드된 것들 확인. `src/util.js` 작업 시 `code-style.md`만 로드, `src/auth/login.js` 작업 시 `security.md` 추가 로드.

#### Day 5 — 첫 Hook (45분)

`.claude/hooks/pre-bash.sh`:

```bash
#!/bin/bash
# Pre-bash hook: 위험 명령어 차단

COMMAND=$(cat)

# git push --force 차단
if echo "$COMMAND" | grep -qE "git push.*(--force|-f( |$))"; then
  echo "❌ Force push is blocked." >&2
  exit 1
fi

# rm -rf / 차단
if echo "$COMMAND" | grep -qE "rm -rf /( |$|[^a-zA-Z0-9])"; then
  echo "❌ Dangerous rm -rf / blocked." >&2
  exit 1
fi

exit 0
```

```bash
chmod +x .claude/hooks/pre-bash.sh
```

`.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/pre-bash.sh"
          }
        ]
      }
    ]
  }
}
```

**테스트:** `git push --force origin main 해줘` → 차단됨. `ls -la 해줘` → 통과.

#### Day 6~7 — 점검 + 실제 작업

```bash
tree -a -L 3 -I 'node_modules|.git'
```

**Claude에게 진단 시키기:**

```text
> CLAUDE.md와 .claude/rules/ 내용을 분석해서 논리적으로 문제 없는지,
  중복되거나 대치되는 내용은 없는지 분석해줘
```

**실제 작업:** `src/`에 간단한 URL 파서 함수 만들고 `tests/`에 테스트 작성. 관찰: kebab-case? camelCase? 테스트 `*.test.js`? 함수 20줄 이내? 에러 처리 원칙대로?

**1주차 자가 진단:**
- [ ] 폴더 구조가 표준 방식
- [ ] User, Project 두 레벨 CLAUDE.md
- [ ] 최소 2개 Rule 파일 + glob 패턴
- [ ] 최소 1개 Hook 작동
- [ ] 실제 작업에서 규칙이 지켜짐

---

### Week 2: 커뮤니티 도구

#### Day 8 — Harness 플러그인 설치 (30분)

```bash
# 마켓플레이스 추가
/plugin marketplace add team-attention/harness

# 플러그인 설치
/plugin install harness
```

확인: `/scaffold`, `/check-harness` 명령어 사용 가능.

#### Day 9 — /scaffold, /check-harness 체험 (1시간)

**`/check-harness`** — 실험용 프로젝트에서:

```bash
/check-harness
```

결과: ✅ 있는 것 / ⚠️ 부족한 것 / 💡 개선 제안.

> 나온 제안을 그대로 다 따르지 마라. 참고용. "이런 걸 검사하는구나"를 보고 내 기준에 맞는 것만 채택.

**`/scaffold`** — 새 빈 프로젝트에서:

```bash
mkdir ~/harness-practice-2
cd ~/harness-practice-2
git init
claude

/scaffold
```

→ 1주일에 걸쳐 한 일을 2분 만에. 자동 생성된 것과 내가 만든 것을 비교.

#### Day 10~11 — 커뮤니티 도구 탐색

| 도구 | 설명 | 링크 |
| --- | --- | --- |
| gstack | 개발 스택 프레임워크 | [github.com/garrytan/gstack](https://github.com/garrytan/gstack) |
| superpowers | 코딩 에이전트 강화 | [github.com/obra/superpowers](https://github.com/obra/superpowers) |
| oh-my-claudecode | 설정 번들 | [github.com/Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode) |

**하나만 고르세요.** 셋 다 깔면 충돌. 각 README 5분씩 훑어보고 가장 본인 스타일 맞는 하나 선택. 실험 프로젝트에 설치.

#### Day 12~14 — 실험 프로젝트 실전 감 잡기

3일간 진짜 작업하듯 써보기:

- Day 12: 간단한 REST API 서버 (Express)
- Day 13: 기능 2~3개 추가
- Day 14: 테스트 커버리지 80% 달성

**목적은 프로젝트 완성이 아님.** Harness 어떻게 작동하는지 체감.

매일 마지막에 `.dev/learnings.md` 기록:

```markdown
## 2026-04-XX

### 잘 된 것
- 테스트 파일 작성할 때 testing.md 규칙 자동 적용

### 불편했던 것
- 함수 20줄 규칙이 너무 빡빡

### 다음에 바꿀 것
- [ ] code-style.md에서 함수 라인 제한 30줄로 완화 검토
```

> **이게 Compound Effect의 시작이다.**

---

### Week 3: 내 것으로 만들기

#### Day 15 — 반복 작업 3개 찾기 (30분)

> **3번 법칙**: 같은 작업을 3번 반복하면 → Skill로 만든다.

노트에 적기:

```text
반복 작업 후보:
1. _______________________ (몇 번 했나: __ 회)
2. _______________________ (몇 번 했나: __ 회)
3. _______________________ (몇 번 했나: __ 회)
```

#### Day 16 — 첫 Skill 만들기 (1시간)

방법 1: `/skill-creator` (Anthropic 공식)

```bash
/skill-creator
```

방법 2: 수동 생성

`.claude/skills/create-component/SKILL.md`:

```markdown
---
name: create-component
description: 프로젝트 스타일 적용한 컴포넌트 생성
---

# 컴포넌트 생성

## 사용법
`/create-component <ComponentName>`

## 동작 순서
1. 기본 컴포넌트 폴더 생성 (components/ui/<name>/)
2. 프로젝트 디자인 토큰 적용
3. 타입 정의 (Props 인터페이스)
4. 검증 (typecheck, lint 통과)

## 제약
- 외부 CSS 파일 금지 (Tailwind만)
- 접근성 (aria-*) 빠뜨리지 않기

## 참고
- 디자인 시스템: docs/design-system.md
- 기존 예시: components/ui/button.tsx
```

**테스트:** `/create-component Badge` → 기대 동작 확인 → 다르면 SKILL.md 수정. **여기서 반복 개선이 시작.**

#### Day 17 — 계획 스킬 `/specify` (1시간)

`.claude/skills/specify/SKILL.md`:

```markdown
---
name: specify
description: 일 시키기 전 계획 수립. 모호한 요청을 플랜 파일로 변환.
---

# /specify

AI에게 일을 시키기 전에 함께 계획을 세우는 스킬.

## 사용 시점
- 새 기능 추가 전
- 리팩토링 전
- 버그 수정이 복잡할 때

## 동작 순서

### 1. 의도 미러링
사용자가 말한 것을 내 언어로 요약 → "이런 의도가 맞나요?"

### 2. 인터뷰
사용자의 전제를 끌어내기 위한 질문 최소 3개:
- 현재 코드 상태
- 제약사항 (성능, 호환성, 시간)
- 성공 기준

### 3. 요구사항 도출
- 기능 요구사항: "A를 하면 B"
- 비기능: 성능, 보안, 유지보수성

### 4. 태스크 분해
- [ ] Task 1 (독립)
- [ ] Task 2 (Task 1 후)
- [ ] Task 3 (독립, 병렬 가능)

### 5. 완료 기준 (Sprint Contract)
측정 가능한 기준:
- 테스트 통과 조건
- 빌드 성공 조건
- 코드 리뷰 통과 조건

### 6. 플랜 파일 저장
`plans/YYYY-MM-DD-<slug>.md`

### 7. 승인 대기
검토 후 수정 요청 반영. "승인"이라고 하면 실행.

## 중요 원칙
- 질문이 끝나기 전 코드 작성 금지
- 명확히 답하지 않으면 다시 질문
- 불확실 영역은 "확실하지 않음" 명시
```

**테스트:**

```text
/specify 사용자 알림 시스템 추가
```

기대: 미러링 → 인터뷰 → 요구사항 → 태스크 분해 → 완료 기준 → `plans/YYYY-MM-DD-notification.md` 저장.

바로 코드 짜기 시작하면 **스킬이 제대로 작동 안 함.** SKILL.md 수정.

#### Day 18~21 — 실전 프로젝트에 조심스럽게 적용

**원칙: 작은 것부터.** 한꺼번에 다 깔지 마라.

**Day 18 — 폴더 구조만**

```bash
cd /path/to/실전-프로젝트
mkdir -p .dev
mkdir -p .claude/{rules,skills,hooks,agents}
# CLAUDE.md는 내일 추가
```

**Day 19 — Project CLAUDE.md** (실험 프로젝트 복사하지 말고 새로 작성)

200줄 이하 유지.

**Day 20 — Rules 이식**

실험 프로젝트의 `.claude/rules/code-style.md` 가져와 실전에 맞게 조정. glob 패턴 추가:

```text
.claude/rules/
├── code-style.md          # 항상
├── react.md (glob: **/*.tsx, **/*.jsx)
├── api.md (glob: **/api/**)
└── design-system.md (glob: **/ui/**, **/components/**)
```

**Day 21 — 컴포넌트 스킬 이식**

Day 16의 스킬을 실전 프로젝트 디자인 토큰·구조에 맞게 재작성. **실제 업무로 테스트.**

---

### Week 4+: 개선 루프

#### Day 22 — session-wrap 설치

```bash
/plugin marketplace add team-attention/plugins-for-claude-natives
/plugin install session-wrap
```

테스트:

```bash
/wrap
```

자동 생성:
- 반복 패턴 요약
- 실수 → Rule 후보
- 반복 작업 → Skill 후보
- CLAUDE.md 업데이트 필요 항목

**제안 받아들일지는 사람의 몫.**

#### Day 23~30 — 주간 점검 루틴

매주 금요일 30분:

1. **자가 진단 체크리스트** (9장 참조)
2. **이번 주 `.dev/learnings.md`** 훑어보기 — 패턴 있나?
3. **Skill 사용 빈도** 점검 — 한 달 안 쓴 Skill 삭제
4. **CLAUDE.md 길이** — 200줄 넘었으면 분리
5. **`/context`** 토큰 분포 확인 — Skills 비정상 크면 정리
6. 발견한 개선 포인트 **1~2개만 이번 주 반영**

> ❌ 점검하다가 대대적 개편 X — 한 주 1~2개만
> ❌ "이거 추가하면 좋을 것 같아" 식 X — 반드시 3번 반복 후

---

## 9장. 자가 진단 체크리스트

월 1회 셀프 리뷰. `/check-harness` 스킬로 자동 진단도 가능 (5축 35개 항목).

### ✅ 잘 가고 있다는 신호

- [ ] **같은 말을 두 번 하지 않는다** — 맥락 전달이 잘 되고 있다
- [ ] **실수가 규칙이 된다** — 개선 루프가 돈다
- [ ] **차단 장치가 뭔가를 막고 있다** — 사고가 구조적으로 예방
- [ ] **불필요한 것이 줄어든다** — 복잡해지는 게 아니라 단순해진다

### ❌ 실패하고 있다는 징후

- [ ] **검수에 시간이 더 오래 걸린다** — 검증 자동화 부족. Evaluator 분리 또는 Sprint Contract 명확화
- [ ] **시켰는데 원하는 결과가 안 나온다** — 맥락 전달 또는 계획 단계 부족. CLAUDE.md/Plan 스킬 점검
- [ ] **스킬·에이전트가 많은데 잘 안 쓴다** — Context pollution. 정리하라
- [ ] **가이드 파일이 길어지고 관리 안 된다** — Progressive Disclosure 구조로 재편

### 30일 자가 진단

**기초 설정:**
- [ ] User CLAUDE.md가 200줄 이하
- [ ] Project CLAUDE.md 있음
- [ ] `.claude/rules/` 3개 이상이 의도대로 작동
- [ ] Hook 최소 1개 작동

**도구 활용:**
- [ ] 커뮤니티 플러그인 1개 이상 설치
- [ ] `/scaffold`, `/check-harness` 사용해봄

**내 것 만들기:**
- [ ] 내가 만든 Skill 최소 2개
- [ ] 그 중 1개 이상이 실제 업무에 쓰임
- [ ] 계획 스킬 (`/specify` 같은) 최소 1회 사용

**개선 루프:**
- [ ] session-wrap 설치
- [ ] 주간 점검 최소 2번
- [ ] 처음 만든 rule 최소 1번 수정 (= 살아있는 문서)

**진짜 중요한 것:**
- [ ] 같은 말을 AI에게 두 번 하지 않게 됨
- [ ] AI 결과물 수정 시간이 줄음
- [ ] 이 Harness를 다른 프로젝트에도 적용하고 싶음

> 10개 이상 체크되면 Harness 기본기 갖춘 상태.

---

## 10장. 실전 도구 레퍼런스

### Team Attention 저장소 3종

| 저장소 | 역할 | 추천 대상 |
| --- | --- | --- |
| **team-attention/harness** | 세션 학습용 가벼운 플러그인 | Harness 처음 시작하는 분 |
| **team-attention/hoyeon** | 개인 Harness 완전체 예시 | 구성 전체 참고하고 싶은 분 |
| **team-attention/plugins-for-claude-natives** | 실무 검증 플러그인 모음 | 바로 써먹을 도구 찾는 분 |

#### team-attention/harness

**링크**: <https://github.com/team-attention/harness>

스킬 4종:
| 스킬 | 설명 |
| --- | --- |
| `/check-harness` | 5축 35개 체크리스트로 진단 |
| `/scaffold` | Greenfield 프로젝트 자동 스캐폴딩 |
| `/specify` | 인터뷰 기반 계획 수립 |
| `/deep-interview` | Socratic 방식 깊이 있는 요구사항 인터뷰 |

성숙도 모델 5축 35개:
1. 준비 (Scaffolding)
2. 맥락 (Context)
3. 실행 설계 (Execution)
4. 검증 (Verification)
5. 개선 (Improvement)

각 축은 **L1 시작 → L2 내 것으로 → L3 자율 운영** 3단계.

#### team-attention/hoyeon

**링크**: <https://github.com/team-attention/hoyeon>

핵심 워크플로우:

```text
/specify → /open → /execute → /publish → /compound
```

| 단계 | 스킬 | 역할 |
| --- | --- | --- |
| 1 | `/specify` | 인터뷰 → PLAN.md |
| 2 | `/open` | Draft PR 생성 (`feat/{name}`) |
| 3 | `/execute` | Orchestrator가 PLAN.md → Worker 위임 |
| 4 | `/publish` | Draft → Ready for Review |
| 5 | `/compound` | learnings 추출 → `docs/learnings/` |

**원샷:** `/ultrawork feature-name`

전문 에이전트 9종:

| 에이전트 | 모델 | 역할 |
| --- | --- | --- |
| `worker` | Sonnet | 위임된 TODO 구현 |
| `gap-analyzer` | Haiku | 누락 요구사항/함정 탐지 |
| `tradeoff-analyzer` | Sonnet | 위험도 평가, 대안 제시 |
| `verification-planner` | Sonnet | 검증 전략 |
| `docs-researcher` | Sonnet | 내부 문서 탐색 |
| `external-researcher` | Sonnet | 외부 라이브러리 리서치 |
| `ux-reviewer` | Sonnet | UX 평가 |
| `reviewer` | Opus | 최종 검토 |
| `git-master` | Sonnet | 원자적 커밋 |

`hy` CLI:

```bash
/init                  # 초기 설정 (.dev/config.yml + hy CLI)
/specify auth          # 계획 승인
/worktree create auth  # 워크트리 생성 + spec 이동
hy go auth             # cd + claude 실행
/execute               # 워크트리에서 구현
hy status              # 모든 워크트리 진행률
```

#### team-attention/plugins-for-claude-natives

**링크**: <https://github.com/team-attention/plugins-for-claude-natives>

9개 플러그인:

| 플러그인 | 설명 |
| --- | --- |
| `agent-council` | 다중 모델 합의 ("summon the council") |
| `clarify` | 모호한 요구사항 → 정확한 스펙 |
| `dev` | `/dev-scan` (커뮤니티) + `/tech-decision` |
| `interactive-review` | 웹 UI로 계획 검토 |
| `say-summary` | 응답 음성 요약 (macOS) |
| `youtube-digest` | YouTube → 요약 + 퀴즈 + 한국어 번역 |
| `google-calendar` | 다중 계정 캘린더 통합 |
| `kakaotalk` | 카톡 메시지 (macOS) |
| `session-wrap` | 세션 회고 + 히스토리 분석 |

설치:

```bash
/plugin marketplace add team-attention/plugins-for-claude-natives
/plugin install <plugin-name>
```

### 빠른 치트시트

| 상황 | 스킬 | 출처 |
| --- | --- | --- |
| 새 프로젝트 시작 | `/scaffold` | harness |
| 기존 하네스 점검 | `/check-harness` | harness |
| 요구사항 모호 (심플) | `/clarify` | plugins-for-claude-natives |
| 요구사항 모호 (깊이) | `/deep-interview` | harness |
| 계획 수립 | `/specify` | harness |
| 전체 파이프라인 | `/ultrawork` | hoyeon |
| 기술 선택 결정 | `/tech-decision` | plugins-for-claude-natives |
| 다중 AI 의견 | "summon the council" | plugins-for-claude-natives (agent-council) |
| 세션 회고 | `/wrap` | session-wrap |
| 컨텍스트 관리 | 20% 쾌적 / 50% `/compact` / 80% `/clear` | Claude Code 내장 |

### 기억해야 할 수치

- CLAUDE.md: **200줄 이하** 유지
- 컨텍스트 **20~30%** 차면 새로 시작
- 같은 작업 **3번** → Skill로
- 같은 실수 **3번** → Rule로
- Team Mode 토큰 **~7배**
- 모델 교체 5% < **하네스 설계 15%** 개선
- `/check-harness`: **5축 35개**, **L1/L2/L3** 3단계
- `hoyeon`: **9개 HITL 체크포인트**, **9개 에이전트**
- 실패 태스크 **최대 3번** 재시도

### 다섯 가지 금과옥조

1. **"프롬프트만으로는 부족하다"** — 환경 자체를 설계하라
2. **"한꺼번에 다 주면 AI도 헷갈린다"** — Progressive Disclosure
3. **"해줘가 아니라 물어봐"** — AI가 스스로 맥락을 채우게
4. **"뭐가 되면 끝인지만 정해주면 AI가 계속 돈다"** — Sprint Contract
5. **"좋은 Harness는 점점 단순해진다"** — 복잡해지면 뭔가 잘못됨

---

## 🎯 마무리 — 사람의 역할

| 축 | 사람의 새로운 역할 |
| --- | --- |
| **구조** | 비즈니스 변화에 맞춰 코드베이스 구조 발전. 새 도구 들어오면 폴더링·경계 재설계 |
| **맥락** | CLAUDE.md·docs/ 코드와 함께 갱신. 새 컨벤션 → rules/. 오래된 규칙은 정리 (가비지 컬렉션) |
| **개선** | AI 산출물 품질 모니터링. 반복 실수 → 규칙, 반복 작업 → 스킬. 안 쓰는 것 치우기 |

> **AI가 코드를 쓰는 시대, 사람의 역할은 "잘 짜기"에서 "잘 일하는 환경을 만들기"로 바뀐다.**

### ⚠️ 마지막 경고

> **Harness를 설계할 때 너무 옥죄려고 하지 마세요.**

많은 사람이 Harness 처음 배우면 "이것도 막아야지", "저것도 규칙으로" 하면서 감옥을 짓는다. 결과: AI는 아무것도 할 수 없는 환경.

원칙은 반대:

> **자유도 높게 주고, 안 되는 것만 제한하기.**

생각보다 Agent는 예측 가능하게 잘 움직인다. 좋은 환경을 만들어주면 지시 초과하는 자율성으로 일한다. 당신은 **감옥 설계자가 아니라 좋은 작업 환경 설계자**다.

---

## 📖 참고

- **이론·기본**: [claude-code.md](./claude-code.md) — 명령어/단축키/모델/CLAUDE.md/워크플로우 기본
- **공식 문서**:
  - Anthropic: [Harness design](https://anthropic.com/engineering/harness-design)
  - OpenAI: [Harness Engineering](https://openai.com/index/harness-engineering)
- **Team Attention 저장소** (이 가이드의 도구 기반):
  - [team-attention/harness](https://github.com/team-attention/harness)
  - [team-attention/hoyeon](https://github.com/team-attention/hoyeon)
  - [team-attention/plugins-for-claude-natives](https://github.com/team-attention/plugins-for-claude-natives)
- **참고 저장소**:
  - [karpathy/autoresearch](https://github.com/karpathy/autoresearch) — 자율 실험
  - [obra/superpowers](https://github.com/obra/superpowers) — 코딩 에이전트 프레임워크
  - [garrytan/gstack](https://github.com/garrytan/gstack)
  - [Yeachan-Heo/oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)
