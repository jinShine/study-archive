export default async function Page({ params }: { params: Promise<{ category: string, itemId: string }> }) {
  const { category, itemId } = await params;
  return (<div className="p-20">Category: {category} / Item: {itemId}</div>);
}
