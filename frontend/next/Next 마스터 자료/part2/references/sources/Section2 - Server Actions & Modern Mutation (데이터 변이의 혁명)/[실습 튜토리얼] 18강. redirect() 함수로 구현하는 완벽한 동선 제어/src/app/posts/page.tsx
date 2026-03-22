export default function PostsPage() {
  return (
    <div className="text-center">
      <div className="text-6xl mb-6 text-green-500 font-bold">SUCCESS</div>
      <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">게시글 발행 완료!</h1>
      <p className="text-gray-500 mb-8 text-lg">리다이렉션 마법을 통해 안전하게 목록 페이지에 도착했습니다.</p>
      <a href="/write" className="text-[#0070f3] font-bold hover:underline">← 다시 작성하러 가기</a>
    </div>
  );
}