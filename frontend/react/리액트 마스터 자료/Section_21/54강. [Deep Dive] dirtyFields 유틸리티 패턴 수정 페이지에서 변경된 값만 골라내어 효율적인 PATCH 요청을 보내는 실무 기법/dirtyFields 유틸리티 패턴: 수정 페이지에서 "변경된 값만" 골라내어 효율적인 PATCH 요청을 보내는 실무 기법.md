[실습] 54강. [Deep Dive] dirtyFields 유틸리티 패턴: 수정 페이지에서 "변경된 값만" 골라내어 효율적인 PATCH 요청을 보내는 실무 기법
지난 시간 우리는 시각 장애를 가진 사용자들도 차별 없이 폼을 이용할 수 있도록 돕는 웹 접근성 자동화 아키텍처를 구축해 보았습니다. 기술이 단순히 편리함을 넘어 배려가 되는 순간을 경험하셨죠? 이제 우리 폼은 기능, 성능, 포용성까지 갖춘 완성형에 가까워졌습니다.

하지만 실무의 세계는 냉정합니다. 데이터를 보내는 방식에서도 정교한 최적화가 요구되죠. 오늘은 dirtyFields를 활용해 진짜 바뀐 값만 쏙 골라내는 실무적인 유틸리티 패턴을 파헤쳐 보겠습니다.

📖 상세 개념 가이드 1: 왜 "전체"가 아닌 "부분"인가? (PUT vs PATCH)
수정 페이지를 개발할 때 우리는 보통 두 가지 선택지에 놓입니다. 모든 데이터를 덮어쓰는 PUT과, 바뀐 부분만 수정하는 PATCH입니다.

💡 시니어의 비유: 식당에서의 추가 주문

단골 식당에서 삼겹살 2인분, 공기밥 2개, 콜라 1개를 먹다가 콜라를 사이다로 바꾸고 싶어졌습니다. 이때 여러분은 "처음부터 다시 차려주세요, 단 콜라만 사이다로 바꿔서요"라고 하나요? 아니면 "콜라만 사이다로 바꿔주세요"라고 하나요? 당연히 후자입니다. 전자는 주방(서버)에 엄청난 불필요한 일거리를 주게 되니까요.

📖 상세 개념 가이드 2: dirtyFields 장부의 원리
React Hook Form은 사용자가 어떤 칸을 건드렸고 그 값이 처음과 달라졌는지를 실시간으로 추적하는 dirtyFields라는 영리한 장부를 가지고 있습니다.

Dirty의 의미: 초기값(defaultValues)과 달라져서 "때가 묻었다"는 뜻입니다.
작동 조건: 반드시 useForm 선언 시 defaultValues가 기준점으로 잡혀 있어야 합니다. 기준이 없으면 무엇이 변했는지 엔진이 알 수 없기 때문입니다.
장부의 형태: dirtyFields는 값 자체가 아니라, 특정 필드가 수정되었는지를 true/false로 기록하는 체크리스트 형태입니다.
/* [Concept]: dirtyFields의 내부 구조 예시 */
// 초기값: { name: "Gemini", age: 20 }
// 수정 후: { name: "Gemini AI", age: 20 }

// dirtyFields 상태:
{
  name: true, // 변경됨!
  age: false  // 그대로임
}
📖 상세 개념 가이드 3: 재귀적 탐색을 이용한 getDirtyValues 유틸리티
단순한 폼이라면 장부를 보고 값을 찾는 게 쉽지만, 주소(city, zip)처럼 객체 안에 객체가 있는 중첩 구조에서는 깊은 탐색이 필요합니다. 이를 위해 우리는 재귀(Recursion) 함수를 작성합니다.

💻 getDirtyValues 유틸리티 구현
/**
 * [getDirtyValues 유틸리티 함수]
 * @param data: 현재 폼의 전체 데이터 (watch나 getValues 결과물)
 * @param dirtyFields: 변경 여부가 기록된 RHF의 필드 상태 객체
 */
export const getDirtyValues = (data, dirtyFields) => {
  const dirtyValues = {};

  // 1. dirtyFields 장부의 모든 키(필드명)를 하나씩 순회합니다.
  Object.keys(dirtyFields).forEach((key) => {
    const currentField = dirtyFields[key];

    // 2. [중첩 구조 처리] 만약 현재 필드가 또 다른 객체라면? (배열 제외)
    if (typeof currentField === "object" && currentField !== null && !Array.isArray(currentField)) {
      // 3. [재귀 호출] 자기 자신을 다시 호출하여 자식 객체 내부를 파고듭니다.
      const childDirtyValues = getDirtyValues(data[key], currentField);

      // 4. 하위 객체에서 실제로 변경된 값이 발견되었을 때만 결과 바구니에 담습니다.
      if (Object.keys(childDirtyValues).length > 0) {
        dirtyValues[key] = childDirtyValues;
      }
    }
    // 5. [단일 필드 처리] 장부에 'true'라고 적혀 있다면 (값이 변했다면)
    else if (currentField === true) {
      // 6. 현재 데이터(data)에서 실제 값을 가져와 바구니에 옮깁니다.
      dirtyValues[key] = data[key];
    }
  });

  return dirtyValues;
};
🔍 코드 상세 분석

Object.keys(dirtyFields): 장부에서 "수정 후보" 명단만 뽑아냅니다.
typeof currentField === "object": 값이 단순히 true가 아니라 객체라면, 그 안에 city: true 같은 상세 장부가 또 들어있다는 뜻입니다.
재귀적 탐색: getDirtyValues가 다시 자신을 부르는 이 기법은 데이터의 깊이가 깊어져도 끝까지 추적할 수 있게 해줍니다.
📖 상세 개념 가이드 4: 실전 수정 페이지 적용 (PATCH 전략)
이제 이 선별기를 실제 제출 로직에 가동해 보겠습니다. 수정 페이지는 세 가지 관문을 거치게 됩니다.

💻 수정 페이지 제출 로직 구현
/* [Implementation]: 수정 페이지 제출 로직 */
const { handleSubmit, formState: { dirtyFields, isDirty } } = useForm({
  // 관문 0: 서버에서 받아온 초기값이 비교의 절대적 기준점이 됩니다.
  defaultValues: initialData
});

const onSubmit = async (data: any) => {
  // [관문 1] 수정된 내용이 아예 없는가?
  // isDirty가 false라면 사용자가 아무것도 건드리지 않은 것이므로 통신을 차단합니다.
  if (!isDirty) {
    alert("수정된 내용이 없습니다.");
    return;
  }

  // [관문 2] 진짜 바뀐 데이터만 골라내기
  // 전체 데이터(data)와 변경 명단(dirtyFields)을 대조합니다.
  const patchData = getDirtyValues(data, dirtyFields);

  // [관문 3] 가벼워진 데이터만 서버에 PATCH 요청 전송
  try {
    // 예시: { name: "홍길동" }만 전송 (나머지 50개 필드는 제외)
    await updateProfileApi(patchData);
    alert("변경된 정보만 성공적으로 저장되었습니다!");
  } catch (error) {
    console.error("저장 중 오류 발생:", error);
  }
};
🔍 동작 순서 및 원리

기준 설정: defaultValues에 데이터를 넣는 순간, RHF 엔진은 기준점을 잡습니다.
상태 감시: 사용자가 타이핑하면 dirtyFields 장부에 true 도장이 찍힙니다.
선별 제출: 제출 시 유틸리티가 true 도장이 찍힌 값만 쏙 골라 patchData를 만듭니다.
효율 전송: 서버는 바뀐 필드만 받아서 부분 수정을 수행합니다.
💡 시니어 아키텍트의 통찰: 데이터 무결성과 보안
이 패턴은 네트워크 자원 절약 외에 데이터 무결성 측면에서도 매우 중요합니다.

⚠️ 비밀번호 암호화 사례

사용자가 비밀번호는 그대로 두고 이름만 고쳤다고 가정해 보세요. 만약 전체 데이터를 다 보낸다면(PUT), 서버는 현재 비밀번호를 다시 한번 암호화해서 저장하는 실수를 할 수 있습니다. 최악의 경우 암호화 로직이 중복 적용되어 로그인이 불가능해질 수도 있죠. 하지만 이름만 보낸다면(PATCH) 서버는 "이름만 바꾸면 되는구나"라고 명확히 인지하여 안전하게 작업을 수행합니다.
