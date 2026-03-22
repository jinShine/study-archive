// src/app/products/new/page.tsx

import { createProductAction } from "../../actions";
// 1. 방금 우리가 캡슐화하여 만든 똑똑한 상태 추적 컴포넌트를 불러옵니다.
import SubmitButton from "../../components/SubmitButton";

export default function NewProductPage() {
  return (
    <div className="p-10 font-sans max-w-md bg-white rounded-lg shadow-md mx-auto mt-10 border border-gray-100">
      <h1 className="text-[#0070f3] mt-0 mb-2 text-2xl font-bold">새로운 상품 통제소</h1>
      <p className="text-gray-500 text-sm mb-5">Pending UI 방어선이 구축된 폼 시스템</p>

      <hr className="border-gray-200 my-5" />

      {/* 2. 서버 액션이 연결된 부모 폼 태그입니다. 이 폼이 작동하면 내부의 자식 컴포넌트들에게 상태가 전파됩니다. */}
      {/* (12강에서 useActionState를 도입하기 전까지는 임시로 as any 우회를 유지합니다) */}
      <form action={createProductAction as any} className="flex flex-col gap-4">

        <input
          type="text"
          name="title"
          placeholder="상품명을 입력하세요"
          required
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070f3] transition-all"
        />

        <input
          type="number"
          name="price"
          placeholder="가격을 입력하세요"
          required
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070f3] transition-all"
        />

        {/* 3. 멍청했던 일반 <button> 태그 대신, 부모의 상태를 추적하는 전용 버튼을 자식으로 삽입합니다. */}
        <SubmitButton />

      </form>
    </div>
  );
}