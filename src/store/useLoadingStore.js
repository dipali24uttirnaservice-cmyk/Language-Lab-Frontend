import { create } from 'zustand';

export const useLoadingStore = create((set) => ({
  isLoading: false,
  activeRequests: 0,
  startLoading: () => set((state) => {
    const active = state.activeRequests + 1;
    return { activeRequests: active, isLoading: true };
  }),
  stopLoading: () => set((state) => {
    const active = Math.max(0, state.activeRequests - 1);
    return { activeRequests: active, isLoading: active > 0 };
  }),
}));