// 📘 34강. useEffect 의존성 배열 케이스 완전 정복 — 실무에서 꼭 알아야 하는 패턴들
// -----------------------------------------------------------------------------
// React의 useEffect 훅은 “렌더링이 끝난 뒤(DOM이 반영된 뒤)” 실행되는
// 사이드 이펙트 처리 도구입니다. 두 번째 인자인 의존성 배열(deps)에
// 무엇을 넣느냐에 따라 실행 시점과 재실행 조건이 달라집니다.
//
// 1) 특정 값(keyword)이 변할 때 서버 검색 요청 보내기
// 2) 여러 값(keyword, category, sort)에 의존하며 이전 요청을 AbortController로 취소
// 3) 의존성 배열을 생략해 “매 렌더마다” 실행되는 효과 확인

import React, { useEffect, useState } from "react";

// -----------------------------------------------------------------------------
// ✅ 예제 1. SearchBoxFetch — keyword가 바뀔 때마다 서버에 검색 요청
// -----------------------------------------------------------------------------
// 포인트
// - 의존성 배열에 [keyword] 만 넣어 “키워드 변경”에만 반응
// - 빈 문자열 가드로 불필요한 네트워크 요청 방지
function SearchBoxFetch() {
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    // keyword가 비어 있으면 요청하지 않음
    if (keyword === "") return;

    // (이미지 코드 그대로) fetch(`/api/search?q=${keyword}`)
    fetch(`/api/search?q=${keyword}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("검색 결과:", data); // 수업 로그
        setResult(data);
      })
      .catch((err) => {
        console.error("검색 요청 실패:", err);
      });
  }, [keyword]); // ← keyword가 바뀔 때만 effect 재실행

  return (
    <section>
      <h3>예제 1 — keyword 변화에 반응하는 검색</h3>
      <input
        type="text"
        value={keyword}
        placeholder="검색어를 입력하세요"
        onChange={(e) => setKeyword(e.target.value)}
      />
      <pre style={{ background: "#111", color: "#b5f5d0", padding: 12 }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </section>
  );
}

// -----------------------------------------------------------------------------
// ✅ 예제 2. FilteredItemsWithAbort — 다중 의존성 + 이전 요청 취소(AbortController)
// -----------------------------------------------------------------------------
// 포인트
// - [keyword, category, sort] 중 하나라도 바뀌면 최신 조건으로 재요청
// - 이펙트가 다시 실행될 때 “직전 요청을 abort()” 해서 낭비/경쟁 상태 방지
// - AbortError 는 정상 흐름(취소)으로 처리하고, 그 외 에러만 로그
function FilteredItemsWithAbort() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 매 실행마다 새로운 컨트롤러 생성
    const controller = new AbortController();

    // (이미지 코드 그대로) `/api/items?kw=${keyword}&cat=${category}&sort=${sort}`
    const url = `/api/items?kw=${keyword}&cat=${category}&sort=${sort}`;

    fetch(url, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        console.log("목록 갱신:", data); // 수업 로그
        setItems(data);
      })
      .catch((err) => {
        if (err?.name === "AbortError") {
          // 이 이펙트가 재실행되며 직전 요청이 정상 취소된 경우
          console.log("이전 요청 취소됨");
          return;
        }
        console.error("목록 요청 실패:", err);
      });

    // cleanup: 다음 이펙트 실행(또는 언마운트) 직전에 “현재 진행 중” 요청을 취소
    return () => {
      controller.abort();
    };
  }, [keyword, category, sort]); // ← 세 값 중 하나라도 바뀌면 재실행

  return (
    <section>
      <h3>예제 2 — 다중 의존성과 이전 요청 취소</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          value={keyword}
          placeholder="검색어"
          onChange={(e) => setKeyword(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">전체</option>
          <option value="book">도서</option>
          <option value="toy">완구</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="priceAsc">가격↑</option>
          <option value="priceDesc">가격↓</option>
        </select>
      </div>

      <pre style={{ background: "#111", color: "#b5f5d0", padding: 12 }}>
        {JSON.stringify(items, null, 2)}
      </pre>
    </section>
  );
}

// -----------------------------------------------------------------------------
// ✅ 예제 3. RenderLogger — 의존성 배열 미지정: “매 렌더마다” 실행
// -----------------------------------------------------------------------------
// 포인트
// - deps를 생략하면 마운트 + 업데이트마다 effect가 실행됨
// - 상태 변경을 여기서 발생시키면 무한 루프 위험 → “로깅/측정”에만 사용 권장
function RenderLogger() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log("렌더링이 발생할 때마다 실행됩니다.");
  }); // ← deps 없음

  return (
    <section>
      <h3>예제 3 — 의존성 배열 미지정</h3>
      <p>콘솔을 열어 로그를 확인하세요.</p>
      <button onClick={() => setCount((n) => n + 1)}>re-render ({count})</button>
    </section>
  );
}

// -----------------------------------------------------------------------------
// 🔍 핵심 요약
// -----------------------------------------------------------------------------
// 1) [x]  → x가 바뀔 때만 effect 재실행 (정밀 제어, 불필요한 호출 방지)
// 2) 여러 deps를 함께 두면 “그 중 하나라도” 바뀌면 재실행
// 3) cleanup(return)은 다음 effect 실행 직전/언마운트 시 호출되어 리소스 정리
// 4) 네트워크 요청은 AbortController로 취소 가능 (실무 필수 패턴)
// 5) deps 생략 시 “모든 렌더마다” 실행 → 로깅/측정 외엔 지양

// -----------------------------------------------------------------------------
// 데모 컴포넌트: 수업에서 세 예제를 한 화면에서 시연할 때 사용
// -----------------------------------------------------------------------------
export default function Lesson34UseEffectCases() {
  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui", padding: 16 }}>
      <h2>34강. useEffect 의존성 배열 케이스 완전 정복</h2>
      <SearchBoxFetch />
      <FilteredItemsWithAbort />
      <RenderLogger />
    </div>
  );
}

export { SearchBoxFetch, FilteredItemsWithAbort, RenderLogger };
