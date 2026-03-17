// nested-updates-in-arrays.jsx
// -------------------------------------------------------------
// 23. 배열 안의 중첩 객체 업데이트 — 깊은 구조에서도 불변성 유지하기
// -------------------------------------------------------------
// 핵심 요약
// - 배열 상태에서 “객체의 안쪽 필드”를 바꿀 때도 원본을 직접 수정하지 말고
//   map / filter로 ‘새 배열’을 만들고, 바뀌는 요소만 얕은 복사(…) 후 필요한
//   하위 객체도 한 단계씩 펼쳐서(…) 값만 덮어쓴다.
// - React는 먼저 “참조가 달라졌는지”로 변경을 감지한다. 같은 참조면 내부가
//   변해도 업데이트를 건너뛸 수 있다 → 불변성 유지가 필수!
// -------------------------------------------------------------

import React, { useState } from "react";

/* -----------------------------------------------------------
 * 섹션 1. 데이터 구조 예시 (배열 안의 중첩 객체)
 *   - 이미지: posts 배열, 각 post는 author { name, email } 포함
 * ---------------------------------------------------------*/

const initialPosts = [
  {
    id: 1,
    title: "첫 번째 글",
    author: { name: "철수", email: "chul@example.com" },
  },
  {
    id: 2,
    title: "두 번째 글",
    author: { name: "영희", email: "young@example.com" },
  },
];

/* -----------------------------------------------------------
 * 섹션 2. 배열 안의 중첩 객체 업데이트 (map + 단계별 스프레드)
 *   - 이미지: changeAuthorName(id, newName)
 * ---------------------------------------------------------*/

function PostList() {
  const [posts, setPosts] = useState(initialPosts);

  function changeAuthorName(id, newName) {
    setPosts(
      posts.map((post) =>
        post.id === id
          ? {
              ...post, // post 객체 복사
              author: {
                ...post.author, // author 객체 복사
                name: newName, // 필요한 값만 덮어쓰기
              },
            }
          : post
      )
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {posts.map((post) => (
        <div key={post.id} style={{ marginBottom: 8 }}>
          <h3>{post.title}</h3>
          <p>
            {post.author.name} ({post.author.email})
          </p>
          <button onClick={() => changeAuthorName(post.id, "민수")}>
            작성자 이름 바꾸기
          </button>
        </div>
      ))}
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 3. 패턴 스니펫 모음 (강의 이미지 그대로 코드화)
 *   3-1) 중첩 객체 한 단계 펼치기: setUser
 *   3-2) 배열 요소의 하위 객체 일부만 교체: setCart
 *   3-3) 메시지 배열에서 특정 요소의 하위 객체만 교체: setMessages
 * ---------------------------------------------------------*/

function UserAddressPatchExample() {
  const [user, setUser] = useState({
    name: "영희",
    age: 25,
    address: { city: "부산", zipcode: "12345" },
  });

  function moveToSeoul() {
    setUser({
      ...user,
      address: {
        ...user.address,
        city: "서울",
      },
    });
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={moveToSeoul}>도시를 서울로 변경</button>
    </div>
  );
}

function CartPatchExample() {
  const [cart, setCart] = useState([
    { id: 1, name: "노트북", quantity: 1, option: { color: "black" } },
    { id: 2, name: "마우스", quantity: 1, option: { color: "white" } },
  ]);

  function paintFirstItemRed() {
    setCart(
      cart.map((item) =>
        item.id === 1
          ? { ...item, option: { ...item.option, color: "red" } }
          : item
      )
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <pre>{JSON.stringify(cart, null, 2)}</pre>
      <button onClick={paintFirstItemRed}>1번 상품 색상 red로</button>
    </div>
  );
}

function MessagesPatchExample() {
  const [messages, setMessages] = useState([
    { id: 9, text: "ping", sender: { name: "Ann", status: "online" } },
    { id: 10, text: "hi", sender: { name: "Bob", status: "online" } },
  ]);

  function setSenderOfflineFor10() {
    setMessages(
      messages.map((msg) =>
        msg.id === 10
          ? { ...msg, sender: { ...msg.sender, status: "offline" } }
          : msg
      )
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <pre>{JSON.stringify(messages, null, 2)}</pre>
      <button onClick={setSenderOfflineFor10}>#10 발신자 offline 처리</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 4. 왜 참조를 바꿔야 하나? (개념 스케치)
 *   - 이미지: 참조 동일성만 먼저 비교하는 예시
 *   - 이미지: 콘솔 착시 (뮤테이션은 보이지만 리렌더는 안 됨)
 * ---------------------------------------------------------*/

function ReferenceCheckSketch() {
  // (설명용 데모)
  const [user, setUser] = useState({
    name: "영희",
    address: { city: "부산", zipcode: "12345" },
  });

  function badMutate() {
    // ❌ 내부를 직접 변경(뮤테이션)
    user.address.city = "서울";
    console.log("콘솔엔 보이는 값:", user); // 값은 바뀌어 보임
    // setUser(user); // 같은 참조라면 변경 감지 실패 가능
  }

  function goodReplace() {
    // ✅ 참조를 바꾸며 교체
    setUser((prev) => ({
      ...prev,
      address: { ...prev.address, city: "서울" },
    }));
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <button onClick={badMutate}>❌ 직접 변경 시도</button>{" "}
      <button onClick={goodReplace}>✅ 불변 업데이트</button>
      <pre style={{ marginTop: 12 }}>
        {`// React는 보통 이렇게 '참조'를 먼저 확인해 효율을 높입니다.
if (prevObject === nextObject) {
  // 내부 속성은 확인하지 않고 변경 없음 처리
}`}
      </pre>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 5. 데모용 루트 컴포넌트
 * ---------------------------------------------------------*/

export default function App() {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        lineHeight: 1.45,
        padding: 16,
      }}
    >
      <h2>23. 배열 안의 중첩 객체 업데이트 — 깊은 구조에서도 불변성 유지하기</h2>

      <h3>섹션 1. 데이터 구조 예시</h3>
      <pre>{JSON.stringify(initialPosts, null, 2)}</pre>

      <h3>섹션 2. 배열 안 중첩 객체 업데이트 (map + 스프레드)</h3>
      <PostList />

      <h3>섹션 3. 패턴 스니펫 모음</h3>
      <UserAddressPatchExample />
      <CartPatchExample />
      <MessagesPatchExample />

      <h3>섹션 4. 참조 비교 개념 스케치</h3>
      <ReferenceCheckSketch />
    </div>
  );
}

/* -----------------------------------------------------------
 * 1) 절대 상태를 “직접” 바꾸지 말 것
 *    - ❌ user.address.city = "서울"; // 참조 동일 → 변경 감지 실패 가능
 *
 * 2) 배열은 map/filter로 새 배열을 만들 것
 *    - ✅ setItems(items.map(i => i.id === id ? { ...i, x: 1 } : i))
 *
 * 3) 바뀌는 요소만 얕은 복사(…) 후, 하위 객체도 한 단계씩 펼쳐서 덮어쓰기
 *    - ✅ { ...post, author: { ...post.author, name: newName } }
 *
 * 4) “참조가 바뀌어야” React가 업데이트를 확정한다
 *    - 동일 참조면 내부 변경은 무시될 수 있음 → 항상 새 객체/새 배열로 교체
 * ---------------------------------------------------------*/
