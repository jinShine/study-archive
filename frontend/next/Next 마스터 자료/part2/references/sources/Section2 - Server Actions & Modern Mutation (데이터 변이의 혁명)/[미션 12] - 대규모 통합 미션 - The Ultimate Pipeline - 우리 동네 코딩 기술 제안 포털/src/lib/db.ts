export interface Proposal { id: string; title: string; votes: number; }
const globalForDb = globalThis as unknown as { __db: { proposals: Proposal[] } };
if (!globalForDb.__db) {
  globalForDb.__db = { proposals: [{ id: "PROP_1", title: "Next.js 15 기반 새로운 우리동네코딩 LMS 구축 제안", votes: 42 }] };
}
export const db = globalForDb.__db;