import React from 'react';

/**
 * PrimaryButtonProps
 * 1. React.ComponentPropsWithoutRef<'button'>: 표준 버튼의 모든 속성을 가져옵니다.
 * 2. extends: 여기에 variant와 isLoading이라는 우리만의 속성을 추가합니다.
 */
interface PrimaryButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  variant: 'solid' | 'outline';
  isLoading?: boolean;
}

export function PrimaryButton({ 
  variant, 
  isLoading, 
  children, 
  ...props 
}: PrimaryButtonProps) {
  return (
    <button 
      disabled={isLoading} 
      {...props} 
      style={{ 
        padding: '8px 16px', 
        borderRadius: '4px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        backgroundColor: variant === 'solid' ? '#646cff' : 'transparent',
        color: variant === 'solid' ? 'white' : '#646cff',
        border: '1px solid #646cff',
        opacity: isLoading ? 0.7 : 1
      }}
    >
      {isLoading ? "Processing..." : children}
    </button>
  );
}