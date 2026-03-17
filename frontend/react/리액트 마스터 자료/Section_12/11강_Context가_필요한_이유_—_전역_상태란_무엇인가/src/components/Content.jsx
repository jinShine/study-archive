import { ProductPage } from './ProductPage';
export function Content({ user }) {
  return (<div style={{ border: '1px solid #64748b', padding: '10px', margin: '5px' }}><h5>Content (Pipe)</h5><ProductPage user={user} /></div>);
}