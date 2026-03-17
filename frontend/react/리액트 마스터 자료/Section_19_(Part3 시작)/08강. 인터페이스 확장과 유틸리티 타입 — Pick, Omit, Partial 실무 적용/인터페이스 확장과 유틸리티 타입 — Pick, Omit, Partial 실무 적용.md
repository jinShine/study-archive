🎯 학습 목표 및 결과물
React.ComponentPropsWithoutRef: 표준 HTML 태그의 모든 속성(유전자)을 한 번에 추출하는 법을 익힙니다.
인터페이스 확장(extends): 기존 타입을 기반으로 기능을 추가하는 '타입 상속과 진화'를 마스터합니다.
Pick & Omit: 거대한 데이터셋에서 필요한 속성만 정밀하게 선택하거나 제거하는 가공 기술을 습득합니다.
Partial: 모든 속성을 선택 사항으로 변환하여 데이터 업데이트 로직의 유연성을 극대화합니다.
최종 결과: 표준 버튼 기능을 유지하며 로딩 기능이 추가된 커스텀 버튼, 보안이 강화된 상품 상세 정보, 부분 수정이 가능한 프로필 시스템 구축.
📖 상세 개념 가이드 (The Core Manual)
1. React.ComponentPropsWithoutRef: HTML 유전자 지도 추출
우리가 만드는 커스텀 컴포넌트(예: MyButton)가 실제 HTML 요소처럼 작동하려면, HTML 표준이 가진 수백 개의 속성(id, className, onClick, onKeyDown, aria-label 등)을 모두 받아줄 수 있어야 합니다.

정의 및 원리: 리액트가 내부적으로 정의해둔 각 HTML 태그별 타입 정보(Type Definition)를 그대로 복제해오는 기술입니다.
기초 신택스 코드 블럭:
// 리액트 패키지에서 특정 태그의 '유전자'만 뽑아냅니다.
type NativeButtonProps = React.ComponentPropsWithoutRef<'button'>;
type NativeInputProps = React.ComponentPropsWithoutRef<'input'>;

왜 상세하게 알아야 하나요?:
유지보수: HTML 표준 속성이 업데이트되어도 우리 코드를 수정할 필요가 없습니다.
사용자 경험: 개발자가 일일이 정의하지 않아도 사용자는 커스텀 버튼에 title이나 onBlur 같은 속성을 마음대로 쓸 수 있습니다.
WithoutRef의 비밀: 리액트의 ref는 DOM에 직접 접근하는 강력한 도구이지만, 잘못 전달하면 런타임 에러가 발생합니다. WithoutRef는 ref를 안전하게 제외한 속성들만 가져오므로, 초보자부터 숙련자까지 가장 범용적으로 사용하는 안전한 타입 추출 방식입니다.
2. 인터페이스 확장 (extends): 타입의 상속과 진화
기존의 기본 설계도를 바탕으로 새로운 기능을 덧붙여 더 강력한 설계도를 만드는 '상속'의 개념입니다.

정의 및 원리: extends 키워드는 "A는 B를 포함한다"는 논리적 관계를 만듭니다. 부모 인터페이스의 모든 타입 정보를 자식이 그대로 흡수합니다.
기초 신택스 코드 블럭:
interface Animal {
  species: string;
  age: number;
}

// Animal의 모든 것을 물려받고, Dog만의 특성인 breed를 추가합니다.
interface Dog extends Animal {
  breed: string;
  isFriendly: boolean;
}

실무적 가치:
중복 제거: 공통 속성(id, createdAt, updatedAt)을 매번 정의할 필요 없이 Base 인터페이스 하나로 관리할 수 있습니다.
다형성: 부모 타입을 확장한 여러 자식 타입들은 공통 분모(부모)를 가지고 있으므로, 부모 타입을 인자로 받는 함수에서 모두 공통적으로 처리될 수 있는 유연함을 가집니다.
3. Pick & Omit: 정밀한 데이터 가공 (Filter & Slice)
원본 설계도(T)에서 특정 항목들(K)만 골라내거나(Pick), 반대로 특정 항목만 도려내는(Omit) 가공 기술입니다.

정의 및 원리:
Pick<T, K>: 원본 T에서 내가 지정한 키 K들만 추출합니다. (White-list 방식)
Omit<T, K>: 원본 T에서 내가 지정한 키 K들만 제외한 나머지를 가져옵니다. (Black-list 방식)
기초 신택스 코드 블럭:
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// 1. Pick: 오직 이름과 이메일만 필요한 '연락처 목록' 타입을 만들 때
type ContactInfo = Pick<User, 'name' | 'email'>;

// 2. Omit: 개인정보인 전화번호만 빼고 나머지가 다 필요한 '공개 프로필' 타입을 만들 때
type PublicProfile = Omit<User, 'phone'>;

실무 활용 팁:
데이터 구조가 복잡할수록 Pick은 필요한 것만 명시하므로 안전하고 명확합니다.
반면, 속성이 수십 개인데 한두 개만 빼고 싶다면 Omit이 훨씬 효율적입니다. 주로 보안상 노출되면 안 되는 필드(password, token)를 거를 때 필수적으로 쓰입니다.
4. Partial: 유연성을 극대화하는 마법 (Optional)
인터페이스에 정의된 모든 필수 속성을 "있어도 되고 없어도 되는" 선택 사항(Optional)으로 한 번에 바꿔버립니다.

정의 및 원리: 원본 타입의 모든 키 뒤에 ?를 붙여주는 매핑 타입(Mapped Type)입니다.
기초 신택스 코드 블럭:
interface Todo {
  title: string;
  description: string;
  isCompleted: boolean;
}

// 모든 필드가 선택 사항이 됩니다.
type UpdateTodoInput = Partial<Todo>;
// 결과: { title?: string; description?: string; isCompleted?: boolean; }

왜 사용하나요? (The "Patch" Pattern):
서버에 데이터를 보낼 때, 굳이 수정하지 않는 데이터까지 보낼 필요는 없습니다. 사용자가 title만 수정했다면 { title: "새 제목" }만 보내도 타입스크립트가 "나머지 정보는 어디 갔어?"라고 화내지 않게 하려면 Partial이 반드시 필요합니다.
상태 업데이트 함수(setState)를 만들 때 일부 데이터만 덮어쓰는 로직에서 최고의 효율을 발휘합니다.
💻 실습 1단계: 표준 속성을 확장한 커스텀 버튼
/* [File Path]: src/components/PrimaryButton.tsx */
import React from 'react';

// 1. React.ComponentPropsWithoutRef<'button'>을 통해 'onClick', 'type' 등 모든 버튼 속성 상속
// 2. 추가적으로 우리 서비스만의 variant와 isLoading 속성 정의
interface PrimaryButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant: 'solid' | 'outline';
  isLoading?: boolean;
}

export function PrimaryButton({
  variant,
  isLoading,
  children,
  ...props // 나머지 모든 표준 속성을 'props'라는 변수로 모음 (Rest Parameters)
}: PrimaryButtonProps) {
  return (
    <button
      disabled={isLoading} // 로딩 중일 때는 버튼의 표준 속성인 disabled를 true로 설정
      {...props}           // onClick, onMouseEnter 등 부모가 준 모든 속성을 태그에 전개 (Spread Operator)
      style={{
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        backgroundColor: variant === 'solid' ? '#646cff' : 'transparent',
        color: variant === 'solid' ? 'white' : '#646cff',
        border: '1px solid #646cff',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      {isLoading ? "처리 중..." : children}
    </button>
  );
}

🔍 코드 상세 설명:

extends React.ComponentPropsWithoutRef<'button'>: 개발자가 직접 정의하지 않아도 HTML 버튼이 가진 수백 개의 속성 타입을 자동으로 인식하게 합니다.
...props (Rest): 구조 분해 할당을 통해 우리가 커스텀한 속성(variant, isLoading)만 쏙 빼내고, 남은 모든 표준 속성들을 한데 묶습니다.
{...props} (Spread): 묶여있던 표준 속성들을 실제 <button> 태그에 뿌려줍니다. 이 덕분에 외부에서 <PrimaryButton onClick={...} />처럼 표준 속성을 그대로 사용할 수 있습니다.
💻 실습 2단계: Omit을 이용한 데이터 보안 설계
/* [File Path]: src/components/ProductDisplay.tsx */
import React from 'react';

// 서버에서 내려주는 전체 상품 데이터 구조
interface Product {
  id: string;
  name: string;
  price: number;
  adminNote: string;   // 노출 금지: 관리자 메모
  secretToken: string; // 노출 금지: 내부 인증 토큰
}

/**
 * Omit 유틸리티 타입 활용:
 * Product 인터페이스에서 'adminNote'와 'secretToken' 키만 제거한 새로운 타입을 생성합니다.
 */
type UserViewProduct = Omit<Product, 'adminNote' | 'secretToken'>;

export function ProductDetail({ product }: { product: UserViewProduct }) {
  return (
    <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '12px', marginTop: '20px' }}>
      <h3>📦 상품 정보</h3>
      <p>상품명: <strong>{product.name}</strong></p>
      <p>판매가: {product.price.toLocaleString()}원</p>
      {/* 🔍 분석: 이 컴포넌트 안에서는 product.secretToken을 사용하려 해도 타입 레벨에서 차단됩니다. */}
    </div>
  );
}

🔍 코드 상세 설명:

Omit<Product, 'adminNote' | 'secretToken'>: 거대한 Product 객체에서 보안상 위험하거나 불필요한 속성들만 도려낸 "안전한 설계도"를 새로 만듭니다.
타입 안전성: 실수로 product.adminNote를 출력하려고 하면 VS Code가 즉시 빨간 줄을 띄워 보안 사고를 코드 작성 단계에서 방어합니다.
💻 실습 3단계: Partial로 유연한 상태 업데이트
/* [File Path]: src/components/ProfileEditor.tsx */
import React, { useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
}

export function ProfileEditor() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "홍길동",
    email: "gildong@react.com",
    bio: "리액트 공부 중"
  });

  /**
   * Partial<UserProfile> 활용:
   * name, email, bio 중 어떤 것이 들어올지 모르거나 하나만 들어와도 허용합니다.
   * 인자 'changes'의 타입은 { name?: string; email?: string; bio?: string; } 가 됩니다.
   */
  const handleUpdate = (changes: Partial<UserProfile>) => {
    // 1. 기존 데이터(...prev)를 복사하고
    // 2. 바뀐 부분(...changes)만 그 위에 덮어씌웁니다.
    setProfile((prev) => ({ ...prev, ...changes }));
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '12px', marginTop: '20px' }}>
      <h3>현재 닉네임: {profile.name}</h3>
      <button onClick={() => handleUpdate({ name: "React Expert" })}>
        닉네임만 업데이트
      </button>
    </div>
  );
}

🔍 코드 상세 설명:

Partial<UserProfile>: 본래 모든 속성이 필수(Required)였던 UserProfile을 가져와 일시적으로 모든 속성에 ?를 붙여줍니다.
{...prev, ...changes}: 자바스크립트의 스프레드 연산자를 활용한 불변성 유지 패턴입니다. changes에 name만 들어있다면, 기존의 email과 bio는 건드리지 않고 name만 업데이트하게 됩니다.
💻 실습 4단계: 시스템 통합 (App.tsx & main.tsx)
/* [File Path]: src/App.tsx */
import React from 'react';
import { PrimaryButton } from './components/PrimaryButton';
import { ProductDetail } from './components/ProductDisplay';
import { ProfileEditor } from './components/ProfileEditor';

function App() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>08강. 인터페이스 확장 및 유틸리티 실습</h1>
      <hr style={{ opacity: 0.1, margin: '30px 0' }} />

      <section>
        <h2>1. 유전자 확장 및 표준 속성 복제 (extends)</h2>
        <PrimaryButton variant="solid" onClick={() => alert('표준 속성 작동!')}>
          상속받은 표준 버튼
        </PrimaryButton>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>2. 데이터 정밀 가공 (Omit)</h2>
        <ProductDetail product={{ id: "A101", name: "고급 리액트 가이드", price: 45000 }} />
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>3. 유연한 수정 로직 (Partial)</h2>
        <ProfileEditor />
      </section>
    </div>
  );
}

export default App;

🔍 코드 상세 설명:

컴포넌트 조립: 위에서 만든 세 가지 타입 전략이 하나의 화면에서 어떻게 유기적으로 동작하는지 보여줍니다.
Props 전달: PrimaryButton에는 버튼 고유 속성(onClick)을, ProductDetail에는 가공된 데이터를 전달하며 각 기술의 실전 용례를 확인할 수 있습니다.
✅ 최종 점검 (Final Verification)
완성된 디렉토리 구조를 확인하세요 (PrimaryButton, ProductDisplay, ProfileEditor 파일 존재 여부).
버튼: isLoading을 true로 바꿨을 때 버튼이 회색으로 변하며 클릭이 막히는지 확인하세요.
상품: ProductDetail 컴포넌트 내에서 product.adminNote를 타이핑했을 때 오류가 발생하는지 확인하세요.
프로필: '닉네임만 업데이트'를 눌렀을 때 이메일 주소가 사라지지 않고 이름만 바뀌는지 확인하세요.
