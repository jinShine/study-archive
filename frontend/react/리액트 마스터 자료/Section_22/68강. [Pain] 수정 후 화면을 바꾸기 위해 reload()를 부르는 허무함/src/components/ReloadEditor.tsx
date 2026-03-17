import { useMutation } from '@tanstack/react-query';
import { updatePostApi } from '../api/mockApi';
import type { PostDto } from '../api/mockApi';

export default function ReloadEditor() {
  const { mutate, isPending } = useMutation({
    mutationFn: (updateData: PostDto) => updatePostApi(updateData),
    onSuccess: () => {
      // ⚠️ 항복 선언: SPA의 장점을 포기하고 전체 페이지를 다시 부팅합니다.
      alert("서버 수정 성공! 이제 강제로 새로고침합니다.");
      window.location.reload();
    }
  });

  return (
    <div style={styles.card}>
      <h4>방법 1: 강제 새로고침 (Reload)</h4>
      <p style={{fontSize: '12px', color: '#666'}}>수정 후 화면이 하얗게 변하며 모든 상태가 날아갑니다.</p>
      <button 
        onClick={() => mutate({ id: 1, title: "새로고침된 제목", content: "내용" })}
        disabled={isPending}
        style={styles.button}
      >
        {isPending ? '수정 중...' : '수정 후 강제 새로고침'}
      </button>
    </div>
  );
}

const styles = {
  card: { border: '1px solid red', padding: '1rem', marginBottom: '20px', borderRadius: '8px' },
  button: { padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px' }
};