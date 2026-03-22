// src/app/product/[id]/HeavyProductDescription.tsx

// 💡 [아키텍트의 정밀 타격]
'use cache';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export default async function HeavyProductDescription({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;

  // 2초짜리 무거운 연산 시뮬레이션
  await delay(2000);
  const cachedTime = new Date().toLocaleTimeString();

  return (
    <div className="bg-red-50 border border-red-200 p-8 rounded-xl shadow-inner relative overflow-hidden">
      <h2 className="text-2xl font-black text-gray-900 mb-4">상품 상세 설명 (마이크로 캐싱 결과)</h2>
      <p className="text-gray-700 mb-6 leading-relaxed">
        이 영역은 'use cache' 지시어에 의해 2초의 연산 과정을 건너뛰고 0.001초 만에 로드됩니다.
        상품 ID({resolvedParams.id})에 대한 데이터베이스 쿼리 결과가 영구 결빙되었습니다.
      </p>

      <div className="inline-block bg-white border-2 border-red-500 px-4 py-2 rounded-lg">
        <p className="text-red-600 font-bold flex items-center gap-2">
          <span>❄️</span> 설명 렌더링 시간 (얼어있음): <span className="font-mono text-xl">{cachedTime}</span>
        </p>
      </div>
    </div>
  );
}