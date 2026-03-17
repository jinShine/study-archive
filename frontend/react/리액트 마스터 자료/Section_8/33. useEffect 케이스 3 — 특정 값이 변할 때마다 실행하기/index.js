// 📘 33강. useEffect 케이스 3 — 특정 값이 변할 때마다 실행하기
// --------------------------------------------------------------
// React의 useEffect 훅은 "화면이 실제로 그려진 뒤" 실행되는 사이드 이펙트(부수효과) 처리 도구입니다.
// 두 번째 인자인 의존성 배열(dependency array)에 어떤 값을 넣느냐에 따라 실행 시점이 달라집니다.
// 이 강의에서는 "특정 값이 변할 때마다 실행"하는 케이스를 집중적으로 다룹니다.

import { useState, useEffect } from "react";

// ✅ 예제 1. 의존성 배열에 cityName이 있을 때
// cityName이 바뀔 때마다 effect가 다시 실행됨
useEffect(() => {
  // cityName 값이 바뀔 때마다 실행됨
  // (React는 렌더링이 완료되고 DOM이 최신 상태로 반영된 후 이 코드를 호출)
}, [cityName]);

// --------------------------------------------------------------
// ✅ 예제 2. SearchBox – keyword가 바뀔 때마다 실행
// --------------------------------------------------------------
function SearchBox() {
  const [keyword, setKeyword] = useState("");
  // keyword: 입력창의 값
  // setKeyword: 입력값을 업데이트하는 함수

  useEffect(() => {
    // keyword가 바뀔 때마다 실행됨 (렌더링 완료 후 DOM 반영된 시점에 호출됨)
    if (keyword !== "") {
      console.log(`"${keyword}" 로 검색을 실행합니다.`);
      // 실제 상황: 이곳에서 서버에 검색 요청 (예: fetch(`/search?q=${keyword}`))
    }
  }, [keyword]); 
  // keyword가 바뀔 때마다 effect 실행
  // keyword가 동일하면 React는 재실행하지 않음 → 불필요한 네트워크 요청 방지

  return (
    <div>
      <input
        type="text"
        value={keyword}
        placeholder="검색어를 입력하세요"
        onChange={(e) => setKeyword(e.target.value)} // 입력할 때마다 keyword 갱신
      />
    </div>
  );
}

// --------------------------------------------------------------
// ✅ 예제 3. ToggleLogger – active 상태가 바뀔 때마다 이벤트 리스너 등록/해제
// --------------------------------------------------------------
function ToggleLogger() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // active 값이 바뀔 때마다 실행됨
    // React는 이전 effect의 cleanup → 새 effect 실행 순서로 작동

    if (active) {
      const handleClick = () => {
        console.log("화면을 클릭했습니다!");
      };

      window.addEventListener("click", handleClick);
      console.log("클릭 이벤트 등록 완료");

      // cleanup 함수: 다음 effect 실행 또는 컴포넌트 언마운트 시 호출됨
      return () => {
        window.removeEventListener("click", handleClick);
        console.log("클릭 이벤트 제거 완료");
      };
    }

    // active가 false일 때는 effect 내부에서 아무 일도 하지 않음
  }, [active]); 
  // active가 true→false, false→true로 바뀔 때마다 다시 실행됨

  return (
    <div>
      <button onClick={() => setActive(!active)}>
        {active ? "끄기" : "켜기"}
      </button>
    </div>
  );
}

// --------------------------------------------------------------
// ✅ 예제 4. FilteredList – 여러 의존성 값(keyword, category, sort) 감시
// --------------------------------------------------------------
function FilteredList() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("recent");

  useEffect(() => {
    console.log("리스트 갱신:", { keyword, category, sort });
    // 이 자리에서 서버에 목록을 요청하거나, 클라이언트 필터링/정렬을 수행할 수 있음
    // 예: fetch(`/api/items?keyword=${keyword}&category=${category}&sort=${sort}`)

    // cleanup: 이전 요청/타이머/리스너 등을 정리
    return () => {
      console.log("이전 요청/작업 정리");
      // 예시: 이전 fetch 요청 취소 (AbortController), setTimeout/Interval 제거 등
    };
  }, [keyword, category, sort]);
  // keyword, category, sort 중 하나라도 바뀌면 effect 재실행

  return (
    <section>
      <input
        value={keyword}
        placeholder="검색어"
        onChange={(e) => setKeyword(e.target.value)}
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="all">전체</option>
        <option value="book">도서</option>
        <option value="movie">영화</option>
      </select>

      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="recent">최신순</option>
        <option value="popular">인기순</option>
      </select>

      {/* 실제로는 여기서 필터된 리스트를 렌더링 */}
    </section>
  );
}

// --------------------------------------------------------------
// ✅ 예제 5. FilteredList 내부 useEffect의 상세 구조
// --------------------------------------------------------------
useEffect(() => {
  console.log("리스트 갱신:", { keyword, category, sort });
  // → 이 시점에서 DOM 업데이트가 끝난 상태 (화면에 최신 내용 반영됨)
  // → 서버 요청(fetch/axios), 타이머 등록(setTimeout/setInterval), 이벤트 등록(addEventListener) 등 수행하기에 적절한 시점

  return () => {
    console.log("이전 요청/작업 정리");
    // → 다음 렌더링 전 또는 언마운트 시 실행됨
    // → 진행 중인 요청 취소, 타이머/리스너 제거 등 리소스 정리 수행
  };
}, [keyword, category, sort]);
// → React는 세 값 중 하나라도 바뀌면 cleanup → 새 effect 실행 순서로 안정적으로 처리함

// --------------------------------------------------------------
// 🔍 핵심 요약
// --------------------------------------------------------------
// 1️⃣ 의존성 배열 [x] → x가 바뀔 때마다 useEffect 재실행
// 2️⃣ 렌더링 → DOM 업데이트 → useEffect 실행 (비동기적으로 뒤에서 실행됨)
// 3️⃣ cleanup 함수는 다음 실행 직전 or 언마운트 시 호출됨
// 4️⃣ 실무에서는 서버 요청, 이벤트 등록, 타이머 관리 등의 “화면 밖 로직”을 이곳에 작성
// 5️⃣ React는 동일 값에 대해 불필요한 effect 재실행을 막아 효율적인 렌더링을 유지함

// --------------------------------------------------------------
export { SearchBox, ToggleLogger, FilteredList };
