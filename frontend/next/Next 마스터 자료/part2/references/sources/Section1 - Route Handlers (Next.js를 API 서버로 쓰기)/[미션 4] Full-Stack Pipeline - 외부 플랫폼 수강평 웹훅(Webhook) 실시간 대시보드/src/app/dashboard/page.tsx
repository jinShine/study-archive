interface ReviewData {
  events: { studentName: string; courseTitle: string; rating: number; comment: string; timestamp: string; }[];
  updatedAt: string;
}

// 서버 컴포넌트: 백엔드와 동일한 물리적 환경에서 실행되므로 DB나 API를 즉시 타격 가능합니다.
export default async function DashboardPage() {

  // [캐시 통제소] cache: "no-store"
  // 프레임워크에게 이 데이터는 절대 캐싱하지 말고, 요청이 들어올 때마다
  // 동적으로 가장 신선한 데이터를 그려내라고 지시하는 아키텍트의 명령입니다.
  const response = await fetch("http://localhost:3000/api/webhooks/reviews", { cache: "no-store" });
  const data: ReviewData = await response.json();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-2 text-slate-800">👨‍🏫 실시간 수강평 대시보드</h1>
        <p className="text-slate-500 mb-8 border-b border-slate-200 pb-4 font-mono text-sm">
          시스템 마지막 동기화: {new Date(data.updatedAt).toLocaleTimeString()}
        </p>

        {data.events.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-500">
            아직 수신된 수강평이 없습니다. Postman으로 이벤트를 트리거해 보십시오.
          </div>
        ) : (
          <ul className="space-y-6">
            {data.events.map((event, index) => {
              // 프론트엔드 비즈니스 로직 (조건부 렌더링 데이터 가공)
              const isPerfect = event.rating === 5;
              const needsAttention = event.rating <= 3;

              return (
                <li key={index} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-amber-400 text-xl tracking-widest mb-1">
                        {"★".repeat(event.rating)}{"☆".repeat(5 - event.rating)}
                      </div>
                      <h2 className="text-lg font-bold text-slate-800">{event.courseTitle}</h2>
                    </div>
                    {isPerfect && <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-black rounded-full">🌟 만점 리뷰</span>}
                    {needsAttention && <span className="px-3 py-1 bg-rose-100 text-rose-700 text-xs font-black rounded-full">⚠️ 확인 요망</span>}
                  </div>
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-1 mb-4">
                    <p className="text-slate-600 italic">"{event.comment}"</p>
                  </blockquote>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700">👤 {event.studentName} 수강생</span>
                    <span className="text-slate-400 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}