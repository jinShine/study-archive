서버의 시간은 흘렀지만, 브라우저의 시간은 멈춰있다
우리가 본질적으로 이해해야 할 지점은 바로 메모리의 관점입니다. 수정을 완료했을 때 서버의 데이터베이스(DB)는 최신 상태로 바뀌었지만, 우리 브라우저 메모리(RAM) 속의 스냅샷은 여전히 과거의 시점에 머물러 있습니다.

이를 현실 세계로 비유하자면, 식당 점원에게 "메뉴 바꿀게요!"라고 주문(Mutation)은 성공적으로 마쳤는데, 내 테이블 위에는 여전히 예전 메뉴가 적힌 낡은 메뉴판(클라이언트 캐시)이 놓여 있는 상황과 같습니다. 이 두 세계의 시간이 어긋나면서 데이터 불일치가 발생하고, 사용자는 "내가 분명 고쳤는데 왜 안 바뀌지?"라는 의문을 갖게 되는 것입니다.

🏛️ 아키텍처 원칙: 새로고침이 '항복 선언'인 이유
라이브러리의 도움 없이 이 간극을 해결하려 할 때, 개발자는 가장 원시적이고 무식한 해결 방법인 강제 새로고침을 선택하곤 합니다. 하지만 시니어의 관점에서 이는 단순히 화면이 한 번 깜빡이는 문제가 아니라, 기술적 한계에 부딪힌 개발자가 내뱉는 마지막 항복 선언과도 같습니다.

1. 새로고침의 3대 비극
자원 낭비의 극치: 이미 브라우저가 가지고 있던 수 메가바이트의 자바스크립트 파일, 스타일시트, 에셋들을 모두 버리고 처음부터 다시 사오는(다운로드) 비효율이 발생합니다.
사용자 맥락(Context) 파괴: 열심히 스크롤을 내려 도착했던 위치 정보는 초기화되고, 다른 입력 폼에서 작성 중이던 소중한 임시 상태값들이 메모리 청소와 함께 모두 증발해 버립니다.
화이트아웃(White-out) 현상: 앱이 완전히 죽었다가 다시 부팅되는 과정에서 화면이 일시적으로 하얗게 변하며 사용자 경험을 툭 끊어버립니다.
🚀 스텝 바이 스텝 가이드: '항복'의 현장 목격하기
Step 1. 데이터 규격 및 가짜 API 설계 (src/api/mockApi.ts)
/**
 * PostDto: 서버에 게시글 수정을 요청할 때 사용하는 데이터 전송 객체 타입입니다.
 * id와 제목 그리고 내용 등 수정할 필드들의 타입을 명확히 정의하여 배달 사고를 방지합니다.
 */
export interface PostDto {
  id: number;
  title: string;
  content: string;
}

export interface Post extends PostDto {
  updatedAt: string;
}

// 수정 API (1초 지연)
export const updatePostApi = async (updateData: PostDto): Promise<Post> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ...updateData, updatedAt: new Date().toISOString() });
    }, 1000);
  });
};

💡 상세 해설: mutationFn은 이 PostDto 가방을 들고 서버로 떠나는 배달원이지만, 이 배달원이 성공적으로 임무를 완수하고 돌아온다고 해서 우리 브라우저가 들고 있는 오래된 신문(캐시)이 자동으로 최신판으로 바뀌지는 않습니다.

Step 2. 새로고침을 선택한 허무한 코드 (src/components/ReloadEditor.tsx)
import { useMutation } from '@tanstack/react-query';
import { updatePostApi } from '../api/mockApi';
import type { PostDto } from '../api/mockApi';

export default function ReloadEditor() {
  const { mutate } = useMutation({
    // mutationFn은 서버에 PATCH 요청을 날려 실제 데이터를 변형하는 배달원입니다.
    mutationFn: (updateData: PostDto) => updatePostApi(updateData),

    // ⚠️ 비극의 시작: 요청이 성공했을 때 실행되는 onSuccess 콜백
    onSuccess: () => {
      // 서버 수정은 성공했지만 브라우저 RAM 속 스냅샷을 갱신할 방법을 모르는 상태입니다.
      // 결국 가장 원시적인 해결책인 새로고침을 선택하여 SPA의 장점을 포기하게 됩니다.
      window.location.reload();
    }
  });

  return (
    <button onClick={() => mutate({ id: 1, title: "새 제목", content: "새 내용" })}>
      수정 후 강제 새로고침 (항복 버튼)
    </button>
  );
}

💡 코드 실행의 상세 과정:

메모리 삭제: 현재 페이지의 모든 상태(useState 등)가 메모리에서 완전히 삭제됩니다.
재요청: 브라우저는 서버로부터 다시 HTML 문서를 요청합니다.
현실 비유: 이는 마치 거실의 전구 하나를 갈기 위해 집 전체의 차단기를 내리고 모든 가전제품을 다시 처음부터 부팅시키는 것과 같습니다.
Step 3. 수동 업데이트의 늪 (src/components/ManualSyncEditor.tsx)
새로고침을 피하기 위해 수동으로 상태를 동기화하려다 더 깊은 지옥에 빠지는 전형적인 로직입니다.

/**
 * updatedPost: 서버로부터 성공적으로 수정되어 돌아온 최신 객체입니다.
 */
const onSuccess = (updatedPost: Post) => {
  // 1. setAllPosts를 호출하여 기존 게시글 배열 상태를 수동으로 수정합니다.
  // map 함수를 사용해 배열을 처음부터 끝까지 순회하며 수정된 게시글을 찾아 교체합니다.
  setAllPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));

  // 2. 만약 연관된 다른 상태(활동 리스트 등)가 있다면 그곳도 수동으로 수정해야 합니다.
  // 이 과정에서 개발자는 어떤 상태가 이 데이터와 연결되어 있는지 모두 기억해야 하는 '인지 부하'를 겪습니다.
  setRecentActivity(prev => [updatedPost, ...prev]);
};

💡 수동 업데이트의 치명적 단점:

명령형 코드: 코드가 '무엇(What)'이 아니라 '어떻게(How)' 바꿀지 일일이 나열하게 되어 가독성이 급격히 떨어집니다.
실수 유발: 상태가 많아질수록 특정 상태를 빠뜨릴 확률이 높고, 이는 곧 데이터 불일치로 이어집니다.
경합 조건(Race Condition): 여러 요청이 동시에 발생할 경우, 어떤 업데이트가 진짜 최신인지 보장할 수 없는 위험에 노출됩니다.
🏁 최종 테스트 케이스: 'Pain' 정밀 분석 포인트
새로고침 방식이 왜 나쁜지 다음 세 가지 포인트에 집중하여 직접 테스트하고 고통을 느껴보세요.

네트워크 재다운로드 관찰:
수행: 크롬 개발자 도구(F12)의 Network 탭을 엽니다.
확인: 수정을 누른 뒤 main.js, index.css 등 이미 가지고 있던 파일들이 다시 호출되는지 확인하세요.
고통: 수정을 한 번 할 때마다 수 메가바이트의 데이터를 다시 받는 허무함을 느껴야 합니다.
사용자 맥락 파괴 테스트:
수행: 스크롤을 중간쯤 내리고, 텍스트 입력창에 아무 글자나 써둔 채로 '수정' 버튼을 누릅니다.
결과: 새로고침 후 스크롤이 맨 위로 튀어 올라가고, 작성 중이던 글자가 사라지는지 확인하세요.
화이트아웃(White-out) 목격:
관찰: 수정 버튼 클릭 후 화면이 찰나의 순간이라도 하얗게 변하는지 보세요. 이는 앱이 '죽었다가 살아나는' 신호입니다.
