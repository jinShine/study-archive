export const metadata = {
  title: '시스템 통제 센터',
  description: 'Next.js 풀스택 파이프라인 실습',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}