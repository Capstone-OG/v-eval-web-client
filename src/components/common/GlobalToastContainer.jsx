import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Individual Toast Card Item with Auto-dismiss Progress Bar & Hover Pause
 */
function ToastItem({ toast, onDismiss }) {
  const { id, type, title, message, duration } = toast;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);
  const timerRef = useRef(null);

  useEffect(() => {
    if (duration <= 0) return;

    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const totalDuration = remainingTimeRef.current;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, totalDuration - elapsed);
      const pct = (newRemaining / duration) * 100;
      setProgress(pct);

      if (newRemaining <= 0) {
        clearInterval(timerRef.current);
        onDismiss(id);
      }
    }, 25);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, duration, isPaused, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Color schemes and icons based on notification type
  const config = {
    success: {
      border: 'border-emerald-200/70',
      bg: 'bg-white/98 backdrop-blur-md',
      shadow: 'shadow-[0_8px_30px_-10px_rgba(15,23,42,0.18)]',
      iconBg: 'bg-emerald-100 text-emerald-600',
      titleColor: 'text-emerald-950',
      msgColor: 'text-emerald-800/90',
      barBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      icon: CheckCircle2
    },
    error: {
      border: 'border-rose-200/70',
      bg: 'bg-white/98 backdrop-blur-md',
      shadow: 'shadow-[0_8px_30px_-10px_rgba(15,23,42,0.18)]',
      iconBg: 'bg-rose-100 text-rose-600',
      titleColor: 'text-rose-950',
      msgColor: 'text-rose-800/90',
      barBg: 'bg-gradient-to-r from-rose-500 to-red-400',
      icon: AlertCircle
    },
    warning: {
      border: 'border-amber-200/70',
      bg: 'bg-white/98 backdrop-blur-md',
      shadow: 'shadow-[0_8px_30px_-10px_rgba(15,23,42,0.18)]',
      iconBg: 'bg-amber-100 text-amber-600',
      titleColor: 'text-amber-950',
      msgColor: 'text-amber-800/90',
      barBg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      icon: AlertTriangle
    },
    info: {
      border: 'border-indigo-200/70',
      bg: 'bg-white/98 backdrop-blur-md',
      shadow: 'shadow-[0_8px_30px_-10px_rgba(15,23,42,0.18)]',
      iconBg: 'bg-indigo-100 text-indigo-600',
      titleColor: 'text-indigo-950',
      msgColor: 'text-indigo-800/90',
      barBg: 'bg-gradient-to-r from-indigo-500 to-blue-400',
      icon: Info
    }
  }[type] || {
    border: 'border-slate-300',
    bg: 'bg-white/95',
    shadow: 'shadow-[0_8px_30px_-10px_rgba(15,23,42,0.18)]',
    iconBg: 'bg-slate-100 text-slate-600',
    titleColor: 'text-slate-900',
    msgColor: 'text-slate-700',
    barBg: 'bg-slate-500',
    icon: Info
  };

  const IconComponent = config.icon;

  // Split message by line breaks to render clean multi-line blocks
  const lines = String(message || '').split('\n').filter(Boolean);

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative w-fit max-w-full overflow-hidden rounded-xl border ${config.border} ${config.bg} ${config.shadow} px-3.5 py-3 transition-shadow duration-200`}
      style={{ animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
    >
      <div className="flex items-start gap-2.5">
        {/* Type Icon Badge */}
        <div className={`shrink-0 w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center shadow-2xs mt-0.5`}>
          <IconComponent className="w-4.5 h-4.5" />
        </div>

        {/* Content Body */}
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className={`text-[13px] font-bold tracking-tight ${config.titleColor} mb-0.5`}>
              {title}
            </h4>
          )}
          <div className={`text-[12px] ${config.msgColor} leading-5 break-words font-medium`}>
            {lines.length > 1 ? (
              <div className="space-y-1 mt-1">
                {lines.map((line, idx) => (
                  <p key={idx} className={line.startsWith('-') ? 'pl-2 text-[11px]' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p>{message}</p>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => onDismiss(id)}
          className="shrink-0 text-slate-400 hover:text-slate-700 -mr-1 -mt-1 p-1.5 rounded-full hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 transition-colors cursor-pointer"
          title="Đóng thông báo"
          aria-label="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Countdown Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-100/60 overflow-hidden">
          <div
            className={`h-full ${config.barBg} transition-all duration-75`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Global Toast Container: Positioned fixed top-right across all pages & modals
 */
export default function GlobalToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 sm:top-5 sm:right-5 z-[999999] flex flex-col items-end gap-2 pointer-events-none"
      style={{ width: 'min(340px, calc(100vw - 32px))' }}
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
