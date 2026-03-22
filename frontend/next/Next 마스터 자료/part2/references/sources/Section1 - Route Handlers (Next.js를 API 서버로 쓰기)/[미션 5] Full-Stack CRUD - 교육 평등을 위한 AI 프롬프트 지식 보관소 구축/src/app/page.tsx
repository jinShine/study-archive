import Link from 'next/link';

/* =========================================================
 * [4] 메인 진입점 (서버 컴포넌트)
 * =========================================================
 * 상단에 "use client"가 없으므로 서버에서 HTML로 완벽히 렌더링되어 클라이언트로 전송됩니다.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-3xl p-10 text-center border border-slate-100">
        <h1 className="text-3xl font-black text-slate-800 mb-4">🚀 교육용 AI 프롬프트 보관소</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          기술을 통한 교육의 평등을 실현하는 지식 베이스입니다.<br/>
          RESTful 아키텍처 기반의 완벽한 CRUD 시스템을 경험하세요.
        </p>

        {/* <Link> 컴포넌트: 브라우저 새로고침(White Flash)을 차단하고
            목적지의 JSON 데이터만 비동기로 가져와 화면을 부드럽게 전환하는 라우팅 마법입니다. */}
        <Link href="/prompts">
          <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all cursor-pointer shadow-md hover:shadow-lg">
            👉 프롬프트 관리 대시보드 입장
          </button>
        </Link>
      </div>
    </div>
  );
}