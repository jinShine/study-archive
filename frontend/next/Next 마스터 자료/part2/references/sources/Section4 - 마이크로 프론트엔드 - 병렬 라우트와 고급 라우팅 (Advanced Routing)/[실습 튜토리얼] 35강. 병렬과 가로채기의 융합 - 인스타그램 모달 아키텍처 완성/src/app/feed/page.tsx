import Link from 'next/link';
const photos = [
  { id: '1', title: '아름다운 풍경', author: 'Elena' },
  { id: '2', title: '멋진 건축물', author: 'Leo' },
];
export default function FeedPage() {
  return (
    <>
      <h1 className="text-3xl font-extrabold mb-8 text-gray-900">글로벌 사진 피드</h1>
      <div className="grid grid-cols-2 gap-6">
        {photos.map((photo) => (
          <div key={photo.id} className="p-6 border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-2">{photo.title}</h3>
            <p className="text-gray-500 mb-6">Photographer: {photo.author}</p>
            <Link href={`/photo/${photo.id}`} className="text-blue-600 font-bold hover:underline">
              사진 상세보기 (모달 띄우기)
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}