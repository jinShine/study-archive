export default async function ISRProductDetail() {
  // 💡 생명 주기(TTL) 60초 부여
  const res = await fetch(
    "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Seoul",
    {
      next: { revalidate: 60 },
    },
  );
  const data = await res.json();

  return (
    <div className="p-10 max-w-xl mx-auto mt-10 bg-white rounded-xl shadow-lg border border-purple-200">
      <div className="bg-purple-50 text-purple-600 font-bold px-3 py-1 rounded-full w-max mb-4 text-sm">
        ⏳ ISR (시간 기반 재검증)
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-4">
        점진적 갱신 상세
      </h1>
      <p className="text-gray-600 mb-4">
        평소엔 0초 캐시를 반환하고, 60초마다 백그라운드에서 몰래 서버를 타격하여
        데이터를 갈아 끼웁니다.
      </p>
      <div className="bg-gray-900 text-purple-400 font-mono p-4 rounded-lg text-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
          TTL: 60s
        </div>
        서버 렌더링 시간:
        <br />
        <span className="text-white">{data.dateTime}</span>
      </div>
    </div>
  );
}
