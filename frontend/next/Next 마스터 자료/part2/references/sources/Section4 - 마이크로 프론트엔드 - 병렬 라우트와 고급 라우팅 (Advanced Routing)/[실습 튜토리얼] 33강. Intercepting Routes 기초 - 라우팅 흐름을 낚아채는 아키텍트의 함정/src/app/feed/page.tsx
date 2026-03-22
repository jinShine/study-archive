import Link from 'next/link';
const photos = [
  { id: '1', title: '아름다운 풍경', author: 'Elena' },
  { id: '2', title: '멋진 건축물', author: 'Leo' },
];
export default function FeedPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900">글로벌 사진 피드</h1>
      <p className="text-gray-500 mb-8">링크를 클릭하여 라우팅 흐름이 낚아채어지는 것을 확인하세요.</p>
      <div className="grid grid-cols-2 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
            <h3 className="text-xl font-bold text-gray-800">{photo.title}</h3>
            <p className="text-gray-500 mb-6">Photographer: {photo.author}</p>
            <Link
              href={`/photo/${photo.id}`}
              className="inline-block px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition-colors"
            >
              사진 상세보기
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}