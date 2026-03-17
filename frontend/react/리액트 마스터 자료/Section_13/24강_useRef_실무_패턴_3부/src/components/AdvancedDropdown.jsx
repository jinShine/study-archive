import { useState, useEffect, useRef } from "react";

export default function AdvancedDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ padding: '100px', textAlign: 'center' }}>
      <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button onClick={() => setIsOpen(!isOpen)} style={{ padding: '10px 20px' }}>
          계정 설정 ⚙️
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute', top: '45px', left: '0', width: '180px',
            backgroundColor: 'white', border: '1px solid #ddd', padding: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'left'
          }}>
            <p style={{ margin: '5px 0', cursor: 'pointer' }}>개인 정보 관리</p>
            <p style={{ margin: '5px 0', cursor: 'pointer' }}>보안 설정</p>
            <hr />
            <p style={{ margin: '5px 0', cursor: 'pointer', color: 'red' }}>로그아웃</p>
          </div>
        )}
      </div>
    </div>
  );
}