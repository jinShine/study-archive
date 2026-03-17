/* [File Path]: src/components/StatusDisplay.tsx
   [Copyright]: © nhcodingstudio 소유 */
import React from 'react';

type FetchStatus =
  | { state: 'loading' }
  | { state: 'success'; data: string }
  | { state: 'error'; error: Error };

export function StatusDisplay({ status }: { status: FetchStatus }) {
  if (status.state === 'success') return <div style={{ color: 'green' }}>✅ {status.data}</div>;
  if (status.state === 'error') return <div style={{ color: 'red' }}>❌ {status.error.message}</div>;
  return <div>⏳ 로딩 중...</div>;
}
