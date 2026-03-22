import Link from 'next/link';
export default async function StandardPhotoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="text-center max-w-3xl mb-10">
        <h1 className="text-5xl font-extrabold mb-6 text-emerald-400">📸 단독 사진 페이지</h1>
        <p className="text-2xl text-gray-300 bg-gray-800 p-6 rounded-xl border border-gray-700">외부 링크 다이렉트 접속 (사진 ID: {resolvedParams.id})<br/><span className="text-red-400 font-bold">뒤로 가기 대신 안전한 귀환 경로</span>를 제공합니다.</p>
      </div>
      <Link href="/feed" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg">피드 메인으로 돌아가기</Link>
    </div>
  );
}