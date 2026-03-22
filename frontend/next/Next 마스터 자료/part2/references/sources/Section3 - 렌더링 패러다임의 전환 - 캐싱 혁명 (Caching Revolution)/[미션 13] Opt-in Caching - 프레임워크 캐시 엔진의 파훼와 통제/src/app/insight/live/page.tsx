export default async function LiveInsightPage() {
  // 컴파일러의 멱살을 잡고 정적 박제(SSG)를 강제로 막아냅니다.
  const res = await fetch("https://dummyjson.com/quotes/random", {
    cache: "no-store",
  });
  const data = await res.json();

  // .slice(시작인덱스, 끝인덱스) 사용
  console.log(`🌊 [Live Fetch] 새로운 영감 생성: ${data.quote.slice(0, 15)}...`);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="bg-slate-800 p-10 rounded-3xl shadow-2xl border border-indigo-500/30 max-w-2xl w-full">
        <h1 className="text-3xl font-black text-white mb-6 text-center">
          🌊 실시간 동적 렌더링
        </h1>
        <p className="text-slate-400 mb-8 font-semibold text-center leading-relaxed">
          매 접속마다 새로운 영감을 제공합니다. 프레임워크가 빌드 타임에 화면을
          정적으로 얼려버리는 것(SSG)을 강제로 막아냈습니다.
        </p>
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-700 relative">
          <span className="text-6xl text-indigo-500/20 absolute top-4 left-4">
            "
          </span>
          <p className="text-xl text-indigo-100 font-medium leading-loose relative z-10 text-center px-4">
            {data.quote}
          </p>
          <p className="text-right text-indigo-400 font-bold mt-6">
            - {data.author}
          </p>
        </div>
      </div>
    </div>
  );
}
