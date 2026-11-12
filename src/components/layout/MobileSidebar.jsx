import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function MobileSidebar({ onClose, ...props }) {
  const drawer = useRef(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawer.current?.querySelector('button')?.focus();
    const keys = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab') return;
      const items = [...drawer.current.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')];
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const desktop = window.matchMedia('(min-width: 1024px)');
    const resize = () => { if (desktop.matches) onClose(); };
    document.addEventListener('keydown', keys);
    desktop.addEventListener('change', resize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', keys);
      desktop.removeEventListener('change', resize);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return <div className="fixed inset-0 z-[70] lg:hidden">
    <button type="button" aria-label="Đóng menu điều hướng" onClick={onClose} className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" tabIndex={-1} />
    <div ref={drawer} role="dialog" aria-modal="true" aria-label="Điều hướng chính"
      className="absolute inset-y-0 left-0 w-72 max-w-[calc(100vw-3rem)] overflow-y-auto bg-white shadow-2xl">
      <button type="button" onClick={onClose} aria-label="Đóng menu" className="absolute right-3 top-3 z-10 rounded-xl bg-white p-2 text-slate-500"><X className="h-5 w-5" /></button>
      <Sidebar {...props} mobile onNavigate={onClose} />
    </div>
  </div>;
}
