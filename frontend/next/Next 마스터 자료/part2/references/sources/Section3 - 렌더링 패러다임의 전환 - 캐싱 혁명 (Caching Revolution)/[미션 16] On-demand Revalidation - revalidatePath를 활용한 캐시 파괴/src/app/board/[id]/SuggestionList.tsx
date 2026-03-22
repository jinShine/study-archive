'use cache';
import { getSuggestions, deleteSuggestionAction } from '@/app/actions';

export default async function SuggestionList({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const resolvedParams = await paramsPromise;
  const boardId = resolvedParams.id;

  const suggestions = await getSuggestions(boardId);

  return (
    <ul className="space-y-4">
      {suggestions.map(suggestion => (
        <li key={suggestion.id} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200 flex justify-between items-start transition-all hover:shadow-md">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-2 bg-slate-100 inline-block px-2 py-1 rounded">
              작성자: {suggestion.author}
            </p>
            <p className="text-slate-800 font-medium text-lg">
              {suggestion.content}
            </p>
          </div>

          <form action={deleteSuggestionAction.bind(null, suggestion.id, boardId)}>
            <button type="submit" className="ml-4 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer active:scale-95 border border-red-200 hover:border-red-500">
              🗑️ 스팸 삭제
            </button>
          </form>
        </li>
      ))}

      {suggestions.length === 0 && (
        <div className="p-10 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-100">
          🎉 모든 건의사항이 처리되었습니다. 완벽하군요!
        </div>
      )}
    </ul>
  );
}