import { NextResponse } from "next/server";
export const revalidate = 60;
export async function GET() {
  const res = await fetch("https://api.github.com/repos/vercel/next.js");
  const data = await res.json();
  return NextResponse.json({ title: "60초 글로벌 캐싱", stars: data.stargazers_count, generatedAt: new Date().toISOString() });
}