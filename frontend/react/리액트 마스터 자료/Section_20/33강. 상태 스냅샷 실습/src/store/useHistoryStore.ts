import { create } from 'zustand';

interface HistoryState {
  count: number;
  past: number[];
  future: number[];
  increment: () => void;
  undo: () => void;
  redo: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  count: 0,
  past: [],
  future: [],
  increment: () => set((state) => ({
    past: [...state.past, state.count].slice(-50),
    count: state.count + 1,
    future: [],
  })),
  undo: () => set((state) => {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, state.past.length - 1),
      count: previous,
      future: [state.count, ...state.future],
    };
  }),
  redo: () => set((state) => {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.count],
      count: next,
      future: state.future.slice(1),
    };
  }),
}));