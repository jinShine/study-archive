import { useContext, useState } from "react"; import { CenterContext } from "../contexts/CenterContext";
export function LostAndFoundDesk() {
  const { lostItems, reportLost, claimItem } = useContext(CenterContext);
  const [text, setText] = useState("");
  return (
    <div>
      <h2>📦 분실물 센터</h2>
      <ul>{lostItems.map(i => <li key={i}>{i} <button onClick={() => claimItem(i)}>찾음</button></li>)}</ul>
      <input value={text} onChange={e => setText(e.target.value)} /><button onClick={() => { reportLost(text); setText(""); }}>신고</button>
    </div>
  );
}