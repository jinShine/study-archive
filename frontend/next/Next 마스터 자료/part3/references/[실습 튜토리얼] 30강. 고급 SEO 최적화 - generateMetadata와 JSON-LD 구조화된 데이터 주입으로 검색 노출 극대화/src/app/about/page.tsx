import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 소개",
};

export default function AboutPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>무인도를 벗어난 화려한 성, AI 스터디 플래너</h1>
      <p>구글 로봇이 가장 사랑하는 완벽한 정적 페이지입니다.</p>
    </main>
  );
}
