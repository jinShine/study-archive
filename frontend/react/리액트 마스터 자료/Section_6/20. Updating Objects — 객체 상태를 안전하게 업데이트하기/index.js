// updating-objects-cheatsheet.jsx
// -------------------------------------------------------------
// 20. Updating Objects — 객체 상태를 안전하게 업데이트하기
// -------------------------------------------------------------
// 핵심 요약
// - 상태(state)로 쓰는 객체/배열은 "불변성"을 지켜서 업데이트해야 함
// - 절대 "직접 변경(뮤테이션)" 하지 말고, 복사본을 만들어 변경 후 setState로 교체
// - 얕은 복사(spread, {...obj}, [...arr])를 기본으로, 중첩 구조는 단계별 복사
// -------------------------------------------------------------

import React, { useState } from "react";

/* -----------------------------------------------------------
 * 섹션 1. 객체/배열 형태의 상태 초기값 예시
 *   - 이미지: useState로 user(중첩 객체), cart(배열) 초기화
 * ---------------------------------------------------------*/

// 1-1) 중첩 객체 상태 예시
function InitialUserStateExample() {
  // 이미지: const [user, setUser] = useState({ name: "홍길동", age: 20, address: { city: "서울", detail: "강남구 역삼동" }});
  const [user] = useState({
    name: "홍길동",
    age: 20,
    address: {
      city: "서울",
      detail: "강남구 역삼동",
    },
  });

  return (
    <pre>
      <b>초기 유저 상태</b>
      {\n${JSON.stringify(user, null, 2)}}
    </pre>
  );
}

// 1-2) 배열(객체 리스트) 상태 예시
function InitialCartStateExample() {
  // 이미지: const [cart, setCart] = useState([{ id:1, name:"노트북", price:1500000, quantity:1 }, { id:2, name:"무선 마우스", price:30000, quantity:2 }]);
  const [cart] = useState([
    { id: 1, name: "노트북", price: 1_500_000, quantity: 1 },
    { id: 2, name: "무선 마우스", price: 30_000, quantity: 2 },
  ]);

  return (
    <pre>
      <b>초기 장바구니</b>
      {\n${JSON.stringify(cart, null, 2)}}
    </pre>
  );
}

/* -----------------------------------------------------------
 * 섹션 2. 값 vs. 참조(레퍼런스) 개념 스케치
 *   - 이미지: let name/age, const user 객체
 *   - 이미지: obj1/obj2가 같은 객체를 가리키는 참조 문제 설명
 * ---------------------------------------------------------*/

function ReferenceSketch() {
  // (학습용 주석) 원시값은 값 복사, 객체/배열은 참조가 복사됨.
  let name = "chulsoo";
  let age = 20;

  // 이미지: const user = { name:"chulsoo", age:20 };
  const user = { name: "chulsoo", age: 20 };

  // 이미지: 참조 공유 예시
  const obj1 = { age: 20 };
  const obj2 = obj1; // 같은 객체를 가리킴 (참조 공유)
  obj2.age = 21; // obj2만 바꾼 것 같지만 obj1도 함께 변경됨

  return (
    <pre>
      <b>값/참조 스케치</b>
      {\nname: ${name}, age: ${age}\nuser: ${JSON.stringify(user)}\n참조 공유 결과(obj1.age): ${obj1.age}}
    </pre>
  );
}

/* -----------------------------------------------------------
 * 섹션 3. 🙅‍♂️ 나쁜 예: 상태 직접 변경(뮤테이션)
 *   - 이미지: Profile()에서 user.age += 1; setUser(user);
 *   - 같은 객체 참조를 다시 set하면 리렌더링이 일어날지 보장 X, StrictMode에서 버그 유발
 * ---------------------------------------------------------*/

function ProfileBad() {
  const [user, setUser] = useState({ name: "철수", age: 20 });

  function handleBirthday() {
    // ❌ 나쁜 예: 상태를 직접 변경(뮤테이션)
    user.age += 1; // 직접 수정
    setUser(user); // 동일 참조를 다시 넣음 → 변경 감지 실패 가능
  }

  return (
    <div>
      <p>
        {user.name} — {user.age}살
      </p>
      <button onClick={handleBirthday}>생일 맞이하기 (❌ 직접 변경)</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 4. ✅ 좋은 예: 스프레드로 복사본 만들어 교체
 *   - 이미지: setUser({ ...user, age: user.age + 1 })
 *   - 중첩 객체는 단계별로 펼쳐서 원하는 속성만 교체
 * ---------------------------------------------------------*/

function ProfileGood() {
  const [user, setUser] = useState({ name: "철수", age: 20 });

  function handleBirthday() {
    // ✅ 좋은 예: 얕은 복사 후 필요한 필드만 교체
    setUser({
      ...user,
      age: user.age + 1,
    });
  }

  // (추가) 중첩 객체 업데이트 예시
  function moveCityToBusan() {
    // 단계별로 펼치기: user → address
    setUser((prev) => ({
      ...prev,
      address: prev.address
        ? { ...prev.address, city: "부산" }
        : { city: "부산", detail: "" },
    }));
  }

  return (
    <div>
      <p>
        {user.name} — {user.age}살
      </p>
      <button onClick={handleBirthday}>생일 맞이하기 (✅ 불변 업데이트)</button>
      <br />
      <button onClick={moveCityToBusan}>도시를 부산으로 변경 (중첩 객체)</button>
      {user.address && (
        <pre style={{ marginTop: 8 }}>
          {JSON.stringify(user.address, null, 2)}
        </pre>
      )}
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 5. 개별 아이템(객체) 업데이트: 카트 수량 +1
 *   - 이미지: CartItem()에서 setItem({ ...item, quantity: item.quantity + 1 })
 * ---------------------------------------------------------*/

function CartItem() {
  const [item, setItem] = useState({
    id: 1,
    name: "노트북",
    price: 1_200_000,
    quantity: 1,
  });

  function increaseQuantity() {
    // ✅ 현재 아이템 복사 → 수량만 교체
    setItem({
      ...item,
      quantity: item.quantity + 1,
    });
  }

  return (
    <div>
      <p>
        {item.name} ({item.quantity}개)
      </p>
      <button onClick={increaseQuantity}>+1</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 6. 배열 안의 객체 토글: TodoList
 *   - 이미지: setTodos(todos.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo))
 *   - 핵심: map으로 새 배열을 만들고, 대상 요소만 복사+변경
 * ---------------------------------------------------------*/

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "공부하기", done: false },
    { id: 2, text: "운동하기", done: false },
  ]);

  // 이미지와 동일한 토글 핸들러
  function toggleTodo(id) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  return (
    <div>
      {todos.map((todo) => (
        <p key={todo.id} style={{ margin: "6px 0" }}>
          <label>
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />{" "}
            {todo.text}
          </label>
        </p>
      ))}
      <pre style={{ marginTop: 8 }}>{JSON.stringify(todos, null, 2)}</pre>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 7. 데모용 루트 컴포넌트
 *   - 페이지에 전 섹션 컴포넌트를 모아 보여주는 용도
 *   - 실제 강의에선 필요 파트만 발췌해서 사용하셔도 됩니다.
 * ---------------------------------------------------------*/

export default function App() {
  return (
    <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", lineHeight: 1.4, padding: 16 }}>
      <h2>20. Updating Objects — 객체 상태를 안전하게 업데이트하기</h2>

      <h3>섹션 1. 상태 초기값 (객체/배열)</h3>
      <InitialUserStateExample />
      <InitialCartStateExample />

      <h3>섹션 2. 값 vs. 참조 개념</h3>
      <ReferenceSketch />

      <h3>섹션 3. 나쁜 예 (직접 변경)</h3>
      <ProfileBad />

      <h3>섹션 4. 좋은 예 (복사본 교체)</h3>
      <ProfileGood />

      <h3>섹션 5. 개별 아이템 업데이트</h3>
      <CartItem />

      <h3>섹션 6. 배열 안 객체 토글</h3>
      <TodoList />
    </div>
  );
}

/* -----------------------------------------------------------
 * 부록: 요약 규칙 (강의 슬라이드 노트용)
 *
 * 1) 절대 상태를 "직접" 바꾸지 말 것
 *    - ❌ user.age += 1; setUser(user)
 * 2) 복사본을 만들어 바꾼 뒤 set
 *    - ✅ setUser({ ...user, age: user.age + 1 })
 * 3) 중첩 객체는 단계별로 펼치기
 *    - ✅ setUser(p => ({ ...p, address: { ...p.address, city: "부산" }}))
 * 4) 배열은 map/filter로 새 배열 만들기
 *    - ✅ setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
 * ---------------------------------------------------------*/
