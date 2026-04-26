# 강의 메모

> 여기에 강의 내용을 복사/붙여넣기 하면, 섹션별로 정리해서 gym/ 폴더에 저장합니다.

강의 교안
https://gymcoding.notion.site/Claude-Code-with-AI-24c6a10d310b8077b064eca98557a416
강의 소스 코드
https://gymcoding.notion.site/2a46a10d310b802da28aebfdf49c6cbc
https://github.com/gymcoding/claude-nextjs-starters/tree/main/.claude/agents/docs

줄바꿈
Shift+Enter: iTerm2, WezTerm, Ghostty 및 Kitty에서 기본적으로 작동합니다
VSCode, Cursor등 에서는 Shift+Enter가 먹히지 않는다.
그래서 Claude Code 내에서 /terminal-setup을 실행하여 VS Code, Alacritty, Zed 및 Warp에 대해 Shift+Enter를 자동으로 구성합니다.

클로드 코드 설치 방법
https://code.claude.com/docs/ko/overview


모든 권한 허용하기
```
claude --dangerously-skip-permissions
```


/init 명령어란?

컨텍스트(Context)란?

세션(Session)이란?

AI 네이티브 개발자란?
AI 도구를 단순히 사용하는것을 넘어, AI의 동작 원리를 이해하고 이를 개발 워크플로우에 자연스럽게 통합하는 개발자


## Claude Code 단축키

---

[대화형 모드 - Claude Docs](https://docs.claude.com/ko/docs/claude-code/interactive-mode)

| 명령어/기호 | 기능 | 설명 |
| --- | --- | --- |
| **`@`** | 파일/폴더 참조 | 특정 파일이나 폴더를 컨텍스트에 포함 |
| **`!`** | Bash 명령어 실행 | 터미널 명령어를 직접 실행 |
| **`ESC 1번`** | 작업 중단 | 현재 실행 중인 작업을 중단 (세션 유지) |
| **`ESC 2번`** | 히스토리 뒤로 | 이전 프롬프트로 돌아가 편집 가능 |
| **`/init`** | 프로젝트 초기화 | CLAUDE.md 파일 생성 및 프로젝트 메모리 초기화 |

**💡 팁:**

- `@` 기호로 여러 파일을 동시에 참조 가능
- `!` 명령어로 개발 워크플로우를 Claude Code 내에서 완성
- `ESC` 키로 유연하게 작업 흐름 제어




# 권한 관리 (/permissions)

## 참고

---

- [[공식문서] 신원 및 접근 관리 (권한 관리)](https://code.claude.com/docs/ko/permissions)
- [[공식문서] 설정 (권한 설정)](https://docs.claude.com/ko/docs/claude-code/settings)

## 명령어 및 기능 설명

---

### `/permissions`

Claude Code가 파일 시스템에 접근할 수 있는 권한을 관리하는 명령어입니다. 현재 설정된 권한을 확인하고, 특정 디렉토리에 대한 읽기/쓰기/실행 권한을 부여하거나 제한할 수 있습니다. 보안을 위해 작업 범위를 명시적으로 제어합니다.

### `/resume`

이전에 중단되었던 Claude Code 세션을 재개하는 명령어입니다. 예기치 않은 종료, 네트워크 문제, 또는 의도적인 일시 중지 후에 마지막 작업 지점부터 다시 시작할 수 있습니다. 이전 대화 컨텍스트와 작업 상태를 복원합니다.

### `/terminal-setup`

터미널 환경 설정을 구성하는 명령어입니다. Claude Code가 터미널 명령어를 실행하고 개발 환경과 상호작용하기 위한 초기 설정을 수행합니다. 셸 환경, 경로 설정, 필요한 도구들의 접근 권한 등을 설정할 수 있습니다.

### `claude --continue`

터미널에서 Claude Code를 실행할 때 이전 작업을 이어서 진행하는 플래그 옵션입니다. 마지막으로 실행했던 Claude Code 세션의 컨텍스트를 로드하여 중단된 지점부터 작업을 계속할 수 있습니다. `/resume`의 터미널 커맨드 버전입니다.

## 한국어 초기화

---

```markdown
/init 프로젝트 초기화를 한국어로 진행해주세요.

다음 설정을 CLAUDE.md에 포함해주세요:

## 언어 및 커뮤니케이션 규칙
- **기본 응답 언어**: 한국어
- **코드 주석**: 한국어로 작성
- **커밋 메시지**: 한국어로 작성
- **문서화**: 한국어로 작성
- **변수명/함수명**: 영어 (코드 표준 준수)
```

## `settings.json`의 `permissions` 설정

---

### 기본 구조

```json
{
  "permissions": {
    "allow": [...],   // 허용 목록
    "ask": [...],     // 확인 요청 목록
    "deny": [...]     // 거부 목록
  }
}
```

### `allow` - 허용 목록

**자동으로 실행/접근을 허용할 작업들**

| 규칙 | 설명 | 예시 |
| --- | --- | --- |
| `Bash` | 모든 bash 명령 허용 | `"Bash"` |
| `Bash(명령어)` | 특정 명령만 허용 | `"Bash(npm run lint)"` |
| `Bash(패턴:*)` | 패턴 매칭 명령 허용 | `"Bash(npm run test:*)"` |
| `Read(경로)` | 파일 읽기 허용 | `"Read(~/.zshrc)"` |
| `Write(경로)` | 파일 쓰기 허용 | `"Write(./dist/**)"` |

### `deny` - 거부 목록

**실행/접근을 차단할 작업들 (최우선 적용)**

**보안 중요 사항**

- `allow`보다 **우선순위가 높음**
- 민감한 파일과 위험한 명령을 보호

**일반적인 거부 예시**

```json
"deny": [
  "Bash(curl:*)",           // 외부 네트워크 요청 차단
  "Bash(rm:*)",             // 파일 삭제 명령 차단
  "Read(./.env)",           // 환경변수 파일 보호
  "Read(./.env.*)",         // .env로 시작하는 모든 파일
  "Read(./secrets/**)",     // secrets 폴더 전체 보호
  "Write(./config/prod.*)"  // 프로덕션 설정 파일 보호
]
```

### 패턴 매칭

| 패턴 | 의미 | 예시 | 매칭되는 것 |
| --- | --- | --- | --- |
| `*` | 단일 레벨 | `test:*` | `test:unit`, `test:e2e` |
| `**` | 다중 레벨 | `secrets/**` | `secrets/api/key.json` |
| `:*` | 명령 인수 | `curl:*` | `curl https://...` |

### 우선순위 순서

```
1. deny    ← 가장 높음 (항상 차단)
2. allow   ← 중간 (자동 허용)
3. ask     ← 낮음 (사용자 확인)
4. (없음)  ← 기본값 (사용자에게 물어봄)
```

### 실전 예시

**개발 환경 설정**

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",      // npm 스크립트 모두 허용
      "Bash(git status)",     // git 상태 확인 허용
      "Read(./src/**)",       // src 폴더 읽기
      "Write(./src/**)"       // src 폴더 쓰기
    ],
    "deny": [
      "Bash(curl:*)",         // 외부 요청 차단
      "Bash(rm:*)",           // 삭제 명령 차단
      "Read(./.env*)",        // 환경 변수 보호
      "Read(./secrets/**)",   // 비밀 폴더 보호
      "Write(./package.json)" // package.json 보호
    ]
  }
}

```

**보안 강화 설정**

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test)",   // 테스트만 허용
      "Read(./README.md)"     // README만 읽기
    ],
    "ask": [
      "Bash(git push:*)",     // push는 확인 필요
      "Write(./src/**)"       // 쓰기는 확인 필요
    ],
    "deny": [
      "Bash",                 // 일반 bash 차단
      "Read(./.env*)",        // 환경변수 차단
      "WebFetch"              // 웹 접근 차단
    ]
  }
}
```

### 주의사항

1. **Bash 패턴은 접두사 매칭**: `curl:*`는 우회 가능하므로 완벽한 보안은 아님
2. **deny가 최우선**: allow에 있어도 deny에 있으면 차단됨
3. **민감 정보 보호 필수**: `.env`, `secrets/` 등은 항상 deny에 추가
4. **최소 권한 원칙**: 필요한 것만 allow에 추가

## `additionalDirectories` 설정

---

추가 디렉토리 목록**

기본적으로 Claude는 실행한 폴더만 접근 가능하지만, 이 설정으로 다른 폴더 접근 권한을 부여합니다.

**문법**

```json
{
  "permissions": {
    "additionalDirectories": [
      "../docs/",              // 상대 경로
      "~/config/",             // 홈 디렉토리
      "/usr/local/templates/"  // 절대 경로
    ]
  }
}
```




## **권한 모드**

---

Claude Code는 **설정 파일**에서 `defaultMode`로 설정할 수 있는 여러 권한 모드를 지원합니다.
모드	설명
default	표준 동작 - 각 도구를 처음 사용할 때 권한을 요청
acceptEdits	세션 동안 파일 편집 권한을 자동으로 승인
plan	계획 모드 - Claude가 분석은 할 수 있지만 파일 수정이나 명령어 실행은 불가
bypassPermissions	모든 권한 요청을 건너뜀 (안전한 환경 필요 - 아래 경고 참조)


## 명령어 기초

---

### `/help`

사용 가능한 모든 명령어와 기능 목록을 표시합니다. 처음 사용하거나 명령어가 기억나지 않을 때 유용합니다.

### `/model`

현재 사용 중인 AI 모델을 확인하거나 변경합니다. Sonnet, Opus, Haiku 등 다른 모델로 전환할 수 있습니다.

### `/resume`

이전에 중단되었던 작업 세션을 재개합니다. 세션이 종료되거나 중단된 지점부터 다시 시작할 수 있습니다.

### `/status`

현재 Claude Code의 상태 정보를 표시합니다. 활성화된 MCP 서버, 권한 모드, 프로젝트 정보 등을 확인할 수 있습니다.

### `/doctor`

시스템 진단을 실행하여 문제를 확인합니다. 설정 오류, 권한 문제, MCP 서버 상태 등을 점검하고 해결 방법을 제시합니다.

### `/config`

설정 인터페이스를 엽니다. 권한, 환경 변수, MCP 서버 등 Claude Code의 다양한 설정을 GUI로 관리할 수 있습니다.



## 토큰 최적화 명령어

---

### `/clear`

현재 대화 내역을 지우고 새로운 세션을 시작합니다. 이전 컨텍스트를 모두 제거하고 깨끗한 상태에서 다시 시작하고 싶을 때 사용합니다.

### `/context`

현재 대화에 포함된 컨텍스트 정보를 표시합니다. 어떤 파일, 코드, 이전 대화 내용이 Claude의 작업 메모리에 있는지 확인할 수 있습니다.

### `/compact`

대화 내역을 압축하여 토큰을 절약합니다. 긴 대화에서 불필요한 부분을 요약하고 중요한 정보만 유지하여 컨텍스트 창을 효율적으로 관리합니다.

### `/config`의 auto-compact 설정

대화가 길어질 때 자동으로 이전 내역을 압축하여 토큰을 절약하는 기능입니다.

**작동 방식:**

- 컨텍스트 창이 가득 차면 자동으로 오래된 대화를 요약
- 중요한 정보는 유지하면서 불필요한 세부사항 제거
- 토큰 사용량 감소로 비용 절감 및 성능 향상

**설정:**

- `/config`에서 활성화/비활성화 가능
- 긴 세션 작업 시 권장




토큰과 컨텍스트 그리고 사용량 제한
https://gymcoding.notion.site/2d26a10d310b8065bf95d1da98deebfb
어떻게 효율적으로 사용할 수 있는가?
??

AI 모델이 더 똑똑해지고, 컨텍스트 윈도우가 더 커지더라도 결국 우리가 해야 할 일은 
컨텍스트를 효과적으로 관리하는 것



# `상태 표시줄(statusline)과 출력 스타일(output-styles`)

## 참고

---

- [[공식문서] 상태 표시줄 (`/statusline`)](https://docs.claude.com/ko/docs/claude-code/statusline)
- [[공식문서] 출력 스타일 (`/output-style`)](https://docs.claude.com/ko/docs/claude-code/output-styles)

## Claude Code 명령어 설명

---

### `/statusline`

터미널 상태 표시줄을 설정합니다. 현재 작업 컨텍스트, 프로젝트 정보, Git 상태 등을 표시하도록 사용자 정의 상태 라인을 구성할 수 있습니다.

### `/output-style`

현재 적용된 출력 스타일을 확인합니다. Claude의 응답 형식과 톤을 결정하는 스타일 설정(예: Explanatory, Concise 등)을 표시합니다.




나만의 출력 스타일 만들기 


Claude Code에서 나만의 **Custom Output Style**을 만드는 방법을 설명드리겠습니다.

## 기본 구조

Custom Output Style은 **Markdown 파일** 형식으로 작성하며, Frontmatter(메타데이터)와 본문(시스템 프롬프트 내용)으로 구성됩니다.

## 파일 생성 위치

Custom Output Style은 **Markdown 파일**로 작성하며, 저장 위치에 따라 적용 범위가 달라집니다:

- **사용자 레벨 (모든 프로젝트에서 사용)**
    - `~/.claude/output-styles/my-style.md`
- **프로젝트 레벨 (특정 프로젝트에서만 사용)**
    - `[특정프로젝트]/.claude/output-styles/my-style.md`

예를 들어, "Teacher"라는 스타일을 만들고 싶다면:

`~/.claude/output-styles/teacher.md` 파일을 생성하세요

## **파일 작성 예시**

```markdown
---
name: Teacher
description: 코드를 설명하면서 가르쳐주는 교육용 스타일
keep-coding-instructions: true
---

# Teacher Style Instructions

당신은 친절한 프로그래밍 선생님입니다.

## 주요 행동 방식

- 코드를 작성할 때마다 왜 이렇게 했는지 설명하세요
- 복잡한 개념은 쉬운 비유로 설명하세요
- 학생이 이해했는지 확인하는 질문을 하세요
- 긍정적이고 격려하는 톤을 유지하세요
```

### Frontmatter 옵션 상세

| 옵션 | 설명 | 예시 |
| --- | --- | --- |
| `name` | 스타일 이름 (파일명과 다르게 설정 가능) | `"Teacher"` |
| `description` | `/output-style` 메뉴에 표시될 설명 | `"코드를 설명하면서..."` |
| `keep-coding-instructions` | 코딩 관련 기본 지침 유지 여부 | `true` 또는 `false` |

## 사용 방법

파일을 만든 후 Claude Code에서:

```bash
# 메뉴에서 선택
/output-style

# 또는 직접 전환
/output-style teacher
```

설정은 `.claude/settings.local.json` 파일에 자동 저장되며, 다음 세션에서도 유지됩니다.

## 주의사항

⚠️ **중요**: `keep-coding-instructions`를 `false`(기본값)로 두면, Claude Code의 모든 코딩 관련 지침이 제거됩니다. 코딩 기능을 유지하려면 `true`로 설정하세요!

<aside>
⚠️

- `keep-coding-instructions` 옵션 쉽게 이해하기
    
    이 옵션은 **Claude Code의 원래 코딩 능력을 유지할지 말지**를 결정합니다.
    
    ### `false` (기본값) - 코딩 능력 제거
    
    `false`로 설정하면 Claude Code의 모든 코딩 관련 시스템 프롬프트가 **완전히 제거**됩니다. "코드를 작성하고 테스트를 실행하세요", "파일을 효율적으로 수정하세요", "에러를 검증하고 수정하세요" 같은 기본 프로그래밍 지침이 모두 사라집니다.
    
    이 옵션은 Claude Code를 **완전히 다른 용도**로 바꾸고 싶을 때 사용합니다. 예를 들어 소설 작가, 데이터 분석가, 상담사 등 코딩과 무관한 에이전트로 만들고 싶다면 `false`를 선택하세요.
    
    ### `true` - 코딩 능력 유지
    
    `true`로 설정하면 Claude Code의 원래 코딩 능력은 **그대로 유지**하면서, 여러분이 작성한 추가 스타일만 덧붙입니다. 모든 코딩 관련 기본 지침과 파일 읽기/쓰기, 테스트 실행 능력이 그대로 남아있습니다.
    
    이 옵션은 **코딩 기능은 그대로 사용하되**, 동작 방식만 조금 바꾸고 싶을 때 적합합니다. 예를 들어 "코드를 작성할 때마다 설명을 추가해줘", "초보자에게 가르치듯이 말해줘" 같은 스타일을 추가하고 싶다면 `true`를 선택하세요.
    
    ### 🎯 개발자에게 권장하는 설정
    
    **개발 작업을 할 때는 `true` 사용을 강력히 권장합니다.**
    
    코딩 능력을 제거하면 Claude Code가 테스트 실행, 에러 검증, 파일 수정 같은 핵심 기능을 수행하지 못하게 됩니다. `true`로 설정하면 이런 필수 기능은 그대로 유지하면서도 "더 자세히 설명하기", "단계별로 진행하기", "코드 리뷰하듯 작성하기" 같은 여러분만의 워크플로우를 추가할 수 있습니다.
    
    **개발자용 Custom Output Style 예시:**
    
    - 설명형 코딩 (Explanatory) - 코드 작성 이유를 함께 설명
    - 교육형 코딩 (Learning) - 학습하면서 개발
    - 리뷰형 코딩 - 코드 품질을 먼저 체크하고 작성
    - 문서화형 코딩 - 주석과 문서를 자동으로 추가
    
    이 모든 경우에 `keep-coding-instructions: true`를 사용하세요.
    
    ## 간단 정리
    
    `false`로 설정하면 Claude Code를 완전히 다른 에이전트로 변신시킬 수 있고, `true`로 설정하면 코딩 능력은 유지하면서 여러분만의 스타일을 추가할 수 있습니다. **개발 목적이라면 항상 `true`를 선택하세요.**
    
</aside>




설정 파일 (settings.json)
https://code.claude.com/docs/ko/settings


메모리 관리 (CLAUDE.md)
https://code.claude.com/docs/ko/memory


모듈형 규칙(Rules)
rules가 뭐야?
Auto Memory가 뭐야?

.claude/rules/로 규칙 구성
your-project/
├── .claude/
│   ├── CLAUDE.md           # 주 프로젝트 지침
│   └── rules/
│       ├── code-style.md   # 코드 스타일 가이드라인
│       ├── testing.md      # 테스트 규칙
│       └── security.md     # 보안 요구사항

🎯 미션 목표
클로드 코드의 설정 파일(settings.json)과 메모리(CLAUDE.md)를 직접 구성해보고, 자신만의 설정을 다른 수강생들과 공유합니다.

📋 미션 내용
1단계: 메모리 파일(CLAUDE.md) 이해하기
클로드 코드는 세션이 바뀌어도 기억을 유지할 수 있도록 메모리 파일을 사용합니다. 메모리 파일의 종류와 역할을 먼저 파악해보세요.

메모리 종류 파일 위치 역할 누구와 공유? 유저 메모리~/.claude/CLAUDE.md 모든 프로젝트에 적용되는 내 개인 설정 나만 사용 프로젝트 메모리./CLAUDE.md 또는 ./.claude/CLAUDE.md 팀과 공유하는 프로젝트 규칙 팀원 전체 (Git으로 공유) 프로젝트 모듈형 규칙./.claude/rules/*.md 주제별로 분리한 프로젝트 규칙 팀원 전체 (Git으로 공유) 로컬 메모리./CLAUDE.local.md 나만 쓰는 프로젝트별 설정 나만 사용 (자동 gitignore) 자동 메모리~/.claude/projects/<프로젝트>/memory/ 클로드가 알아서 기록하는 학습 내용 나만 사용 (프로젝트별)

💡 핵심 포인트: 메모리 파일은 클로드 코드 시작 시 자동으로 읽힙니다. 즉, 여기에 적어둔 규칙과 선호사항이 매 세션마다 적용됩니다!

2단계: 유저 메모리(~/.claude/CLAUDE.md) 직접 만들기
유저 메모리는 어떤 프로젝트에서든 항상 적용되는 나만의 규칙입니다. 아래 예시를 참고해서 자신만의 유저 메모리를 작성해보세요.

📝 작성 방법
클로드 코드에서 /memory 명령어를 입력하면 메모리 파일을 편집할 수 있습니다. 또는 직접 파일을 생성/편집해도 됩니다: ~/.claude/CLAUDE.md 편집

✅ 예시: 유저 메모리
# 코딩 스타일
- 변수명은 camelCase 사용
- 함수에는 간단한 JSDoc 주석 추가
- console.log 대신 적절한 로깅 라이브러리 사용

# 커뮤니케이션
- 코드 변경 시 변경 이유를 간단히 설명
- 에러 발생 시 원인과 해결 방법을 함께 제시

# 자주 쓰는 명령어
- 빌드: npm run build
- 테스트: npm run test
- 린트: npm run lint
💡 팁: "코드는 잘 포맷하세요" 같은 애매한 표현보다 "들여쓰기는 2칸 스페이스 사용" 같이 구체적으로 쓰는 것이 효과적입니다!

⚠️ 참고: "한국어로 응답해줘"는 메모리가 아니라 settings.json의 language 옵션으로 설정하는 게 정확합니다. 4단계에서 다룹니다!

3단계: 프로젝트 메모리(CLAUDE.md) 만들기
실습할 프로젝트 폴더에서 프로젝트 메모리를 설정해봅니다.

📝 작성 방법
가장 간단한 방법은 클로드 코드에서 /init 명령어를 사용하는 것입니다:

> /init
이 명령어를 실행하면 클로드가 프로젝트를 분석해서 CLAUDE.md 초안을 자동으로 생성해줍니다.

직접 작성하고 싶다면 프로젝트 루트에 CLAUDE.md 파일을 만드세요:

✅ 예시: 프로젝트 메모리 (React 프로젝트)

# 프로젝트 개요
React + TypeScript 기반 할일 관리 앱

# 기술 스택
- React 19 + TypeScript
- Tailwind CSS
- Zustand (상태관리)

# 빌드 & 실행 명령어
- 개발 서버: npm run dev
- 빌드: npm run build
- 테스트: npm run test

# 코드 컨벤션
- 컴포넌트 파일명: PascalCase (예: TodoList.tsx)
- 훅 파일명: use로 시작 (예: useTodos.ts)
- 타입 정의는 types/ 디렉토리에 모아서 관리

# 프로젝트 구조
- src/components/ : UI 컴포넌트
- src/hooks/ : 커스텀 훅
- src/types/ : TypeScript 타입 정의
- src/stores/ : Zustand 스토어
✅ 예시: 프로젝트 메모리 (Python 프로젝트)

# 프로젝트 개요
FastAPI 기반 REST API 서버

# 기술 스택
- Python 3.12 + FastAPI
- SQLAlchemy (ORM)
- PostgreSQL (데이터베이스)

# 실행 명령어
- 개발 서버: uvicorn main:app --reload
- 테스트: pytest
- 린트: ruff check .
- 포맷팅: ruff format .

# 코드 컨벤션
- 함수명/변수명: snake_case
- 클래스명: PascalCase
- 모든 API 엔드포인트에 Pydantic 모델로 입출력 검증
- docstring은 Google 스타일
4단계: 설정 파일(settings.json) 구성하기
설정 파일은 권한(permissions), 환경 변수, 도구 동작을 제어하는 JSON 파일입니다.

📝 설정 파일 위치와 역할

설정 범위 파일 위치 용도 유저 설정~/.claude/settings.json 모든 프로젝트에 적용되는 내 설정 프로젝트 설정.claude/settings.json 팀과 공유하는 프로젝트 설정 로컬 설정.claude/settings.local.json 나만 쓰는 프로젝트 설정 (gitignore 됨)

💡 우선순위: 로컬 설정 > 프로젝트 설정 > 유저 설정 (더 구체적인 설정이 우선!)

📝 작성 방법

클로드 코드에서 /config 명령어로 설정 화면을 열 수 있습니다. 또는 직접 파일을 만들어보세요:

프로젝트 설정 파일: .claude/settings.json
사용자 설정 파일: ~/.claude/settings.json
✅ 예시: 유저 설정 (모든 프로젝트 공통)

{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "language": "korean",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Bash(npm run build)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
이 설정의 의미:

🌐 language: 클로드가 항상 한국어로 응답 (v2.1.0에서 추가된 공식 옵션)
✅ allow: lint, test, build 명령어는 매번 허락 안 받고 바로 실행
🚫 deny: .env 파일이나 secrets/ 폴더는 절대 읽지 못하게 차단
💡 팁: 한국어 응답을 CLAUDE.md에 "한국어로 답해줘"라고 쓰는 분들이 많은데, language 설정이 훨씬 정확하고 안정적입니다!

✅ 예시: 프로젝트 설정 (팀 공유용)

{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run dev)",
      "Bash(npm run build)",
      "Bash(npx prisma *)",
      "Bash(docker compose *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Read(./.env.production)"
    ]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
이 설정의 의미:

✅ allow: 개발 서버, 빌드, Prisma, Docker 명령어 자동 허용
🚫 deny: 위험한 삭제 명령, force push, 프로덕션 환경변수 파일 차단
🌐 env: 환경 변수 NODE_ENV를 development로 설정
5단계: 나만의 설정 공유하기
위 실습을 통해 만든 메모리 파일이나 설정 파일의 내용을 공유합니다. 전부 공유할 필요 없고, 가장 유용하다고 생각하는 부분 1가지 이상만 공유하면 됩니다!

📝 공유 템플릿

🏷️ 설정 종류: [유저 메모리 / 프로젝트 메모리 / 유저 설정 / 프로젝트 설정 중 택1]

📁 파일 위치: [예: ~/.claude/CLAUDE.md]

📄 작성한 내용:
[자신이 작성한 내용을 붙여넣기]

💡 이렇게 설정한 이유:
[왜 이 규칙/설정이 유용한지 한두 줄로 설명]
✅ 작성 예시 1: 유저 메모리

🏷️ 설정 종류: 유저 메모리

📁 파일 위치: ~/.claude/CLAUDE.md

📄 작성한 내용:
# 커뮤니케이션
- 코드 변경 시 무엇을 왜 바꿨는지 간단히 설명
- 파일을 새로 만들 때는 먼저 계획을 말해주고 진행

# 코딩 스타일
- 들여쓰기는 2칸 스페이스
- 함수는 30줄 이하로 유지, 길어지면 분리 제안
- 매직 넘버 사용 금지, 상수로 정의

💡 이렇게 설정한 이유:
코딩 스타일을 일관되게 유지하고, 코드 변경 맥락을 항상 파악할 수 있어서 편합니다.
(한국어 응답은 settings.json에 "language": "korean" 으로 설정했습니다!)
✅ 작성 예시 2: 프로젝트 설정

🏷️ 설정 종류: 프로젝트 설정

📁 파일 위치: .claude/settings.json

📄 작성한 내용:
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx prisma *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Bash(rm -rf *)",
      "Bash(git push --force *)"
    ]
  }
}

💡 이렇게 설정한 이유:
npm 스크립트와 Prisma는 자주 쓰니까 매번 허락 안 받아도 되게 하고,
환경변수 유출이나 위험한 명령어는 사전에 차단했습니다.




# MCP
https://code.claude.com/docs/ko/mcp
### MCP 서버 모음 사이트

- [Smithery (스미더리)](https://smithery.ai/)
- [Model Context Protocol Servers: Github](https://github.com/modelcontextprotocol/servers)

MCP가 뭔지?
어떻게 사용하는지?
등




## [CLAUDE.md](http://CLAUDE.md) 설정 및 AI 개발 워크플로우!

Best Practices for Claude Code
- https://code.claude.com/docs/en/best-practices

## 참고

---

- [[공식 문서] 메모리 관리](https://docs.claude.com/ko/docs/claude-code/memory)
- [[공식 문서] Claude 코드 모범사례 (개발 워크플로우)](https://www.anthropic.com/engineering/claude-code-best-practices)

## [`CLAUDE.md`](http://CLAUDE.md) 설정

---

```markdown
## 언어 및 커뮤니케이션 규칙
- 기본 응답 언어: 한국어
- 코드 주석: 한국어로 작성
- 커밋 메시지: 한국어로 작성
- 문서화: 한국어로 작성
- 변수명/함수명: 영어 (코드 표준 준수)
```

## 검증된 개발 워크플로우

---

Claude Code는 정해진 사용법이 없어 자유롭게 활용할 수 있습니다. 많은 사용자들이 시행착오를 거쳐 찾아낸 효과적인 작업 패턴들을 소개합니다.

다양한 문제 해결에 적합한 만능 워크플로우입니다: 

**`탐색` → `계획` → `코딩` → `커밋`** 

이는 특히 복잡한 문제의 경우 하위 에이전트의 강력한 사용을 고려해야 하는 워크플로우의 일부입니다. 특히 대화나 작업 초기에 하위 에이전트를 사용하여 세부 사항을 확인하거나 특정 질문을 조사하도록 Claude에게 지시하면 효율성 손실 측면에서 큰 단점 없이 컨텍스트 가용성을 유지하는 경향이 있습니다.

### 1단계: 탐색 (정보 수집)

Claude에게 관련 파일, 이미지, URL을 읽도록 요청하되, 일반적인 지침("로깅을 처리하는 파일을 읽어줘")이나 구체적인 파일명("logging.py를 읽어줘")을 제공하고, 아직 코드를 작성하지 말라고 명시적으로 지시합니다.

<aside>

**서브에이전트 활용**

복잡한 문제일수록 Claude가 서브에이전트를 사용해 세부사항을 확인하도록 하세요. 특히 작업 초반에 이렇게 하면 전체 맥락을 잘 유지하면서도 효율적입니다.

예를 들어 "코드 검토 전문 에이전트로 이 코드를 분석해줘" 또는 "파일 검색 전문 에이전트로 관련 파일을 찾아줘"와 같이 요청하면, 대화 초반에도 더 정확한 분석을 얻을 수 있고 전체적인 작업 품질이 향상됩니다.

</aside>

- 정보 수집
    1. https://gitingest.com/

### **2단계: 계획 수립**

Claude에게 특정 문제에 접근하는 방법에 대한 계획을 세우도록 요청합니다. `"think"`라는 단어를 사용해 확장 사고 모드를 활성화하는 것을 권장하는데, 이는 Claude에게 대안을 더 철저히 평가할 수 있는 추가 계산 시간을 제공합니다. 다음 특정 구문들은 시스템에서 증가하는 사고 예산 수준에 직접 매핑됩니다.

**`"think"` 키워드로 깊은 사고 모드 활성화**:

- `"think"` → 기본 사고
- `"think hard"` → 더 깊은 사고
- `"think harder"` → 매우 깊은 사고
- `"ultrathink"` → 최대 깊이 사고

각 수준은 Claude가 사용할 수 있는 **사고 예산(토큰)을 점진적으로 더 많이 할당**합니다.

<aside>

계획이 마음에 들면 문서나 GitHub 이슈로 저장
구현(3단계)이 원하는 대로 되지 않을 경우 이 지점으로 다시 돌아갈 수 있습니다.

</aside>

### **3단계: 코딩**

Claude에게 계획에 따라 실제 코드 구현하도록 요청합니다. 이 단계에서는 솔루션의 각 부분을 구현하면서 해당 솔루션의 합리성을 명시적으로 검증하도록 요청하는 것도 좋습니다.

**실제 요청 예시:**

```json
❌ 그냥 요청:
"로그인 기능을 만들어줘"

✅ 검증하면서 요청:
"로그인 기능을 만들어줘.
각 단계마다 멈춰서 '이 부분이 제대로 작동할까?',
'빠뜨린 건 없을까?' 확인하면서 진행해줘."

✅ 검증하면서 요청:
"쇼핑몰 장바구니 기능 만들어줘.
코드 작성할 때마다 한 번씩
'이 로직이 맞나?', '사용자가 헷갈리지 않을까?'
이런 거 체크해가면서 해줘."
```

### **4단계: 커밋 & PR**

Claude에게 결과를 커밋하고 풀 리퀘스트를 생성하도록 요청합니다. 관련이 있다면 이 시점에서 Claude에게 방금 한 작업에 대한 설명과 함께 README나 변경 로그(CHANGELOG)를 업데이트하도록 하는 것도 좋은 시점입니다.

### ⚠️ 핵심!

`#1`-`#2` 단계는 매우 중요합니다. 이 단계 없이는 Claude가 솔루션 코딩으로 바로 뛰어드는 경향이 있습니다. 때로는 그것이 원하는 바일 수도 있지만, Claude에게 먼저 연구하고 계획하도록 요청하면 사전에 더 깊은 사고가 필요한 문제들에 대한 성능이 크게 향상됩니다.

## UI 개발 워크플로우: `코드 작성` → `결과 스크린샷` = 반복

UI나 디자인 작업을 할 때 효과적인 방법입니다. 테스트 대신 시각적 목표를 제공하는 방식입니다.

### **준비물: 스크린샷 도구 설정**

- Puppeteer MCP 서버 또는 Playwright MCP 서버 (웹 브라우저 자동화)
- iOS 시뮬레이터 MCP 서버 (iOS 앱 화면)
- 또는 수동으로 스크린샷 복사/붙여넣기

### **1단계: 디자인 목표 제공**

- 원하는 디자인을 이미지로 제공
    - 이미지 파일 경로 알려주기
    - 드래그 앤 드롭
    - 복사/붙여넣기

### **2단계: 구현과 반복**

- "이 디자인대로 코드로 구현해줘"
- "구현한 결과 스크린샷 찍어서 확인해"
- "디자인과 다른 부분 수정해"
- 원하는 결과가 나올 때까지 반복

### **3단계: 최종 커밋**

- 디자인과 일치하면 커밋

## **💡 핵심**

인간과 마찬가지로, Claude의 출력은 반복을 통해 크게 향상되는 경향이 있습니다. 첫 번째 버전은 괜찮을 수 있지만, 2-3번의 반복 후에는 일반적으로 훨씬 더 나아 보입니다. 최상의 결과를 위해 Claude가 자신의 출력을 볼 수 있는 도구를 제공하세요.

- 1차 시도: 기본적인 구조 완성
- 2차 시도: 세부 디자인 개선
- 3차 시도: 거의 완벽한 결과물

Claude가 자신이 만든 결과물을 직접 볼 수 있도록 도구를 제공하는 것이 중요합니다. 보고 수정할 수 있어야 더 좋은 결과를 만들 수 있습니다.


---




[프로젝트1]: Starter Kit 만들기 - 공식문서
- https://code.claude.com/docs/en/best-practices
- https://platform.claude.com/docs/ko/build-with-claude/prompt-engineering/claude-prompting-best-practices#leverage-thinking-and-interleaved-thinking-capabilities
- https://platform.claude.com/docs/ko/build-with-claude/prompt-engineering/claude-prompting-best-practices#give-claude-a-role

/init -> 프로젝트 맥락을 파악 -> CLAUDE.md 파일을 생성
주요 기술스택을 정의한다음에 프로젝트 구조, 빌드/실행 명령어, 코드 컨벤션 등을 작성하는 것을 권장드립니다. 이렇게 하면 매 세션마다 일관된 규칙과 맥락이 적용되어 작업 효율이 크게 향상됩니다.


---

Playwright MCP??
```
claude mcp add playwright npx @playwright/mcp@latest --scope project
```

여기에 많이 사용하는 MCP 소개와 사용 예제 추가하면 좋을것 같은데??


---

커스텀 명령어 만들기
- 위치 : .claude/commands/hello.md  
- 내용 예시
```
# 프로젝트 명령어 생성
mkdir -; .claude/commands
echo "이 코드의 성능 문제를 분석하고 최적화를 제안하세요:" > .claude/commands/optimize.md
```

슬래시 명령어????

---

서브에이전트???
https://code.claude.com/docs/ko/sub-agents
서브 에이전트 생성 방법 및 활용 방법
예제 등 추가 해줬음 해.

새로운기능, 코드리뷰, 테스트 등 나눠서 진행가능??

/agents

 코드리뷰를 전문적으로 수행하는 서브에이전트를 생성해주세요! 그리고 코드리뷰                                         
  서브에이전트는 코드 구현 완료 후에 실행해주세요.                                                                    
                                                   


---

훅(Hooks)????
https://code.claude.com/docs/ko/hooks-guide

/hooks 명령어로 훅 관리하기

사용방법과 예제가 필요함

---

자주 사용하는 MCP 서버 소개 및 사용법

## MCP Server 설치

---

### 클로드 코드 MCP Server 설치

이 MCP들에 대한 내용들 설명 및 예제 사용방법

이것들 아니더라도 추천할만한것들 있으면 알려줘.
요즘 superpowers MCP Server도 뜨고 있던데?

- [Context7](https://github.com/upstash/context7)
    
    ```bash
    claude mcp add --transport http context7 https://mcp.context7.com/mcp --scope project
    ```
    
- [Playwright](https://github.com/microsoft/playwright-mcp)
    
    ```bash
    claude mcp add playwright npx @playwright/mcp@latest --scope project
    ```
    
- [Sequential thinking](https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking)
    
    ```bash
    claude mcp add sequential-thinking --scope project -- npx -y @modelcontextprotocol/server-sequential-thinking
    ```
    
- [ShadcnUI MCP Server](https://ui.shadcn.com/docs/mcp)
    
    ```bash
    npx shadcn@latest mcp init --client claude
    ```
    

---


메타프롬프트 활용 PRD (+MVP) 작성하기
```
당신은 클로드 코드 프롬프트 엔지니어 입니다.
노션을 사용해서 입력한 견적서 내용을
클라이언트가 웹으로 확인하고 PDF로 다운받을 수 있는
MVP PRD 문서를 작성하는 메타 프롬프트를 생성해주세요.
```


---

# 플러그인이란? - 마켓플레이스부터 실전 데모까지

아래 참고 링크들을 통해서 어떤것들이 소개되어있고 적용할 수 있는지에 대해 알려줘.

## 참고

- [[공식문서] 클로드 코드 플러그인](https://code.claude.com/docs/ko/plugins)
- [[공식문서] 플러그인 마켓플레이스](https://code.claude.com/docs/ko/plugin-marketplaces)
- [마켓플레이스 모음: Claude Code Marketplaces](https://claudemarketplaces.com/)
- [[깃헙] anthropics/claude-code](https://github.com/anthropics/claude-code)

