import { Routes, Route } from 'react-router';
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LogPage from './pages/LogPage';

export default function App() {
  return (
    <div style={{ padding: '20px' }}>
      <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <strong>현재 주소창을 직접 수정해서 이동해보세요: /analytics, /logs</strong>
      </nav>
      <Routes>
        <Route index element={<InventoryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="logs" element={<LogPage />} />
      </Routes>
    </div>
  );
}