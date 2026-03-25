export default function HeavyThirdPartyPage() {
  return (
    <main className="p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-red-600">최적화 전: 무거운 레거시 iframe</h1>
      <p className="mb-8 text-gray-600">
        일반적인 iframe은 화면에 보이기도 전에 수 MB의 자바스크립트를 다운로드하여 메인 스레드를 막아버립니다.
      </p>

      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">백색 소음 플레이리스트 (기본 iframe)</h2>
        <div className="w-full h-[400px] border-4 border-red-300 rounded shadow-lg overflow-hidden">
          {/* 💡 무거운 본체가 한 번에 다운로드되는 렌더링 블로킹의 주범입니다. */}
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/ogfYd705cRs" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </main>
  );
}

// 최적화 버전

// import { YouTubeEmbed } from '@next/third-parties/google';

// export default function OptimizedThirdPartyPage() {
//   return (
//     <main className="p-10 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-blue-700">최적화 후: 우아한 파사드(Facade) 패턴</h1>
//       <p className="mb-8 text-gray-600">
//         가벼운 썸네일 껍데기만 띄워두고, 사용자가 재생 버튼을 누르는 순간에만 본체 스크립트를 다운로드합니다.
//       </p>

//       <section className="mb-12">
//         <h2 className="text-xl font-bold mb-4">백색 소음 플레이리스트 (@next/third-parties)</h2>
//         <div className="w-full rounded shadow-lg overflow-hidden border-4 border-blue-300">
//           {/* 💡 초기 로딩을 전혀 방해하지 않는 상호작용 기반 지연 로딩 컴포넌트입니다. */}
//           <YouTubeEmbed 
//             videoid="ogfYd705cRs" 
//             height={400} 
//             params="controls=1" 
//           />
//         </div>
//       </section>
//     </main>
//   );
// }