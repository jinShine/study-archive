import GoalCounter from './_components/GoalCounter';
import BookmarkButton from './_components/BookmarkButton';

export default function Page() {
  const subjects = ['민법 (총칙)', '행정법', '행정학개론'];
  return (
    <div>
      <h1 className="text-4xl font-black mb-8">학습 대시보드</h1>
      <GoalCounter />
      <div className="grid grid-cols-2 gap-6">
        {subjects.map(sub => (
          <div key={sub} className="p-6 bg-white rounded-xl shadow border">
            <h3 className="text-xl font-black mb-4">{sub}</h3>
            <BookmarkButton />
          </div>
        ))}
      </div>
    </div>
  );
}
