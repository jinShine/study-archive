export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (<div className="p-20 text-5xl font-black">ITEM: {slug}</div>);
}
