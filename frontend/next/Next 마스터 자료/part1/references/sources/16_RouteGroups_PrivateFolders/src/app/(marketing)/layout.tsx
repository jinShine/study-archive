export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="font-sans text-gray-900" suppressHydrationWarning>
        <header className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="text-xl font-bold text-indigo-600 tracking-tight">MyService</span>
            <nav className="space-x-6 text-sm font-medium text-gray-600">
              <a href="#" className="hover:text-indigo-600">Features</a>
              <a href="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-bold shadow-md hover:bg-indigo-700 transition-all">
                Get Started
              </a>
            </nav>
          </div>
        </header>
        <main className="min-h-screen bg-white">{children}</main>
        <footer className="bg-gray-50 py-12 text-center text-gray-400 text-sm border-t">
          <p>© 2026 MyService Inc. Marketing Group Layer</p>
        </footer>
      </body>
    </html>
  );
}
