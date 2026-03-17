Race Condition, 중복 요청, 무분별한 로딩
안녕하세요 여러분! 드디어 우리는 폼 아키텍처의 세계를 넘어, 프론트엔드 개발의 가장 거대한 난제 중 하나인 서버 상태 관리(Server State Management)의 세계로 들어왔습니다.

그 첫 번째 시간으로 우리가 그동안 너무나 당연하게 사용해오던 useEffect 기반 데이터 페칭이 실무에서 얼마나 위험한 재앙이 될 수 있는지 그 민낯을 파헤쳐 보겠습니다. 단순히 코드가 길어지는 수준의 문제가 아니라, 여러분의 서비스에 '유령 데이터'를 불러오는 치명적인 버그의 근원을 함께 살펴보시죠.

🏛️ 이론 배경: 왜 useEffect는 정답이 아닐까?
지금까지 우리는 폼의 내부 구조를 탄탄하게 만드는 데 집중했습니다. 이제 데이터를 서버와 동기화할 차례인데, 아마 대다수의 리액트 개발자들은 데이터를 가져올 때 가장 먼저 '컴포넌트가 마운트될 때 useEffect 안에서 fetch를 하고 그 결과를 useState에 담으면 되겠지'라는 생각을 떠올릴 것입니다. 하지만 이 평범해 보이는 접근 방식은 서비스가 조금만 복잡해져도 통제 불능의 버그들을 쏟아내기 시작합니다.

경쟁 상태 (Race Condition) 가장 끔찍한 문제입니다. 검색창에 '사과'를 검색했다가 마음이 바뀌어 바로 '포도'를 검색했다고 상상해 봅시다.
첫 번째 요청: '사과' (네트워크 느림 🐢)
두 번째 요청: '포도' (네트워크 빠름 🚀) 이때 '포도' 데이터가 먼저 도착해 화면에 보이지만, 진짜 재앙은 뒤늦게 도착한 '사과' 데이터가 화면을 덮어버릴 때 발생합니다. useEffect는 이전 요청을 자동으로 취소하거나 무시하는 기능이 없기 때문입니다.
무분별한 네트워크 자원 낭비 부모 컴포넌트가 리렌더링되거나 동일한 데이터를 필요로 하는 여러 개의 자식 컴포넌트가 동시에 마운트될 때, 각자 useEffect를 가동합니다. '사용자 프로필' 정보를 5개의 컴포넌트에서 원한다면, 우리 브라우저는 똑같은 요청을 5번이나 보내게 됩니다.
지옥의 보일러플레이트와 파편화 데이터 하나를 가져오기 위해 매번 로딩, 에러, 데이터를 관리하는 코드를 무한히 복사해서 붙여넣어야 합니다. 정작 중요한 비즈니스 로직은 저 밑으로 밀려나고, 가독성은 바닥을 치게 됩니다.
🚀 스텝 바이 스텝 가이드
🛠️ Step 0: 프로젝트 환경 구축 (Vite + TS)
터미널에서 아래 명령어를 입력하여 실습 환경을 만듭니다.

npm create vite@latest fetch-disaster-lab -- --template react-ts
cd fetch-disaster-lab
npm install
npm run dev
🧪 Step 1: 실제 API 기반 모킹 및 타입 정의 (src/api/mockApi.ts)
Type-only export를 지원하도록 인터페이스를 구성합니다.

export interface Post {
  id: number;
  title: string;
  body: string;
}

export interface User {
  name: string;
  email: string;
}

/**
 * [원칙] 실제 외부 API 호출 + 인위적 지연
 * ID 1번 요청은 3초 지연시켜서 나중에 도착하게 만듭니다.
 */
export const fetchPostById = async (id: number | string): Promise<Post> => {
  const delay = id === 1 || id === "1" ? 3000 : 500;

  const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const data = await response.json();

  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const fetchUser = async (): Promise<User> => {
  console.log("📡 [Network Log] 실제 API 서버에 유저 정보 요청 중...");
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/1`);
  return response.json();
};
🧐 주목할 점:

id === 1인 경우에만 setTimeout을 3초로 설정하여 Race Condition을 의도적으로 유도했습니다.
fetchUser 호출 시 로그를 남겨 중복 요청 발생 여부를 추적합니다.
🏎️ Step 2: [재앙 1] 경쟁 상태 (src/components/RaceCondition.tsx)
import type을 사용하여 타입과 로직을 엄격히 분리합니다.
import { useState, useEffect } from 'react';
import { fetchPostById } from '../api/mockApi';
import type { Post } from '../api/mockApi'; // ✅ Type-only import 적용

export default function RaceCondition() {
  const [postId, setPostId] = useState<number | null>(null);
  const [data, setData] = useState<Post | null>(null);

  useEffect(() => {
    if (!postId) return;

    // ❌ 재앙의 근원: 이전 요청이 처리 중임에도 결과가 도착하면 무조건 덮어씌움
    fetchPostById(postId).then((res) => {
      console.log(`✅ 데이터 도착: 포스트 ${postId}`);
      setData(res);
    });
  }, [postId]);

  return (
    <div style={{ border: '2px solid red', padding: '1rem', margin: '1rem' }}>
      <h3>🔥 1. 경쟁 상태 (Race Condition)</h3>
      <button onClick={() => setPostId(1)}>1번 포스트 (느림 - 사과)</button>
      <button onClick={() => setPostId(2)}>2번 포스트 (빠름 - 포도)</button>

      <p>현재 요청 ID: <strong>{postId || '없음'}</strong></p>
      <p>화면 표시 제목: <mark>{data?.title || '데이터 없음'}</mark></p>
    </div>
  );
}

🧐 주목할 점:

import type을 통해 Post가 오직 타입 검사용으로만 쓰임을 명시했습니다.
버튼을 순서대로 눌렀을 때 콘솔 로그와 화면이 일치하지 않는 순간을 포착하세요.
👯 Step 3: [재앙 2] 중복 요청 (src/components/DuplicateRequest.tsx)
import { useState, useEffect } from 'react';
import { fetchUser } from '../api/mockApi';
import type { User } from '../api/mockApi'; // ✅ Type-only import 적용

function ProfileIcon() {
  const [user, setUser] = useState<User>();
  useEffect(() => { fetchUser().then(setUser); }, []);
  return <span>👤 {user?.name}</span>;
}

function Sidebar() {
  const [user, setUser] = useState<User>();
  useEffect(() => { fetchUser().then(setUser); }, []); // ❌ 중복 발생
  return <aside style={{ background: '#eee', padding: '10px' }}>📧 {user?.name}의 사이드바</aside>;
}

export default function DuplicateRequest() {
  return (
    <div style={{ border: '2px solid blue', padding: '1rem', margin: '1rem' }}>
      <h3>🔥 2. 무분별한 중복 요청</h3>
      <ProfileIcon />
      <Sidebar />
      <p>💡 콘솔창에서 <code>[Network Log]</code> 중복 횟수를 확인하세요.</p>
    </div>
  );
}

🌋 Step 4: [재앙 3] 보일러플레이트 지옥 (src/components/BoilerplateHell.tsx)
import { useState, useEffect } from 'react';
import { fetchPostById } from '../api/mockApi';
import type { Post } from '../api/mockApi'; // ✅ Type-only import 적용

export default function BoilerplateHell() {
  const [postId, setPostId] = useState<number | string>('');
  const [data, setData] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) return;
    let isCancelled = false; // 🚩 Race condition 방어용 수동 플래그

    setIsLoading(true);
    fetchPostById(postId)
      .then(res => {
        if (!isCancelled) {
          setData(res);
          setError(null);
        }
      })
      .catch(err => {
        if (!isCancelled) setError(err as Error);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => { isCancelled = true; }; // 🧼 클린업을 통한 방어
  }, [postId]);

  return (
    <div style={{ border: '2px solid green', padding: '1rem', margin: '1rem' }}>
      <h3>🔥 3. 지옥의 보일러플레이트 (The Noise)</h3>
      <input type="number" onChange={(e) => setPostId(e.target.value)} placeholder="ID 입력" />
      {isLoading && <p>⌛ 로딩 중...</p>}
      <p>결과: {data?.title}</p>
    </div>
  );
}

🧐 주목할 점:

비즈니스 로직보다 isCancelled 같은 방어용 코드(노이즈)가 더 많아지는 비효율을 확인하세요.
🏗️ Step 5: 메인 앱 조립 (src/App.tsx)
import RaceCondition from './components/RaceCondition';
import DuplicateRequest from './components/DuplicateRequest';
import BoilerplateHell from './components/BoilerplateHell';

export default function App() {
  return (
    <div style={{ padding: '20px', lineHeight: '1.6' }}>
      <h1>useEffect Fetching Disaster Lab 🧪</h1>
      <p>서버 상태를 <code>useState</code>로 직접 관리할 때 발생하는 재앙을 체험합니다.</p>
      <hr />
      <RaceCondition />
      <DuplicateRequest />
      <BoilerplateHell />
    </div>
  );
}

🏁 최종 테스트 케이스 (Test Cases)
1. 경쟁 상태(Race Condition) 테스트

수행:1번 포스트(느림) 버튼을 클릭한 직후, 곧바로 2번 포스트(빠름) 버튼을 클릭합니다.
결과: 화면에 잠시 '2번 포스트'의 제목이 나타났다가, 약 2초 뒤 갑자기 '1번 포스트'의 제목으로 화면이 되돌아가는 것을 확인합니다.
분석: 네트워크상에서 늦게 완료된 1번 응답이 이미 렌더링 된 최신 2번 데이터를 덮어쓰면서 발생하는 '유령 데이터' 버그입니다.
2. 중복 요청(Duplicate Requests) 테스트

수행: 페이지를 새로고침(F5) 하거나 브라우저 개발자 도구(F12)의 콘솔창을 확인합니다.
결과: 페이지에는 유저 정보가 하나만 필요한 것처럼 보이지만, 콘솔에는 [Network Log] 실제 API 서버에 유저 정보 요청 중...이라는 로그가 정확히 2회 연속으로 찍히는 것을 확인합니다.
분석: 동일한 데이터를 필요로 하는 컴포넌트(ProfileIcon, Sidebar)가 각자 독립적인 useEffect를 실행하여 서버 자원을 낭비하고 있는 상태입니다.
3. 보일러플레이트 및 노이즈 테스트

수행:BoilerplateHell.tsx 코드를 열어 실제 데이터 페칭 로직의 비중을 확인합니다.
결과: 단 하나의 데이터를 가져오기 위해 isCancelled라는 수동 플래그 관리 코드와 로딩/에러/데이터 상태를 위한 3~4개의 useState가 코드를 지배하고 있음을 확인합니다.
분석: 비즈니스 로직보다 방어적인 보일러플레이트 코드가 많아지며 가독성과 유지보수성이 급격히 저하된 상태입니다.
4. 언마운트 시 유령 업데이트 테스트

수행:RaceCondition 컴포넌트에서 버튼을 클릭하여 요청을 보낸 뒤, 응답이 오기 전에 다른 탭으로 이동하거나 컴포넌트가 사라지게 조작합니다. (본 실습에서는 코드를 주석 처리해 확인 가능)
결과: 개발자 도구에서 "메모리 누수" 경고가 뜨거나, 이미 사라진 컴포넌트의 상태를 업데이트하려 했다는 경고가 발생할 수 있습니다.
분석:useEffect 클린업 처리가 완벽하지 않을 때 발생하는 전형적인 유령 데이터 업데이트 시도입니다.