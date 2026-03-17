/* [File Path]: src/components/InputField.tsx
   [Copyright]: © nhcodingstudio 소유 */
import React, { useState } from 'react';

export function InputField() {
  const [text, setText] = useState<string>("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value);

  return (
    <div style={{ margin: '20px 0' }}>
      <input type="text" value={text} onChange={handleChange} style={{ padding: '10px' }} />
      <p>실시간 검증: {text}</p>
    </div>
  );
}
