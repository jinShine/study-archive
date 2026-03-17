import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserApi, userKeys } from '../api/mockApi';
import type { User } from '../api/mockApi'; // ✅ Type-only import

export default function UserEditor({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation<User, Error, User>({
    mutationFn: (updatedUser) => updateUserApi(updatedUser),

    // 🎯 오늘의 주인공: 서버 수정 성공 시 실행되는 콜백
    onSuccess: (data, variables) => {
      /**
       * ✅ 시니어의 단 한 줄: Invalidation
       * 'users'로 시작하는 모든 캐시를 찾아 즉시 'Stale' 딱지를 붙입니다.
       */
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      console.log(`✨ ${variables.name}님 정보 갱신 프로세스 진입`);
    }
  });

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', backgroundColor: '#f9f9f9', borderRadius: '8px', flex: 1 }}>
      <h3>🛠️ 수정 제어실</h3>
      <button 
        style={{ padding: '10px', cursor: 'pointer' }}
        disabled={isPending}
        onClick={() => mutate({ id, name: "New Senior " + Math.floor(Math.random() * 100) })}
      >
        {isPending ? '서버 통신 중...' : '이름 랜덤 수정 및 무효화'}
      </button>
      <p style={{fontSize: '12px', color: '#666'}}>새로고침 없이 왼쪽 정보만 바뀌는지 확인하세요.</p>
    </div>
  );
}