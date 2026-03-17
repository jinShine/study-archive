import { CounterProvider } from "./contexts/CounterProvider";
import CounterScreen from "./components/CounterScreen";
export default function App() {
  return (
    <CounterProvider>
      <CounterScreen />
    </CounterProvider>
  );
}