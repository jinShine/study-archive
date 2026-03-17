import { ProductList } from './ProductList';
export function ProductLayout({ user }) {
  return (<div style={{ border: '1px solid #cbd5e1', padding: '10px', margin: '5px' }}><h5>ProductLayout (Pipe)</h5><ProductList user={user} /></div>);
}