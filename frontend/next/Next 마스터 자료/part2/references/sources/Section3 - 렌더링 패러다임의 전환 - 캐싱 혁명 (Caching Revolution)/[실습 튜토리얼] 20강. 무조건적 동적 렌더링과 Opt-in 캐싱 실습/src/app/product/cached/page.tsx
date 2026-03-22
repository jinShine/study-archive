export default async function CachedProductDetail() {
  // 💡 아키텍트의 핀셋: 성능이 필요한 곳에만 영구 결빙을 허락합니다.
  const res = await fetch(
    "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul",
    { cache: "force-cache" },
  );
  const data = await res.json();
  return (
    <div className="p-10 max-w-xl mx-auto mt-10 bg-white rounded-xl shadow-lg border border-blue-200">
      <div className="bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full w-max mb-4 text-sm">
        ❄️ Opt-in Caching (강제 캐시 저장)
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-4">
        캐싱된 상품 상세
      </h1>
      <p className="text-gray-600 mb-4">
        최초 1회만 타격하고 영구적으로 얼립니다. (F5를 눌러도 시간 정지)
      </p>
      <div className="bg-gray-900 text-blue-400 font-mono p-4 rounded-lg text-lg">
        캐시 스냅샷 시간:
        <br /> <span className="text-white">{data.dateTime}</span>
      </div>
    </div>
  );
}
