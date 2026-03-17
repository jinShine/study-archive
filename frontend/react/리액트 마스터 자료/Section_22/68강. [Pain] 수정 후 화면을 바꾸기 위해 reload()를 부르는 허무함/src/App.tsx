import ReloadEditor from './components/ReloadEditor';
import ManualSyncEditor from './components/ManualSyncEditor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Mutation Pain Lab 🧪</h1>
        <p>수정 후 데이터가 자동으로 바뀌지 않을 때 우리가 겪는 고통</p>
        <hr />
        <div style={{marginTop: '20px'}}>
          <ReloadEditor />
          <ManualSyncEditor />
        </div>
        <div style={{marginTop: '20px', padding: '10px', background: '#f9f9f9', fontSize: '14px'}}>
          💡 <strong>테스트:</strong> 입력창에 아무 글자나 써둔 뒤 '새로고침' 버튼을 눌러보세요. 작성 중인 글자가 사라지는 '맥락 파괴'를 경험할 수 있습니다.
        </div>
      </main>
    </QueryClientProvider>
  );
}