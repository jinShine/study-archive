import { CenterProvider, NoticeContext } from "./contexts/CenterContext"; import { NoticeBoard } from "./components/NoticeBoard"; import { LostAndFoundDesk } from "./components/LostAndFoundDesk";
export default function App() {
  return (
    <div style={{ padding: '40px' }}>
      <h1>🏢 아파트 관리 시스템</h1>
      <NoticeBoard />
      <CenterProvider><LostAndFoundDesk /></CenterProvider>
    </div>
  );
}