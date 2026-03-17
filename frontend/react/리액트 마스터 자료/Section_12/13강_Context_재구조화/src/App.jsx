import { UserProvider } from "./contexts/UserProvider";
import { Layout } from "./components/Layout";
export default function App() {
  return <UserProvider><div style={{padding:"20px"}}><h1>Context Refactoring</h1><Layout /></div></UserProvider>;
}