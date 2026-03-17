/* [Copyright]: © nhcodingstudio 소유 */
import React, { useId, useRef } from 'react';

interface CustomInputProps {
  label: string;
  externalRef?: React.RefObject<HTMLInputElement>;
}

export function CustomInput({ label, externalRef }: CustomInputProps) {
  const generatedId = useId();
  const internalRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <label htmlFor={generatedId}>{label}</label>
      {/* 🚨 아래 라인에서 까다로운 타입 충돌이 발생합니다. */}
      <input
        id={generatedId}
        ref={externalRef || internalRef} 
        type="text"
      />
    </div>
  );
}