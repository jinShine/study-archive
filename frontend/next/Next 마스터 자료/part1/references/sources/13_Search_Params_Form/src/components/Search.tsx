/**
 * Search Component: 순수 HTML <form> 기능을 활용한 서버 컴포넌트
 * @param initialQuery - 서버에서 받아온 현재 검색어를 input에 유지(defaultValue)하기 위해 사용
 */
export default function Search({ initialQuery }: { initialQuery?: string }) {
  return (
    <form action="/products" className="relative w-full group">
      <label htmlFor="search" className="sr-only">검색</label>
      
      {/* name="q"가 URL의 ?q=... 키값이 됩니다. */}
      <input
        name="q"
        type="text"
        placeholder="어떤 상품을 찾으시나요?"
        defaultValue={initialQuery}
        className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-400 text-slate-700"
      />
      
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl grayscale group-focus-within:grayscale-0 transition-all">
        🔍
      </div>
      
      {/* 엔터키 제출을 위해 숨겨진 버튼 배치 (웹 표준) */}
      <button type="submit" className="hidden">검색</button>
    </form>
  );
}
