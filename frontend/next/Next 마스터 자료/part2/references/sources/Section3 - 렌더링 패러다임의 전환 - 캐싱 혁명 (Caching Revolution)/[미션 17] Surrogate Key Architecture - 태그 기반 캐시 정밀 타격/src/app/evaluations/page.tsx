'use cache';

import { getEvaluations } from '@/app/actions';
import { cacheTag } from 'next/cache';
import ActionControllers from './ActionControllers';

export default async function EvaluationsPage() {
  cacheTag('global-evals');
  const evaluations = await getEvaluations();

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans flex justify-center">
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-3xl p-10 border border-slate-200">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">
          🦆 글로벌 수강평 통제소
        </h1>
        <p className="text-slate-500 mb-8 font-medium">
          대리 키(Surrogate Key)를 활용하여 얼어붙은 캐시를 유연하게 통제하십시오.
        </p>
        
        <hr className="mb-8 border-slate-200" />

        <ul className="space-y-4">
          {evaluations.map(evaluation => (
            <li key={evaluation.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
              <div>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                  {evaluation.author}
                </span>
                <p className="mt-2 text-lg text-slate-800 font-medium">
                  {evaluation.content}
                </p>
              </div>
              
              <ActionControllers evalId={evaluation.id} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}