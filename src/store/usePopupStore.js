import { create } from "zustand";

export const usePopupStore = create((set) => ({
  isOpen: false,
  title: "",
  message: "",
  sessionExpired: false,
  showPopup: (title, message, options = {}) =>
    set({ isOpen: true, title, message, sessionExpired: !!options.sessionExpired }),
  hidePopup: () => set({ isOpen: false, title: "", message: "", sessionExpired: false }),
}));