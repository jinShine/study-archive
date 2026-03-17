import { AuthProvider } from "./contexts/AuthContext";
import { TodoProvider } from "./contexts/TodoProvider";
import TodoInput from "./components/TodoInput";
export default function App() {
  return (
    <AuthProvider>
      <TodoProvider>
        <h1>Multi-Engine App</h1>
        <TodoInput />
      </TodoProvider>
    </AuthProvider>
  );
}