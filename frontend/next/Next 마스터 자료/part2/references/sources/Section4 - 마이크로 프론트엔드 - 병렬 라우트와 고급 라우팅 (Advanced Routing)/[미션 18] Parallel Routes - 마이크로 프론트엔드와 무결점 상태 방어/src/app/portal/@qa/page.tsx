export default async function QaSlot() {
  await new Promise(res => setTimeout(res, 2000));
  return (
    <div className="bg-emerald-50 p-6 rounded-3xl shadow-sm border border-emerald-200 h-full">
      <h3 className="text-xl font-bold text-emerald-800 mb-4 flex items-center gap-2">
        <span>💬</span> 멘토링 Q&A
      </h3>
      <div className="p-4 bg-white rounded-xl shadow-sm border border-emerald-100 mb-3">
        <p className="font-bold text-emerald-900 text-sm mb-1">Q. PPR과 Suspense의 차이가 뭔가요?</p>
        <p className="text-xs text-emerald-600">답변 대기 중...</p>
      </div>
    </div>
  );
}