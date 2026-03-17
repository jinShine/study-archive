import React, { useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
}

export function ProfileEditor() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "홍길동",
    email: "test@nh.com",
    bio: "TS Master"
  });

  const handleUpdate = (changes: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...changes }));
  };

  return (
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f4f4f4', borderRadius: '12px' }}>
      <p>Current: {profile.name}</p>
      <button onClick={() => handleUpdate({ name: "React Expert" })}>Change Name</button>
    </div>
  );
}