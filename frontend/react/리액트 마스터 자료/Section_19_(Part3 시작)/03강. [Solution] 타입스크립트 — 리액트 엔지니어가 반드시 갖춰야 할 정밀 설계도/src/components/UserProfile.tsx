/* [File Path]: src/components/UserProfile.tsx
   [Copyright]: © nhcodingstudio
   [Test Process]: import type을 사용해 설계도를 가져와 UI를 렌더링합니다. */
import React from 'react';
import type { User } from '../types/user';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div style={{ padding: '20px', border: '2px solid #646cff', borderRadius: '12px', backgroundColor: '#f9f9f9', marginTop: '1rem' }}>
      <h3 style={{ margin: 0, color: '#333' }}>👤 엔지니어 프로필</h3>
      <p style={{ fontSize: '1.2rem' }}>성함: <strong>{user.displayName.toUpperCase()}</strong></p>
      <small style={{ color: '#666' }}>ID Tag: {user.id}</small>
    </div>
  );
}
