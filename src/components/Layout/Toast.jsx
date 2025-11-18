import { useEffect, useState } from 'react';
import { create } from 'zustand';

// Toast store for managing notifications
export const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, 3000);
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),
}));

export default function Toast() {
  const { toasts, removeToast } = useToastStore();

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'border-neon-green text-neon-green shadow-neon-green';
      case 'error':
        return 'border-neon-red text-neon-red shadow-neon-red';
      case 'warning':
        return 'border-neon-yellow text-neon-yellow';
      default:
        return 'border-neon-cyan text-neon-cyan shadow-neon-cyan';
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            bg-black border-2 rounded px-4 py-3 min-w-[250px] 
            flex items-center justify-center
            animate-slide-in-bottom
            ${getToastStyles(toast.type)}
          `}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
