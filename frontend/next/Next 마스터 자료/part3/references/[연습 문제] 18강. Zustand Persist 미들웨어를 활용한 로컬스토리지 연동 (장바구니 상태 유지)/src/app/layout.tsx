import './globals.css';
import { CartProvider } from '../components/CartProvider';
export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-50 antialiased"><CartProvider>{children}</CartProvider></body>
    </html>
  );
}