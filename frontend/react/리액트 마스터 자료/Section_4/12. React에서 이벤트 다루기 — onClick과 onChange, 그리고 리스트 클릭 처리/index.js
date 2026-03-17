/*
📘 React 이벤트 핸들링 완전 정복
------------------------------------------
HTML의 onclick → React의 onClick으로 발전하는 과정
이벤트 객체(event), 매개변수 전달, map() 내부 핸들링까지
*/

// ======================================================
// 1️⃣ HTML 방식의 이벤트 연결 (비추천 방식)
// ======================================================

<button onclick="alert('Hello!')">클릭</button>

 /*
 - HTML에서는 문자열 형태로 이벤트 코드를 작성함.
 - 이 방식은 전역 스코프에서 함수를 찾기 때문에, React에서는 동작하지 않음.
 - React에서는 “JSX 속성”을 통해 함수를 직접 연결해야 함.
 */


// ======================================================
// 2️⃣ React의 기본 이벤트 핸들링 (onClick)
// ======================================================

function App() {
  // 클릭 시 실행할 함수
  function handleClick() {
    console.log("버튼이 클릭되었습니다!");
  }

  // onClick 속성에 함수 참조를 전달
  return <button onClick={handleClick}>클릭</button>;
}

 /*
 ✅ 핵심 개념:
 - onClick은 문자열이 아니라 “함수 참조”를 받는다.
 - 함수 이름 뒤에 괄호()를 쓰면 즉시 실행되므로 ❌
   반드시 handleClick처럼 함수 자체를 넘긴다.
 */


// ======================================================
// 3️⃣ 입력 이벤트(onChange) 처리
// ======================================================

function App() {
  // 입력값이 변경될 때마다 실행되는 함수
  function handleChange(event) {
    console.log("현재 입력값:", event.target.value);
  }

  return <input type="text" onChange={handleChange} />;
}

 /*
 ✅ event 객체:
 - React는 브라우저 이벤트를 감싸는 SyntheticEvent를 제공함.
 - event.target.value → 현재 입력창의 값
 - React 이벤트 이름은 camelCase(onChange, onClick, onSubmit 등)
 */


// ======================================================
// 4️⃣ 배열 데이터 + 클릭 이벤트 (기본 버전)
// ======================================================

const items = ["사과", "바나나", "체리"];

function ItemList() {
  return (
    <ul className="list-group">
      {items.map((item) => (
        <li
          key={item}
          className="list-group-item"
          onClick={() => console.log("클릭됨")}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default ItemList;

 /*
 ✅ 포인트:
 - 각 항목을 map으로 렌더링할 때, 고유한 key를 지정해야 함.
 - 클릭 시 “익명 함수”를 써서 즉시 실행이 아닌 “지연 실행”하도록 함.
 */


// ======================================================
// 5️⃣ 클릭 시 어떤 항목이 눌렸는지 로그 출력
// ======================================================

const items = ["사과", "바나나", "체리"];

function ItemList() {
  return (
    <ul className="list-group">
      {items.map((item) => (
        <li
          key={item}
          className="list-group-item"
          onClick={() => console.log(item)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

 /*
 ✅ 개선점:
 - 클릭된 항목(item)을 콘솔에 직접 출력.
 - 각 li가 자신만의 클릭 이벤트를 가지게 됨.
 */


// ======================================================
// 6️⃣ 클릭 시 인덱스(index)와 항목(item) 함께 출력
// ======================================================

const items = ["사과", "바나나", "체리"];

function ItemList() {
  return (
    <ul className="list-group">
      {items.map((item, index) => (
        <li
          key={item}
          className="list-group-item"
          onClick={() => console.log(index, item)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default ItemList;

 /*
 ✅ 활용도 높은 패턴:
 - (item, index) → map에서 두 번째 인자 사용 가능.
 - 클릭 시 몇 번째 항목이 눌렸는지도 함께 확인 가능.
 */


// ======================================================
// 7️⃣ 이벤트 객체(event) 전체 로그 출력
// ======================================================

const items = ["사과", "바나나", "체리"];

function ItemList() {
  return (
    <ul className="list-group">
      {items.map((item, index) => (
        <li
          key={item}
          className="list-group-item"
          onClick={(event) => console.log(event)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default ItemList;

 /*
 ✅ event는 SyntheticEvent 객체
 - React가 브라우저의 native event를 감싸는 래퍼 객체임.
 - event.target / event.type / event.currentTarget 등 다양한 정보 포함
 */


// ======================================================
// 8️⃣ item, index, event 모두 전달하는 핸들러
// ======================================================

const items = ["사과", "바나나", "체리"];

function ItemList() {
  // 클릭 시 세 가지 정보를 모두 출력
  function handleClick(item, index, event) {
    console.log("클릭된 항목:", item);
    console.log("클릭된 인덱스:", index);
    console.log("SyntheticEvent 전체:", event);
  }

  return (
    <ul className="list-group">
      {items.map((item, index) => (
        <li
          key={item}
          className="list-group-item"
          onClick={(event) => handleClick(item, index, event)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default ItemList;

 /*
 ✅ 완성형 React 이벤트 핸들러 패턴
 - 필요한 데이터를 인자로 전달하면서도 event 객체를 함께 다룸.
 - JSX 이벤트 핸들러에서 인자를 넘길 때는 “화살표 함수” 필수!
 - handleClick(item, index, event) 호출 방식은 가장 실무 친화적.
 */
