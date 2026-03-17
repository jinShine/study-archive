# 23강. useRef 실전 프로젝트 (2부) — 스마트 타이머와 비디오 최적화 시스템

## 도입

이번 강의에서는 "스마트 멀티 타이머"와 "비디오 이어보기 시스템"이라는 두 가지 프로젝트를 통해 useRef를 실무에서 어떻게 활용하는지 실전 감각을 익힌다. 단순히 코드를 짜는 것이 아니라, 성능을 갉아먹는 리렌더링의 범인을 잡고 최적화된 엔진을 다는 과정이다.

## 개념 설명

하나의 컴포넌트 안에서 useRef는 여러 역할을 동시에 수행할 수 있다:

1. **리모컨**: DOM 요소에 접근하여 자동 포커스
2. **금고**: setInterval ID를 보관하여 타이머 제어
3. **스위치**: 첫 렌더링 방어용 플래그
4. **기록장**: 이전 값 비교용 저장소

비디오 시스템에서는 초당 수십 번 발생하는 재생 시간 업데이트를 useState 없이 Ref로 기록하여, 불필요한 리렌더링을 원천 차단하는 성능 최적화 기법을 적용한다.

**데이터의 여정 (Data Journey):**
1. 입력: 브라우저가 `onTimeUpdate` 신호를 보낸다
2. 저장: `lastTimeRef.current`에 숫자를 빠르게 적어둔다 (리액트는 이 사실을 모른다)
3. 추출: 사용자가 "저장" 버튼을 누르면 그제야 비밀 공간을 열어 숫자를 꺼낸다

## 코드 예제

### 스마트 멀티 타이머 (SmartTimer)

```jsx
import { useState, useEffect, useRef } from "react";

export default function SmartTimer() {
  const [count, setCount] = useState(0);

  // [리모컨] 검색창 자동 포커스용
  const inputRef = useRef(null);
  // [금고] setInterval ID 보관용 (렌더링 방지)
  const timerIdRef = useRef(null);
  // [스위치] 첫 렌더링 방어용
  const isFirstRender = useRef(true);
  // [기록장] 이전 카운트 비교용
  const prevCountRef = useRef();

  // 자동 포커스 로직
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // 데이터 추적 및 알림 로직
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    console.log(`기록: 현재(${count}초), 이전(${prevCountRef.current}초)`);
    prevCountRef.current = count;
  }, [count]);

  const startTimer = () => {
    if (timerIdRef.current) return; // 중복 실행 방지
    timerIdRef.current = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerIdRef.current);
    timerIdRef.current = null;
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ddd', borderRadius: '15px' }}>
      <h3>스마트 타이머 시스템</h3>
      <input ref={inputRef} placeholder="여기에 메모하세요" style={{ padding: '8px' }} />
      <h1 style={{ fontSize: '3rem' }}>{count}s</h1>
      <button onClick={startTimer} style={{ backgroundColor: '#4caf50', color: 'white' }}>시작</button>
      <button onClick={stopTimer} style={{ backgroundColor: '#f44336', color: 'white', marginLeft: '10px' }}>정지</button>
    </div>
  );
}
```

### 비디오 시청 기록 최적화 (VideoOptimizer)

```jsx
import { useRef } from "react";

export default function VideoOptimizer() {
  const videoRef = useRef(null);
  // 실시간 재생 시간을 렌더링 없이 저장
  const lastTimeRef = useRef(0);

  const onTimeUpdate = () => {
    if (videoRef.current) {
      // [성능 핵심] 이 함수는 영상 재생 중 계속 실행되지만,
      // Ref를 수정하므로 컴포넌트 전체는 절대 리렌더링되지 않는다 (CPU 절약)
      lastTimeRef.current = videoRef.current.currentTime;
    }
  };

  const saveProgress = () => {
    // 결정적인 순간(버튼 클릭)에만 저장소의 값을 가져온다
    alert(`현재 ${Math.floor(lastTimeRef.current)}초 지점을 저장했습니다.`);
  };

  return (
    <div style={{ marginTop: '20px', padding: '20px', background: '#333', color: '#fff', borderRadius: '15px' }}>
      <h3>비디오 이어보기 엔진</h3>
      <video
        ref={videoRef}
        onTimeUpdate={onTimeUpdate}
        controls
        width="100%"
        style={{ borderRadius: '10px' }}
      >
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
      </video>
      <button onClick={saveProgress} style={{ marginTop: '10px', width: '100%', padding: '10px' }}>
        시청 위치 기록하기
      </button>
    </div>
  );
}
```

## 코드 해설

**SmartTimer:**
- `timerIdRef`: `setInterval`의 ID는 화면에 보여줄 필요가 없다. `useState`에 담았다면 숫자가 올라갈 때마다 ID 저장용 상태 변경 때문에 불필요한 연산이 한 번 더 일어난다.
- `if (timerIdRef.current) return`: 이미 타이머가 실행 중이면 중복 실행을 방지한다. 이 방어 로직이 없으면 "시작" 버튼을 여러 번 누를 때마다 타이머가 중첩되어 속도가 배로 빨라진다.
- `prevCountRef.current = count`: `useEffect` 안에서 업데이트하므로, 렌더링 시점에는 항상 "직전 값"이 유지된다.

**VideoOptimizer:**
- `onTimeUpdate`: 이 이벤트는 아주 빈번하게 발생한다. 유튜브 같은 서비스에서 재생 시간을 `useState`로 관리했다면 영상이 재생될 때마다 댓글창, 추천 리스트 등이 모두 버벅이며 다시 그려졌을 것이다. `useRef`는 이 대참사를 막는 "성능 방어막"이다.

**만약 이 코드가 없다면?**
- `timerIdRef`가 없다면: 타이머를 멈추려고 할 때 `setInterval`의 번호를 잃어버려 타이머가 영원히 멈추지 않는 "좀비 타이머"가 된다.
- `isFirstRender`가 없다면: 페이지 접속하자마자 "0초가 되었습니다"라는 불필요한 알림이 뜬다.

## 실무 비유

- **SmartTimer**: 카페의 주문 번호 시스템과 같다. 타이머 ID(주문 번호)를 별도 메모장(Ref)에 적어두고, 취소할 때 그 번호를 꺼내 "이 주문 취소해주세요"라고 한다. 메모장을 잃어버리면(일반 변수) 어떤 주문을 취소해야 할지 알 수 없다.
- **VideoOptimizer**: 도서관 열람실의 CCTV와 같다. 모든 움직임(재생 시간 변화)을 조용히 기록하다가, 관리자(사용자)가 요청할 때만 기록을 보여준다. 매번 화면에 띄울 필요가 없다.

## 핵심 포인트

1. 하나의 컴포넌트에서 useRef를 여러 개 사용하여 리모컨, 금고, 스위치, 기록장 역할을 동시에 수행할 수 있다.
2. `setInterval`/`setTimeout`의 ID는 반드시 Ref에 보관해야 정리(cleanup)가 가능하다.
3. 빈번하게 발생하는 이벤트(onTimeUpdate, onScroll, onMouseMove)의 데이터는 Ref에 저장하여 리렌더링을 방지한다.
4. 중복 실행 방지 로직(`if (ref.current) return`)은 타이머, API 호출 등에서 필수 방어 패턴이다.
5. 사용자의 결정적인 액션(버튼 클릭) 시점에만 Ref의 값을 꺼내 사용하는 것이 최적의 패턴이다.

## 자가 점검

- [ ] SmartTimer에서 useRef가 4개 쓰이는 각각의 역할을 설명할 수 있는가?
- [ ] 타이머 ID를 useState로 관리하면 어떤 문제가 생기는지 말할 수 있는가?
- [ ] VideoOptimizer에서 `onTimeUpdate`의 값을 useState로 관리했을 때의 성능 문제를 설명할 수 있는가?
- [ ] 카운트가 10초가 되면 자동으로 타이머를 멈추는 로직을 `useEffect` 안에 구현할 수 있는가?
