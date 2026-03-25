import { NextRequest, NextResponse, userAgent } from 'next/server';

export function proxy(req: NextRequest) {
  const { device } = userAgent(req);
  const url = req.nextUrl.clone();

  if (device.type === 'mobile') {
    if (url.pathname.startsWith('/m')) {
      return NextResponse.next();
    }
    url.pathname = `/m${url.pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
