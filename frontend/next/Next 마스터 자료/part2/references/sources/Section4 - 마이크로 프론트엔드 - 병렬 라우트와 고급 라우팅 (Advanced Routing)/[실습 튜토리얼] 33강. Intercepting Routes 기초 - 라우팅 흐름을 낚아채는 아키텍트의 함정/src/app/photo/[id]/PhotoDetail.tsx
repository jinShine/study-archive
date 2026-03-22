export default async function PhotoDetail({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;
  const photoId = resolvedParams.id;
  return (
    <div className="text-center">
      <h1 className="text-4xl font-extrabold mb-4 text-emerald-400">
        📸 단독 사진 페이지 (Standard View)
      </h1>
      <p className="text-xl text-gray-300 leading-relaxed mt-6">
        가로채기 함정 없이 브라우저 다이렉트로 접속하셨습니다. (사진 ID: {photoId})<br/>
        <span className="text-sm text-gray-500 mt-4 block">
          이곳은 피드의 레이아웃이 전혀 적용되지 않은 <strong>완전히 독립된 전체 화면</strong>입니다.
        </span>
      </p>
    </div>
  );
}