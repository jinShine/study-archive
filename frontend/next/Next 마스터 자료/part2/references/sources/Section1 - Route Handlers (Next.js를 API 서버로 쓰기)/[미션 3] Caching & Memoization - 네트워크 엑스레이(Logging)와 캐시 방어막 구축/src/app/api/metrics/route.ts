import { NextResponse } from "next/server";

/**
 * 3. Segment Config를 통한 라우트 핸들러 캐시 통제
 * 이 파일(세그먼트) 내부에서 일어나는 모든 연산의 최종 응답을 60초 동안 서버 캐시에 강제 고정합니다.
 */
export const revalidate = 60;

export async function GET() {
  const res = await fetch("https://api.github.com/repos/vercel/next.js");
  const data = await res.json();

  return NextResponse.json({
    title: "60초 글로벌 캐싱된 GitHub 리포트",
    stars: data.stargazers_count,
    // ★ 캐싱 작동 여부를 시각적으로 증명할 타임스탬프
    generatedAt: new Date().toLocaleTimeString(),
  });
}