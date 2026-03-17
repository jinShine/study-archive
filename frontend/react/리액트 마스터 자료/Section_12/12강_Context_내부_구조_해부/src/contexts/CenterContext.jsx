import { createContext, useState } from "react";
export const NoticeContext = createContext("현재 등록된 공지사항이 없습니다.");
export const CenterContext = createContext();
export function CenterProvider({ children }) {
  const [lostItems, setLostItems] = useState(["지갑", "에어팟"]);
  const reportLost = (item) => setLostItems((prev) => [...prev, item]);
  const claimItem = (item) => setLostItems((prev) => prev.filter((i) => i !== item));
  return <CenterContext.Provider value={{ lostItems, reportLost, claimItem }}>{children}</CenterContext.Provider>;
}