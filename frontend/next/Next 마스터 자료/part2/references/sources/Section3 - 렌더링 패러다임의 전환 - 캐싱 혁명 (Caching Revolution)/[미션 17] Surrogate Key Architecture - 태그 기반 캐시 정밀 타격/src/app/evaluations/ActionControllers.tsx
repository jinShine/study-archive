'use client';

import { deleteEvalSoftAction, deleteEvalInstantAction } from '@/app/actions';

export default function ActionControllers({ evalId }: { evalId: string }) {
  return (
    <div className="flex gap-3 mt-2">
      <button
        onClick={() => deleteEvalSoftAction(evalId)}
        className="px-4 py-2 bg-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-300 transition-colors"
      >
        ☁️ 부드러운 삭제 (revalidateTag)
      </button>

      <button
        onClick={() => deleteEvalInstantAction(evalId)}
        className="px-4 py-2 bg-red-100 text-red-600 font-bold text-sm rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-200"
      >
        ⚡ 즉시 삭제 (updateTag)
      </button>
    </div>
  );
}