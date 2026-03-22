import { registerDeviceAction } from "../../actions";
import AccessButton from "../../components/AccessButton";

export default function SecurityRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl">
        <h1 className="text-white text-3xl font-black mb-2 tracking-tight">기기 등록 센터</h1>
        <p className="text-slate-500 text-sm mb-8 font-mono italic">Security Protocol: useFormStatus Locking</p>
        
        <form action={registerDeviceAction as any} className="flex flex-col gap-6">
          <div className="space-y-4">
            <input 
              name="deviceName" 
              placeholder="기기 명칭 (예: 보안 카메라 01)" 
              required 
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            />
            <input 
              name="serialNumber" 
              placeholder="시리얼 번호" 
              required 
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
            />
          </div>
          
          {/* 상태 추적 레이더를 장착한 자식 컴포넌트 */}
          <AccessButton />
        </form>
        
        <p className="mt-8 text-center text-xs text-slate-600">
          * 기기 등록 중에는 보안을 위해 모든 상호작용이 일시 차단됩니다.
        </p>
      </div>
    </div>
  );
}