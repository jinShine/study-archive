import { useLoaderData } from 'react-router';
export const inventoryLoader = async () => { return [{id: 1, name: 'Secure Data'}]; };
export default function InventoryPage() {
  const data = useLoaderData();
  return <div><h1>Inventory</h1>{JSON.stringify(data)}</div>;
}