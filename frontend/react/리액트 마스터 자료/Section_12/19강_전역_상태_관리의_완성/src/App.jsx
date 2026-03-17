import { AuthProvider } from "./contexts/AuthContext";
import { TodoProvider } from "./contexts/TodoProvider";
import Header from "./components/Header";
import TodoDashboard from "./components/TodoDashboard";
export default function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <Header />
        <TodoDashboard />
      </TodoProvider>
    </AuthProvider>
  );
}