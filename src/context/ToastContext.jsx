import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import GlobalToastContainer from '../components/common/GlobalToastContainer';

const ToastContext = createContext(null);

// Global event bus for non-React callers & singleton API
const listeners = new Set();
let toastIdCounter = 0;

/**
 * Universal Toast Singleton
 * Can be imported and used anywhere in the app:
 * toast.success('Nội dung'), toast.error('Lỗi'), toast.warning('Cảnh báo'), toast.info('Thông tin')
 */
export const toast = {
  show: (options) => {
    listeners.forEach(fn => fn(options));
  },
  success: (message, titleOrOpts = {}) => {
    const opts = typeof titleOrOpts === 'string' ? { title: titleOrOpts } : titleOrOpts;
    toast.show({ type: 'success', message, title: opts.title || 'Thành công', ...opts });
  },
  error: (message, titleOrOpts = {}) => {
    const opts = typeof titleOrOpts === 'string' ? { title: titleOrOpts } : titleOrOpts;
    toast.show({ type: 'error', message, title: opts.title || 'Đã có lỗi xảy ra', duration: 6500, ...opts });
  },
  warning: (message, titleOrOpts = {}) => {
    const opts = typeof titleOrOpts === 'string' ? { title: titleOrOpts } : titleOrOpts;
    toast.show({ type: 'warning', message, title: opts.title || 'Lưu ý', duration: 5000, ...opts });
  },
  info: (message, titleOrOpts = {}) => {
    const opts = typeof titleOrOpts === 'string' ? { title: titleOrOpts } : titleOrOpts;
    toast.show({ type: 'info', message, title: opts.title || 'Thông báo', ...opts });
  },
  dismiss: (id) => {
    listeners.forEach(fn => fn({ action: 'dismiss', id }));
  }
};

/**
 * ToastProvider: Root provider wrapping the application
 * Automatically intercepts legacy browser window.alert calls into modern toasts
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((payload) => {
    if (payload.action === 'dismiss') {
      setToasts(prev => prev.filter(t => t.id !== payload.id));
      return;
    }

    const id = `toast_${Date.now()}_${++toastIdCounter}`;
    const newToast = {
      id,
      type: payload.type || 'info',
      title: payload.title || (
        payload.type === 'success' ? 'Thành công' :
        payload.type === 'error' ? 'Lỗi thao tác' :
        payload.type === 'warning' ? 'Cảnh báo' : 'Thông báo'
      ),
      message: payload.message || '',
      duration: payload.duration ?? (payload.type === 'error' ? 6500 : payload.type === 'warning' ? 5000 : 4000),
      createdAt: Date.now()
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5));
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  // Intercept window.alert so no unhandled alert() ever disrupts the user experience
  useEffect(() => {
    const originalAlert = window.alert;
    
    window.alert = (msg) => {
      if (!msg) return;
      const str = String(msg);
      const lower = str.toLowerCase();
      if (lower.includes('thành công') || lower.includes('hoàn tất') || lower.includes('imported')) {
        toast.success(str);
      } else if (lower.includes('lỗi') || lower.includes('không thể') || lower.includes('thất bại') || lower.includes('error')) {
        toast.error(str);
      } else if (lower.includes('vui lòng') || lower.includes('cảnh báo') || lower.includes('chú ý')) {
        toast.warning(str);
      } else {
        toast.info(str);
      }
    };

    window.toast = toast;
    window.showToast = (msg, type = 'info') => {
      if (type === 'success') toast.success(msg);
      else if (type === 'error') toast.error(msg);
      else if (type === 'warning') toast.warning(msg);
      else toast.info(msg);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismissToast }}>
      {children}
      <GlobalToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

/**
 * Custom Hook for components to access toast helpers
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { toast, toasts: [], dismissToast: toast.dismiss };
  }
  return ctx;
}
