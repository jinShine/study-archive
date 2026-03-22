import { Suspense } from 'react';
import InterceptedMentor from './InterceptedMentor';

export default function InterceptedMentorPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-indigo-50/80 border-l-8 border-indigo-500 rounded-r-3xl my-8 shadow-inner">
      <Suspense fallback={
        <div className="flex items-center gap-3 animate-pulse">
          <span className="text-2xl">⏳</span>
          <p className="text-indigo-600 font-bold text-lg">낚아챈 멘토 요약 화면을 구성 중입니다...</p>
        </div>
      }>
        <InterceptedMentor paramsPromise={params} />
      </Suspense>
    </div>
  );
}