import { notFound } from 'next/navigation';

export default async function FlightsPage() {
  console.log("✈️ 서버: 데이터를 조회 중입니다...");

  // 1. 스트리밍 SSR 테스트를 위한 2.5초 지연
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // 2. 50% 확률 에러 발생 (재시도 버튼 테스트용)
  if (Math.random() < 0.5) {
    console.error("❌ 서버: 통신 장애 발생!");
    throw new Error("항공사 API 서버 응답 지연");
  }

  const flights = [{ id: "V-2026", city: "PARIS", price: "₩1,250,000" }];

  if (!flights || flights.length === 0) notFound();

  console.log("✅ 서버: 데이터 로드 성공!");

  return (
    <div className="p-10">
      <h1 className="text-4xl font-black mb-10 text-slate-800 italic uppercase">Available Flights</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 bg-white border-2 border-slate-100 rounded-[3.5rem] shadow-2xl">
          <span className="text-blue-500 font-black text-xs uppercase tracking-widest">Limited Offer</span>
          <h3 className="text-5xl font-black mt-3">{flights[0].city}</h3>
          <div className="mt-12 pt-8 border-t border-slate-50 flex justify-between items-end">
            <span className="text-3xl font-mono font-black text-blue-600">{flights[0].price}</span>
            <button className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold text-sm">BOOK NOW</button>
          </div>
        </div>
      </div>
    </div>
  );
}
