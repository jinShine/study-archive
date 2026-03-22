'use client';
import { useActionState } from 'react';
import { createProductAction, ProductFormState } from '../../actions';
import SubmitButton from '../../components/SubmitButton';

export default function NewProductPage() {
  const initialState: ProductFormState = { success: false, message: '', attemptCount: 0 };
  const [state, formAction] = useActionState(createProductAction, initialState);

  return (
    <div className="p-10 font-sans max-w-md bg-white rounded-lg shadow-md mx-auto mt-10 border border-gray-100">
      <h1 className="text-[#0070f3] mt-0 mb-2 text-2xl font-bold">새로운 상품 통제소</h1>
      <p className="text-gray-500 text-sm mb-5">useActionState가 장착된 완벽한 피드백 시스템</p><hr className="border-gray-200 my-5" />
      <form action={formAction} className="flex flex-col gap-4">
        <input type="text" name="title" placeholder="상품명을 입력하세요" className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070f3]" />
        <input type="number" name="price" placeholder="가격을 입력하세요" className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070f3]" />
        <SubmitButton />
        {state.message && (
          <div className={`p-4 mt-2 rounded-md border ${state.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
            <p className="m-0 mb-1 font-bold text-sm opacity-80">시도 횟수: {state.attemptCount}회</p>
            <p className="m-0 font-semibold">{state.message}</p>
          </div>
        )}
      </form>
    </div>
  );
}