import './globals.css';
import { CartProvider } from '../components/CartProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}