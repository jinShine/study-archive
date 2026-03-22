export default async function DynamicProductDetail() {
  // 🚨 아키텍트의 멱살잡이: 컴파일러의 HTML 정적 박제를 차단합니다.
  const res = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul', { cache: 'no-store' });
  const data = await res.json();
  return (
    <div className="p-10 max-w-xl mx-auto mt-10 bg-white rounded-xl shadow-lg border border-red-200">
      <div className="bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full w-max mb-4 text-sm">🔥 Dynamic Rendering (100% 신선도)</div>
      <h1 className="text-3xl font-black text-gray-900 mb-4">실시간 상품 상세</h1>
      <p className="text-gray-600 mb-4">프레임워크의 빌드 룰을 깨부수고 매 요청마다 서버 API를 타격합니다.</p>
      <div className="bg-gray-900 text-green-400 font-mono p-4 rounded-lg text-lg">
        서버 렌더링 시간:<br/> <span className="text-white">{data.dateTime}</span>
      </div>
    </div>
  );
}