/* [File Path]: src/components/CustomButton.tsx
   [Copyright]: © nhcodingstudio 소유 */
import React from 'react';

interface CustomButtonProps extends Omit<React.ComponentPropsWithRef<'button'>, 'color'> {
  customColor: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function CustomButton({ customColor, children, style, ...rest }: CustomButtonProps) {
  const buttonStyle: React.CSSProperties = {
    backgroundColor: customColor === 'primary' ? '#646cff' : '#2f3640',
    color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer', ...style
  };
  return <button style={buttonStyle} {...rest}>{children}</button>;
}
