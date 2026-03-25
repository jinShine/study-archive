import './globals.css';
import { CartProvider } from '@/components/CartProvider';

export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased bg-zinc-50">
        <CartProvider>
          <div className="min-h-screen relative">
            {children}
            {modal}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}