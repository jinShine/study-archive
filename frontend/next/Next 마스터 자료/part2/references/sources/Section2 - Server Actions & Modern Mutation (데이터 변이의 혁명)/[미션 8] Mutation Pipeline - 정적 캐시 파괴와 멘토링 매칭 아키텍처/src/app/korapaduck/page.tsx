import { db } from "@/lib/db";

export default function MentoringQueuePage() {
  /**
   * =========================================================================
   * 🚨 아키텍처의 핵심: 정적 라우트 캐시 (Full Route Cache)
   * =========================================================================
   * 이 페이지는 fetch나 쿠키(cookies) 같은 동적 함수를 전혀 사용하지 않습니다.
   * 따라서 프레임워크는 빌드(npm run build) 시점에 db의 데이터를 읽어와서
   * '영원히 변하지 않는 정적 HTML'로 박제(캐싱)해 버립니다.
   */
  const requests = db.mentoringList;

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black text-blue-600 mb-2 tracking-tighter">🦆 Korapaduck 멘토링 대기열</h1>
        <p className="text-slate-500 mb-8 font-medium border-b-2 border-slate-200 pb-4">교육의 평등, 기술로 실현합니다.</p>
        
        <ul className="space-y-4">
          {requests.length === 0 ? (
            <li className="p-8 bg-white rounded-2xl shadow-sm text-center text-slate-500">대기 중인 멘토링이 없습니다.</li>
          ) : (
            requests.map((req) => (
              <li key={req.id} className="p-6 bg-white rounded-2xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center">
                <div>
                  <span className="block text-xl font-bold text-slate-800 mb-1">{req.topic}</span>
                  <span className="text-sm font-semibold text-blue-600">🙋‍♂️ {req.studentName} 학생</span>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}