# 24강. useRef 실무 패턴 (3부) — 영역 밖 클릭 감지와 외부 라이브러리 통합 제어

## 도입

사용자가 메뉴 밖을 클릭했을 때 자동으로 닫히는 "영역 밖 클릭 감지(Outside Click Detection)"는 실무 UI 구현의 필수 요소다. 드롭다운, 모달, 툴팁 등 대부분의 오버레이 UI에 적용된다.

이번 강의에서는 리액트의 상태(State)와 브라우저의 전역 이벤트(DOM Event)를 `useRef`라는 교각으로 연결하는 고난도 아키텍처를 구축한다.

## 개념 설명

리액트의 `onClick`은 해당 요소 안에서만 작동한다. 하지만 "영역 밖"을 알기 위해서는 리액트의 통제권을 벗어나 브라우저(`document`) 전체의 클릭을 감시해야 한다.

핵심 원리:
1. `useRef`로 드롭다운의 물리적 DOM 영역을 잡아둔다
2. `document.addEventListener`로 브라우저 전체 클릭을 감시한다
3. 클릭된 지점(`event.target`)이 Ref가 가리키는 영역 안에 포함되는지 `contains()`로 판별한다
4. 포함되지 않으면 메뉴를 닫는다

**State 중심 접근 vs Ref 중심 접근:**

| 비교 항목 | 상태(State) 중심 | 참조(Ref) 중심 (정답) |
|-----------|-----------------|---------------------|
| 판단 기준 | "값이 바뀌었는가?" | "클릭된 DOM 노드가 내 안에 있는가?" |
| 동작 원리 | 논리적 데이터 비교 | 물리적 DOM 구조 비교 (contains) |
| 외부 연동 | 불가능 (리액트 내부만 감시) | 가능 (브라우저 전역 이벤트와 결합) |
| 결과 | 배경 전체에 투명 막을 깔아야 함 | 깔끔한 논리만으로 외부 클릭 제어 가능 |

## 코드 예제

### 영역 밖 클릭 감지 드롭다운 (AdvancedDropdown)

```jsx
import { useState, useEffect, useRef } from "react";

export default function AdvancedDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  // 드롭다운의 물리적 위치를 기억할 리모컨
  const dropdownRef = useRef(null);

  useEffect(() => {
    // 클릭 지점이 메뉴 상자 내부인지 외부인지 판별하는 함수
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        console.log("영역 밖 클릭 감지! 메뉴를 닫습니다.");
        setIsOpen(false);
      }
    };

    // 브라우저 전체 화면에 클릭 감시 장치를 설치
    document.addEventListener("mousedown", handleClickOutside);

    // [중요] 컴포넌트가 사라질 때 감시 장치를 제거하여 메모리 누수 방지
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <div
        ref={dropdownRef}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
        >
          계정 설정
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute', top: '45px', left: '0', width: '200px',
            backgroundColor: 'white', border: '1px solid #ddd',
            borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 10, textAlign: 'left', padding: '10px'
          }}>
            <div style={{ padding: '10px', cursor: 'pointer' }}>내 프로필</div>
            <div style={{ padding: '10px', cursor: 'pointer' }}>결제 수단</div>
            <div style={{ padding: '10px', cursor: 'pointer', color: 'red' }}>로그아웃</div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## 코드 해설

- `document.addEventListener("mousedown", ...)`: 리액트 컴포넌트의 `onClick`은 해당 요소 안에서만 작동한다. "영역 밖"을 알기 위해서는 브라우저(document) 전체의 신호를 가로채야 한다.
- `contains(event.target)`: DOM 표준 API로, 부모 요소가 특정 자식 요소를 품고 있는지 확인하는 가장 빠르고 정확한 방법이다.
- `removeEventListener`: 이 청소 로직이 없으면 사용자가 다른 페이지로 이동해도 브라우저가 계속 클릭을 감시하며 에러를 발생시킨다. 이벤트 리스너 등록과 해제는 항상 쌍으로 관리한다.
- `dropdownRef.current && ...`: Ref가 아직 연결되지 않았거나 컴포넌트가 언마운트된 경우를 방어한다.
- 의존성 배열 `[]`: 처음 렌더링될 때 딱 한 번만 감시 장치를 설치한다.

## 실무 비유

- 이 패턴은 보안 카메라 시스템과 같다. 건물(드롭다운 영역) 밖에서 수상한 움직임(클릭)이 감지되면 자동으로 문(메뉴)을 닫는 것이다. 건물 안에서의 움직임(내부 클릭)은 무시한다.
- 차트 라이브러리(D3, Chart.js) 등을 사용할 때도 이와 같이 `ref`에 인스턴스를 보관하면 리렌더링 시 차트가 파괴되지 않고 유지된다. 외부 라이브러리와 리액트를 안전하게 연결하는 교각 역할이다.

## 핵심 포인트

1. "영역 밖 클릭 감지"는 `useRef` + `document.addEventListener` + `contains()`의 조합으로 구현한다.
2. 전역 이벤트 리스너는 반드시 cleanup 함수에서 `removeEventListener`로 제거해야 메모리 누수를 방지한다.
3. `contains()` API는 DOM 구조상 부모-자식 관계를 물리적으로 판별하는 가장 정확한 방법이다.
4. 이 패턴은 드롭다운, 모달, 툴팁, 사이드바 등 대부분의 오버레이 UI에 공통적으로 적용된다.
5. 외부 라이브러리의 인스턴스를 Ref에 보관하면 리렌더링 시에도 인스턴스가 파괴되지 않고 유지된다.

## 자가 점검

- [ ] `document.addEventListener`를 사용하는 이유를 리액트의 `onClick`과 비교하여 설명할 수 있는가?
- [ ] `contains()` API의 역할과 작동 원리를 설명할 수 있는가?
- [ ] cleanup 함수에서 `removeEventListener`를 하지 않으면 어떤 문제가 생기는지 말할 수 있는가?
- [ ] 이 패턴을 모달 컴포넌트에 적용하여 배경 클릭 시 모달을 닫는 기능을 구현할 수 있는가?
