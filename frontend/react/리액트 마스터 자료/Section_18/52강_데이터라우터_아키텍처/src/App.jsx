import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from './components/Layout';
import InventoryPage from './pages/InventoryPage';
import AnalyticsPage from './pages/AnalyticsPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <InventoryPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}