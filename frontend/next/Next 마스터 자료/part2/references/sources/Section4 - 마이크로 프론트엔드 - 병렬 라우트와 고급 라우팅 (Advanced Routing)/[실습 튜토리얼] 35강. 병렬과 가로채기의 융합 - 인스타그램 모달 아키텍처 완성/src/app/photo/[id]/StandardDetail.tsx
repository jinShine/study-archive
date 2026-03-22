export default async function StandardDetail({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;
  const photoId = resolvedParams.id;
  return (
    <div className="text-center max-w-3xl">
      <h1 className="text-5xl font-extrabold mb-6 tracking-tight text-emerald-400">
        📸 단독 사진 페이지
      </h1>
      <p className="text-2xl text-gray-300 leading-relaxed mt-8">
        외부 링크를 통해 다이렉트로 접속하셨습니다. (사진 ID: {photoId})<br/>
        <span className="text-lg text-gray-500 mt-4 block">
          이곳은 피드의 레이아웃이 전혀 적용되지 않은 <strong>완전히 독립된 거대한 화면</strong>입니다.
        </span>
      </p>
    </div>
  );
}