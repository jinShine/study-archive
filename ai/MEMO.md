

대부분의 엔지니어가 Cluade Code를 잘못 쓰고 있다.
❌ 잘못된 사용법
- 한 번 프롬프트, 한 번 답변, 반복
- 컨텍스트 없이 매번 새로 설명
- 파일 접근 가능한 ChatGPT 취급
- 단일 작업 도구로 인식

✅ 올바른 사용법
- 메모리가 있는 런타임으로 활용
- 정책(Hooks)으로 안전망 구축
- 재사용 가능한 역량 쌓기
- 위임된 전문가로 운영

Claude Code를 이해하는 4개의 레이어
1. Layer 1: Context
- Claude.md 
    - 영속적인 프로젝트 메모리
    - 마크다운파일, 컨벤션, 아키텍처, 팀 규칙 등을 저장.
    - Claude가 매 세션마다 자동으로 읽어 컨텍스트 유지
- /init
    - 기존 프로젝트 상태 설명

2. Layer 2: Composition 레이어
- 커스텀 슬래시 커멘드
    - 팀 전체가 공유하는 프롬프트를 명령어로.
    - 예: /generate_test_code, /summarize_meeting 등
- Skills (SKILL.md)
    - 재사용 가능한 프롬프트 조각
    - 특정 작업에 최적화된 프롬프트 템플릿
- Subagents
    - 특정 도메인 전문가 역할을 하는 하위 에이전트
    - 예: CodeReviewer, DataAnalyst, DevOpsSpecialist 등
- Plugins
    - 외부 도구와의 통합
    - 예: GitHub, Jira, CI/CD 시스템 등

3. Layer 3: Control 레이어
- Plan Mode
    - Shift + Tab으로 실행 전 검토
    - 단계별 계획 수립과 검증
- Hooks
    - 위험한 작업에 대한 안전망
    - 예: /delete_branch 전에 "Are you sure?" 확인
    - Guardrails
- Headless Mode
    - 프롬프트 없이도 자동으로 작업 수행
    - 예: 코드 리뷰 후 자동으로 PR 생성
    
4. Capability 레이어
- MCP 서버 연동
    - Claude Code의 역량을 API로 노출
    - 다른 시스템에서 Claude의 기능 활용 가능
    

4개의 레이어는 독립적이지 않습니다.
Context -> Composition -> Control -> Capability 순으로 쌓을 수록 레버리지가 커집니다.

핵심 인사이트
"챗봇이 아닌 런타임으로 대하라"
1. 메모리(CLAUDE.md)
2. 재사용 역량(Skills, Slash Commands)
3. 정책(Hooks)
4. 전문가 (Subagents)




AI 코딩 어시스턴트를 완전히 바꾸는 단 하나의 파일

https://github.com/forrestchang/andrej-karpathy-skills
- Github에서 엄청난 스타를 받은 CLAUDE.md
- 모델 교체 없이, 행동 원칙 4가지만으로 AI 코딩의 고질적 문제를 잡습니다.


Skills
- 재사용 가능한 프롬프트 
- 한번 만들어 놓으면 팀 전체가 활용 가능
- /슬래시 직접 호출
    - 사용자가 원하는 순간 명시적으로 실행
    - ㅂ배포 커밋 처럼 시점이 명확한 작업에 적합
- 대화 맥락 자동 트리거
    - Skill의 description을 보고 Claude가 스스로 판단해 적절한 순간에 자동으로 로드


기존 방식과 비교

단순 프롬프트
- 재사용성 X
- 자동트리거 X
- 인자 전달 X

CLAUDE.md
- 재사용성 O
- 자동트리거 O
- 인자 전달 X

./claude/commands/
- 재사용성 O
- 자동트리거 O
- 인자 전달 O ($ARGUMENTS)

./claude/skills/
- 재사용성 O
- 자동트리거 O
- 인자 전달 O ($ARGUMENTS)


Skills의 저장위치
- Personal
    - ~/.claude/skills/<name>/SKILL.md
- Project
    - .claude/skills/<name>/SKILL.md
- Plugin
    - <plugin>/skills/<name>/SKILL.md

높은 계층이 낮은 계층을 덮어 쓴다.
- Enterprise > Personal > Project > Plugin
💡 Plugin Skill은 plugin:skill-name 네임스페이스를 사용해 다른 계층과 충돌하지 않는다.

Skill 만들기
~/.claude/skills
 |- SKILL.md

SKILL.md 템플릿
```
---
name: skill-name
description: |
  이 스킬은 ~~~할 때 사용합니다.
  예시: ~~~
---

## 스킬 설명
- 이 스킬이 하는 일에 대한 자세한 설명
```

name
- 슬래시 명령어가 된다.
    - 예: skill-name -> /skill-name
- 소문자, 숫자, 하이픈만 허용 (최대 64자)

- description
    - Claude가 자동 트리거 시기를 판단하는 기준.
    - 주요 사례를 앞에 배치하세요.
    - 250자 초과 시 잘린다.

