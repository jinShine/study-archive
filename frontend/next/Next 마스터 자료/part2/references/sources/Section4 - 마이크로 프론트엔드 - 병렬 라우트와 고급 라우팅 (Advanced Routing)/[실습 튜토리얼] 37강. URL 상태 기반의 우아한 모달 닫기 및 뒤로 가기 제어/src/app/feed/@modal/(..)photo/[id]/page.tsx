import CloseModalButton from '../../CloseModalButton';
export default async function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const photoId = resolvedParams.id;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative">
        <CloseModalButton />
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 pr-16">✨ 사진 상세 팝업 모달</h2>
        <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6"><p className="text-gray-400 font-medium text-lg">사진 ID: {photoId}</p></div>
        <p className="text-gray-600 leading-relaxed bg-blue-50 p-4 rounded-lg">뒤로 가기나 닫기 버튼을 누르면 피드로 안전하게 돌아갑니다.</p>
      </div>
    </div>
  );
}