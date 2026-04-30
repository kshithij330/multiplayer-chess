// client/src/components/UI/Toast.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, createContext, useContext, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`pointer-events-auto px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl border text-sm font-medium cursor-pointer ${
                toast.type === "error"
                  ? "bg-red-500/20 border-red-500/30 text-red-300"
                  : toast.type === "success"
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                  : toast.type === "warning"
                  ? "bg-amber-500/20 border-amber-500/30 text-amber-300"
                  : "bg-blue-500/20 border-blue-500/30 text-blue-300"
              }`}
              onClick={() => removeToast(toast.id)}
            >
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
