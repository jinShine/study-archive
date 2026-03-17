import { useLoaderData } from 'react-router';
export const inventoryLoader = async () => {
  const response = await fetch('https://api.sampleapis.com/coffee/hot');
  if (!response.ok) throw new Error("Fetch failed");
  return response.json();
};
export default function InventoryPage() {
  const products = useLoaderData();
  return (
    <div>
      <h1>Real-time Inventory</h1>
      <ul>{products.slice(0, 5).map(p => <li key={p.id}>{p.title}</li>)}</ul>
    </div>
  );
}