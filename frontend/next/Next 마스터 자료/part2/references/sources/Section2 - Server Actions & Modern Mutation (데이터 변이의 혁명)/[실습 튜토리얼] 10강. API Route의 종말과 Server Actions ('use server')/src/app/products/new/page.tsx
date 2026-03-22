import { createProductAction } from "../../actions";

export default function NewProductPage() {
  return (
    <div className="p-10 font-sans max-w-md bg-white rounded-lg shadow-md mx-auto mt-10 border border-gray-100">
      <h1 className="text-[#0070f3] mt-0 mb-2 text-2xl font-bold">새로운 상품 통제소</h1>
      <p className="text-gray-500 text-sm mb-5">API 통신 코드가 증발한 혁신적인 폼 렌더링</p>
      
      <hr className="border-gray-200 my-5" />
      
      {/* 🚨 아키텍트 임시 통제: 11강 전까지 TypeScript 타입 검열 강제 우회 (as any) */}
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
        
        <button 
          type="submit" 
          className="p-3 bg-[#0070f3] hover:bg-blue-700 text-white border-none rounded-md font-bold cursor-pointer transition-colors shadow-sm"
        >
          상품 등록 시스템 가동
        </button>
      </form>
    </div>
  );
}