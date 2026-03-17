import { AuthProvider } from "./contexts/AuthContext"; import LogoutButton from "./components/LogoutButton";
export default function App() {
  return (
    <AuthProvider>
      <div style={{ padding: '50px' }}>
        <h1>⚡ 최적화된 인증 엔진</h1>
        <LogoutButton />
      </div>
    </AuthProvider>
  );
}