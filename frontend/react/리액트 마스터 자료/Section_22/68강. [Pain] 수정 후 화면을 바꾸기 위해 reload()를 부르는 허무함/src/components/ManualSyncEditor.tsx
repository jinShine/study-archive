import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updatePostApi } from '../api/mockApi';
import type { Post } from '../api/mockApi';

export default function ManualSyncEditor() {
  const [localTitle, setLocalTitle] = useState("수동 동기화 전 제목");

  const { mutate, isPending } = useMutation({
    mutationFn: updatePostApi,
    onSuccess: (updatedPost: Post) => {
      // ❌ 고통: 서버 응답을 받아 직접 로컬 상태를 하나하나 수정해야 합니다.
      // 데이터가 복잡해질수록 이 '용접' 코드는 걷잡을 수 없이 길어집니다.
      setLocalTitle(updatedPost.title);
      alert("수동으로 화면의 글자만 바꿨습니다. (새로고침 안 함)");
    }
  });

  return (
    <div style={{...styles.card, borderColor: 'blue'}}>
      <h4>방법 2: 수동 상태 업데이트 (Manual Sync)</h4>
      <p>현재 화면의 제목: <strong>{localTitle}</strong></p>
      <button 
        onClick={() => mutate({ id: 1, title: "수동으로 바꾼 제목", content: "내용" })}
        disabled={isPending}
        style={{...styles.button, backgroundColor: '#3498db'}}
      >
        {isPending ? '수정 중...' : '수동으로 글자만 바꾸기'}
      </button>
    </div>
  );
}

const styles = {
  card: { border: '1px solid red', padding: '1rem', marginBottom: '20px', borderRadius: '8px' },
  button: { padding: '8px 16px', cursor: 'pointer', backgroundColor: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px' }
};