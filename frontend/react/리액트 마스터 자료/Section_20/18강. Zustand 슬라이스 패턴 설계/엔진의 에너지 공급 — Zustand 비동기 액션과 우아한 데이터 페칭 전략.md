📖 상세 개념 가이드 (The Core Manual)
지난 시간 우리는 create, set, get이라는 삼총사를 통해 Zustand 엔진의 기본 동작 원리를 완벽하게 분해해 보았습니다. 이제 엔진의 개별 부품을 다루는 법을 마스터했으니, 오늘은 이 엔진을 어떻게 하면 더 거대하고 정교한 시스템으로 확장할 수 있을지 그 설계의 미학을 배워보려 합니다.

실제 현업에서 관리해야 할 상태가 기하급수적으로 늘어날 때, 모든 로직을 하나의 파일에 몰아넣는 것은 위험합니다. 그래서 노련한 아키텍트들은 엔진을 도메인(관리 영역)별로 조각내어 관리하는 슬라이스 패턴(Slice Pattern) 전략을 선택합니다. 백화점의 층별 관리 사례를 통해 기초부터 StateCreator의 비밀, 그리고 import type을 활용한 런타임 에러 방지까지 정밀하게 파헤쳐 보겠습니다.

1. 배경 및 역할: 왜 슬라이스 패턴(Slice Pattern)인가?
수만 줄의 코드를 하나의 거대한 객체에 몰아넣으면, 나중에 작은 기능 하나를 고치려 해도 시스템 전체를 뜯어내야 하는 비극이 발생합니다. 슬라이스 패턴은 관리 영역(Domain)을 조각내어 유지보수의 독립성을 확보하는 아키텍처입니다.

배경: 애플리케이션 규모 확장에 따른 코드 복잡도 해결 및 유지보수성 향상 필요.
역할: 거대한 스토어를 기능 단위(예: 유저, 상품, 알림)로 분리하여 관리.
기능: 각 슬라이스는 자신의 데이터만 책임지며, 최종적으로는 하나의 통합 스토어로 합쳐져 컴포넌트에 공급됨.
2. 설계도 작성: 전체 백화점 청사진 (types.ts)
슬라이스 패턴의 첫 단추는 각 구역의 명세와 이를 합친 전체 건물의 구조를 정의하는 것입니다. 런타임에 영향을 주지 않도록 인터페이스로만 구성합니다.

/* [File Path]: src/store/types.ts */

/**
 * [1층 화장품 코너 설계도]
 * 향수 재고와 판매 로직을 정의합니다.
 */
export interface CosmeticsSlice {
  perfumeStock: number; // 향수 재고량 (상태)
  sellPerfume: () => void; // 향수 판매 (액션)
}

/**
 * [2층 의류 코너 설계도]
 * 셔츠 재고와 판매 로직을 정의합니다.
 */
export interface ClothingSlice {
  shirtStock: number; // 셔츠 재고량 (상태)
  sellShirt: () => void; // 셔츠 판매 (액션)
}

/**
 * [백화점 통합 설계도]
 * 1층과 2층의 기능을 합쳐 하나의 거대한 중앙 통제실 청사진을 만듭니다.
 */
export interface DepartmentStore extends CosmeticsSlice, ClothingSlice {}

🔍 상세 코드 설명

*CosmeticsSlice & ClothingSlice: 각 도메인이 가져야 할 데이터(State)와 행위(Action)를 개별적으로 정의합니다. 이는 객체지향의 '단일 책임 원칙'을 타입 시스템에 적용한 것입니다.
extends: 자바스크립트의 상속 개념을 활용하여 분리된 조각들을 하나의 거대한 DepartmentStore 타입으로 묶어줍니다. 이 통합 타입은 나중에 각 슬라이스가 "전체 건물 구조"를 인지하게 만드는 기준점이 됩니다. 이를 통해 서로 다른 슬라이스 간에도 타입 추론이 가능해집니다.
3. StateCreator: 전문가 고용 계약서 파헤치기
슬라이스를 만들 때 가장 중요한 문법은 StateCreator입니다. 이는 전문가가 나중에 어떤 시스템의 일부가 될 것인지를 미리 약속하는 '전문가 고용 계약서'입니다.

/* [StateCreator Syntax Structure] */

// StateCreator<전체_건물_모양, 미들웨어_장비1, 미들웨어_장비2, 현재_조각_모양>

🔍 상세 개념 설명

첫 번째 인자 (DepartmentStore): 전문가가 나중에 합쳐질 건물 전체의 구조를 인지해야 함을 뜻합니다. 그래야 1층 전문가가 get()을 통해 다른 층 상황을 참조할 수 있습니다.
*빈 배열 [], []**: 미들웨어(persist, devtools 등)를 사용하지 않을 때 비워두는 예약석입니다. "기본 도구만 쓰겠다"는 선언입니다.
네 번째 인자 (CosmeticsSlice): "내가 책임질 구역은 여기다"라고 명시하는 실제 슬라이스 타입입니다. 이 인자를 통해 현재 슬라이스가 구현해야 할 필드들을 강제합니다.
💻 실습 1단계: 화장품 슬라이스 구현 (cosmeticsSlice.ts)
import type을 사용하여 런타임 에러(SyntaxError)를 방지하는 것이 핵심입니다.
/* [File Path]: src/store/cosmeticsSlice.ts */
import { StateCreator } from 'zustand';
// 💡 중요: 인터페이스와 타입은 'import type'으로 가져와야 런타임 에러를 피할 수 있습니다.
import type { CosmeticsSlice, DepartmentStore } from './types';

/**
 * [1층 화장품 전문가 그룹 로직]
 * StateCreator를 통해 전체 구조를 인지하면서, 실제 구현은 CosmeticsSlice에 맞게 진행합니다.
 */
export const createCosmeticsSlice: StateCreator<
  DepartmentStore, // 첫 번째: 전체 스토어 타입 (다른 슬라이스 참조용)
  [],              // 두 번째: 미들웨어 (없음)
  [],              // 세 번째: 미들웨어 (없음)
  CosmeticsSlice   // 네 번째: 현재 구현할 슬라이스 타입
> = (set) => ({
  // [상태]: 초기 향수 재고 100개
  perfumeStock: 100,

  // [액션]: 향수를 판매하면 재고를 1 감소시킴
  sellPerfume: () => set((state) => ({
    // 전체 state 중 perfumeStock만 안전하게 업데이트합니다.
    perfumeStock: state.perfumeStock - 1
  })),
});

🔍 상세 코드 설명

import type: 질문하신 에러의 핵심 해결책입니다. TypeScript 컴파일러에게 "이 모듈에서는 타입 정보만 쓸 거야, 실제 자바스크립트 값은 필요 없어"라고 알려줍니다. 결과적으로 브라우저가 실행될 때 존재하지 않는 값을 찾으려다 발생하는 SyntaxError를 완벽히 차단합니다.
StateCreator의 제네릭: DepartmentStore를 첫 번째 인자로 둠으로써 set 내부의 state가 전체 스토어의 모습을 갖추게 합니다. 덕분에 자동 완성이 완벽하게 작동합니다.
상태 업데이트: set 함수에 콜백을 전달하여 현재 상태(state)를 안전하게 캡처하고, 변경하고 싶은 조각(perfumeStock)만 포함된 새 객체를 반환합니다.
💻 실습 2단계: 의류 슬라이스 구현 (clothingSlice.ts)
/* [File Path]: src/store/clothingSlice.ts */
import type { StateCreator } from 'zustand';
import type { ClothingSlice, DepartmentStore } from './types';

/**
 * [2층 의류 전문가 그룹 로직]
 */
export const createClothingSlice: StateCreator<
  DepartmentStore,
  [],
  [],
  ClothingSlice
> = (set) => ({
  // [상태]: 초기 셔츠 재고 50개
  shirtStock: 50,

  // [액션]: 셔츠 판매 로직
  sellShirt: () => set((state) => ({
    // 의류 재고만 정밀하게 타격하여 업데이트합니다.
    shirtStock: state.shirtStock - 1
  })),
});

🔍 상세 코드 설명

관심사 분리 (Separation of Concerns): 화장품과 의류 로직이 파일 단위로 격리되었습니다. 이는 대규모 프로젝트에서 각 도메인 담당자가 서로의 코드를 건드리지 않고 독립적으로 개발할 수 있는 환경을 제공합니다.
모듈화된 구현: createClothingSlice라는 독립된 생성 함수를 정의함으로써, 해당 슬라이스만 따로 떼어내어 테스트하거나 다른 스토어에서 재사용하기 매우 용이해집니다.
💻 실습 3단계: 통합 스토어 완성 (index.ts)
분리된 조각들을 하나로 합쳐 리액트 훅으로 변환합니다.

/* [File Path]: src/store/index.ts */
import { create } from 'zustand';
import type { DepartmentStore } from './types';
import { createCosmeticsSlice } from './cosmeticsSlice';
import { createClothingSlice } from './clothingSlice';

/**
 * [최종 통합 스토어]
 * (...a) 문법은 set, get 같은 마스터키 세트를 각 슬라이스에 배분한다는 뜻입니다.
 */
export const useDepartmentStore = create<DepartmentStore>()((...a) => ({
  // 각 층 전문가들에게 마스터키를 넘겨주며 방을 합칩니다.
  ...createCosmeticsSlice(...a),
  ...createClothingSlice(...a),
}));

🔍 상세 코드 설명

create<DepartmentStore>(): 최종 스토어는 모든 슬라이스가 합쳐진 통합 타입을 가집니다. 이를 통해 컴포넌트에서 스토어를 쓸 때 강력한 타입 체킹이 보장됩니다.
(...a) (Rest 인자): Zustand 내부의 set, get, api 도구들을 배열 형태로 통째로 받아옵니다.
전개 연산자 (...): 각 슬라이스 함수를 실행(...a를 넘겨주며)하여 얻은 객체들을 하나의 거대한 중앙 통제실 객체로 병합합니다. 이것이 슬라이스 패턴의 물리적 결합 과정입니다.
💻 실습 4단계: UI 적용 (App.tsx)
/* [File Path]: src/App.tsx */
import React from 'react';
import { useDepartmentStore } from './store';

export function App() {
  // 셀렉터 패턴으로 필요한 데이터와 액션만 쏙 골라옵니다.
  const perfumeStock = useDepartmentStore((state) => state.perfumeStock);
  const sellPerfume = useDepartmentStore((state) => state.sellPerfume);
  const shirtStock = useDepartmentStore((state) => state.shirtStock);
  const sellShirt = useDepartmentStore((state) => state.sellShirt);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <h1>🏬 Zustand 백화점 관리 시스템</h1>

      <section style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '10px' }}>
        <h2>💄 1층: 화장품 코너</h2>
        <p>향수 재고: <strong>{perfumeStock}</strong>개</p>
        <button onClick={sellPerfume} style={{ padding: '8px 16px', cursor: 'pointer' }}>향수 판매</button>
      </section>

      <section style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '10px' }}>
        <h2>👕 2층: 의류 코너</h2>
        <p>셔츠 재고: <strong>{shirtStock}</strong>개</p>
        <button onClick={sellShirt} style={{ padding: '8px 16px', cursor: 'pointer' }}>셔츠 판매</button>
      </section>
    </div>
  );
}

🔍 상세 코드 설명

Selector 최적화: useDepartmentStore((state) => state.perfumeStock)와 같이 필요한 조각만 가져오는 방식을 사용했습니다. 이는 성능의 핵심입니다. 의류 재고가 변해도 화장품 섹션은 리렌더링되지 않습니다.
직관적인 UI 연동: 상태와 액션이 마치 로컬 변수처럼 사용되어 컴포넌트의 가독성이 대폭 향상됩니다.
✅ 최종 점검 (Final Verification)
에러 해결: import type을 통해 브라우저 콘솔의 Uncaught SyntaxError가 사라졌는지 확인하세요.
설계 독립성: 화장품과 의류 로직이 완전히 분리되어 유지보수가 용이해졌습니다.
확장성: 이제 3층 가전 코너가 생겨도 types.ts와 새 슬라이스 파일만 추가하면 기존 코드를 거의 건드리지 않고 확장 가능합니다.
