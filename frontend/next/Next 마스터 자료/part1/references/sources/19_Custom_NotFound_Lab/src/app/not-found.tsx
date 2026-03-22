import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 font-sans px-6">
      <div className="relative mb-12">
        {/* 배경에 깔리는 거대한 404 숫자 */}
        <h1 className="text-[12rem] md:text-[16rem] font-black text-indigo-100 tracking-tighter leading-none select-none">
          404
        </h1>
        
        {/* 숫 위에 겹쳐진 배지 (위트 있는 기울기 적용) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF6A3D] px-4 py-2 text-sm md:text-base rounded-xl rotate-12 text-white font-black shadow-2xl shadow-orange-200 whitespace-nowrap">
          Opps! Page Not Found 😿
        </div>
      </div>

      <div className="text-center max-w-md">
        <h3 className="text-3xl font-black mb-4 tracking-tight">길을 잃으신 것 같아요!</h3>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          찾으시는 페이지가 이사를 갔거나, 주소를 잘못 입력하셨을 수 있습니다. <br/>
          걱정 마세요. 아래 버튼을 눌러 안전하게 홈으로 돌아갈 수 있습니다.
        </p>

        {/* [강의 포인트] Link 컴포넌트로 사용자 경험 유지 */}
        <Link href="/" className="group relative inline-flex items-center gap-2 px-10 py-5 bg-slate-900 text-white font-black rounded-[2rem] hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95">
          <span>홈으로 돌아가기</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}
