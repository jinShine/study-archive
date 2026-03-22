import { Suspense } from 'react';
import EducationStats from './EducationStats';

// 🚨 부모 페이지(정적 껍데기)에서는 절대 `await params`를 수행하지 않습니다!
export default function DashboardPage({ params }: { params: Promise<{ id: string }> }) {

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-10 font-sans">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-200">
        
        {/* 이 상단 영역은 빌드 시점에 완벽하게 구워져 0초 만에 로드됩니다. */}
        <div className="p-10 bg-slate-900 text-center">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tighter">
            🦆 코라파덕 글로벌 성과 대시보드
          </h1>
          <p className="text-slate-400 font-medium">
            이 뼈대(Static Shell)는 서버 통신에 발목 잡히지 않고 번개처럼 나타납니다.
          </p>
        </div>

        <div className="p-10">
          {/* <Suspense> 방호벽으로 감싸, 정적 껍데기를 안전하게 보호하고 스트리밍 구멍을 만듭니다. */}
          <Suspense fallback={
            <div className="p-12 bg-red-50/50 border-2 border-dashed border-red-200 rounded-2xl flex flex-col items-center justify-center animate-pulse">
              <svg className="animate-spin h-10 w-10 text-red-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-red-600 font-bold text-lg tracking-tight">
                ⏳ 무거운 통계 데이터를 산출하는 중입니다...
              </p>
            </div>
          }>
            <EducationStats paramsPromise={params} />
          </Suspense>
        </div>

        <div className="bg-slate-100 p-6 text-center border-t border-slate-200">
          <p className="text-slate-500 text-sm font-bold">
            Data Architecture by Next.js PPR & cacheLife
          </p>
        </div>

      </div>
    </div>
  );
}