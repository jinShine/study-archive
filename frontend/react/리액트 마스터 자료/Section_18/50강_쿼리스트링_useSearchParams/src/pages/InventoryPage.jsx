import { useSearchParams } from 'react-router';
export default function InventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const handleFilter = (type) => { setSearchParams({ category: type }); };
  const btn = (type, label) => (
    <button onClick={() => handleFilter(type)} style={{
      padding: '8px 16px', margin: '5px', borderRadius: '8px',
      backgroundColor: category === type ? 'blue' : 'gray', color: 'white'
    }}>{label}</button>
  );
  return (
    <div style={{ padding: '20px' }}>
      <h2>Inventory Filter</h2>
      {btn('all', '전체')} {btn('electronics', '전자')} {btn('furniture', '가구')}
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc' }}>
        Current Filter: <b>{category.toUpperCase()}</b>
      </div>
    </div>
  );
}