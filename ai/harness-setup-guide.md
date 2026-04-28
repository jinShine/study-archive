# 🎯 Harness 처음 세팅하기

**초보자를 위한 30일 실전 가이드 — 이호연 방식 그대로**

---

## 이 가이드를 읽기 전에

### 누구를 위한 가이드인가
- Claude Code나 Cursor를 써본 적은 있지만 "Harness"는 처음 듣는 분
- PDF 자료는 읽었는데 "그래서 뭘 먼저 해야 해?"가 막막한 분
- 이미 프로젝트가 있지만 거기 바로 적용하긴 무서운 분

### 필요한 것
- 컴퓨터에 Claude Code 설치되어 있을 것 (없으면 먼저 `claude.ai/code` 설치)
- Git 기본 사용법
- 하루 30분~1시간 시간

### 소요 시간
- **1주차 (Phase 1)**: 기초 세팅 — 약 4~6시간 (하루 1시간씩)
- **2주차 (Phase 2)**: 커뮤니티 도구 체험 — 약 2~3시간
- **3주차 (Phase 3)**: 내 스킬 만들기 — 약 3~4시간
- **4주차 이후 (Phase 4)**: 개선 루프 정착 — 주 30분씩

### 마음가짐 3가지

1. **한꺼번에 다 하려 하지 마세요.** 이호연님이 강조한 원칙입니다. 하루에 한 단계씩.
2. **처음부터 완벽한 Harness는 없습니다.** 쓰면서 다듬는 겁니다.
3. **실험용 프로젝트에서 먼저 해보세요.** Puree Platform 같은 실전 프로젝트는 2주차 이후에.

---

## 전체 여정 한눈에 보기

```
Week 1  [기초 세팅]
Day 0   준비 - 실험용 프로젝트 만들기
Day 1   구조 - 폴더 구조 깔기
Day 2   맥락 1 - User 레벨 CLAUDE.md
Day 3   맥락 2 - Project 레벨 CLAUDE.md
Day 4   맥락 3 - 첫 Rule 파일
Day 5   경계 - 간단한 Hook 1개
Day 6~7 복습 + 실제로 써보기

Week 2  [커뮤니티 도구]
Day 8   Harness 플러그인 설치
Day 9   /scaffold, /check-harness 체험
Day 10  superpowers 또는 유사 도구 살펴보기
Day 11~14 실험용 프로젝트에 적용해보고 감 잡기

Week 3  [내 것으로 만들기]
Day 15  내 반복 작업 3개 찾기
Day 16  첫 Skill 만들기 (/skill-creator)
Day 17  계획 스킬 시도 (/specify 패턴)
Day 18~21 Puree Platform에 조심스럽게 적용

Week 4+ [개선 루프]
Day 22  session-wrap 설치
Day 23~ 주간 점검 루틴 정착
Day 30  자가 진단 - 2주 후 체크리스트
```

---

# Week 1: 기초 세팅

## Day 0: 준비 (30분)

### 왜 실험용 프로젝트로 시작하나

처음 Harness를 세팅할 때는 반드시 실수합니다. 규칙을 잘못 쓰거나, 폴더 구조를 바꿔야 하거나, Hook이 의도치 않게 발동합니다. 이게 Puree Platform 같은 실전 프로젝트에서 벌어지면 스트레스만 받습니다.

**작은 실험용 프로젝트 하나를 만드세요.** 뭐든 괜찮습니다. TODO 앱, 계산기, 심지어 빈 프로젝트도 됩니다. 목적은 "Harness 설정을 안전하게 연습하는 것"이지 "이 프로젝트를 완성하는 것"이 아닙니다.

### 해야 할 일

1. 터미널을 엽니다.

2. 실험용 프로젝트를 만듭니다:

```bash
mkdir ~/harness-practice
cd ~/harness-practice
git init
```

3. 간단한 README와 package.json 정도만 만들어서 "프로젝트 같은" 상태로 만듭니다:

```bash
echo "# Harness Practice" > README.md
npm init -y  # 또는 본인 선호 언어로 초기화
git add .
git commit -m "initial commit"
```

4. Claude Code가 이 프로젝트에서 실행되는지 확인합니다:

```bash
claude
```

### 체크포인트

- [ ] `harness-practice` 폴더가 있다
- [ ] `git log`에 첫 커밋이 있다
- [ ] 이 폴더에서 Claude Code가 정상 실행된다

### 흔한 실수

- ❌ "처음부터 Puree에 하면 되지 뭐" → 실수하면 스트레스. 분리된 공간 필수.
- ❌ "실험용이니까 대충" → 반대로 해야 합니다. 실전처럼 진지하게, 그러나 안전한 공간에서.

---

## Day 1: 구조 — 폴더 구조 깔기 (1시간)

### 오늘의 목표

이호연님이 제시한 **표준 폴더 구조**를 프로젝트에 세팅합니다.

```
harness-practice/
├── src/           # 비즈니스 로직
├── docs/          # AI 참고 문서 (사람이 관리)
├── tests/         # 검증 인프라
├── .dev/          # AI 작업 기록
├── .claude/       # AI 설정
│   ├── rules/     # 상황별 규칙
│   ├── skills/    # 반복 작업 레시피
│   ├── hooks/     # 안전장치
│   └── agents/    # 전문 에이전트
├── out/           # 빌드 산출물
└── CLAUDE.md      # 프로젝트 지도
```

### 해야 할 일

1. 한 번에 모든 폴더 생성:

```bash
cd ~/harness-practice
mkdir -p src docs tests .dev out
mkdir -p .claude/{rules,skills,hooks,agents}
```

2. 각 폴더에 `.gitkeep` 파일을 넣어서 빈 폴더도 Git이 추적하게 합니다:

```bash
touch src/.gitkeep docs/.gitkeep tests/.gitkeep
touch .dev/.gitkeep out/.gitkeep
touch .claude/rules/.gitkeep .claude/skills/.gitkeep
touch .claude/hooks/.gitkeep .claude/agents/.gitkeep
```

3. 빈 `CLAUDE.md`를 만듭니다:

```bash
touch CLAUDE.md
```

4. `.gitignore`를 세팅합니다:

```bash
cat > .gitignore << 'EOF'
# Build artifacts
out/
dist/
build/
node_modules/

# AI work traces (선택 - 개인 기록만 제외하고 싶다면)
.dev/scratchpad/

# OS / IDE
.DS_Store
.vscode/
.idea/
EOF
```

**주목: `.dev/`는 기본적으로 Git에 포함시킵니다.** AI가 남긴 learnings나 troubleshooting 기록은 팀과 공유하면 가치가 있습니다. 개인 스크래치패드만 제외합니다.

5. 첫 커밋:

```bash
git add .
git commit -m "scaffold: add Harness folder structure"
```

### 각 폴더의 역할 (기억해두기)

| 폴더 | 누가 관리 | 무엇을 담나 |
|---|---|---|
| `src/` | 사람+AI | 실제 비즈니스 로직 코드 |
| `docs/` | **사람** | 비즈니스 룰, ADR, API 스펙 (사람의 진실) |
| `tests/` | 사람+AI | 테스트 코드 |
| `.dev/` | 주로 AI | learnings, troubleshooting, 실험 기록 |
| `.claude/rules/` | 사람 | AI가 따라야 할 규칙 |
| `.claude/skills/` | 사람+AI | 반복 작업 레시피 |
| `.claude/hooks/` | 사람 | 위험 명령 차단 스크립트 |
| `.claude/agents/` | 사람 | 전문 에이전트 정의 |
| `out/` | 시스템 | 빌드 결과물 (Git 제외) |
| `CLAUDE.md` | 사람 | 프로젝트 지도 (내일 작성) |

### 체크포인트

- [ ] `tree -a -L 2` 명령으로 확인했을 때 위 구조가 보인다
- [ ] `git log`에 "scaffold" 커밋이 있다
- [ ] `.gitignore`에 `out/`이 포함되어 있다

### 흔한 실수

- ❌ **`docs/`에 모든 걸 다 넣기** → 사람 문서와 AI 흔적을 분리해야 합니다. docs = 사람, .dev = AI.
- ❌ **`.claude/`를 `.gitignore`에 넣기** → 팀과 공유해야 할 설정입니다. 포함시키세요.
- ❌ **폴더만 만들고 끝** → 내일 CLAUDE.md를 쓰기 전까지는 AI가 이 구조를 "모릅니다". 구조는 첫 단추일 뿐.

---

## Day 2: 맥락 1 — User CLAUDE.md (30분)

### 오늘의 목표

**내 작업 습관을 모든 프로젝트에 자동 적용**하기 위해 User 레벨 CLAUDE.md를 작성합니다.

User CLAUDE.md는 `~/.claude/CLAUDE.md`에 있습니다. 이 파일은 **내 컴퓨터의 모든 Claude Code 프로젝트**에 자동으로 로드됩니다. 한 번만 잘 써두면 어디서든 내 스타일로 일합니다.

### 해야 할 일

1. User 레벨 디렉토리 준비:

```bash
mkdir -p ~/.claude
```

2. `~/.claude/CLAUDE.md` 파일을 만들고 아래 내용을 넣습니다 (본인 선호에 맞게 수정):

```markdown
# 내 작업 스타일

## 커뮤니케이션
- 응답은 한국어로
- 코드 주석은 영어로
- 불필요한 설명 최소화. 내가 물어본 것만 답하기.
- 확실하지 않으면 "확실하지 않음"이라고 명시하기

## 코딩 일반
- 함수는 가능한 한 짧게 (20줄 이내 권장)
- 변수명은 축약하지 말고 의미 드러나게
- 주석은 "왜"를 쓰지 "무엇"을 쓰지 말 것

## 커밋
- Conventional Commits 스타일 (feat:, fix:, refactor: 등)
- 제목은 50자 이내, 한글 가능

## 디버깅 태도
- 증상만 고치지 말고 원인 찾기
- "일단 됩니다" 금지. 왜 되는지 이해하고 답하기

## 절대 하지 말 것
- 내 승인 없이 main 브랜치에 직접 push
- .env 파일 내용을 로그/응답에 출력
- 확인 없이 rm -rf 실행
```

3. 저장하고 끝.

### 이게 정말 적용되는지 확인하기

새 터미널을 열고 아무 폴더에서나:

```bash
cd /tmp
mkdir test-claude
cd test-claude
claude
```

Claude Code에서 간단한 질문을 해보세요:

> "간단한 JavaScript 함수 하나 만들어줘"

만약 User CLAUDE.md가 제대로 로드되었다면:
- 응답이 한국어로 올 것
- 코드 주석은 영어로 되어 있을 것
- 함수는 짧게 되어 있을 것

### 체크포인트

- [ ] `cat ~/.claude/CLAUDE.md`가 내용을 출력한다
- [ ] 새 프로젝트에서 Claude Code가 위 스타일로 응답한다

### 팁

- **처음부터 완벽하게 쓰려 하지 마세요.** 일주일 쓰면서 "이 부분은 자꾸 내가 수정하게 되네"라고 느끼는 걸 추가합니다.
- **200줄 이하를 유지하세요.** 너무 많으면 AI가 핵심을 놓칩니다.
- **민감한 정보 금지.** 이 파일이 실수로 공개 저장소에 올라갈 수도 있습니다.

### 흔한 실수

- ❌ "나는 별 스타일 없는데" → 있습니다. 지난주에 AI 결과물을 어떻게 수정했는지 돌이켜보세요. 그게 스타일입니다.
- ❌ 너무 많이 쓰기 → 실제로 자주 어기는 것만 적습니다. 안 어기는 건 안 써도 됩니다.

---

## Day 3: 맥락 2 — Project CLAUDE.md (1시간)

### 오늘의 목표

실험용 프로젝트의 **프로젝트 지도**를 작성합니다. 이 프로젝트만의 스택, 컨벤션, 제약을 담습니다.

### 해야 할 일

1. `harness-practice/CLAUDE.md`를 엽니다 (어제 빈 파일로 만들어둔 것).

2. 아래 템플릿을 복사하고 **실험용 프로젝트에 맞게 수정**합니다:

```markdown
# Harness Practice

## 이 프로젝트란
실험용 프로젝트. Harness 세팅을 연습하는 공간.

## 스택
- Node.js 20, JavaScript (또는 본인이 쓰는 것)
- (프레임워크 쓰면 여기 명시)

## 폴더 구조
- `src/` — 소스 코드
- `docs/` — 비즈니스 문서 (사람이 관리)
- `.dev/` — AI 작업 흔적
- `tests/` — 테스트 코드
- `.claude/` — AI 설정 (rules, skills, hooks)

## 컨벤션
- 파일명: kebab-case (예: user-service.js)
- 함수명: camelCase
- 상수: UPPER_SNAKE_CASE
- 테스트: `*.test.js`로 파일명 끝내기

## 작업 방식
- 새 기능 추가 전에 `docs/adr/`에 ADR 작성
- 모든 함수에 최소 1개 테스트
- 커밋 전에 `npm test` 통과 확인

## 절대 하지 말 것
- main 브랜치에 직접 push 금지 (PR 필수)
- 테스트 없는 함수 커밋 금지
- `.env` 파일 수정 금지

## 참고 문서
- 아키텍처: `docs/architecture.md` (아직 없음 — 만들 때 추가)
- API 스펙: `docs/api.md` (아직 없음)

## Quick Start
```bash
npm install
npm test
npm run dev
```
```

3. 저장 후 커밋:

```bash
git add CLAUDE.md
git commit -m "docs: add project CLAUDE.md"
```

### 테스트: 진짜 적용되는지 확인

프로젝트 폴더에서 Claude Code를 실행하고:

> "간단한 utility 함수 하나 만들어서 src/에 저장해줘"

확인 포인트:
- 파일명이 `kebab-case`로 되는가? (예: `string-utils.js` ✓ / `stringUtils.js` ✗)
- 함수명이 `camelCase`인가?
- `tests/`에 테스트 파일도 같이 만들어달라고 했을 때 `*.test.js` 규칙을 따르는가?

만약 컨벤션을 안 지키면 CLAUDE.md가 제대로 로드되지 않고 있는 겁니다. `/context` 명령으로 확인하세요.

### 체크포인트

- [ ] 프로젝트에 `CLAUDE.md`가 있고 100~200줄 내외
- [ ] AI에게 작업 시켰을 때 위 컨벤션을 지킨다
- [ ] User CLAUDE.md와 충돌 없이 둘 다 적용된다

### 핵심 원리 기억하기

```
USER    ~/.claude/CLAUDE.md         모든 프로젝트 공통
  ↓ 상속
PROJECT my-app/CLAUDE.md            이 프로젝트만
  ↓ 상속
FOLDER  src/auth/CLAUDE.md          이 폴더만 (나중에 필요하면)
```

**하위가 상위를 덮어씁니다.** User에 "camelCase"라고 적어두고 Project에 "snake_case"라고 적으면, 이 프로젝트는 snake_case가 됩니다.

### 흔한 실수

- ❌ **너무 길게 쓰기** → 500줄 넘으면 AI가 핵심을 놓칩니다. 200줄 선에서 컷.
- ❌ **모든 정보를 여기에 다 넣기** → 세부 정보는 `docs/`나 `.claude/rules/`에. CLAUDE.md는 지도일 뿐.
- ❌ **`docs/architecture.md`라고 써놓고 그 파일 없음** → AI가 참고하려고 할 때 실패. 있는 파일만 참조하세요.

---

## Day 4: 맥락 3 — 첫 Rule 파일 (30분)

### 오늘의 목표

CLAUDE.md가 너무 길어지지 않게 **규칙을 분리**하는 법을 배웁니다. `.claude/rules/` 폴더의 진가.

### 왜 Rule 파일로 분리하나

CLAUDE.md에 모든 규칙을 다 넣으면:
- 파일이 금방 500줄 넘음
- 코드 작성 때도 배포 규칙까지 읽음 (컨텍스트 낭비)
- 수정할 때 어디가 어디인지 헷갈림

Rule 파일로 분리하면:
- 주제별로 깔끔
- glob 패턴으로 필요할 때만 로드
- 각 규칙을 독립적으로 관리

### 해야 할 일

#### 4-1: 항상 로드되는 기본 규칙

`.claude/rules/code-style.md`를 만들고:

```markdown
# 코드 스타일 규칙

## 함수
- 20줄 이내 권장. 넘으면 함수 분리 고려.
- 파라미터 3개 이하 권장. 넘으면 객체로 묶기.
- 순수 함수 우선. 부수효과는 명시적으로 격리.

## 네이밍
- boolean은 `is`, `has`, `should` 접두사 사용
- 동사로 시작하는 함수명 (getUser, createOrder)
- 축약 금지 (usr ✗ → user ✓)

## 주석
- "왜"를 쓰기. "무엇"은 코드가 말한다.
- TODO는 담당자와 날짜 포함: `// TODO(seungjin, 2026-05): ...`

## 에러 처리
- try-catch는 의미 있는 복구가 가능할 때만
- 의미 없이 catch해서 console.log만 찍는 것 금지
- 에러는 처리하거나, 명시적으로 올리거나, 둘 중 하나
```

이 파일은 glob 지정이 없어서 **항상 로드**됩니다.

#### 4-2: 조건부 로드되는 규칙 (glob 사용)

`.claude/rules/testing.md`를 만들고:

```markdown
---
glob: ["**/*.test.js", "**/*.spec.js", "**/tests/**"]
---

# 테스트 작성 규칙

## 구조
- Arrange-Act-Assert 패턴 사용
- 각 테스트는 독립적 (다른 테스트 결과에 의존 금지)
- describe로 기능 단위 그룹핑

## 이름
- `it('should ... when ...')` 형식
- 테스트가 실패했을 때 에러 메시지만 봐도 무슨 상황인지 알게

## 어설션
- `expect(...).toBe(...)` 대신 구체적 matcher 사용
  - 숫자 비교: `toBeGreaterThan`
  - 객체 비교: `toEqual` (깊은 비교)
  - 배열 포함: `toContain`

## 금지사항
- 실제 네트워크 호출 (반드시 mock)
- 실제 DB 접근 (테스트 DB나 in-memory 사용)
- 테스트에서 `Math.random()` 직접 사용 (seed 가능한 것으로 대체)
```

**이 파일은 glob 패턴 때문에 테스트 파일 작업할 때만 로드됩니다.** `.claude/rules/` 폴더의 강력한 점이 여기 있습니다.

#### 4-3: 또 하나의 조건부 규칙

`.claude/rules/security.md`를 만들고:

```markdown
---
glob: ["**/auth/**", "**/*.sql", "**/routes/**"]
---

# 보안 규칙

## 인증
- 토큰은 항상 httpOnly 쿠키에 저장
- 사용자 비밀번호는 로그에 절대 남기지 않기
- 인증 실패 에러에 "user not found" vs "wrong password" 구분 금지 (정보 노출)

## 입력 검증
- 사용자 입력은 무조건 검증 후 사용
- SQL은 반드시 parameterized query (문자열 concat 금지)
- 파일 업로드는 MIME 타입 + 확장자 이중 검증

## 민감 정보
- .env 직접 수정 금지
- API 키는 코드에 하드코딩 금지
- 로그에 개인정보 남기지 않기
```

이건 `auth`, `sql`, `routes` 관련 파일 작업할 때만 로드됩니다.

### 커밋

```bash
git add .claude/rules/
git commit -m "rules: add code-style, testing, security rules"
```

### 테스트

Claude Code에서 각 상황을 만들어보세요:

**상황 1**: `src/util.js` 작성 요청  
→ `code-style.md`는 로드됨, `testing.md`/`security.md`는 안 로드됨

**상황 2**: `src/util.test.js` 작성 요청  
→ `code-style.md` + `testing.md` 로드됨

**상황 3**: `src/auth/login.js` 작성 요청  
→ `code-style.md` + `security.md` 로드됨

`/context` 명령으로 현재 로드된 것들을 확인할 수 있습니다.

### 체크포인트

- [ ] `.claude/rules/`에 3개 파일이 있다
- [ ] 각 파일 상단에 glob이 있거나 없거나 의도대로
- [ ] 실제로 조건부 로드가 동작한다

### 핵심 기억

> **CLAUDE.md는 지도. `.claude/rules/`는 세부 규칙. docs/는 비즈니스 문서.**

셋을 헷갈리지 마세요.

---

## Day 5: 경계 — 첫 Hook 1개 (45분)

### 오늘의 목표

**이중 안전장치** 중 "코드로 막는" 부분을 체험합니다. 가장 간단한 Hook 하나 설치하기.

### Hook이란

AI가 명령어를 실행하기 **직전에** 끼어들어서 검사하는 스크립트입니다. 말로 "하지 마"라고 해도 혹시 실수할 수 있으니, 강제로 막는 장치입니다.

### 해야 할 일

#### 5-1: git push --force 차단 Hook

`.claude/hooks/pre-bash.sh` 파일을 만듭니다:

```bash
#!/bin/bash
# Pre-bash hook: 위험한 명령어 실행 전 차단

# stdin으로 실행하려는 명령어가 들어옴
COMMAND=$(cat)

# git push --force 계열 차단
if echo "$COMMAND" | grep -qE "git push.*(--force|-f( |$))"; then
  echo "❌ Force push is blocked. Use a regular push or contact your team lead." >&2
  exit 1
fi

# rm -rf / 계열 차단
if echo "$COMMAND" | grep -qE "rm -rf /( |$|[^a-zA-Z0-9])"; then
  echo "❌ Dangerous rm -rf / command blocked." >&2
  exit 1
fi

# 안전한 명령이면 통과
exit 0
```

실행 권한 주기:

```bash
chmod +x .claude/hooks/pre-bash.sh
```

#### 5-2: Hook 등록 (settings.json)

`.claude/settings.json`을 만듭니다 (없으면):

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

> **⚠️ 주의**: Claude Code의 정확한 settings.json 포맷은 버전에 따라 다를 수 있습니다. 설치 후 `claude --help`나 공식 문서(`docs.claude.com`)에서 최신 hook 스펙을 한 번 확인하세요. 이호연님의 방식은 개념적으로 이렇게 간다는 것만 잡으시면 됩니다.

#### 5-3: 작동 확인

Claude Code에서 시도:

> "git push --force origin main 해줘"

결과: Hook이 "❌ Force push is blocked..." 메시지 출력하며 실행 차단.

> "ls -la 해줘"

결과: 정상 통과.

#### 5-4: CLAUDE.md와 이중화

마지막으로 Project CLAUDE.md에 이 규칙을 **말로도** 적어둡니다. Day 3에 작성한 CLAUDE.md의 "절대 하지 말 것"에 이미 있죠. 이중 안전장치가 완성되었습니다.

```
말 (CLAUDE.md)           →  AI가 스스로 안 하게 유도
코드 (Hook)              →  실수해도 강제로 차단
```

### 커밋

```bash
git add .claude/hooks/ .claude/settings.json
git commit -m "hooks: add pre-bash safety guards"
```

### 체크포인트

- [ ] `.claude/hooks/pre-bash.sh`가 실행 권한 있음
- [ ] `.claude/settings.json`에 hook 등록됨
- [ ] 실제로 위험 명령을 시키면 차단됨
- [ ] 안전한 명령은 통과됨

### 흔한 실수

- ❌ **Hook만 만들고 등록 안 함** → settings.json에 등록해야 발동.
- ❌ **Hook이 너무 엄격** → 정상 작업이 막히면 오히려 방해. 처음엔 **명백히 위험한 것만** 막으세요.
- ❌ **복잡한 로직을 Hook에 넣기** → Hook은 단순하게. 복잡한 검증은 CI에서.

### 심화 (나중에)

익숙해지면 다른 종류의 Hook도 추가할 수 있습니다:
- **Post**: 커밋 후 자동 테스트 실행
- **Stop**: 세션 종료 시 `.dev/session-log.md`에 작업 내용 자동 기록
- **Notification**: 배포 완료 시 Slack 알림

지금은 Pre Hook 하나만. 충분합니다.

---

## Day 6~7: 복습 + 실제로 써보기

### Day 6: 점검 (1시간)

지금까지 만든 것들을 되돌아봅니다.

```bash
cd ~/harness-practice
tree -a -L 3 -I 'node_modules|.git'
```

보여야 할 것:

```
.
├── .claude
│   ├── agents/.gitkeep
│   ├── hooks
│   │   └── pre-bash.sh
│   ├── rules
│   │   ├── code-style.md
│   │   ├── security.md
│   │   └── testing.md
│   ├── settings.json
│   └── skills/.gitkeep
├── .dev/.gitkeep
├── .gitignore
├── CLAUDE.md
├── README.md
├── docs/.gitkeep
├── out/.gitkeep
├── src/.gitkeep
└── tests/.gitkeep
```

그리고 Claude Code에서 본인에게 진단을 시켜봅니다:

> "CLAUDE.md와 .claude/rules/ 내용을 분석해서 논리적으로 문제가 없는지, 중복되거나 대치되는 내용은 없는지 분석해줘"

나오는 답을 참고해서 수정할 부분을 찾아냅니다.

### Day 7: 실제 작업 시켜보기 (1시간)

실험용 프로젝트에 진짜 작은 기능을 하나 만들게 해보세요. 예를 들어:

> "src/에 간단한 URL 파서 함수를 만들어줘. tests/에 테스트도 같이."

관찰할 것:
- 파일명이 kebab-case인가?
- 함수명이 camelCase인가?
- 테스트 파일이 `*.test.js`로 끝나는가?
- 함수가 20줄 이내인가?
- 에러 처리가 CLAUDE.md 원칙대로 되어 있는가?

**하나라도 지켜지지 않으면 원인을 추적해보세요.** CLAUDE.md에 안 썼는가? Rule이 로드 안 되었는가? glob이 잘못되었는가?

이 과정이 **가장 중요한 학습**입니다. 실제로 써보면서 Harness가 어떻게 작동하는지 몸으로 이해하게 됩니다.

### 1주차 자가 진단

- [ ] 폴더 구조가 이호연님 방식대로 되어 있다
- [ ] User, Project 두 레벨의 CLAUDE.md가 있다
- [ ] 최소 2개 이상의 Rule 파일이 있고, glob 패턴을 사용한다
- [ ] 최소 1개의 Hook이 실제로 작동한다
- [ ] 실제 작업에서 규칙이 지켜지는 것을 확인했다

**다 체크되면 Week 2로. 아니면 Week 1을 반복.** 기초가 단단해야 다음이 쉽습니다.

---

# Week 2: 커뮤니티 도구 활용

이호연님이 PDF에서 강조한 첫 번째 조언: **"이미 잘 만들어진 도구부터 써보기"**. 바퀴를 다시 발명하지 마세요.

## Day 8: Harness 플러그인 설치 (30분)

### 왜 플러그인부터

직접 스킬·에이전트·훅을 다 짜는 것은 엄청난 노력이 듭니다. 이호연님의 Team Attention에서 **이미 검증된 것들**을 묶어서 플러그인으로 배포합니다. 먼저 써보고 내 것으로 어떻게 커스터마이징할지 감을 잡는 게 훨씬 빠릅니다.

### 해야 할 일

Claude Code의 플러그인 설치 방식은 버전에 따라 조금씩 다릅니다. 현재 (2026 기준) 대표적인 방법:

1. **자료에서 언급된 저장소 확인**:
   - `team-attention/harness` — 이호연님 팀의 공식 플러그인
   - `plugins-for-claude-natives` — Team Attention이 실무에서 검증한 플러그인 모음

2. **설치 방법** (Claude Code 플러그인 매니저를 통해):

```bash
# 예시 - 실제 명령은 Claude Code 문서 확인 필요
claude plugin install team-attention/harness
```

또는 수동 설치:

```bash
cd ~/.claude/plugins  # 또는 지정된 플러그인 경로
git clone https://github.com/team-attention/harness
```

3. **설치 확인**: Claude Code를 재시작하고 슬래시 명령어가 뜨는지:

```
/scaffold       — 프로젝트 초기 구성 자동화
/check-harness  — 현재 Harness 상태 진단
```

정확한 설치 방법은 [team-attention/harness 저장소의 README](https://github.com/team-attention/harness) (또는 최신 안내)를 따르세요.

### 체크포인트

- [ ] 플러그인이 설치되어 `/scaffold`, `/check-harness`가 사용 가능하다
- [ ] 설치 경로를 알고 있다 (업데이트나 제거할 때 필요)

---

## Day 9: /scaffold, /check-harness 체험 (1시간)

### /check-harness — 지금 상태 진단

실험용 프로젝트에서 실행:

```
/check-harness
```

결과로 나올 것:
- ✅ 있는 것 (폴더, CLAUDE.md, rules 등)
- ⚠️ 부족한 것 (예: docs/architecture.md가 참조되는데 없음)
- 💡 개선 제안 (예: "테스트 커버리지 목표 규칙이 없습니다")

**나온 제안을 그대로 다 따르지 마세요.** 참고용입니다. "이런 걸 검사하는구나"를 보고 내 기준에 맞는 것만 채택합니다.

### /scaffold — 새 프로젝트에서 체험

새 빈 프로젝트를 하나 더 만들어서:

```bash
mkdir ~/harness-practice-2
cd ~/harness-practice-2
git init
claude
```

Claude Code 안에서:

```
/scaffold
```

일어나는 일:
- CLAUDE.md 자동 생성
- `.claude/rules/` 구조 자동 생성
- 기본 폴더링 자동 제안
- 프로젝트 타입(웹앱, CLI, 라이브러리 등)에 맞게 커스터마이징

**어제까지 1주일에 걸쳐 한 일을 2분 만에 해줍니다.** 그렇다고 어제 한 일이 헛수고는 아닙니다. 이제 "무엇이 왜 필요한지"를 아는 눈이 생겼기 때문에, `/scaffold`가 만들어주는 것을 **평가하고 수정**할 수 있습니다.

### 핵심 체험 포인트

1. `/scaffold`가 만든 CLAUDE.md와 내가 Day 3에 쓴 CLAUDE.md를 비교하세요.
2. 어느 쪽이 더 내 스타일에 맞나?
3. 섞을 수 있는 부분은?

### 체크포인트

- [ ] `/check-harness`로 진단 결과를 본 적 있다
- [ ] `/scaffold`가 만드는 구조를 이해한다
- [ ] 내가 만든 것과 자동 생성된 것을 비교해봤다

---

## Day 10~11: superpowers 등 탐색 (1~2시간)

이호연님이 언급한 세 가지 커뮤니티 도구가 있습니다.

### gstack (github.com/garrytan/gstack)
Claude Code용 개발 스택 프레임워크. 프로젝트 타입별로 최적화된 설정.

### superpowers (github.com/obra/superpowers)
**김승진님이 이미 탐색하신 그 프레임워크입니다.** Claude Code / Cursor용 코딩 에이전트 강화 프레임워크.

### oh-my-claudecode (github.com/Yeachan-Heo/oh-my-claudecode)
Claude Code용 설정 번들. zsh 유저라면 친숙한 oh-my-zsh 스타일.

### 해야 할 일

1. **하나만 고르세요.** 셋 다 깔면 충돌납니다.
2. 각 저장소 README를 훑어봅니다. 5분씩.
3. 가장 본인 스타일과 맞는 하나를 선택합니다.
4. **실험용 프로젝트에** 설치합니다. (Puree 아직 안 됩니다!)
5. README 따라 기본 기능을 체험합니다.

### 평가 포인트

- 문서가 이해되는가?
- 기본 세팅이 내 User CLAUDE.md 스타일과 충돌하지 않는가?
- 추가되는 스킬/에이전트가 실제로 유용해 보이는가?

### 체크포인트

- [ ] 세 도구의 README를 각각 훑어봤다
- [ ] 하나를 선택해서 실험 프로젝트에 설치했다
- [ ] 기본 기능 최소 2개를 실제로 써봤다

---

## Day 12~14: 실험 프로젝트에서 실전 감 잡기

3일간 실험용 프로젝트에서 **진짜 작업하듯이** 써보세요.

예시 과제:
- Day 12: 간단한 REST API 서버 만들기 (Express 등)
- Day 13: 기능 2~3개 추가
- Day 14: 테스트 커버리지 80% 달성

**목적은 프로젝트 완성이 아닙니다.** Harness가 어떻게 작동하는지, 어디가 불편한지, 어디가 유용한지 **체감하는 것**입니다.

매일 마지막에 `.dev/learnings.md`에 기록:

```markdown
## 2026-04-XX

### 잘 된 것
- 테스트 파일 작성할 때 testing.md 규칙 자동 적용되어 편함
- hook이 실수로 force push 치려고 할 때 막아줌

### 불편했던 것
- 함수 20줄 규칙이 너무 빡빡함. 30줄로 완화할까 고민.

### 다음에 바꿀 것
- [ ] code-style.md에서 함수 라인 제한 수정 검토
```

**이게 Compound Effect의 시작입니다.** 기록이 쌓이면 개선 포인트가 보입니다.

### 1주차 자가 진단

- [ ] 플러그인 최소 1개가 설치되어 있다
- [ ] `/check-harness` 결과를 보고 개선한 지점이 있다
- [ ] 3일 이상 실제 작업에 써봤다
- [ ] `.dev/learnings.md`에 최소 3개 기록이 있다

---

# Week 3: 내 것으로 만들기

지금까지는 남이 만든 것 + 기본 설정이었습니다. 이제 **내 패턴**을 뽑아낼 차례입니다.

## Day 15: 내 반복 작업 3개 찾기 (30분)

### 3번 법칙 기억하기

> **같은 작업을 3번 반복하면 → Skill로 만든다.**

실험용 프로젝트에서 2주간 작업하면서, 또는 평소 업무(Puree Platform)에서 **반복했던 작업 3개**를 찾아내세요.

### 찾는 방법

노트에 이렇게 적어보세요:

```
반복 작업 후보:
1. _______________________ (몇 번 했나: __ 회)
2. _______________________ (몇 번 했나: __ 회)
3. _______________________ (몇 번 했나: __ 회)
```

김승진님의 경우 아마도:
1. **Shadcn 컴포넌트 추가 + Linear 스타일 적용 + Puree 디자인 토큰 적용** (이미 여러 번 했을 것)
2. **API 함수 + React Query hook + 타입 정의 세트로 생성** (API 연동 때마다)
3. **QSC 체크리스트 컴포넌트 패턴 반복 생성** (이미 Show and Prove에서 만든 경험 있음)

**3개 고르기.** 완벽할 필요 없습니다. 가장 자주 하는 것.

### 체크포인트

- [ ] 반복 작업 3개를 구체적으로 적었다
- [ ] 각각 몇 번 정도 반복했는지 추정했다

---

## Day 16: 첫 Skill 만들기 (1시간)

### 방법 1: `/skill-creator` 사용

Anthropic 공식 스킬 생성 도구를 씁니다. 사용법:

```
/skill-creator
```

안내에 따라:
1. 스킬 이름 입력 (예: `create-shadcn-component`)
2. 목적 설명 (예: "Puree 스타일을 적용한 Shadcn 컴포넌트 생성")
3. 단계 정의 (AI가 인터뷰해줌)
4. 저장

### 방법 2: 수동 생성

`.claude/skills/create-shadcn-component/SKILL.md`:

```markdown
# /create-shadcn-component

Puree Platform 스타일을 적용한 Shadcn 컴포넌트를 생성합니다.

## 사용법
`/create-shadcn-component <ComponentName>`

## 동작 순서

1. **Shadcn 기본 컴포넌트 추가**
   - `npx shadcn@latest add <base-component>` 실행
   - 에러 나면 사용자에게 기본 컴포넌트 선택 요청

2. **Puree 디자인 토큰 적용**
   - `references/puree-tokens.md` 참조
   - 색상: `#121218` (배경), `#8b5cf6` (primary)
   - 폰트: Pretendard
   - 밀도: high (Linear 스타일)

3. **타입 정의**
   - `components/ui/<name>.types.ts` 생성
   - Props 인터페이스 export

4. **Storybook / 예시 파일** (선택)
   - `components/ui/<name>.example.tsx` 생성

5. **검증**
   - `npm run typecheck` 통과 확인
   - Lint 통과 확인

## 제약
- 외부 CSS 파일 금지 (Tailwind만)
- Framer Motion 사용 가능하나 과하지 않게
- 접근성 (aria-*) 빠뜨리지 않기

## 참고
- 디자인 시스템: `docs/design-system.md`
- 기존 컴포넌트 예시: `components/ui/button.tsx`
```

옵션으로 `references/puree-tokens.md`를 만들어서 디자인 토큰을 자세히 정리합니다 (Progressive Disclosure).

### 테스트

Claude Code에서:

```
/create-shadcn-component Badge
```

기대 동작:
- Shadcn Badge 설치
- Puree 스타일 적용
- 타입 정의 생성
- 타입체크 통과

실제 결과가 기대와 다르면 SKILL.md를 수정합니다. 여기서 **반복 개선**이 시작됩니다.

### 커밋

```bash
git add .claude/skills/
git commit -m "skills: add /create-shadcn-component"
```

### 체크포인트

- [ ] `.claude/skills/` 아래 첫 스킬 폴더가 있다
- [ ] `/create-shadcn-component` 같이 슬래시 명령으로 호출된다
- [ ] 실제 결과물이 나왔고, 수정할 점을 2개 이상 발견했다

---

## Day 17: 계획 스킬 — /specify 패턴 (1시간)

### 왜 계획 스킬

이호연님이 PDF에서 강조한 것: **"해줘"의 함정.** 모호한 요청을 바로 실행시키면 실패율이 높습니다. 계획부터 세우게 하는 스킬이 필요합니다.

### 간단한 /specify 스킬 만들기

`.claude/skills/specify/SKILL.md`:

```markdown
# /specify

AI에게 일을 시키기 전에 함께 계획을 세우는 스킬입니다.
모호한 요청을 구체적인 플랜 파일로 변환합니다.

## 사용 시점
- 새 기능 추가 전
- 리팩토링 전
- 버그 수정이 복잡해 보일 때

## 동작 순서

### 1. 의도 미러링
사용자가 말한 것을 내 언어로 요약해서 "이런 의도가 맞나요?" 묻기.

### 2. 인터뷰
사용자의 전제를 끌어내기 위한 질문을 던집니다. 최소 3개.
예시:
- 현재 코드 상태에 대한 질문
- 제약사항에 대한 질문 (성능, 호환성, 시간)
- 성공 기준에 대한 질문

### 3. 요구사항 도출
기능 요구사항과 비기능 요구사항 분리:
- 기능: "A를 하면 B가 나와야 함"
- 비기능: 성능, 보안, 유지보수성

### 4. 태스크 분해
작업 단위로 쪼개고 의존성 명시:
```
- [ ] Task 1 (독립)
- [ ] Task 2 (Task 1 후)
- [ ] Task 3 (독립, 병렬 가능)
```

### 5. 완료 기준 설정 (Sprint Contract)
측정 가능한 기준 명시:
- 테스트 통과 조건
- 빌드 성공 조건
- 코드 리뷰 통과 조건

### 6. 플랜 파일 저장
`plans/YYYY-MM-DD-<slug>.md`로 저장.

### 7. 승인 대기
사용자가 플랜 검토 후 수정 요청하면 반영. "승인"이라고 하면 실행 단계로.

## 중요 원칙
- 질문이 끝나기 전까지 코드 작성 금지
- 사용자가 명확히 답하지 않으면 다시 질문
- 불확실한 영역은 "이 부분은 확실하지 않음"이라고 명시
```

### 테스트

Claude Code에서:

```
/specify 사용자 알림 시스템을 추가하고 싶어
```

기대 동작:
1. "현재 이런 이해인데 맞나요?" 미러링
2. "어떤 이벤트에 알림? 실시간 vs 배치? DB 저장 필요?" 등 인터뷰
3. 요구사항 정리
4. 태스크 분해
5. 완료 기준
6. `plans/2026-04-20-notification-system.md`로 저장

바로 코드 짜기 시작하면 **스킬이 제대로 작동 안 하는 것**입니다. SKILL.md를 수정하세요.

### 체크포인트

- [ ] `/specify` 스킬이 있다
- [ ] 실행하면 코드가 아니라 질문이 먼저 나온다
- [ ] 최종 결과물이 `plans/` 폴더의 MD 파일이다

---

## Day 18~21: Puree Platform에 조심스럽게 적용 (1주일)

**드디어 실전 투입.** 하지만 주의사항이 있습니다.

### 원칙: 작은 것부터

Puree Platform에 한꺼번에 다 깔지 마세요. 4일에 걸쳐 단계적으로.

### Day 18: Puree에 폴더 구조만 (1시간)

이미 있는 것:
- `src/` (이미 있을 것)
- `docs/` (일부 있을 수도)

추가할 것:
```bash
cd /path/to/puree-platform
mkdir -p .dev
mkdir -p .claude/{rules,skills,hooks,agents}
```

**CLAUDE.md를 아직 추가하지 마세요.** 내일 합니다.

### Day 19: Puree의 CLAUDE.md (1~2시간)

실험 프로젝트의 CLAUDE.md를 **복사하지 말고**, Puree용으로 새로 씁니다. 기억에 있는 정보를 바탕으로:

```markdown
# Puree Platform

## 제품
- Watch HQ: 프랜차이즈 컴플라이언스 SaaS
- Enterprise: SI 분석 제품
- 고객: 프랜차이즈 본사 운영팀
- 주요 마일스톤: 2026-05 온보딩, 2026-06 Watch HQ v1 출시

## 기술 스택
- Next.js 15, TypeScript, Shadcn/ui
- 상태: Zustand, 서버: React Query
- 배포: Firebase App Hosting
- 폰트: Pretendard

## 디자인 시스템
- Linear 스타일 다크 (near-black `#121218`)
- Primary: 보라 `#8b5cf6`
- 고밀도 UI
- 자세한 토큰: `docs/design-system.md`

## 컨벤션
- 컴포넌트: PascalCase
- 훅: useXxx
- API: React Query로 래핑 필수
- 스타일: Tailwind only
- Staging API: hq-backend-staging-api.forspace.xyz (프록시 경유)

## 금기
- main 직접 push 금지
- 테스트 없는 API 함수 추가 금지
- 디자인 토큰 하드코딩 금지 (반드시 CSS 변수로)

## 모노레포 구조 (Turborepo)
- packages/ui: 공용 컴포넌트
- packages/store: 전역 상태
- packages/forms: 폼 로직
- apps/watch-hq: Watch HQ 앱
- apps/enterprise: Enterprise 앱

## 참고 문서
- docs/architecture.md
- docs/design-system.md
- docs/api-contract.md
```

200줄 이하를 지키세요.

### Day 20: 실험 프로젝트의 rules 이식 (30분)

실험 프로젝트의 `.claude/rules/code-style.md`를 가져옵니다. Puree에 맞게 조정:

```markdown
# 코드 스타일 규칙 (Puree)

## 컴포넌트
- 각 컴포넌트는 별도 파일
- 한 파일당 1개 기본 export
- Props는 타입 정의 필수

## React
- useMemo/useCallback은 실제 성능 문제 있을 때만
- 커스텀 훅은 use로 시작
- 서버 컴포넌트 우선, 필요할 때만 "use client"

## TypeScript
- any 금지. unknown 후 타입 가드.
- 타입은 가능한 한 좁게 (string보다는 리터럴 유니온)

## Tailwind
- arbitrary value (`w-[123px]`) 최소화. 디자인 토큰 우선.
- clsx/cn 유틸 사용해서 조건부 클래스 깔끔하게
```

추가로 glob 패턴 활용:

```
.claude/rules/
├── code-style.md          # 항상
├── react.md (glob: **/*.tsx, **/*.jsx)
├── api.md (glob: **/api/**, **/services/**)
└── design-system.md (glob: **/ui/**, **/components/**)
```

### Day 21: Day 16의 컴포넌트 생성 스킬을 Puree에 맞게 재작성

실험 프로젝트에서 만든 `/create-shadcn-component`를 Puree에 맞게 조정해서 복사합니다. Puree의 실제 디자인 토큰 경로, Turborepo 구조를 반영합니다.

### 테스트: 실제 업무 하나를 Harness로

실제 업무에서 컴포넌트 하나를 이 스킬로 만들어보세요. 잘 되면 성공. 안 되면 문서를 다듬으세요.

### 체크포인트

- [ ] Puree에 `.claude/` 구조가 있다
- [ ] Puree용 CLAUDE.md가 200줄 이하로 작성되어 있다
- [ ] 최소 2개 rule 파일이 있다
- [ ] 실제 업무 하나를 Harness로 완료했다

---

# Week 4+: 개선 루프 정착

## Day 22: session-wrap 설치 (30분)

이호연님이 PDF에서 소개한 `session-wrap` 플러그인 설치. Claude Code 세션 종료 시 자동으로 인사이트를 뽑아줍니다.

### 설치

`plugins-for-claude-natives` 저장소에서 확인:

```bash
# 예시 (정확한 방법은 저장소 문서 확인)
claude plugin install session-wrap
```

### 작동 확인

한 세션을 평소처럼 작업 후 종료:

```
/session-wrap
```

자동으로 생성되는 것:
- 반복 패턴 요약
- 실수한 것 목록 → Rule 후보
- 반복 작업 → Skill 후보
- CLAUDE.md 업데이트 필요 항목

이걸 그대로 반영할지 판단하는 건 사람의 몫입니다.

---

## Day 23~30: 주간 점검 루틴 정착

### 매주 금요일 30분 루틴

1. **자가 진단 체크리스트** (PDF p.51 참고) 점검:

```
✅ 잘 가고 있다는 신호
- [ ] 같은 말을 두 번 하지 않는다
- [ ] 실수가 규칙이 된다
- [ ] 차단 장치가 뭔가를 막고 있다
- [ ] 불필요한 것이 줄어든다

❌ 실패 징후
- [ ] 검수에 시간이 더 오래 걸린다
- [ ] 시켰는데 원하는 결과가 안 나온다
- [ ] 스킬·에이전트가 많은데 잘 안 쓴다
- [ ] 가이드 파일이 길어지고 관리 안 된다
```

2. **이번 주 `.dev/learnings.md`** 훑어보기. 패턴 있나?

3. **Skill 사용 빈도** 점검. 한 달 안 쓴 Skill은 삭제.

4. **CLAUDE.md 길이** 확인. 200줄 넘었으면 분리.

5. **`/context`** 로 토큰 분포 확인. Skills가 비정상적으로 크면 정리.

6. 발견한 개선 포인트 1~2개만 이번 주에 반영.

### 절대 하지 말 것

- ❌ 점검하다가 대대적 개편 시작 — 한 주에 1~2개만 바꾸기
- ❌ "이거 추가하면 좋을 것 같아" 식으로 무작정 추가 — 반드시 3번 반복된 후에

---

## Day 30: 2주 후 자가 진단

### 최종 체크리스트

**기초 설정**
- [ ] User CLAUDE.md가 200줄 이하로 유지된다
- [ ] Project CLAUDE.md가 Puree에 맞게 있다
- [ ] `.claude/rules/` 3개 이상이 의도대로 작동한다
- [ ] Hook이 최소 1개 이상 작동한다

**도구 활용**
- [ ] 커뮤니티 플러그인 1개 이상 설치되어 있다
- [ ] `/scaffold`, `/check-harness`를 써봤다

**내 것 만들기**
- [ ] 내가 만든 Skill이 최소 2개 있다
- [ ] 그 중 1개 이상이 실제 업무에 쓰인다
- [ ] 계획 스킬 (`/specify` 같은)을 최소 1회 이상 사용했다

**개선 루프**
- [ ] session-wrap 또는 유사 도구가 설치되어 있다
- [ ] 주간 점검 루틴을 최소 2번 해봤다
- [ ] 처음에 만든 rule을 최소 1번 수정했다 (= 살아있는 문서)

**진짜 중요한 것**
- [ ] 같은 말을 AI에게 두 번 하지 않게 되었다
- [ ] AI 결과물 수정 시간이 예전보다 줄었다
- [ ] 이 Harness를 다른 프로젝트에도 적용하고 싶다

10개 이상 체크되면 당신은 더 이상 초보가 아닙니다. **Harness 기본기를 갖춘 상태**입니다.

---

# 자주 묻는 질문

### Q1. CLAUDE.md가 자꾸 길어져요

**A.** `.claude/rules/`로 분리하세요. CLAUDE.md에는 "이 상황에서는 이 파일 참조"라고 포인터만 둡니다. Progressive Disclosure 원칙.

### Q2. 다른 AI 도구(Cursor)는 어떻게 해요?

**A.** Cursor도 `.cursorrules` 같은 비슷한 파일을 지원합니다. CLAUDE.md의 Project 레벨 내용을 복사해서 조정하면 됩니다. User 레벨은 도구마다 달라서 각각 써야 합니다.

### Q3. 팀에 어떻게 도입해요?

**A.** 혼자 1달 쓰고 효과를 본 뒤에 제안하세요. 증거 없이 도입하면 반발만 삽니다. 증거가 있으면 설득이 쉽습니다. `.claude/`를 팀 레포에 커밋하는 것부터 시작.

### Q4. Hook이 자꾸 정상 작업까지 막아요

**A.** Hook이 너무 엄격한 겁니다. 명백히 위험한 것만 막도록 조건을 좁히세요. `git push --force`는 막되, `git push -u origin feature/xxx`는 통과하게.

### Q5. 어디서 스킬 아이디어를 얻어요?

**A.** 본인이 이번 주에 AI에게 한 지시 중에 "**또 이거 설명해야 해?**"라고 느낀 순간이 스킬 후보입니다. 3번 느끼면 만드세요.

### Q6. 이호연님 방식과 다르게 하고 싶은 게 생기면?

**A.** 괜찮습니다. 본인 프로젝트에 맞게 커스터마이징하는 게 정상입니다. PDF에도 "본인이 이해 가능한 형태로 Harness를 사용하는 것이 중요"라고 적혀 있습니다. 원리를 지키되 구현은 본인 스타일로.

### Q7. 너무 복잡해져서 관리가 안 돼요

**A.** PDF의 핵심 경고: **"좋은 Harness는 점점 단순해진다."** 복잡해지고 있다면 뭔가 잘못된 겁니다. 안 쓰는 것 삭제, 중복 합치기, 필요 없어진 규칙 제거부터.

---

# 마무리 — 다음 여정

30일 후, 당신은 이 질문들에 답할 수 있어야 합니다.

1. **"AI가 왜 그 결정을 했지?"** → CLAUDE.md / rules를 추적해서 설명 가능
2. **"이 작업 자동화되나?"** → 3번 반복된 것인지 판단 가능
3. **"이 규칙이 여전히 필요한가?"** → 주간 점검으로 판단 가능

그리고 이 질문을 **즐겁게** 할 수 있어야 합니다. 업무가 줄었으니까요.

이호연님이 PDF 마지막에 남긴 문장으로 마무리합니다:

> **AI가 코드를 쓰는 시대, 사람의 역할은 "잘 짜기"에서 "잘 일하는 환경을 만들기"로 바뀐다.**

이제 당신은 그 방향으로 한 걸음 내디뎠습니다. 다음은 매일의 반복으로 정교해지는 것. 화이팅입니다.

---

## 다음 단계 추천

30일을 완주했다면 다음 주제들을 탐구해보세요:

1. **Subagent 오케스트레이션** — 여러 AI를 병렬로 쓰기
2. **Ralph Loop 구축** — 완료 기준 정하고 자동 반복
3. **Generator/Evaluator 분리** — 코드 리뷰 자동화
4. **Browser Agent** — UI 시각 검증 자동화 (Puree에 특히 유용)
5. **팀 단위 Harness** — 개인 → 팀으로 확장

각각은 별도 1~2주 공부가 필요한 주제입니다. 천천히, 한 번에 하나씩.

---

## 참고

- 원본 발표: 이호연 (Team Attention), "Harness Engineering", 2026.04.07
- PDF 정리본: `harness-engineering.md`
- Anthropic 공식: anthropic.com/engineering/harness-design
- OpenAI 공식: openai.com/index/harness-engineering