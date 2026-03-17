// 📄 Welcome.js
// 48강. Inline Styles — 가장 직접적인 스타일링 방법
// 요소에 직접 style 객체를 전달하는 가장 기본적인 React 스타일링 방식

export default function Welcome() {
  // 🎨 1️⃣ 스타일 객체 정의
  // React의 Inline Style은 JS 객체 형태로 작성해야 하며,
  // CSS 속성 이름은 camelCase(낙타표기법)을 사용해야 합니다.
  const titleStyle = {
    color: "royalblue",     // 글자색
    fontSize: "24px",       // 글자 크기
    fontWeight: "bold",     // 글자 두께
    padding: "10px"         // 내부 여백
  };

  // 💬 2️⃣ JSX에서 style 속성으로 전달
  // HTML의 style="..." 과 달리 React에서는 객체를 넘깁니다.
  // 따라서 중괄호 {{ }}를 두 번 써야 함.
  return <h1 style={titleStyle}>안녕하세요, React!</h1>;
}

/* 
📄 렌더링 결과 (브라우저에 변환된 실제 HTML)
------------------------------------------------
<h1 style="color: royalblue; font-size: 24px; font-weight: bold; padding: 10px;">
  안녕하세요, React!
</h1>
------------------------------------------------
*/

/*
💡 개념 요약
------------------------------------------------
✅ Inline Style은 요소에 직접 스타일을 전달하는 방법입니다.
✅ React에서는 style 속성에 문자열이 아닌 객체(Object)를 넘깁니다.
✅ 속성명은 반드시 camelCase로 작성해야 합니다.
   예: background-color → backgroundColor
✅ 단위(px, %, em 등)는 문자열로 작성해야 합니다. ("24px")
✅ JS 변수나 props 값을 바로 활용할 수 있습니다.
------------------------------------------------
*/

/*
🔍 동적 스타일링 예시
------------------------------------------------
export default function Greeting({ isActive }) {
  const style = {
    color: isActive ? "green" : "gray",
    fontWeight: isActive ? "bold" : "normal"
  };
  return <h2 style={style}>Hello React!</h2>;
}
------------------------------------------------
*/

/*
📘 Inline Style의 장단점
------------------------------------------------
✅ 장점:
 - 외부 CSS 파일 없이 빠르고 간단하게 스타일 지정 가능
 - props, state와 쉽게 연동되어 동적 스타일링에 유리함

❌ 단점:
 - 재사용성과 유지보수성이 떨어짐
 - hover, focus 같은 CSS 의사클래스 사용 불가
 - 미디어쿼리, 애니메이션 등 복잡한 CSS는 비효율적
------------------------------------------------
*/

/*
✅ 핵심 요약
------------------------------------------------
- style 속성은 객체 형태로 작성한다.
- CSS 속성명은 camelCase로 써야 한다.
- 단위(px)는 문자열로 작성한다.
- Inline Style은 빠르고 단순하지만, 대규모 프로젝트에서는
  CSS Module이나 styled-components 같은 방식이 더 적합하다.
------------------------------------------------
*/
