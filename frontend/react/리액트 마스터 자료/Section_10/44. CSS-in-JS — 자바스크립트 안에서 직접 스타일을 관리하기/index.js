/* -----------------------------------------------
   43강. Vanilla CSS 방식 (App.css + App.js)
------------------------------------------------ */

// App.css
h1 {
  color: blue;
  text-align: center;
}

button {
  background-color: green;
  color: white;
  padding: 10px;
  border-radius: 5px;
}

// App.js
import "./App.css";

export default function App() {
  return (
    <div>
      <h1>안녕하세요, React!</h1>
      <button>클릭</button>
    </div>
  );
}


/* -----------------------------------------------
   43강. 전역 CSS 적용 (styles.css + App.js)
------------------------------------------------ */

// styles.css
button {
  color: red;
}

// App.js
import "./styles.css";

function App() {
  return (
    <div>
      <button>로그인</button>
      <button>회원가입</button>
    </div>
  );
}

export default App;

// 결과:
// styles.css의 button 스타일이 전역으로 적용되어
// 두 버튼 모두 빨간 글씨로 출력됨.


/* -----------------------------------------------
   44강. Inline Style 방식 (Button.js)
------------------------------------------------ */

// Button.js
export default function Button({ primary }) {
  const buttonStyle = {
    backgroundColor: primary ? "blue" : "gray",
    color: "white",
    padding: "10px 15px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  };

  return <button style={buttonStyle}>클릭</button>;
}

// 렌더링 결과:
// <button style="background-color: blue; color: white; ...">클릭</button>


/* -----------------------------------------------
   44강. CSS-in-JS 방식 (styled-components 예시)
------------------------------------------------ */

// 설치 명령어:
// npm install styled-components
// 또는
// yarn add styled-components

// (emotion을 쓴다면)
// npm install @emotion/react @emotion/styled
// 또는
// yarn add @emotion/react @emotion/styled


// App.js
import styled from "styled-components";

const Button = styled.button`
  background-color: ${(props) => (props.primary ? "blue" : "gray")};
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  border: none;
  cursor: pointer;
`;

export default function App() {
  return (
    <>
      <Button primary>Primary 버튼</Button>
      <Button>일반 버튼</Button>
    </>
  );
}

// 설명:
// styled.button`` 내부의 CSS는 런타임에 변환되어
// 자동 생성된 고유 클래스 이름으로 DOM에 부착됩니다.
// 따라서 props에 따라 동적으로 스타일이 변경되며,
// 전역 오염 없이 원하는 디자인을 적용할 수 있습니다.
