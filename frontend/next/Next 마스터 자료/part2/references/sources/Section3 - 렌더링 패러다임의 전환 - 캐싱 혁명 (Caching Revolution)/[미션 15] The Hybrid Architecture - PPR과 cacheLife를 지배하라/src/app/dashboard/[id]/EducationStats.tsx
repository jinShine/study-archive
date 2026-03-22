'use cache';
import { cacheLife } from 'next/cache';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// 부모로부터 문자열이 아닌 Promise(상자) 자체를 넘겨받습니다.
export default async function EducationStats({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  // 방호벽 내부의 안전지대: 여기서 비로소 동적 데이터를 해제(await)합니다.
  const resolvedParams = await paramsPromise;

  // 'minutes' 프로필 적용 (SWR 백그라운드 갱신 1분 간격)
  cacheLife('minutes');

  // 무거운 연산 시뮬레이션 (최초 1회 3초 소요)
  await delay(3000);
  const renderTime = new Date().toLocaleTimeString();

  return (
    <div className="bg-indigo-50/50 p-10 rounded-2xl border border-indigo-100 shadow-inner">
      <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
        <span className="text-3xl">📈</span> 지역 코드 [{resolvedParams.id}] 심층 통계
      </h3>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 font-bold mb-1">수료율</p>
          <p className="text-4xl font-black text-indigo-600">98.5%</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-slate-500 font-bold mb-1">취업 연계</p>
          <p className="text-4xl font-black text-emerald-600">420 명</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-white/60 rounded-xl inline-block border border-indigo-200">
        <p className="text-indigo-800 font-mono text-sm">
          마지막 서버 동기화 시간: <span className="font-bold text-lg ml-2">{renderTime}</span>
        </p>
      </div>
    </div>
  );
}