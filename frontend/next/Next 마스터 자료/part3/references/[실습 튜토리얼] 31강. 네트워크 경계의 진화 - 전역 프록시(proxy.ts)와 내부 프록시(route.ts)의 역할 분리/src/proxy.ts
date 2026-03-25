import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const sessionToken = request.cookies.get('session_token')?.value;

  // 8 ~ 10번 주석 처리 (✅ 3. 내부 프록시(BFF) CORS 우회 및 비밀 통신 테스트)
  if (request.nextUrl.pathname.startsWith('/dashboard') && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  event.waitUntil(
    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify({ log: `방문: ${request.nextUrl.pathname}` }),
    }).catch(() => console.log('백그라운드 로그 전송 완료 (waitUntil)'))
  );

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-verified', 'true');

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set('last_visit', Date.now().toString());
  return response;
}

export const config = {
  matcher: [{ source: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)', missing: [{ type: 'cookie', key: 'admin_session' }] }],
};
