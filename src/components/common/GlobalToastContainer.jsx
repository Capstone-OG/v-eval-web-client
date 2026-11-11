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
      border: 'border-emerald-300/80',
      bg: 'bg-white/95 backdrop-blur-md',
      shadow: 'shadow-lg shadow-emerald-500/10',
      iconBg: 'bg-emerald-100 text-emerald-600',
      titleColor: 'text-emerald-950',
      msgColor: 'text-emerald-800/90',
      barBg: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      icon: CheckCircle2
    },
    error: {
      border: 'border-rose-300/80',
      bg: 'bg-white/95 backdrop-blur-md',
      shadow: 'shadow-lg shadow-rose-500/10',
      iconBg: 'bg-rose-100 text-rose-600',
      titleColor: 'text-rose-950',
      msgColor: 'text-rose-800/90',
      barBg: 'bg-gradient-to-r from-rose-500 to-red-400',
      icon: AlertCircle
    },
    warning: {
      border: 'border-amber-300/80',
      bg: 'bg-white/95 backdrop-blur-md',
      shadow: 'shadow-lg shadow-amber-500/10',
      iconBg: 'bg-amber-100 text-amber-600',
      titleColor: 'text-amber-950',
      msgColor: 'text-amber-800/90',
      barBg: 'bg-gradient-to-r from-amber-500 to-yellow-400',
      icon: AlertTriangle
    },
    info: {
      border: 'border-indigo-300/80',
      bg: 'bg-white/95 backdrop-blur-md',
      shadow: 'shadow-lg shadow-indigo-500/10',
      iconBg: 'bg-indigo-100 text-indigo-600',
      titleColor: 'text-indigo-950',
      msgColor: 'text-indigo-800/90',
      barBg: 'bg-gradient-to-r from-indigo-500 to-blue-400',
      icon: Info
    }
  }[type] || {
    border: 'border-slate-300',
    bg: 'bg-white/95',
    shadow: 'shadow-lg shadow-slate-500/10',
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${config.border} ${config.bg} ${config.shadow} p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
      style={{ animation: 'slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon Badge */}
        <div className={`shrink-0 w-8 h-8 rounded-xl ${config.iconBg} flex items-center justify-center shadow-2xs mt-0.5`}>
          <IconComponent className="w-4.5 h-4.5" />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-2">
          {title && (
            <h4 className={`text-xs font-black tracking-tight ${config.titleColor} mb-0.5`}>
              {title}
            </h4>
          )}
          <div className={`text-xs ${config.msgColor} leading-relaxed break-words font-medium`}>
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
          className="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer"
          title="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Countdown Progress Bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/60 overflow-hidden">
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
      aria-live="polite"
      className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[999999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
