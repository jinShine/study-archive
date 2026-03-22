import "./globals.css";

export const metadata = {
  title: 'Devlog',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-white">{children}</body>
    </html>
  )
}
