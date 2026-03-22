'use server';
import { revalidatePath } from 'next/cache';

let mockSuggestions = [
  { id: 'SUG_1', boardId: 'hq', content: '서버 아키텍처 강의를 더 늘려주세요!', author: '열혈수강생' },
  { id: 'SUG_2', boardId: 'hq', content: '카지노 사이트 가입하세요!!! (악성 스팸)', author: '도박봇' }
];

export async function getSuggestions(boardId: string) {
  await new Promise(res => setTimeout(res, 500));
  return mockSuggestions.filter(s => s.boardId === boardId);
}

export async function deleteSuggestionAction(suggestionId: string, boardId: string) {
  try {
    mockSuggestions = mockSuggestions.filter(s => s.id !== suggestionId);
    console.log(`🗑️ [DB 갱신] 건의 ${suggestionId} 영구 삭제 완료`);

    // 💡 [캐시 파괴 철퇴] 낡은 화면이 남지 않도록 해당 URL의 캐시를 정밀 타격하여 파괴합니다.
    revalidatePath(`/board/${boardId}`);
    console.log(`🔥 [캐시 파괴] /board/${boardId} 라우트 최신화 지시 완료`);
  } catch (error) {
    console.error("삭제 실패:", error);
  }
}