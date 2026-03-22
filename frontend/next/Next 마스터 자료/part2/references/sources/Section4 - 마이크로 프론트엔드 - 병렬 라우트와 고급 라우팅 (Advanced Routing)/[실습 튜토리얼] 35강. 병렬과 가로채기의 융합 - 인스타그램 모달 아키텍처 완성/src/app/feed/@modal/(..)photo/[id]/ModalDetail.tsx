export default async function ModalDetail({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;
  const photoId = resolvedParams.id;
  return (
    <>
      <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
        ✨ 사진 상세 팝업 모달
      </h2>
      <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6">
        <p className="text-gray-400 font-medium text-lg">📸 사진 ID: {photoId} 이미지가 렌더링되는 구역</p>
      </div>
      <p className="text-gray-600 text-lg leading-relaxed">
        현재 피드의 문맥을 완벽히 유지한 채,<br/>
        URL만 <strong className="text-blue-600">/photo/{photoId}</strong> 로 동기화되었습니다!
      </p>
      <p className="mt-6 text-sm font-bold text-red-500 text-center">※ 지금 키보드의 F5(새로고침)를 눌러 단독 페이지로 전환해 보세요!</p>
    </>
  );
}