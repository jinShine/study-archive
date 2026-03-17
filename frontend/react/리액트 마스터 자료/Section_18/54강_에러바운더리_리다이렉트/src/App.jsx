import { createBrowserRouter, RouterProvider, redirect } from 'react-router';
import Layout from './components/Layout';
import ErrorPage from './pages/ErrorPage';
import InventoryPage, { inventoryLoader } from './pages/InventoryPage';

const protectedLoader = async () => {
  const isAuth = false; // 테스트를 위해 권한 없음 설정
  if (!isAuth) return redirect('/login-simulated');
  return inventoryLoader();
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <InventoryPage />, loader: protectedLoader },
      { path: "login-simulated", element: <div><h1>Login Required</h1><p>로그인 페이지 시뮬레이션입니다.</p></div> }
    ],
  },
]);

export default function App() { return <RouterProvider router={router} />; }