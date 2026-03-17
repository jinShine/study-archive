import { AuthProvider } from "./contexts/AuthContext"; import UserProfile from "./components/UserProfile";
export default function App() {
  return <AuthProvider><div style={{padding:'50px'}}><h1>Abstraction Strategy</h1><UserProfile /></div></AuthProvider>;
}