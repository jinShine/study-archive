// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // UI 렌더링 최적화 (React Compiler)
  reactCompiler: true,

  // 서버 네트워크 추적 (Fetch 로그 상세화)
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // 💡 [아키텍트의 스위치] Next.js 통합 캐싱 제어 권한을 획득합니다.
  cacheComponents: true,
};

export default nextConfig;












