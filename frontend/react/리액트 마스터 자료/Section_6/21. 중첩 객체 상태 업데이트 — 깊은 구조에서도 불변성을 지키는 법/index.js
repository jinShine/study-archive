// updating-nested-objects.jsx
// -------------------------------------------------------------
// 21. Updating Nested Objects — 깊은 구조에서도 불변성을 지키는 법
// -------------------------------------------------------------
// 핵심 요약
// - 중첩 객체의 상태를 변경할 때는 "불변성(immutability)"을 반드시 지켜야 함
// - ❌ 직접 수정(user.address.city = "부산")은 같은 참조를 유지하므로 리렌더링이 일어나지 않음
// - ✅ 새로운 객체를 만들어(스프레드 연산자) 단계별로 복사 후 교체해야 React가 변화를 감지함
// - 깊은 구조일수록 ‘단계별 얕은 복사(shallow copy per level)’가 핵심
// -------------------------------------------------------------

import React, { useState } from "react";

/* -----------------------------------------------------------
 * 섹션 1. ❌ 직접 수정의 문제
 *   - 이미지: user.address.city = "부산"
 *   - React는 참조가 같으면 상태 변경으로 인식하지 않음
 * ---------------------------------------------------------*/

function ProfileBad() {
  const [user, setUser] = useState({
    name: "영희",
    age: 25,
    address: {
      city: "서울",
      zipcode: "12345",
    },
  });

  function moveCity() {
    user.address.city = "부산"; // ❌ 직접 수정
    setUser(user); // 같은 참조 → 렌더링 되지 않음
  }

  return (
    <div>
      <p>
        {user.name} — {user.address.city}
      </p>
      <button onClick={moveCity}>부산으로 이사하기 (❌ 직접 수정)</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 2. ✅ 올바른 중첩 객체 업데이트
 *   - 이미지: setUser({...user, address: {...user.address, city:"부산"}})
 *   - 각 단계(user → address)별로 새 객체를 만들어 교체
 * ---------------------------------------------------------*/

function ProfileGood() {
  const [user, setUser] = useState({
    name: "영희",
    age: 25,
    address: {
      city: "서울",
      zipcode: "12345",
    },
  });

  function moveCity() {
    setUser({
      ...user, // user의 다른 속성 복사
      address: {
        ...user.address, // address의 다른 속성 복사
        city: "부산", // 교체할 필드만 덮어쓰기
      },
    });
  }

  return (
    <div>
      <p>
        {user.name} — {user.address.city}
      </p>
      <button onClick={moveCity}>부산으로 이사하기 (✅ 불변성 유지)</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 3. 복잡한 중첩 구조 예시
 *   - 이미지: company 객체 내부에 contact, address 등 복합 구조
 * ---------------------------------------------------------*/

function CompanyExample() {
  const [company, setCompany] = useState({
    name: "우리회사",
    industry: "IT 서비스",
    founded: 2015,
    employeeCount: 120,
    contact: {
      phone: "02-1234-5678",
      email: "info@wooricorp.com",
    },
    address: {
      city: "서울",
      detail: "강남구 역삼동",
      zipCode: "06236",
    },
  });

  function changeAddress() {
    // ✅ 각 중첩 객체를 단계별로 새로 만들어 교체
    setCompany({
      ...company,
      address: {
        ...company.address,
        city: "부산",
        detail: "해운대구 센텀동",
        zipCode: "48060",
      },
      contact: {
        ...company.contact,
        phone: "051-987-6543",
      },
    });
  }

  return (
    <div>
      <h3>{company.name}</h3>
      <p>
        {company.address.city} ({company.address.detail})
      </p>
      <p>전화번호: {company.contact.phone}</p>
      <button onClick={changeAddress}>회사 이전하기</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 4. 더 깊은 구조의 예시
 *   - 이미지: user.profile.contact.phone / user.profile.address.city
 *   - 중첩 레벨이 깊을수록 단계별 spread가 필요
 * ---------------------------------------------------------*/

function DeepNestedExample() {
  const [user, setUser] = useState({
    id: 1,
    profile: {
      name: "Alice",
      address: { city: "Seoul", zip: "06000" },
      contact: { phone: "010-1111-2222" },
    },
    settings: { theme: "light" },
  });

  function updateContact() {
    setUser({
      ...user,
      profile: {
        ...user.profile,
        contact: {
          ...user.profile.contact,
          phone: "010-9999-8888",
        },
      },
    });
  }

  return (
    <div>
      <p>
        {user.profile.name} — {user.profile.contact.phone}
      </p>
      <button onClick={updateContact}>전화번호 변경</button>
    </div>
  );
}

/* -----------------------------------------------------------
 * 섹션 5. 데모용 루트 컴포넌트
 * ---------------------------------------------------------*/

export default function App() {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        lineHeight: 1.4,
        padding: 16,
      }}
    >
      <h2>21. 중첩 객체 상태 업데이트 — 깊은 구조에서도 불변성을 지키는 법</h2>

      <h3>섹션 1. 나쁜 예 (직접 수정)</h3>
      <ProfileBad />

      <h3>섹션 2. 좋은 예 (불변성 유지)</h3>
      <ProfileGood />

      <h3>섹션 3. 복합 객체 업데이트</h3>
      <CompanyExample />

      <h3>섹션 4. 깊은 구조 업데이트</h3>
      <DeepNestedExample />
    </div>
  );
}

/* -----------------------------------------------------------
 *
 * 1) 상태로 사용하는 객체는 직접 수정하지 말 것
 *    - ❌ user.address.city = "부산"
 * 2) 단계별로 복사 후 교체
 *    - ✅ setUser({...user, address: {...user.address, city: "부산"}})
 * 3) 깊은 구조일수록 단계별 얕은 복사 적용
 *    - ✅ setUser({...user, profile: {...user.profile, contact: {...user.profile.contact, phone: "010..."}}})
 * 4) React는 “참조(reference)”가 바뀌어야 렌더링을 감지함
 * ---------------------------------------------------------*/
