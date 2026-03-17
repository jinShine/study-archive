import { Routes, Route } from 'react-router';
import InventoryPage from './pages/InventoryPage';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<InventoryPage />} />
    </Routes>
  );
}