export default async function InterceptedMentor({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;
  const mentorId = resolvedParams.id;

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-3xl font-black text-indigo-900 mb-4 tracking-tight">
        🎯 낚아챈 멘토 요약 (Intercepted View)
      </h2>
      <p className="text-indigo-800 leading-relaxed font-medium text-lg">
        현재 피드(Feed)의 <strong>레이아웃 맥락을 파괴하지 않고</strong>,<br/>
        주소창만 <code className="bg-white px-3 py-1 rounded-lg font-mono text-sm shadow-sm text-indigo-600 border border-indigo-100">/mentor/{mentorId}</code> 로 변경한 뒤 이 요약 화면을 부드럽게 덮어씌웠습니다!
      </p>

      <div className="mt-6 inline-block bg-red-100 border border-red-200 px-6 py-3 rounded-xl">
        <p className="text-sm font-black text-red-600 tracking-wide">
          🚨 아키텍트의 실험: 지금 키보드의 F5(새로고침)를 눌러보십시오!
        </p>
      </div>
    </div>
  );
}