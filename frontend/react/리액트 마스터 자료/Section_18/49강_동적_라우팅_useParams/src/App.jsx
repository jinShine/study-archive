import { Routes, Route } from 'react-router';
import Layout from './components/Layout';
import InventoryPage from './pages/InventoryPage';
import ProductDetail from './pages/ProductDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<InventoryPage />} />
        <Route path="inventory/:productId" element={<ProductDetail />} />
      </Route>
    </Routes>
  );
}