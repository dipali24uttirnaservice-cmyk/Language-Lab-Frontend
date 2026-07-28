import { create } from "zustand";

export const usePopupStore = create((set) => ({
  isOpen: false,
  title: "",
  message: "",
  showPopup: (title, message) => set({ isOpen: true, title, message }),
  hidePopup: () => set({ isOpen: false, title: "", message: "" }),
}));