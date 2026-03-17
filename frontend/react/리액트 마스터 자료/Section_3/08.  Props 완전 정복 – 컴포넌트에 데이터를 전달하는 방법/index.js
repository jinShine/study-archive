// React Component Basics (수업 정리본)
// ----------------------------------
// 이 자료는 React 컴포넌트의 기초 개념과 JSX 문법 차이를
// 단계적으로 이해하기 위해 구성되었습니다.
// 각 코드 블록은 실제 수업에서 다룬 순서에 따라 배열되어 있습니다.

// ------------------------------------------------------
// [1] 함수와 컴포넌트의 기본 비교
// ------------------------------------------------------

// 일반 함수: 단순한 계산을 수행
function add(a, b) {
  return a + b;
}
console.log(add(2, 3)); // 5

// React 컴포넌트: 함수처럼 동작하지만 JSX를 반환
function Greeting(props) {
  return <h1>안녕하세요, {props.name}님!</h1>;
}

// JSX 사용 예시
<Greeting name="Yongsu" />;

// 내부적으로 이렇게 변환됨
Greeting({ name: "Yongsu" });

// ------------------------------------------------------
// [2] JSX 호출과 함수 호출의 개념도
// ------------------------------------------------------

<Greeting name="Yongsu" age={20} />;

function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>; // { name: "Yongsu", age: 20 }
}

// JSX는 내부적으로 다음과 같이 변환됨
React.createElement(Greeting, { name: "Yongsu", age: 20 });

// 일반 함수 호출 관점에서는 이렇게 볼 수 있음
Greeting({ name: "Yongsu", age: 20 });

// ------------------------------------------------------
// [3] JSX에서 props가 객체 형태로 전달되는 구조 확인
// ------------------------------------------------------

<Greeting name="Yongsu" age={20} />;

function Greeting(props) {
  console.log(props); // { name: 'Yongsu', age: 20 }
  return <h1>안녕하세요, {props.name}님!</h1>;
}

// ------------------------------------------------------
// [4] JSX 속성의 표현식 사용
// ------------------------------------------------------

<Greeting name="Yongsu" />;
<Greeting name={userName} age={20 + 1} isAdmin={true} />;

// props 안에는 각각의 표현식이 계산된 결과값이 전달됨
// { name: "Yongsu" }, { name: userName, age: 21, isAdmin: true }

// ------------------------------------------------------
// [5] JSX와 HTML 문법 차이점
// ------------------------------------------------------

// HTML
{
  /* <label for="email" class="label">Email</label>
<input id="email" class="input" />

// JSX
<label htmlFor="email" className="label">Email</label>
<input id="email" className="input" />

// HTML
<button onclick="alert('hi')">Click</button>

// JSX
<button onClick={() => alert('hi')}>Click</button>; */
}

// → JSX에서는 DOM 속성 이름이 camelCase로 변경됨.

// ------------------------------------------------------
// [6] props 디폴트 값 설정하기 (기본 매개변수 문법)
// ------------------------------------------------------

function Greeting({ name = "Guest" }) {
  return <h1>Hello, {name}!</h1>;
}

root.render(<Greeting />); // "Guest"
root.render(<Greeting name="Kim" />); // "Kim"

// ------------------------------------------------------
// [7] 여러 개의 props 전달 및 구조 분해
// ------------------------------------------------------

function UserInfo({ name, age, country }) {
  return (
    <div>
      <p>이름: {name}</p>
      <p>나이: {age}</p>
      <p>국가: {country}</p>
    </div>
  );
}

root.render(<UserInfo name="Yongsu" age={20} country="Korea" />);

// ------------------------------------------------------
// [8] props는 읽기 전용 (불변성)
// ------------------------------------------------------

function Price({ amount }) {
  // amount = amount * 1.1; // ❌ props 재할당 금지
  const withTax = amount * 1.1; // ✅ 새 변수에 할당
  return <span>{withTax}</span>;
}

// props는 외부에서 주어지는 입력값이므로 변경하지 않고,
// 항상 새로운 변수를 만들어서 계산해야 합니다.

// ------------------------------------------------------
// [9] props 전개(spread) 문법으로 유연한 컴포넌트 만들기
// ------------------------------------------------------

function Input({ label, ...inputProps }) {
  return (
    <label>
      {label}
      <input {...inputProps} />
    </label>
  );
}

// ✅ 사용 예시: 여러 속성을 한 번에 전달
root.render(<Input label="이름" type="text" placeholder="홍길동" required />);

// → 구조 분해로 label과 나머지 속성(inputProps)을 분리
// → inputProps는 { type: 'text', placeholder: '홍길동', required: true }
// → {...inputProps}는 input 태그에 그대로 펼쳐져 전달됩니다.
