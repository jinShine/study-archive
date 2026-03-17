# 41강. 외부 라이브러리 연동 -- 명령적 API 포장 전략

## 도입

실무에서 가장 까다로운 작업 중 하나인 비리액트 라이브러리(Flatpickr)를 리액트 생태계 안으로 완벽하게 편입시키는 최종 코드를 완성해 본다. 이 코드는 단순히 기능을 구현하는 것을 넘어, 부모 컴포넌트에게 라이브러리의 복잡함을 숨기고 '안전한 조종기'만 건네주는 캡슐화(Encapsulation)의 정석을 보여준다.

## 개념 설명

외부 라이브러리 연동의 핵심은 세 가지 참조(ref)를 구분하여 관리하는 것이다.

1. **inputRef**: 실제 DOM 인풋을 가리키는 참조 (라이브러리가 달라붙을 지점)
2. **fp (인스턴스 참조)**: 라이브러리 인스턴스를 보관하는 참조 (명령을 내릴 실체)
3. **부모의 ref**: `useImperativeHandle`로 부모에게 노출할 안전한 API 정의

## 코드 예제

### 자식 컴포넌트 (MyDatePicker.jsx)

부모에게 라이브러리의 내부 문법을 노출하지 않고, 우리가 정의한 `openPicker`, `closePicker`, `clearDate` 버튼만 노출한다.

```jsx
import { useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const MyDatePicker = forwardRef((props, ref) => {
  // 1. 실제 DOM 인풋을 가리킬 참조
  const inputRef = useRef();
  // 2. 라이브러리 인스턴스를 보관할 참조
  const fp = useRef();

  // 라이브러리 초기화 및 뒷정리
  useEffect(() => {
    fp.current = flatpickr(inputRef.current, {
      onChange: (selectedDates, dateStr) => {
        if (props.onChange) props.onChange(dateStr);
      },
    });

    // 컴포넌트 제거 시 메모리 누수 방지
    return () => {
      if (fp.current) {
        fp.current.destroy();
      }
    };
  }, [props]);

  // 3. 부모에게 노출할 안전한 '비밀 버튼'들 정의
  useImperativeHandle(ref, () => ({
    openPicker: () => {
      if (fp.current) fp.current.open();
    },
    closePicker: () => {
      if (fp.current) fp.current.close();
    },
    clearDate: () => {
      if (fp.current) fp.current.clear();
    }
  }), []);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="날짜를 선택하세요"
      style={{
        padding: '10px',
        borderRadius: '8px',
        border: '2px solid #ddd',
        width: '250px',
        fontSize: '16px'
      }}
    />
  );
});

export default MyDatePicker;
```

### 부모 컴포넌트 (App.jsx)

부모는 `flatpickr`의 문법을 몰라도 자식이 준 버튼만 눌러서 날짜창을 제어한다.

```jsx
import { useRef, useState } from 'react';
import MyDatePicker from './components/MyDatePicker';

export default function App() {
  const datePickerRef = useRef();
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <div style={{ padding: '50px', fontFamily: 'sans-serif' }}>
      <h1>데이트 피커 원격 제어</h1>
      <p>선택된 날짜: <strong>{selectedDate || "없음"}</strong></p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => datePickerRef.current.openPicker()}>창 열기</button>
        <button onClick={() => datePickerRef.current.closePicker()}>창 닫기</button>
        <button onClick={() => datePickerRef.current.clearDate()}>날짜 초기화</button>
      </div>

      <MyDatePicker
        ref={datePickerRef}
        onChange={(date) => setSelectedDate(date)}
      />
    </div>
  );
}
```

## 코드 해설

### 왜 이 구조가 강력한가?

- **결합도 하락**: 나중에 `flatpickr`를 버리고 Dayjs나 다른 라이브러리로 바꿔도, 부모인 `App.jsx`는 고칠 필요가 없다. 오직 `MyDatePicker` 내부만 수정하면 된다.
- **보안 강화**: 부모가 `input`의 `type`을 갑자기 바꾸거나 속성을 건드려 라이브러리를 망가뜨리는 일을 원천 차단했다.
- **코드의 의도 명확화**: `fp.current.clear()`보다는 `clearDate()`가 동료 개발자들에게 훨씬 친절한 이름표이다.

## 실무 비유

외부 라이브러리 래핑은 외국어 통역 서비스와 같다. 부모(한국인 사장)가 자식(통역사)에게 "계약 해지해줘"라고 한국어로 말하면, 통역사가 내부적으로 외국어(flatpickr API)로 변환하여 실행한다. 사장은 외국어를 배울 필요가 없고, 통역사를 바꿔도 사장의 업무 방식은 변하지 않는다.

## 핵심 포인트

- 외부 라이브러리 연동 시 `useRef`로 인스턴스를 보관하고, `useEffect`로 생명주기를 관리하며, `useImperativeHandle`로 안전한 API만 노출한다.
- `destroy()` 호출을 통한 클린업은 메모리 누수 방지의 핵심이다.
- 라이브러리 교체 시 자식 컴포넌트 내부만 수정하면 되는 낮은 결합도 구조가 이상적이다.

## 자가 점검

- [ ] 외부 라이브러리의 인스턴스를 `useRef`로 보관하고 `useEffect`의 클린업에서 `destroy`하는 패턴을 이해했는가?
- [ ] `useImperativeHandle`로 래핑하여 부모가 라이브러리 문법을 몰라도 되게 만든 캡슐화 전략을 파악했는가?
- [ ] 이 구조의 핵심 장점(라이브러리 교체 시 부모 코드 수정 불필요)을 설명할 수 있는가?
