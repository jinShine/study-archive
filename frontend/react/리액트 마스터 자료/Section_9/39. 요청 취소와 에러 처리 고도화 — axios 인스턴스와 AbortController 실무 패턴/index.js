// 📘 39강. 요청 취소와 에러 처리 고도화 — axios 인스턴스와 AbortController 실무 패턴
// -----------------------------------------------------------------------------
// 핵심 포인트
// 1) axios 인스턴스(apiClient) + AbortController로 진행 중 요청을 안전하게 취소
// 2) AxiosError를 사람이 읽기 쉬운 메시지로 변환하는 normalize 함수 분리
// 3) 로딩/에러/데이터 렌더링 분기 (여기서는 products.length로 간단 로딩 처리)
// -----------------------------------------------------------------------------
//
// 디렉터리 예시
// src/services/apiClient.js      ← axios 인스턴스 정의
// src/components/ProductList.js  ← 본 파일
//
// apiClient.js는 강의 38강 파일과 동일합니다.
//   export const apiClient = axios.create({
//     baseURL: "https://fakestoreapi.com",
//     timeout: 8000,
//     headers: { "Content-Type": "application/json" },
//   });

import { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";

// -----------------------------------------------------------------------------
// 에러 메시지 표준화: AxiosError → 사용자 메시지
//  - 취소(ERR_CANCELED), 타임아웃(ECONNABORTED), 404/5xx 등을 구분
function normalizeAxiosError(err) {
  // 요청이 취소된 경우(AbortController.abort())
  if (err?.code === "ERR_CANCELED") {
    return "요청이 취소되었습니다.";
  }
  // 타임아웃(axios 인스턴스의 timeout 초과)
  if (err?.code === "ECONNABORTED") {
    return "요청 시간이 초과되었습니다. 다시 시도해 주세요.";
  }
  // 서버가 상태 코드를 제공한 경우
  if (err?.response?.status === 404) {
    return "데이터를 찾을 수 없습니다.";
  }
  if (err?.response?.status >= 500) {
    return "서버에 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  }
  // 그 외 알 수 없는 오류
  return "알 수 없는 오류가 발생했습니다.";
}

// -----------------------------------------------------------------------------
// /src/components/ProductList.js
// - 마운트 시 한 번 상품 목록 요청
// - 언마운트 시 진행 중 요청 취소
// - 에러는 normalizeAxiosError로 사람이 읽기 쉬운 메시지로 변환
function ProductList() {
  const [products, setProducts] = useState([]); // 상품 목록
  const [error, setError] = useState(null);     // 에러 메시지 문자열

  useEffect(() => {
    const controller = new AbortController(); // 요청 취소를 위한 컨트롤러

    // 실제 네트워크 호출 로직을 effect 내부에서 정의
    async function fetchProducts() {
      try {
        const res = await apiClient.get("/products", {
          signal: controller.signal, // 컨트롤러와 연결 → abort() 시 요청 취소
        });
        setProducts(res.data); // 성공 시 상태 갱신 → 재렌더링 발생
      } catch (err) {
        // 취소는 에러로 노출하지 않고 조용히 종료 (UX 노이즈 방지)
        if (err?.code === "ERR_CANCELED") {
          // 디버깅이 필요하면 로그만 남김
          console.log("요청이 취소되었습니다.");
          return;
        }
        // 사용자 친화 메시지로 변환해서 UI에 노출
        setError(normalizeAxiosError(err));
      }
    }

    fetchProducts();

    // cleanup: 컴포넌트가 사라지거나 의존성이 바뀌면 진행 중 요청 취소
    return () => {
      controller.abort();
    };
  }, []); // 마운트 시 1회

  // -----------------------------
  // 렌더링 분기
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (products.length === 0) return <p>로딩 중...</p>;

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id ?? p.title}>{p.title}</li>
      ))}
    </ul>
  );
}

export default ProductList;

// -----------------------------------------------------------------------------
// 사용 팁
// -----------------------------------------------------------------------------
// 1) 검색/필터/정렬 등 의존성이 있는 리스트라면
//    useEffect의 의존성 배열에 [keyword, category, sort] 등을 넣고,
//    effect 시작 시마다 새 AbortController를 생성해 이전 요청을 cleanup에서 abort하세요.
// 2) 에러 표준화는 컴포넌트 밖 util로 분리해 재사용하면 중복 제거에 유리합니다.
// 3) 로딩 상태를 더 명확히 보고 싶다면 loading useState를 추가하고
//    요청 직전에 true, 성공/실패 시 false로 전환하세요.
