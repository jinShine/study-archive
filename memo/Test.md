# Claude Code 강의 정리

---

## 1. 핵심 개념

### AI 활용 패러다임의 진화

| 단계 | 이름 | 핵심 |
|------|------|------|
| 1단계 | **Prompt Engineering** | 질문을 잘 하는 법 |
| 2단계 | **Context Engineering** | 맥락을 잘 주는 법 |
| 3단계 | **Harness Engineering** | AI를 부리는 법 |

> AI는 더 이상 챗봇이 아니라, **에이전트를 직접 실행하는 방식**으로 진화했다.

### Harness란?

AI에게 **도구, 규칙, 환경**을 세팅해서 **자율적으로 일하게** 만드는 것.

---

## 2. Anthropic의 PGE 구조 (3-에이전트)

```
Plan → Generator → Evaluator(검증)
```

- **Planner** : 작업을 분석하고 계획 수립
- **Generator** : 실제 코드/결과물 생성
- **Evaluator** : 결과물 검증 및 피드백

---

## 3. 주요 구성 요소

### MCP (Model Context Protocol)

- AI가 **외부 도구를 사용할 수 있게** 해주는 연결 규칙 (프로토콜)
- 필요한 도구를 골라서 설치하면, AI가 그 도구를 직접 사용한다
- `json` 파일로 관리

### Skill

- AI에게 가르쳐준 **업무 매뉴얼** (`.md` 파일)
- Skill 없을 때 : "커밋 메시지 형식은 이렇고, PR은 이렇고..." 매번 설명
- Skill 있으면 : `/commit` 한 단어면 끝!

> **MCP + Skill = 자동화**

---

## 4. Agent Development Kit — 5 Layers

Harness 세팅 = 이 5가지를 구성하는 것

| Layer | 구성 요소 | 설명 |
|-------|-----------|------|
| 1 | **CLAUDE.md** | AI에게 주는 업무 지침서 (헌법). 매 세션마다 이 파일을 먼저 읽고 시작. 직접 작성하거나 좋은 것을 가져다 써도 됨 |
| 2 | **Skills** | 반복 업무를 명령어화한 매뉴얼 (`.md`) |
| 3 | **Hooks** | AI 행동에 걸리는 자동 트리거 |
| 4 | **Subagents** | 하위 에이전트에게 작업 위임 |
| 5 | **Plugins** | 확장 기능 |

추가 개념:
- **Rules** : AI의 행동 규칙 파일. 한 번 세팅하면 모든 프로젝트에 자동 적용

```
CLAUDE.md → Skills → Hooks → Subagents → Plugins = 완성
```

---

## 5. 시작하기 (설치)

1. Node.js 설치
2. Claude Code 설치
3. Claude 실행

---

## 6. 워크플로우 예시

```
PM 요청
  └→ Agent Router (자동 판단)
        ├→ 전문 에이전트 (디자인, SEO, 리서치 등) → 결과물 즉시 전달
        ├→ PGE 파이프라인 (개발 작업) → Plan → Generate → Evaluate
        └→ Agent Teams (대규모 협업) → Leader A, B, C 등 병렬 처리
```

> 요청 → 자동 판단 → 최적 경로 선택 → 결과물

---

## 7. PRD (Product Requirements Document)

- **제품 요구사항 정의서** = "뭘 만들 것인가"를 정의하는 문서
- AI 시대에 기획자의 PRD는 **더 중요해졌다**
  - AI가 잘 동작하려면 명확한 요구사항이 필수

---

## 8. 데이터 분석 자동화 (MCP 활용 예시)

```
┌─ 데이터 소스 ──────────┐                          ┌─ 결과물 ───────────────┐
│ GA4 (트래픽, 이벤트)    │                          │                        │
│ GTM (태그 관리)         │                          │ 통합 대시보드          │
│ Clarity (UX 세션)       │ → Claude Code + MCP →   │ 주간 인사이트 보고서   │
│ GSC (검색 성과)         │      커넥터              │                        │
│ Sheets (결제, 매출)     │                          │                        │
│ BigQuery (코호트)       │                          │                        │
└─────────────────────────┘                          └────────────────────────┘
```

---

## 9. Harness Engineering 심화

### 개념

Harness Engineering = AI에게 **도구(MCP), 규칙(Rules), 환경(CLAUDE.md), 기술(Skills), 자동화(Hooks)**를 세팅해서
사람이 일일이 지시하지 않아도 **자율적으로 일하게 만드는 기술**.

```
Prompt Engineering    →  "이렇게 해줘" (매번 지시)
Context Engineering   →  "여기 참고해" (맥락 제공)
Harness Engineering   →  "알아서 해" (환경 구축 후 자율 실행)
```

### 왜 중요한가?

| 비교 | Prompt만 잘 쓸 때 | Harness를 세팅할 때 |
|------|-------------------|-------------------|
| 반복 작업 | 매번 같은 지시 반복 | 한 번 세팅, 자동 실행 |
| 품질 | 프롬프트에 따라 들쑥날쑥 | 규칙/검증이 내장되어 일관적 |
| 확장성 | 1명이 1개 작업 | 여러 에이전트가 병렬 작업 |
| 보안 | 실수 가능 | Hooks가 자동으로 차단 |

### Harness를 구성하는 5가지 요소

```
┌─────────────────────────────────────────────────────┐
│                  Harness Engineering                 │
├─────────┬─────────┬─────────┬───────────┬───────────┤
│CLAUDE.md│  Skills │  Hooks  │ Subagents │  Plugins  │
│ (지침서) │ (매뉴얼) │(자동트리거)│ (위임)    │ (확장)    │
└─────────┴─────────┴─────────┴───────────┴───────────┘
         + Rules (행동 규칙) + MCP (외부 도구 연결)
```

> 이 5 Layers를 직접 하나씩 세팅할 수도 있지만, **Claude Forge**를 쓰면 한 번에 끝난다.

---

## 10. Claude Forge 상세 정리

### Claude Forge란?

> "oh-my-zsh for Claude Code"

Claude Code를 기본 CLI에서 **풀 개발 환경**으로 변환하는 오픈소스 프레임워크.
Harness의 5 Layers(CLAUDE.md, Skills, Hooks, Subagents, Plugins)를 **올인원으로 세팅**해준다.

- GitHub : `sangrokjung/claude-forge` (643+ stars)
- 라이선스 : MIT

### 포함 구성 요소

| 카테고리 | 수량 | 주요 내용 |
|----------|------|-----------|
| **Agents** | 11개 | planner, architect, code-reviewer, security-reviewer, tdd-guide, database-reviewer 등 |
| **Commands** | 40개 | `/plan`, `/tdd`, `/code-review`, `/commit-push-pr`, `/explore`, `/orchestrate` 등 |
| **Skills** | 15개 | build-system, security-pipeline, eval-harness, team-orchestrator, session-wrap 등 |
| **Hooks** | 15개 | Secret 필터링, 원격 명령 차단, DB 보호, 보안 자동 트리거, Rate Limiting 등 |
| **Rules** | 9개 | coding-style, security, git-workflow, golden-principles 등 |
| **MCP Servers** | 6개 | context7, memory, exa, github, fetch, jina-reader |

### 에이전트 구성

**Opus 에이전트 (6개)** — 깊은 분석 & 계획

| 에이전트 | 역할 |
|----------|------|
| planner | 복잡한 기능의 구현 계획 수립 |
| architect | 시스템 설계, 확장성 결정 |
| code-reviewer | 품질, 보안, 유지보수성 리뷰 |
| security-reviewer | OWASP Top 10, 시크릿, SSRF, 인젝션 탐지 |
| tdd-guide | TDD 강제 (RED → GREEN → IMPROVE) |
| database-reviewer | PostgreSQL/Supabase 쿼리 최적화, 스키마 설계 |

**Sonnet 에이전트 (5개)** — 빠른 실행 & 자동화

| 에이전트 | 역할 |
|----------|------|
| build-error-resolver | 빌드/TypeScript 에러 수정 |
| e2e-runner | Playwright E2E 테스트 생성 및 실행 |
| refactor-cleaner | 사용하지 않는 코드 정리 |
| doc-updater | 문서 및 코드맵 업데이트 |
| verify-agent | 빌드/린트/테스트 검증 |

### Agent Router 시스템

키워드 기반으로 **33개 에이전트에 자동 라우팅** — 사용자가 에이전트를 직접 선택할 필요 없음

```
사용자 입력 → Agent Router → 키워드 매칭 → 전문 에이전트 자동 위임
```

예시:
- "코드 리뷰해줘" → `code-reviewer` 에이전트
- "아키텍처 설계" → `architect` 에이전트
- "SEO 분석" → `seo-geo-aeo-strategist` 에이전트

### 6-Layer 보안 시스템 (Hooks)

```
Layer 1: output-secret-filter     → API 키, 토큰, 비밀번호 유출 차단
Layer 2: remote-command-guard     → curl pipe, wget pipe 등 위험 명령 차단
Layer 3: db-guard                 → DROP, TRUNCATE 등 파괴적 SQL 차단
Layer 4: security-auto-trigger    → 코드 변경 시 취약점 자동 스캔
Layer 5: rate-limiter             → MCP 서버 남용 방지
Layer 6: mcp-usage-tracker        → MCP 사용량 모니터링
```

### 주요 워크플로우

**기능 개발 (Feature Development)**
```
/plan → /tdd → /code-review → /handoff-verify → /commit-push-pr → /sync
```

**버그 수정 (Bug Fix)**
```
/explore → /tdd → /verify-loop → /quick-commit → /sync
```

**보안 감사 (Security Audit)**
```
/security-review → /stride-analysis-patterns → /security-compliance
```

**팀 협업 (Team Collaboration)**
```
/orchestrate → Agent Teams (병렬 작업) → /commit-push-pr
```

### 설치 방법

**사전 요구 사항**

| 도구 | 버전 | 확인 명령 |
|------|------|-----------|
| Node.js | v22+ | `node -v` |
| Git | any | `git --version` |
| jq | any | `jq --version` |
| Claude Code CLI | ≥1.0 | `claude --version` |

**방법 1: 플러그인 설치 (권장)**
```bash
# Claude Code 마켓플레이스에서 설치
/plugin marketplace add sangrokjung/claude-forge
/plugin install claude-forge@claude-forge

# 또는 GitHub에서 직접 설치
claude plugin install github:sangrokjung/claude-forge
```

**방법 2: Git Clone (커스터마이징용)**
```bash
# 1. 클론
git clone --recurse-submodules https://github.com/sangrokjung/claude-forge.git
cd claude-forge

# 2. 설치 (심링크를 ~/.claude에 생성)
./install.sh

# 3. Claude Code 실행
claude
```

### 설치 시 install.sh가 하는 일

1. 의존성 체크 (node, git, jq)
2. Git 서브모듈 초기화
3. 기존 `~/.claude/` 백업
4. 7개 디렉토리 + `settings.json`을 `~/.claude/`에 **심링크** 생성
5. CC CHIPS 커스텀 오버레이 적용
6. MCP 서버 + 외부 Skills 설치 (선택)
7. 셸 별칭 추가 (`cc` → `claude`, `ccr` → `claude --resume`)

> 심링크 방식이라 `git pull` 한 번이면 전체 업데이트 완료

### 커스터마이징

```bash
# 기본 설정을 덮어쓰지 않고 로컬 설정 추가
cp setup/settings.local.template.json ~/.claude/settings.local.json
vim ~/.claude/settings.local.json
```

`settings.local.json`은 `settings.json` 위에 자동 머지된다.

---

## 11. 1인 창업자를 위한 Claude Forge 실전 활용법

### 핵심 개념 : Agent Router가 알아서 판단한다

Claude Forge의 가장 강력한 기능은 **Agent Router**다.
"코드 리뷰해줘"라고 말하면 `code-reviewer`가, "SEO 분석해줘"라고 말하면 `seo-geo-aeo-strategist`가 자동으로 투입된다.
즉, 사용자는 **"뭘 해달라"고만 말하면** 된다.

```
사용자: "랜딩페이지 만들어줘"
  └→ Agent Router → web-designer 에이전트 자동 투입

사용자: "사업계획서 초안 작성해줘"  
  └→ Agent Router → product-strategist 에이전트 자동 투입
```

### 1인 창업자에게 유용한 33개 에이전트 (라우팅 테이블)

| 영역 | 키워드 (이렇게 말하면 됨) | 투입 에이전트 |
|------|-------------------------|--------------|
| **기획** | "구현 계획", "복잡한 기능", "설계" | `planner` |
| **기획 (전략)** | "제품 전략", "사업 전략", "로드맵" | `product-strategist` |
| **UI/UX 디자인** | "UI", "UX", "랜딩페이지", "대시보드" | `web-designer` |
| **개발** | "코드 리뷰", "코드 검토" | `code-reviewer` |
| **아키텍처** | "아키텍처", "기술 부채", "설계 판단" | `architect` |
| **TDD** | "테스트", "TDD", "red-green" | `tdd-guide` |
| **DB** | "쿼리 최적화", "스키마 설계" | `database-reviewer` |
| **보안** | "OWASP", "보안 분석" | `security-reviewer` |
| **SEO** | "SEO", "GEO", "AEO", "검색 노출" | `seo-geo-aeo-strategist` |
| **카피라이팅** | "카피", "헤드라인", "CTA", "광고 문구" | `copywriting` |
| **법무** | "계약", "계약서", "NDA", "법률", "판례" | `contract-legal` |
| **세무/회계** | "세금", "세무", "회계", "부가세", "절세" | `financial-accountant` |
| **특허/IP** | "특허", "발명", "청구항", "상표", "IP" | `patent-attorney` |
| **견적** | "견적", "견적서", "가격 제안" | `quotation` |
| **정부지원** | "정부지원", "보조금", "사업계획서", "TIPS" | `gov-support-strategist` |
| **광고** | "광고 최적화", "ROAS", "광고 분석" | `ad-optimizer-team` |
| **그로스** | "마케팅 전략", "growth" | `performance-growth-marketer` |
| **콘텐츠** | "콘텐츠 기획", "YouTube" | `qjc-content` |
| **CRM/영업** | "영업", "세일즈", "리드", "파이프라인" | `crm-manager` |
| **영상** | "Remotion", "영상 제작" | `remotion-creator` |
| **리서치** | "조사", "리서치", "시장 조사", "동향 분석" | `researcher` |
| **AI 연구** | "AI 연구", "논문 분석", "SOTA" | `ai-researcher` |
| **스토리텔링** | "브랜드 스토리", "내러티브", "피치덱" | `storyteller` |

### 1인 창업 단계별 활용 시나리오

#### Phase 1: 아이디어 → 기획

```
"시장 조사해줘 — [분야] 시장 규모와 경쟁사 분석"
  └→ researcher 에이전트

"제품 전략 짜줘 — MVP 기능 정의, 타겟 고객, 차별점"
  └→ product-strategist 에이전트

"사업계획서 TIPS 지원용으로 작성해줘"
  └→ gov-support-strategist 에이전트

"특허 출원 가능한지 검토해줘"
  └→ patent-attorney 에이전트
```

#### Phase 2: 디자인

```
"랜딩페이지 디자인해줘 — SaaS 서비스, 모던 스타일"
  └→ web-designer 에이전트

"CTA 문구 만들어줘 — 무료 체험 유도"
  └→ copywriting 에이전트

"브랜드 스토리 만들어줘 — 투자자 피치덱용"
  └→ storyteller 에이전트
```

#### Phase 3: 개발 (핵심 워크플로우)

가장 자주 쓰게 될 개발 파이프라인:

```
/plan        → planner가 구현 계획 수립, 의존성·리스크 분석
/tdd         → tdd-guide가 RED→GREEN→IMPROVE 사이클 진행
/code-review → code-reviewer가 CRITICAL/HIGH/MEDIUM 이슈 분류
/handoff-verify → verify-agent가 새 컨텍스트에서 빌드·테스트·린트 검증
/commit-push-pr → 커밋 메시지 작성, 푸시, PR 생성까지 자동화
/sync        → 프로젝트 문서 동기화
```

> `/auto 로그인 페이지 만들기` — 이렇게 한 줄 입력하면 계획부터 PR까지 전부 자동 진행

버그 발생 시:
```
/explore     → 코드베이스 탐색, 원인 파악
/tdd         → 실패 테스트 작성 → 최소 수정 → 통과 확인
/verify-loop → 빌드·테스트 반복 검증, 사이드 이펙트 확인
/quick-commit → 빠른 커밋 & 푸시
```

#### Phase 4: 마케팅 & 그로스

```
"SEO 분석해줘 — [사이트 URL] 검색 노출 최적화"
  └→ seo-geo-aeo-strategist 에이전트

"광고 최적화해줘 — Google Ads ROAS 개선"
  └→ ad-optimizer-team 에이전트 (하위: ad-scout-google, ad-compass 등 자동 투입)

"콘텐츠 플랜 짜줘 — YouTube + 블로그 연간 계획"
  └→ qjc-content 에이전트

"마케팅 전략 수립해줘 — B2B SaaS growth"
  └→ performance-growth-marketer 에이전트
```

#### Phase 5: 운영 & 법무

```
"이용약관 작성해줘"
  └→ contract-legal 에이전트

"부가세 신고 준비해줘 — 간이과세자"
  └→ financial-accountant 에이전트

"견적서 만들어줘 — 웹 개발 프로젝트"
  └→ quotation 에이전트

"보안 감사해줘"
  └→ /security-review → /stride-analysis-patterns → /security-compliance
```

### 실전 팁

#### 1. 처음 시작할 때

```bash
# 설치 후 가장 먼저 실행
/guide                    # 3분 인터랙티브 투어

# 혼자서 전체 파이프라인 테스트
/auto 로그인 페이지 만들기   # 계획 → 코드 → 테스트 → PR 전부 자동
```

#### 2. 팀 없이 병렬 작업 하기

`/orchestrate` 커맨드로 Agent Teams를 구성하면, **1인인데 여러 명이 동시에 작업하는 효과**:

```
/orchestrate
  → Leader 에이전트가 작업을 분배
  → 프론트엔드 에이전트 + 백엔드 에이전트 + 테스트 에이전트 병렬 실행
  → 파일 소유권 분리 (머지 충돌 없음)
  → 결과를 합쳐서 /commit-push-pr
```

#### 3. 자연어로 말하면 된다

에이전트 이름을 외울 필요 없음. Agent Router가 키워드를 감지해서 자동 위임:

```
❌ "code-reviewer 에이전트 호출해서 리뷰해줘"
✅ "코드 리뷰해줘"                               → 자동으로 code-reviewer 투입

❌ "seo-geo-aeo-strategist 에이전트로 분석해줘"
✅ "SEO 분석해줘"                                → 자동으로 해당 에이전트 투입
```

#### 4. 커스텀 에이전트 추가

자주 하는 작업이 있으면 `commands/agent-router.md`에 라우팅 추가:

```markdown
| 나만의 키워드 | my-custom-agent |
```

#### 5. 세션 관리

```
세션 시작 시 → context-sync-suggest 훅이 "문서 동기화할까요?" 제안
세션 종료 시 → session-wrap-suggest 훅이 "작업 정리할까요?" 제안
다음 세션   → ccr (claude --resume)로 이전 세션 이어서 작업
```

### 한 눈에 보는 1인 창업자 플로우

```
┌─────────────────────────────────────────────────────────────────┐
│                   1인 창업자 × Claude Forge                      │
├─────────┬───────────────────────────────────────────────────────┤
│         │                                                       │
│  아이디어 │  "시장 조사해줘" → researcher                          │
│         │  "제품 전략 짜줘" → product-strategist                  │
│         │  "TIPS 사업계획서" → gov-support-strategist             │
│         │                                                       │
├─────────┼───────────────────────────────────────────────────────┤
│         │                                                       │
│  디자인  │  "랜딩페이지 만들어줘" → web-designer                   │
│         │  "CTA 문구" → copywriting                              │
│         │  "피치덱 스토리" → storyteller                          │
│         │                                                       │
├─────────┼───────────────────────────────────────────────────────┤
│         │                                                       │
│   개발   │  /plan → /tdd → /code-review → /commit-push-pr       │
│         │  /orchestrate → 병렬 에이전트 팀                        │
│         │  /security-review → 보안 감사                           │
│         │                                                       │
├─────────┼───────────────────────────────────────────────────────┤
│         │                                                       │
│ 마케팅   │  "SEO 분석" → seo-geo-aeo-strategist                  │
│         │  "광고 최적화" → ad-optimizer-team                      │
│         │  "콘텐츠 플랜" → qjc-content                           │
│         │                                                       │
├─────────┼───────────────────────────────────────────────────────┤
│         │                                                       │
│  운영    │  "계약서" → contract-legal                             │
│         │  "세무" → financial-accountant                         │
│         │  "견적서" → quotation                                  │
│         │                                                       │
└─────────┴───────────────────────────────────────────────────────┘
```

> **핵심 : 에이전트 이름을 몰라도 된다. 자연어로 말하면 Router가 알아서 배정한다.**
