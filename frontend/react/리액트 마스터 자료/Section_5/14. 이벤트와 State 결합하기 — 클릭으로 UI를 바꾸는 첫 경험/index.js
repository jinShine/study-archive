/**
 * React State 예제 모음
 * ---------------------
 * 1️⃣ Counter – useState로 숫자 상태 관리
 * 2️⃣ ToggleButton – useState로 불리언 상태 전환
 * 3️⃣ SelectableList – useState로 선택된 항목 상태 관리
 */

import { useState } from "react";

/* ---------------------------------------------------------
 * ① Counter 컴포넌트
 * 숫자 상태(count)를 관리하는 가장 기본적인 예제입니다.
 * 버튼 클릭 시 count 값이 1씩 증가하며 화면이 자동으로 갱신됩니다.
 --------------------------------------------------------- */
function Counter() {
  // count: 현재 상태 값
  // setCount: 상태를 변경하는 함수
  const [count, setCount] = useState(0); // 초기값 0 설정

  // 버튼 클릭 시 setCount를 통해 상태를 +1 증가시킴
  return (
    <div>
      {/* 현재 카운트를 화면에 표시 */}
      <p>현재 카운트: {count}</p>

      {/* 버튼 클릭 시 상태 업데이트 → React가 자동 재렌더링 */}
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

/* ---------------------------------------------------------
 * ② ToggleButton 컴포넌트
 * 불리언(true/false) 형태의 상태를 토글(toggle)하는 예제입니다.
 * 삼항 연산자를 사용하여 상태에 따라 문구와 버튼 이름을 바꿉니다.
 --------------------------------------------------------- */
function ToggleButton() {
  // isOn: 현재 스위치 상태 (true = 켜짐, false = 꺼짐)
  const [isOn, setIsOn] = useState(false); // 초기값 false

  return (
    <div>
      {/* 상태값에 따라 다른 문구를 표시 */}
      <p>{isOn ? "켜짐 상태입니다." : "꺼짐 상태입니다."}</p>

      {/* 클릭 시 현재 상태를 반전시킴 → !isOn */}
      <button onClick={() => setIsOn(!isOn)}>
        {isOn ? "끄기" : "켜기"}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------
 * ③ SelectableList 컴포넌트
 * 배열 데이터를 렌더링하고, 클릭된 항목의 인덱스를 상태로 관리합니다.
 * 선택된 항목은 굵게(bold) 표시되어 시각적으로 구분됩니다.
 --------------------------------------------------------- */
function SelectableList() {
  // 배열 데이터 정의
  const items = ["사과", "바나나", "체리"];

  // selected: 현재 선택된 항목의 인덱스 (없으면 null)
  const [selected, setSelected] = useState(null);

  return (
    <ul>
      {/* map을 통해 배열을 <li> 리스트로 변환 */}
      {items.map((item, index) => (
        <li
          key={index} // React가 각 항목을 구분하기 위한 고유 key
          onClick={() => setSelected(index)} // 클릭 시 선택 상태 변경
          style={{
            cursor: "pointer",
            fontWeight: selected === index ? "bold" : "normal", // 선택된 항목만 굵게 표시
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------
 * 내보내기 (모든 예제 컴포넌트를 한 번에 export)
 --------------------------------------------------------- */
export { Counter, ToggleButton, SelectableList };
