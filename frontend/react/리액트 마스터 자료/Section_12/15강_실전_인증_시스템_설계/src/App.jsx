import { AuthProvider } from "./contexts/AuthContext"; import LoginButton from "./components/LoginButton";
export default function App() {
  return (
    <AuthProvider>
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h1>🔐 Auth System Demo</h1>
        <LoginButton />
      </div>
    </AuthProvider>
  );
}