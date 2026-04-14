# Claude Code 완전 정복 가이드

> 코드를 몰라도 **문제, 원하는 결과, 확인 방법**만 말하면 충분히 쓸 수 있어요.

---

## 1. Claude Code란?

**한마디로:** 내 컴퓨터 폴더에 접근해서 파일을 읽고, 수정하고, 실행할 수 있는 AI 에이전트

| 채팅 AI (ChatGPT, Claude 웹) | Claude Code (에이전트) |
|---|---|
| 내가 물으면 AI가 답해요 (탁구) | "이거 해줘" 하면 혼자서 알아서 해요 (심부름꾼) |
| 매번 다음 질문을 **내가** 생각해야 해요 | 여러 단계를 연결해서 한 번에 처리 |
| 예) "이 글 좀 다듬어줘" | 예) "경쟁사 5개 분석하고 노션에 캘린더까지 만들어줘" |

### Claude Code가 특별한 이유 3가지

1. **도구 조합** — 여러 도구를 조합해 복잡한 작업을 처리
2. **무한 확장** — MCP, Plugin, Skill 등 새 기능을 계속 붙일 수 있음
3. **로컬 보안** — 내 코드를 외부에 보내지 않고 내 컴퓨터에서만 동작

### 과금 구조

- **Pro** ($20/월) — 먼저 익숙해지기에 충분
- **Max** ($100~200/월) — 익숙해진 후 올려도 늦지 않음
- 모델 순서: Haiku 4.5 < **Sonnet 4.6 (추천)** < Opus 4.6
- 사용량 확인: [claude.ai/settings/usage](https://claude.ai/settings/usage)

---

## 2. 설치 & 시작하기

### 데스크탑 앱 (추천)

1. [code.claude.com](https://code.claude.com/docs/en/desktop-quickstart) 접속
2. OS에 맞게 다운로드 → 설치
3. Windows는 [Git for Windows](https://git-scm.com/install/windows) 먼저 설치

### 터미널 (개발자용)

```bash
# Node.js 먼저 설치 후
npm install -g @anthropic-ai/claude-code
```

### 시작하기

- **데스크탑 앱**: '코드' 탭 클릭 → 폴더 선택 → 대화 시작
- **터미널**: `claude` 입력 → 엔터

### 주요 설정

| 번호 | 설정 | 설명 |
|---|---|---|
| ❹ | 편집 자동 수락 | 권한 요청 없이 알아서 작업 (설정에서 "권한 우회 모드 허용" 먼저 ON) |
| ❺ | 모델 선택 | Max 플랜 아니면 **Sonnet**으로 설정 |
| ❻ | 폴더 경로 | 작업할 프로젝트 폴더 지정 |
| ❼ | 환경 | **Local** 선택 (내 컴퓨터 기준) |

> 💡 터미널에서 권한 건너뛰기: `claude --dangerously-skip-permissions`

### 실습 예시

```
그냥 네가 랜덤하게 아이디어 내서 간단한 게임 하나 만들어봐
```

→ 금방 게임 완성! 브라우저에서 바로 확인 가능

---

## 3. CLAUDE.md = AI의 알림장

### 비유: 전학 온 친구에게 설명하기

- 점심은 12시
- 체육복은 화·목에 입기
- 숙제는 여기에 적기

→ Claude에게도 이런 정리 문서가 필요하고, 그게 **CLAUDE.md**

### `/init` 명령어

```
/init
```

프로젝트 폴더를 훑어보고 → 언어/규칙 파악 → CLAUDE.md 초안을 자동 생성

### CLAUDE.md 종류

| 종류 | 위치 | 적용 범위 |
|---|---|---|
| 전교 알림장 | `~/.claude/CLAUDE.md` | 모든 프로젝트 |
| 우리 반 알림장 | `프로젝트/CLAUDE.md` | 이 프로젝트만 |
| 나만의 메모장 | `프로젝트/.claude/CLAUDE.local.md` | 나만 보기 |

> 💡 위치를 모르겠으면 Claude Code에 물어보세요:
> "이 컴퓨터에서 글로벌, 프로젝트, 프로젝트 내 나만 보는 CLAUDE.md 파일 위치 알려줘"

---

## 4. 수정 요청하는 법

**코드를 몰라도 됩니다.** 문제 + 원하는 결과 + 확인 방법만 말하면 OK!

### 스크린샷 활용

`Ctrl+V`로 스크린샷 붙여넣기 → "이 부분 고쳐줘"

### 요청 예시

```
✗ 나쁜 예: "로그인 페이지 만들어줘"

✓ 좋은 예:
"로그인 버튼을 눌러도 아무 반응이 없어요. 원인 찾고 고쳐줘.
수정한 뒤 직접 실행해서 에러 없는지 확인해줘.
무엇을 바꿨는지 쉬운 말로 설명해줘."
```

### 꿀팁

- 바꿀 글자는 정확히 적어주세요 (제목, 버튼 문구 등)
- 파일 이름을 몰라도 "관련 파일부터 찾아줘"라고 하면 됨
- 수정 범위는 좁게: "다른 화면은 건드리지 말고 그 부분만"
- 마지막에 꼭: "직접 실행해서 확인해줘"

### 작전 짜기 모드 & 집중 생각 모드

| 모드 | 사용법 | 언제? |
|---|---|---|
| 작전 짜기 (Plan) | `Shift+Tab+Tab` | 파일 여러 개 고칠 때 |
| 집중 생각 (Think) | `ultrathink` 입력 | 복잡한 버그 찾을 때 |
| 둘 다 | 작전 + ultrathink | 아주 큰 작업 |
| 그냥 보통 | — | 간단한 수정 |

> ⚠️ 두 모드 다 비용이 더 듭니다. 필요할 때만 쓰세요!

---

## 5. 대화 흐름 조종하기

### 핵심 명령어

| 명령 | 역할 | 언제? |
|---|---|---|
| `ESC` | 일시정지 | Claude가 잘못된 방향으로 갈 때 |
| `ESC` × 2 | 되감기 | 이전으로 돌아갈 때 (터미널) |
| `/compact` | 대화 요약 후 계속 | 대화가 길어질 때 |
| `/clear` | 새 채팅 시작 | 한 작업 끝나면 |
| `/rewind` | 코드/대화 되감기 | 잘못된 수정 취소 |
| `/statusline` | 상태 표시줄 | 남은 토큰, 비용 확인 |
| `/init` | CLAUDE.md 갱신 | 대화 내용을 알림장에 기록 |

> ⚠️ **"Prompt is too long"이 뜨면 모든 맥락을 잃습니다!**
> 그 전에 `/compact` 또는 `/init`으로 정리하세요.

---

## 6. 사용자 정의 명령어 만들기

자주 쓰는 요청을 커스텀 명령어로 저장할 수 있어요.

### 만드는 법 (추천)

Claude Code에 이렇게 요청:

```
사용자정의 커맨드 하나 생성해줘.
/color 라고 치면 어느 요소의 어떤 색상으로 바꿀지 논의를 시작하는 거야
```

→ `.claude/commands/color.md` 파일이 자동 생성

### 직접 만드는 법

1. `.claude/commands/` 폴더에 `.md` 파일 만들기
2. 파일 안에 Claude한테 시킬 내용 쓰기
3. Claude Code 재시작

> 파일 이름 = 명령어 이름 (예: `audit.md` → `/audit`)

---

## 7. 기능 확장 — 5가지 핵심 개념

### 식당 비유로 한 번에 이해하기

| 개념 | 식당 비유 | 설명 | 예시 |
|---|---|---|---|
| **API** | 📋 주문서 | 외부 서비스에 요청 보내고 결과 받아오는 통로 | Gemini API로 이미지 생성 |
| **MCP** | 🔧 통합 주방 시스템 | 여러 서비스를 같은 방식으로 연결하는 표준 | 노션, 구글, 슬랙 커넥터 |
| **Skill** | 📖 레시피북 | 특정 작업의 기준과 순서를 정리한 지식 문서 | Remotion 스킬로 영상 제작 |
| **Agent** | 👨‍🍳 주방장 | 스스로 판단하고 도구를 조합해 결과물 완성 | UI/UX 에이전트에 디자인 위임 |
| **Plugin** | ⚡ 추가 장비 | 원래 없던 기능 장착 (MCP+Skill+Agent 통합 가능) | Playwright로 브라우저 자동화 |

### 김치찌개가 나오기까지 (동작 순서)

1. 손님 주문 → **Agent**가 무엇을 할지 판단
2. **MCP**로 주방 안 재고/도구 확인
3. 재료 없으면 **API**로 외부에 주문
4. **Skill** 레시피 보고 조리
5. **Agent**가 결과 확인 후 내보냄
6. **Plugin**으로 전체 품질 향상

---

## 7-1. API 활용 예시: 이미지 생성

### Gemini API 연결하기

1. [Google AI Studio](https://aistudio.google.com/prompts/new_chat) 접속
2. 결제 설정 (신규 $300 무료 크레딧)
3. [API Keys](https://aistudio.google.com/api-keys) 페이지에서 키 복사

### 요청 예시

```
이 API key 이용해서 gemini-3-pro-image-preview 모델로
이 게임 썸네일 500x500짜리 만들어줘: (API KEY)

이 key는 글로벌 환경에 .env 파일로 저장해줘.
절대 외부나 GitHub 등에 노출되지 않게
```

> 💡 모델 비교:
> - 나노바나나프로 (`gemini-3-pro-image-preview`) — 텍스트 표현 우수, $0.13/1k
> - 나노바나나2 (`gemini-3.1-flash-image-preview`) — 일반 이미지 충분, $0.07/1k

---

## 7-2. MCP 설치 & 활용

### 설치 방법

- **앱**: 사용자 지정 → 커넥터 → + 버튼
- **터미널**: `claude mcp add [이름] npx @[패키지]`

### 필수 MCP 2가지

```bash
# 대화 간 기억 유지
claude mcp add memory npx @anthropic-ai/mcp-memory

# 안전한 파일 접근
claude mcp add filesystem npx @anthropic-ai/mcp-filesystem
```

### MCP 활용 예시: 노션 페이지 자동 작성

노션 커넥터 연결 후:

```
이 게임의 기획 문서를 노션에 작성해줘.
게임 소개, 조작법, 개발 일지를 포함해줘.
```

→ 노션에 문서가 자동 생성!

### MCP 찾는 곳

| 사이트 | 설명 |
|---|---|
| [registry.modelcontextprotocol.io](http://registry.modelcontextprotocol.io) | 공식 레지스트리 |
| [pulsemcp.com](http://pulsemcp.com) | 8,500개+ 서버 |
| [mcp-awesome.com](http://mcp-awesome.com) | 품질 검증된 서버 |
| [fastmcp.me](http://fastmcp.me) | 가장 큰 레지스트리 + 통계 |

> ⚠️ MCP는 많이 연결할수록 복잡해질 수 있어요. 필요한 것부터 쓰세요.

---

## 7-3. Skill 활용 예시: 영상 제작

### Remotion Skill 설치

```
글로벌 단위로 이 스킬들 깔아줘
npx skills add remotion-dev/skills
npx skills add https://github.com/remotion-dev/skills --skill remotion-best-practices
```

설치 후 Claude Code 재시작 → "이 게임 홍보 영상 만들어줘" 요청

### Skill 찾는 곳

| 사이트 | 링크 |
|---|---|
| Anthropic 공식 | [github.com/anthropics/skills](http://github.com/anthropics/skills) |
| Agent Skills 스펙 | [agentskills.io](http://agentskills.io) |
| Awesome Claude Skills | [awesomeclaude.ai](http://awesomeclaude.ai) |
| skills.sh | [skills.sh](http://skills.sh) |

---

## 7-4. Agent 활용

에이전트 = 역할을 나눠 여러 Claude가 협업하는 방식

### 서브에이전트

```
design-ui-designer 에이전트와 design-ux-researcher를
서브에이전트로 써서 이 게임 UI, UX를 개선해줘
```

### 서브에이전트 vs 에이전트 팀

| 구분 | 서브에이전트 | 에이전트 팀 |
|---|---|---|
| 비유 | 심부름 보내기 | 친구들이랑 함께하기 |
| 구조 | 메인이 지시 → 결과 수집 | 여러 Claude가 독립 + 상호 소통 |
| 적합한 상황 | 조사, 분석 등 단방향 | 프론트+백엔드 동시 개발 |

```bash
# 에이전트 팀 켜기 (터미널 전용)
claude config set -g agentTeams true

# 실행
"프론트엔드와 백엔드를 에이전트팀 기능으로 동시에 작업해줘"
```

> 에이전트 팀은 아직 실험적 기능. 서브에이전트 먼저 익숙해지세요!

### 에이전트 찾는 곳

| 사이트 | 링크 |
|---|---|
| Claude Code Toolkit (95개+) | [GitHub](https://github.com/rohitg00/awesome-claude-code-toolkit) |
| Awesome Claude Code | [GitHub](https://github.com/hesreallyhim/awesome-claude-code) |

---

## 7-5. Plugin (추천 플러그인)

**설치**: 사용자 지정 → 개인 플러그인 → + 버튼

### Claude 능력 강화

| 플러그인 | 설명 |
|---|---|
| **Superpowers** | 브레인스토밍, 코드 리뷰, 디버깅, TDD |
| **Skill Creator** | 새로운 스킬 생성·수정·테스트 |
| **Claude MD Management** | CLAUDE.md 품질 관리·업데이트 |
| **Playwright** | 웹 브라우저 자동 조작 |

### 코딩 & 배포

| 플러그인 | 설명 |
|---|---|
| **Frontend Design** | UI/UX 구현 가이드 |
| **GitHub** | 이슈, PR, 코드 리뷰 직접 수행 |
| **Vercel** | 배포 상태, 로그, 도메인 설정 |

### 검색 안 될 때 수동 설치

```bash
# Superpowers
/plugin install superpowers@claude-plugins-official

# Playwright
claude mcp add playwright npx '@playwright/mcp@latest'

# GitHub
/install-github-app
npx plugins add github@claude-plugins-official

# Vercel
npx plugins add vercel/vercel-plugin
```

### Playwright 활용 예시

```
크롬 브라우저에서 네이버에 접속해서
실시간 검색어 TOP 10을 스크린샷으로 캡처해줘
```

→ 브라우저를 직접 조작해서 결과를 가져옴!

---

## 8. GitHub + Vercel 배포

### 전체 흐름

```
💻 로컬 개발 → 📦 GitHub 업로드 → 🚀 Vercel 배포 → 🌍 공개 완료!
```

### GitHub 연결

- 앱: 개인 플러그인에서 GitHub 설치 시 자동 연결
- 터미널: `/install-github-app`

### 실제 요청

```
이 프로젝트를 GitHub에 올리고 Vercel로 배포해줘.
배포 URL 알려줘.
```

→ 누구나 접속 가능한 URL 생성!

---

## 9. Hooks = 자동 알람 장치

특정 이벤트 전후에 자동 실행되는 스크립트

### 집 자동화 비유

| 집 자동화 | Claude Hook |
|---|---|
| 현관문 열림 → 불 켜짐 | 파일 수정 → 자동 검사 |
| 가스 감지 → 밸브 잠김 | 비밀 파일 접근 → 자동 차단 |
| 밤 10시 → 불 꺼짐 | 코드 저장 → 자동 테스트 |

### Hook 종류

| Hook | 언제? | 차단 가능? |
|---|---|---|
| **PreToolUse** | 도구 쓰기 **전** | ✅ 가능 |
| **PostToolUse** | 도구 쓰고 **후** | ❌ 알림만 |
| **SessionStart** | Claude 시작할 때 | ❌ |
| **Stop** | Claude 끝날 때 | ❌ |
| **UserPromptSubmit** | 메시지 보낼 때 | ❌ |

### 설정 예시

```
이 프로젝트에 Hook 설정 해줘:
1. 파일 수정 전 → 백업 파일 자동 생성
2. 코드 저장 후 → 린트 검사 자동 실행
3. 비밀 파일(.env) 접근 시 → 차단
```

---

## 10. 작업 팁 & 베스트 프랙티스

### CLAUDE.md 잘 쓰는 법

- 50~100줄 이내 유지 (핵심만!)
- "이 내용 빼면 Claude가 실수할까?" 기준으로 정리
- `앞으로도 이렇게 해줘`, `CLAUDE.md에 추가해줘`로 업데이트

### 컨텍스트 관리

- 한 작업 끝나면 `/clear`로 새 채팅
- 대화 길어지면 `/compact`로 정리
- 한 번에 하나의 작업만 요청
- 채팅 이름 바꿔서 관리

### 검증 중심 요청 (가장 중요!)

```
✗ "로그인 페이지 만들어줘"
✓ "로그인 페이지 만들고, 테스트 실행해서 다 통과하게 고쳐줘"
```

### 추천 작업 흐름

```
작업 요청 → 작전 모드 → 계획 확인 → 실행 → CLAUDE.md에 배운 것 추가
```

---

## 11. 디스패치 — 핸드폰으로 로컬 Claude Code 조종

1. 컴퓨터에서 디스패치 설정 진입
2. QR코드를 핸드폰 Claude 앱으로 스캔
3. 핸드폰 앱 → 디스패치 → 작업 지시

→ 핸드폰에서 명령하면 컴퓨터의 Claude Code가 실행!

---

## 📋 치트시트: 필수 단축키 & 명령어

### 기본 명령

| 키 | 설명 |
|---|---|
| `claude` | Claude Code 시작 |
| `/init` | 알림장(CLAUDE.md) 자동 생성 |
| `@파일명` | "이 파일 참고해" |
| `#` | "이거 기억해" (규칙 저장) |

### 대화 관리

| 키 | 설명 |
|---|---|
| `ESC` | 일시정지 |
| `ESC` × 2 | 되감기 |
| `/compact` | 대화 요약 정리 |
| `/clear` | 새 채팅 시작 |
| `/rewind` | 코드/대화 되감기 |

### 모드 전환

| 키 | 설명 |
|---|---|
| `Shift+Tab` | 모드 순환 (보통 → 자동승인 → 작전짜기) |
| `Shift+Enter` | 여러 줄 입력 |
| `think` | 살짝 생각 |
| `think hard` | 보통 생각 |
| `megathink` | 깊은 생각 |
| `ultrathink` | 최대 생각 |

### 확장 & 기타

| 키 | 설명 |
|---|---|
| `claude mcp add` | MCP 추가 |
| `/install-github-app` | GitHub 연결 |
| `/loop` | 완료까지 반복 (최대 3일) |
| `/effort max` | 항상 최대 사고 유지 |
| `/add-dir` | 다른 폴더 참고 추가 |
| `/statusline` | 상태 표시줄 |
| `/keybindings` | 단축키 커스텀 |

### 생각 깊이 단어

| 단어 | 깊이 | 용도 |
|---|---|---|
| `think` | ★☆☆☆ | 간단한 문제 |
| `think hard` | ★★☆☆ | 일반적인 문제 |
| `megathink` | ★★★☆ | 복잡한 문제 |
| `ultrathink` | ★★★★ | 아주 어려운 문제 |

---

## 🔗 유용한 링크 모음

### MCP 서버

- 공식 레지스트리: [registry.modelcontextprotocol.io](http://registry.modelcontextprotocol.io)
- PulseMCP: [pulsemcp.com](http://pulsemcp.com)
- Awesome MCP: [mcp-awesome.com](http://mcp-awesome.com)

### Skill

- Anthropic 공식: [github.com/anthropics/skills](http://github.com/anthropics/skills)
- 스킬 검색: [skills.sh](http://skills.sh)

### Agent & 커뮤니티

- Claude Code Toolkit: [GitHub](https://github.com/rohitg00/awesome-claude-code-toolkit)
- Awesome Claude Code: [GitHub](https://github.com/hesreallyhim/awesome-claude-code)
- ClaudeLog: [claudelog.com](http://claudelog.com)
- 치트시트: [GitHub](https://github.com/Njengah/claude-code-cheat-sheet)

### 강의 원본

- [Notion 강의 자료](https://jolly-shrine-63f.notion.site/Claude-Code-31fe4917eeaa81d9b86dfc908f5e26c9)