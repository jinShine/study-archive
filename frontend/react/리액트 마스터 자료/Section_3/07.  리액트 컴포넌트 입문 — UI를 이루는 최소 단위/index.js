// 📘 React 기본 컴포넌트 구조 & JSX 정리본

// ✅ 1. 가장 기본적인 함수형 컴포넌트
// React 컴포넌트는 함수(Function)로 정의하며,
// JSX를 return합니다. JSX는 HTML과 비슷하지만 실제로는 JS 문법입니다.

function Hello() {
  return <h1>Hello, React!</h1>;
}

// ✅ 2. 대문자/소문자 구분에 따른 React의 인식 차이
// - 대문자로 시작하는 태그명: React가 '사용자 정의 컴포넌트'로 인식
// - 소문자로 시작하는 태그명: HTML 기본 태그로 인식 (존재하지 않으면 에러 발생)

function Hello() {
  return <h1>👋 안녕하세요, 저는 컴포넌트입니다!</h1>;
}

function App() {
  return (
    <div>
      <Hello /> {/* ✅ 대문자 → 컴포넌트로 인식 */}
      <hello /> {/* ⚠️ 소문자 → HTML 태그로 간주 → 렌더링 안 됨 */}
      <div>div 태그입니다.</div> {/* ✅ 정상 DOM 태그 */}
      <span>span 태그입니다.</span> {/* ✅ 정상 DOM 태그 */}
    </div>
  );
}

// ✅ 3. JSX 내부 동작 이해: Babel 변환 결과 (React.createElement)
// JSX는 실제로는 React.createElement() 호출로 변환됩니다.
// 대문자 컴포넌트면 함수 참조, 문자열이면 HTML 태그로 처리됩니다.

function Hello() {
  return <h1>안녕하세요, 컴포넌트입니다 👋</h1>;
}

function App() {
  return (
    <div>
      <Hello /> {/* ✅ React.createElement(Hello) → 컴포넌트 참조 */}
      <div />   {/* ✅ React.createElement("div") → HTML 태그 */}
    </div>
  );
}

// ✅ 4. Self-closing vs 여는/닫는 태그 형태
// 컴포넌트나 태그는 <Hello />처럼 self-closing 가능하며,
// <Hello></Hello>처럼 감싸는 형태로도 작성할 수 있습니다.

function Hello() {
  return <h1>안녕하세요, 컴포넌트입니다 👋</h1>;
}

function App() {
  return (
    <div>
      <Hello></Hello> {/* ✅ 여는/닫는 형태 */}
      <Hello />        {/* ✅ Self-closing 형태 */}
    </div>
  );
}

// ✅ 5. ReactDOM.createRoot + render()
// 실제로 브라우저에 렌더링할 때는 ReactDOM.createRoot()와 root.render() 사용.
// 소문자 <hello>는 HTML 태그로 오인되어 렌더링되지 않음.

function Hello() {
  return <h1>안녕하세요, 컴포넌트입니다 👋</h1>;
}

function App() {
  return (
    <div>
      <Hello /> {/* ✅ React가 컴포넌트로 인식 → 정상 출력 */}
      <hello /> {/* ⚠️ React가 HTML 태그로 처리 → 렌더링 안 됨 */}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// ✅ 6. 컴포넌트는 반드시 하나의 루트(<div> 또는 <React.Fragment>)로 감싸야 함
// 여러 형제 요소를 직접 return하면 JSX 문법 오류 발생

// 올바른 예시: 하나의 <div>로 감싸기
function CorrectComponent() {
  return (
    <div>
      <h1>제목</h1>
      <p>본문</p>
    </div>
  );
}

// ❌ 오류 예시: 두 개의 형제 요소를 바로 반환
function WrongComponent() {
  return (
    <h1>제목</h1>
    <p>본문</p> // → SyntaxError (JSX element must have one parent element)
  );
}

// ✅ 7. Fragment(<> </>) 문법으로 불필요한 div 제거
// 여러 요소를 반환하되, DOM에 추가 태그를 만들지 않고 묶을 때 사용
// <>...</>는 <React.Fragment>...</React.Fragment>의 축약형입니다.

function Example() {
  return (
    <>
      <h1>제목</h1>
      <p>본문 내용</p>
    </>
  );
}

// 또는 긴 문법 버전
function ExampleLong() {
  return (
    <React.Fragment>
      <h1>제목</h1>
      <p>본문 내용</p>
    </React.Fragment>
  );
}

// ✅ 8. 여러 컴포넌트를 조합하기
// 각 컴포넌트를 독립적으로 정의한 뒤, 부모 컴포넌트에서 조합할 수 있습니다.
// 이 구조가 React의 재사용성과 모듈화를 가능하게 합니다.

function Title() {
  return <h1>Welcome</h1>;
}

function Emoji() {
  return <div className="emoji" aria-label="dev">👩‍💻</div>;
}

function Header() {
  return (
    <header className="header">
      <Emoji />
      <Title />
    </header>
  );
}

const root2 = ReactDOM.createRoot(document.getElementById("root"));
root2.render(<Header />);

// 📖 정리 요약
// - JSX는 React.createElement의 문법적 설탕이다.
// - 대문자는 사용자 정의 컴포넌트, 소문자는 HTML 태그로 인식된다.
// - return은 반드시 하나의 부모 요소로 감싸야 한다.
// - Fragment를 사용하면 불필요한 div 없이 여러 자식 반환 가능.
// - ReactDOM.createRoot() → root.render()로 실제 브라우저 DOM에 출력한다.
// - 컴포넌트는 독립적으로 만들어 조합 가능하다.
