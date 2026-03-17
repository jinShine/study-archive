import React from 'react';
import type { DesignToken } from '../types/design';

interface ButtonProps {
  token: DesignToken;
  label: string;
}

export function DesignButton({ token, label }: ButtonProps) {
  return (
    <button style={{ padding: '10px 20px', margin: '10px', borderRadius: '6px', border: '1px solid #646cff', backgroundColor: token.startsWith('primary') ? '#646cff' : '#eee', color: token.startsWith('primary') ? 'white' : '#333' }}>
      {label} ({token})
    </button>
  );
}