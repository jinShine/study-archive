import { CartProvider } from '../components/CartProvider';
import './globals.css';
export default function RootLayout({ children }) {
  return (
    <html lang="ko"><body className="bg-slate-50 antialiased"><CartProvider>{children}</CartProvider></body></html>
  );
}