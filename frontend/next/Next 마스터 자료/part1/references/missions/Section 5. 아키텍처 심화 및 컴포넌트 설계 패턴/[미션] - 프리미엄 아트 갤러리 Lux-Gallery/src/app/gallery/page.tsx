import ArtFrame from './art-frame';
import LikeButton from './like-button';
export default function Page() {
  return (
    <div className="p-20 flex flex-col items-center">
      <ArtFrame>
        <div className="flex justify-between items-center mb-8 pb-4 border-b">
          <h2 className="text-3xl font-bold">The Code Masterpiece</h2>
          <LikeButton />
        </div>
        <p className="text-stone-500 italic">이 본문 데이터는 서버 컴포넌트에서 안전하게 렌더링되었습니다.</p>
      </ArtFrame>
    </div>
  );
}
