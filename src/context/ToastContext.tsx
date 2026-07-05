import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | '';

interface ToastState {
  message: string;
  type: ToastType;
  show: boolean;
}

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({ message: '', type: '', show: false });
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, type: ToastType = '') => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setState({ message, type, show: true });
    timerRef.current = window.setTimeout(() => {
      setState((s) => ({ ...s, show: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast${state.show ? ' show' : ''}${state.type ? ' ' + state.type : ''}`}>
        {state.message}
      </div>
    </ToastContext.Provider>
  );
}
