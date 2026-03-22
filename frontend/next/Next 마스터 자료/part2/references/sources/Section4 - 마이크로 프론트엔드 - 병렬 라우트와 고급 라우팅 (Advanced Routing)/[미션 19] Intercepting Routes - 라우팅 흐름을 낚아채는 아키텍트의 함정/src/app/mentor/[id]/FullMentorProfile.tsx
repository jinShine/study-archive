export default async function FullMentorProfile({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;
  const mentorId = resolvedParams.id;

  return (
    <div className="text-center max-w-2xl bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
      <h1 className="text-5xl font-black mb-6 text-emerald-400 tracking-tighter">
        📸 단독 프로필 (Standard View)
      </h1>
      <p className="text-2xl text-slate-300 leading-relaxed font-medium">
        가로채기 함정 없이 브라우저 다이렉트로 접속하셨습니다.<br/>
        <span className="inline-block mt-4 px-4 py-2 bg-slate-800 text-emerald-300 font-mono rounded-xl text-lg">
          멘토 ID: {mentorId}
        </span>
      </p>

      <hr className="my-8 border-slate-800" />

      <p className="text-base text-slate-500 font-medium">
        이곳은 피드의 레이아웃이 전혀 적용되지 않은 <strong>완전히 독립된 거대한 전체 화면</strong>입니다.
      </p>
    </div>
  );
}