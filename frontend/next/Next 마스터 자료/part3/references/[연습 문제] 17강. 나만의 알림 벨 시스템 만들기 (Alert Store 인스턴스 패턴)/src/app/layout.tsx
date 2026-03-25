import './globals.css';
import { AlertProvider } from '../components/AlertProvider';
import { AlertDisplay } from '../components/AlertUI';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AlertProvider>
          <AlertDisplay />
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}