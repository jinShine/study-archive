import { Suspense } from 'react';
import FullMentorProfile from './FullMentorProfile';

export default function StandardMentorPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-10 font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-400 font-bold text-xl">단독 프로필 페이지 동기화 중...</p>
        </div>
      }>
        <FullMentorProfile paramsPromise={params} />
      </Suspense>
    </div>
  );
}