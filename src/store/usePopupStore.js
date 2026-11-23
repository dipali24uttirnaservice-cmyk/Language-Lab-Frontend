import { create } from "zustand";

export const usePopupStore = create((set) => ({
  isOpen: false,
  title: "",
  message: "",
  sessionExpired: false,
  options: {}, // <-- Add options to state
  
  showPopup: (title, message, options = {}) =>
    set({ 
      isOpen: true, 
      title, 
      message, 
      sessionExpired: !!options.sessionExpired,
      options // <-- Save options in state
    }),
    
  hidePopup: () => 
    set({ 
      isOpen: false, 
      title: "", 
      message: "", 
      sessionExpired: false, 
      options: {} // <-- Reset options
    }),
}));