import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 🚀 서버가 브라우저에게 응답할 때마다 이 헤더들을 자동으로 주입합니다.
  async headers() {
    return [
      {
        // 1. 우리 웹사이트의 모든 경로(/(.*))에 이 보안 헤더들을 덮어씌웁니다.
        source: '/(.*)',
        headers: [
          {
            // 2. [클릭재킹 방어] 다른 해커의 웹사이트가 우리 사이트를 투명한 iframe으로 몰래 띄우지 못하게 물리적으로 차단합니다.
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // 3. [MIME 스니핑 방어] 브라우저가 똑똑한 척하며 파일 형식을 멋대로 해석해서 악성 코드를 실행하는 것을 막습니다.
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // 4. [정보 유출 방어] 사용자가 우리 사이트에서 외부 링크로 넘어갈 때, 주소창의 민감한 정보가 꼬리표처럼 따라가지 않게 자릅니다.
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // 5. [HSTS: HTTPS 강제] 사용자가 실수로 http:// 로 접속하더라도, 브라우저가 무조건 안전한 https:// 로만 연결하도록 강제합니다.
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            // 6. [XSS 최후의 보루] CSP: 내가 허락한 안전한 출처(self)에서만 이미지, 스크립트, 폰트를 불러오도록 엄격하게 통제합니다.
            key: 'Content-Security-Policy',
            value: "default-src 'self'; image-src 'self' https://trusted-cdn.com; script-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
