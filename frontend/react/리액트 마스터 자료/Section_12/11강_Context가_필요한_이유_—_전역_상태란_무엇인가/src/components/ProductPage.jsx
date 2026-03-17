import { ProductLayout } from './ProductLayout';
export function ProductPage({ user }) {
  return (<div style={{ border: '1px solid #94a3b8', padding: '10px', margin: '5px' }}><h5>ProductPage (Pipe)</h5><ProductLayout user={user} /></div>);
}