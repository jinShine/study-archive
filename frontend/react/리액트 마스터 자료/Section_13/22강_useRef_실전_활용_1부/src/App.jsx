import PriceTracker from "./components/PriceTracker";
import SkipFirstRender from "./components/SkipFirstRender";
export default function App() {
  return (
    <div style={{ padding: '20px' }}>
      <PriceTracker />
      <SkipFirstRender />
    </div>
  );
}