import './globals.css';
import { GalleryProvider } from '@/components/GalleryProvider';
export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  return (
    <html lang="ko">
      <body><GalleryProvider>{children}{modal}</GalleryProvider></body>
    </html>
  );
}