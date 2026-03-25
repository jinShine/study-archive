export default function HeavyMediaPage() {
  // Unsplash의 4K 이상 고해상도 무거운 원본 이미지 URL
  const heavyImageUrl = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=100&w=4000";

  return (
    <main className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-red-600">최적화 전: 무거운 레거시 태그</h1>
      <p className="mb-8 text-gray-600">
        HTML 기본 img 태그는 모바일 화면의 작은 칸을 채우기 위해 수 MB의 원본을 그대로 다운로드합니다.
      </p>

      <section>
        <h2 className="text-xl font-bold mb-4">학습 인증 샷 (HTML img)</h2>
        <div className="w-full h-64 border-2 border-red-300 rounded overflow-hidden">
          {/* 💡 최적화가 전혀 적용되지 않은 날것의 이미지 태그입니다. */}
          <img 
            src={heavyImageUrl} 
            alt="무거운 4K 학습 인증 샷" 
            className="w-full h-full object-cover"
          />
        </div>
      </section>
    </main>
  );
}

// 최적화 버전

// import Image from 'next/image';

// export default function OptimizedMediaPage() {
//   const heavyImageUrl = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=100&w=4000";

//   return (
//     <main className="p-10 max-w-3xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6 text-blue-700">최적화 후: 마법 같은 미디어 다이어트</h1>
//       <p className="mb-8 text-gray-600">
//         Next.js Image가 서버에서 이미지를 깎고, AVIF로 압축하여 필요한 해상도만 브라우저로 내려보냅니다.
//       </p>

//       <section>
//         <h2 className="text-xl font-bold mb-4">학습 인증 샷 (Next.js Image)</h2>

//         {/* 💡 fill 속성을 사용하기 위해 부모에 반드시 relative를 줍니다. */}
//         <article className="relative w-full h-64 border-2 border-blue-300 rounded overflow-hidden shadow-lg">
//           <Image
//             src={heavyImageUrl}
//             alt="가볍게 최적화된 학습 인증 샷"
//             fill
//             className="object-cover"
//             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//             priority={true}
//             placeholder="blur"
//             blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
//           />
//         </article>
//       </section>
//     </main>
//   );
// }