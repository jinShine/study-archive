\'use client\';
import { createContext, useContext, useState } from 'react';
import { createStore, useStore } from 'zustand';
const GalleryContext = createContext<any>(null);
export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(() => createStore((set) => ({
    likedPhotos: [],
    toggleLike: (id: number) => set((state: any) => ({
      likedPhotos: state.likedPhotos.includes(id) ? state.likedPhotos.filter((p: number) => p !== id) : [...state.likedPhotos, id]
    })),
  })));
  return <GalleryContext.Provider value={store}>{children}</GalleryContext.Provider>;
}
export function useGalleryStore(selector: any) {
  const context = useContext(GalleryContext);
  return useStore(context, selector);
}