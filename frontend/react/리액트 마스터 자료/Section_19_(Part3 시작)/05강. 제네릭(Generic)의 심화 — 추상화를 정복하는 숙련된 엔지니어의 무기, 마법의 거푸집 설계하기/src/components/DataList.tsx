/* [File Path]: src/components/DataList.tsx
   [Copyright]: © nhcodingstudio 소유 */
import React from 'react';

interface DataListProps<T extends { id: string | number }> {
  items: T[];
  renderRow: (item: T) => React.ReactNode;
}

export function DataList<T extends { id: string | number }>({ items, renderRow }: DataListProps<T>) {
  return (
    <div style={{ border: '1px solid #e1e4e8', borderRadius: '8px', overflow: 'hidden', marginTop: '20px', backgroundColor: '#fff' }}>
      {items.map((item) => (
        <div key={item.id} style={{ padding: '12px 20px', borderBottom: '1px solid #eee' }}>
          {renderRow(item)}
        </div>
      ))}
    </div>
  );
}
