// 📘 36강. fetch와 axios — useEffect 안에서 비동기 요청 다루기
// -----------------------------------------------------------------------------
// 1) fetch 기초 사용
// 2) axios 설치 & 기본 호출
// 3) useEffect 안에서의 올바른 비동기 패턴(잘못된/올바른 예시 비교)
//
// 실습 API: https://fakestoreapi.com/products
// 주의: 실제 서비스에서는 에러 처리, 로딩 상태, 요청 취소(AbortController) 등을 함께 고려합니다.

import React, { useEffect, useState } from "react";
import axios from "axios";

// -----------------------------------------------------------------------------
// ✅ 섹션 1. fetch 기초 — then 체이닝으로 JSON 파싱
// (res.json()으로 명시적으로 파싱)
// -----------------------------------------------------------------------------
function FetchBasicDemo() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // fetch는 응답 본문을 직접 JSON으로 파싱하지 않기 때문에,
    // res.json()을 한 번 더 호출해야 실제 데이터를 얻을 수 있습니다.
    fetch("https://fakestoreapi.com/products")
      .then((res) => res.json())
      .then((json) => {
        console.log("fetch 결과:", json);
        setData(json);
      })
      .catch((err) => {
        console.error("fetch 오류:", err);
      });
  }, []);

  return (
    <section>
      <h3>섹션 1 — fetch 기초</h3>
      <pre style={{ background: "#111", color: "#b5f5d0", padding: 12 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

// -----------------------------------------------------------------------------
// ✅ 섹션 2. axios 설치 안내
// -----------------------------------------------------------------------------
/*
# 터미널에서 한 번만 설치
npm install axios
*/

// -----------------------------------------------------------------------------
// ✅ 섹션 3. axios 기초 — res.data에 파싱된 JSON이 바로 담김
// (axios.get → res.data)
// -----------------------------------------------------------------------------
async function getProductsWithAxios() {
  try {
    const res = await axios.get("https://fakestoreapi.com/products");
    console.log(res.data); // axios는 파싱된 JSON이 res.data에 바로 들어있음
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function AxiosBasicDemo() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 간단한 데모: 위에서 만든 함수 호출
    (async () => {
      const json = await getProductsWithAxios();
      setData(json);
    })();
  }, []);

  return (
    <section>
      <h3>섹션 3 — axios 기초</h3>
      <pre style={{ background: "#111", color: "#b5f5d0", padding: 12 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

// -----------------------------------------------------------------------------
// ❌ 잘못된 예시: useEffect 자체를 async로 선언
// -----------------------------------------------------------------------------
/*
useEffect(async () => {                  // ⛔ 금지: cleanup이 Promise가 되어 버림
  const res = await axios.get("https://fakestoreapi.com/products");
  console.log(res.data);
}, []);
*/

// -----------------------------------------------------------------------------
// ✅ 올바른 예시 1: 이펙트 내부에서 async 함수를 정의하고 호출
// - 장점: cleanup(return)과 비동기 흐름을 명확히 분리할 수 있음
// -----------------------------------------------------------------------------
function CorrectAsyncInsideEffect() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get("https://fakestoreapi.com/products");
        console.log(res.data);
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchData();
  }, []);

  return (
    <section>
      <h3>섹션 4 — 올바른 패턴 1 (내부 async 함수 정의)</h3>
      <pre style={{ background: "#111", color: "#b5f5d0", padding: 12 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

// -----------------------------------------------------------------------------
// ✅ 올바른 예시 2: IIFE(즉시 실행 함수)로 async 호출
// - 짧은 형태가 필요할 때 유용
// -----------------------------------------------------------------------------
function CorrectIIFEInsideEffect() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("https://fakestoreapi.com/products");
        console.log(res.data);
        setData(res.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, []);

  return (
    <section>
      <h3>섹션 5 — 올바른 패턴 2 (async IIFE)</h3>
      <pre style={{ background: "#111", color: "#b5f5d0", padding: 12 }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </section>
  );
}

// -----------------------------------------------------------------------------
// 🔍 보너스 메모
// -----------------------------------------------------------------------------
// - 요청 취소: 사용자가 빠르게 페이지를 이동/입력 변경 시, AbortController(또는 axios cancel token)을 써서
//   “이전 요청”을 취소하면 더 실전적입니다. (36강 확장 주제)
// - 상태 관리: 로딩/에러 상태를 별도 state로 관리하면 UI 품질이 올라갑니다.

// -----------------------------------------------------------------------------
// 데모 컨테이너 — 한 화면에서 모든 예제를 시연
// -----------------------------------------------------------------------------
export default function Lesson36FetchAxios() {
  return (
    <div style={{ fontFamily: "ui-sans-serif, system-ui", padding: 16 }}>
      <h2>36강. fetch와 axios — useEffect 안에서 비동기 요청 다루기</h2>
      <FetchBasicDemo />
      <AxiosBasicDemo />
      <CorrectAsyncInsideEffect />
      <CorrectIIFEInsideEffect />
    </div>
  );
}

export {
  FetchBasicDemo,
  AxiosBasicDemo,
  CorrectAsyncInsideEffect,
  CorrectIIFEInsideEffect,
  getProductsWithAxios,
};
