import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updatePost } from '../api/mockApi';
import type { Post, UpdatePostDto } from '../api/mockApi'; // ✅ Type-only import

const styles = {
  container: { padding: '1.5rem', border: '2px solid #333', borderRadius: '12px', backgroundColor: '#fff' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' },
  button: { padding: '10px 20px', cursor: 'pointer', backgroundColor: '#333', color: '#fff', border: 'none', borderRadius: '4px' }
};

export default function PostEditor() {
  const [title, setTitle] = useState("기존 제목");

  // useMutation<TData, TError, TVariables> 제네릭을 통한 타입 안전성 확보
  const { mutate, isPending } = useMutation<Post, Error, UpdatePostDto>({
    mutationFn: (newPost) => updatePost(newPost),
    onSuccess: (data, variables) => {
      console.log(`✅ 성공: [${data.title}]로 수정되었습니다.`);
      alert(`성공적으로 수정되었습니다! \n(요청 제목: ${variables.title})`);
    },
    onError: (error, variables) => {
      console.error(`❌ 실패: ${error.message}`);
      alert(`수정 실패! [${variables.title}] 요청 중 에러가 발생했습니다.`);
    },
    onSettled: () => {
      console.log('🏁 모든 통신 프로세스 종료.');
    }
  });

  const handleSubmit = () => {
    // mutate 방아쇠를 당깁니다.
    mutate({ id: 1, title, content: "수정된 내용입니다." });
  };

  return (
    <div style={styles.container}>
      <h3>📝 게시글 수정하기</h3>
      <input
        style={styles.input}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isPending}
      />
      <button 
        style={{...styles.button, opacity: isPending ? 0.5 : 1}} 
        onClick={handleSubmit} 
        disabled={isPending}
      >
        {isPending ? '🛰️ 서버와 통신 중...' : '서버 데이터 수정하기'}
      </button>
      
      {isPending && <p style={{ color: 'blue', fontSize: '14px' }}>📡 행동 대장이 서버로 출동했습니다!</p>}
    </div>
  );
}