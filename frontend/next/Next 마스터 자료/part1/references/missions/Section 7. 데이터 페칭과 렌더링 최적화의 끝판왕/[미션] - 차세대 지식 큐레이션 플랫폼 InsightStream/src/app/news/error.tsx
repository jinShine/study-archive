'use client';
export default function Error({reset}: any) {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-red-500 mb-6">데이터를 불러오지 못했습니다.</h2>
      <button onClick={() => reset()} className="bg-black text-white px-6 py-2 rounded-full font-bold">재시도</button>
    </div>
  );
}
