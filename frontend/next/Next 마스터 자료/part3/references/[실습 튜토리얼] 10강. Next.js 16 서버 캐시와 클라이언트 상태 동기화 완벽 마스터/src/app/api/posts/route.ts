import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: 1, title: '🔥 Next.js 서버 캐시 완벽 정복하기' },
    { id: 2, title: '⚡ TanStack Query v5의 놀라운 성능' },
    { id: 3, title: '✨ 화면 깜빡임이 0%가 되는 기적' }
  ]);
}
