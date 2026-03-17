import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from './components/Layout';
import InventoryPage, { inventoryLoader } from './pages/InventoryPage';
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [{ index: true, element: <InventoryPage />, loader: inventoryLoader }],
  },
]);
export default function App() { return <RouterProvider router={router} />; }