import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type Logger = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  name?: string
) => StateCreator<T, Mps, Mcs>;

export const logger: Logger = (f, name) => (set, get, store) => {
  const loggedSet: typeof set = (...a) => {
    console.log(`%c[Zustand] ${name || 'Store'} 업데이트 시작`, 'color: #4CAF50; font-weight: bold;');
    console.log('이전 상태(Prev):', get());
    set(...a);
    console.log('다음 상태(Next):', get());
    console.log('%c업데이트 완료', 'color: #4CAF50; font-weight: bold;');
  };
  return f(loggedSet, get, store);
};