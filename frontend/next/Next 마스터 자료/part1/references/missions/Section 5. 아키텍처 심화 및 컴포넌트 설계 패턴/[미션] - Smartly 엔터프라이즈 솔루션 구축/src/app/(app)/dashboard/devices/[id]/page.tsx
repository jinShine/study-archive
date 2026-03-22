import PowerToggle from '../toggle-button';
export default async function DetailPage({ params }: any) {
  const { id } = await params;
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-4xl font-black mb-10 text-slate-800">Control: {id}</h1>
      <PowerToggle name={id} />
    </div>
  );
}
