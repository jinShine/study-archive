'use client'
import React, { useState } from 'react';
import PlannerSidebar from '@/components/PlannerSidebar';
import HeavyStudyLogEditor from '@/components/HeavyStudyLogEditor';
import AdvancedChart from '@/components/AdvancedChart';
import Fuse from 'fuse.js';

export default function HeavyPlannerPage() {
  const [showChart, setShowChart] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const mockData = ['React', 'Next.js', 'TypeScript', 'Tailwind'];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) return setSearchResults([]);
    const fuse = new Fuse(mockData);
    setSearchResults(fuse.search(value).map(res => res.item));
  };

  return (
    <main className="flex min-h-screen bg-white">
      <PlannerSidebar />
      <section className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">최적화 전: 거대한 돌덩이 로딩</h1>
        <p className="mb-8 text-gray-600">
          사용자는 단순히 대시보드에 접속했을 뿐인데 브라우저는 차트와 에디터 코드를 낑낑대며 다운로드합니다.
        </p>
        <div className="mb-8">
          <input type="text" placeholder="학습 주제 검색 (정적 로드)" onChange={handleSearch} className="border border-gray-300 p-2 w-full rounded text-black" />
          <p className="mt-2 text-sm text-gray-500">결과: {searchResults.join(', ')}</p>
        </div>
        <HeavyStudyLogEditor />
        <button onClick={() => setShowChart(!showChart)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          상세 통계 보기
        </button>
        {showChart && <AdvancedChart />}
      </section>
    </main>
  );
}

// 최적화 후 코드

// 'use client'

// import React, { useState } from 'react';
// import dynamic from 'next/dynamic';
// import PlannerSidebar from '@/components/PlannerSidebar'; // 가벼운 컴포넌트는 그대로 정적 유지

// // 1. 에디터를 동적 청크로 분리 (스켈레톤 UI와 ssr: false 적용)
// const DynamicStudyEditor = dynamic(() => import('@/components/HeavyStudyLogEditor'), {
//   ssr: false,
//   loading: () => (
//     <div className="h-[400px] w-full bg-gray-200 animate-pulse rounded border border-gray-300 flex items-center justify-center mb-8">
//       <span className="text-gray-500 font-medium">에디터를 안전하게 불러오는 중입니다...</span>
//     </div>
//   )
// });

// // 2. 차트를 동적 청크로 분리
// const DynamicAdvancedChart = dynamic(() => import('@/components/AdvancedChart'));

// export default function OptimizedPlannerPage() {
//   const [showChart, setShowChart] = useState(false);
//   const [searchResults, setSearchResults] = useState<string[]>([]);
//   const mockData = ['React', 'Next.js', 'TypeScript', 'Tailwind'];

//   const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     if (!value) return setSearchResults([]);

//     // 3. 사용자가 타이핑을 시작하는 순간 네트워크를 통해 fuse.js를 로드합니다.
//     const Fuse = (await import('fuse.js')).default;
//     const fuse = new Fuse(mockData);
//     setSearchResults(fuse.search(value).map(res => res.item));
//   };

//   return (
//     <main className="flex min-h-screen bg-white">
//       <PlannerSidebar />
//       <section className="flex-1 p-8">
//         <h1 className="text-3xl font-bold mb-6 text-blue-700">최적화 후: 마법 같은 온디맨드 로딩</h1>
//         <p className="mb-8 text-gray-600">
//           초기 화면이 눈에 띄게 가벼워졌으며, 자원을 적재적소에 배치했습니다.
//         </p>

//         <div className="mb-8">
//           <input
//             type="text"
//             placeholder="학습 주제 검색 (fuse.js 동적 로드)"
//             onChange={handleSearch}
//             className="border border-gray-300 p-2 w-full rounded text-black"
//           />
//           <p className="mt-2 text-sm text-gray-500">결과: {searchResults.join(', ')}</p>
//         </div>

//         {/* 에디터는 즉시 렌더링을 시도하지만, 코드는 별도의 청크로 안전하게 비동기 다운로드됩니다. */}
//         <DynamicStudyEditor />

//         {/* 프리로드 적용: 마우스를 올릴 때 미리 차트 청크를 다운로드하기 시작합니다. */}
//         <button
//           onMouseEnter={() => import('@/components/AdvancedChart')}
//           onClick={() => setShowChart(!showChart)}
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//         >
//           상세 통계 보기
//         </button>

//         {/* 버튼을 클릭하여 상태가 true가 되면 그제서야 분리된 차트 청크가 렌더링됩니다. */}
//         {showChart && <DynamicAdvancedChart />}
//       </section>
//     </main>
//   );
// }