// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 기존에 설정된 UI 렌더링 최적화 컴파일러
  reactCompiler: true,
  
  // 새롭게 추가할 서버 네트워크 추적 옵션
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;


















