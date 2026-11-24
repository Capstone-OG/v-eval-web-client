import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { MathfieldElement } from 'mathlive';
import 'mathlive/fonts.css';

// Tắt audio sound files và dùng font đã bundle qua mathlive/fonts.css để tránh 404
try {
  MathfieldElement.soundsDirectory = null;
  MathfieldElement.fontsDirectory = null;
} catch {
  // ignore
}

/**
 * VisualMathField — Trình sửa công thức toán học WYSIWYG trực quan (MathLive <math-field>).
 * Gõ `2x^2` -> tự biến thành 2x², gõ `1/2` -> tự biến thành phân số, bấm trực tiếp lên ký tự/chỉ số để sửa.
 */
const VisualMathField = forwardRef(function VisualMathField(
  { value = '', onChange, onDone, autoFocus = true, className = '' },
  ref
) {
  const mfRef = useRef(null);
  const lastValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const onDoneRef = useRef(onDone);
  onChangeRef.current = onChange;
  onDoneRef.current = onDone;

  useImperativeHandle(ref, () => ({
    focus: () => mfRef.current?.focus?.(),
    insertLatex: (snippet) => {
      const mf = mfRef.current;
      if (!mf) return;
      mf.focus();
      try {
        mf.executeCommand(['insert', snippet, { focus: true, feedback: false }]);
      } catch {
        mf.value = `${mf.value || ''} ${snippet}`.trim();
      }
      const next = mf.value || '';
      lastValueRef.current = next;
      onChangeRef.current?.(next);
    }
  }));

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;

    // Cấu hình UX mượt mà, không bật bàn phím ảo che màn hình desktop
    try {
      mf.mathVirtualKeyboardPolicy = 'manual';
      mf.smartFence = true;
      mf.smartSuperscript = true;
      mf.removeExtraneousParentheses = true;
    } catch {
      // ignore
    }

    if (mf.value !== (value || '')) {
      mf.value = value || '';
      lastValueRef.current = value || '';
    }

    if (autoFocus) {
      requestAnimationFrame(() => {
        try {
          mf.focus();
          mf.executeCommand('moveToMathfieldEnd');
        } catch {
          // ignore
        }
      });
    }
  }, [autoFocus]);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return;
    const incoming = value || '';
    if (incoming !== lastValueRef.current && mf.value !== incoming) {
      mf.value = incoming;
      lastValueRef.current = incoming;
    }
  }, [value]);

  useEffect(() => {
    const mf = mfRef.current;
    if (!mf) return undefined;

    const handleInput = (evt) => {
      const next = evt.target?.value ?? mf.value ?? '';
      lastValueRef.current = next;
      onChangeRef.current?.(next);
    };

    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        evt.stopPropagation();
        try { window.mathVirtualKeyboard?.hide?.(); } catch { /* ignore */ }
        onDoneRef.current?.();
      } else if (evt.key === 'Enter' && !evt.shiftKey) {
        evt.preventDefault();
        evt.stopPropagation();
        try { window.mathVirtualKeyboard?.hide?.(); } catch { /* ignore */ }
        onDoneRef.current?.();
      }
    };

    mf.addEventListener('input', handleInput);
    mf.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      mf.removeEventListener('input', handleInput);
      mf.removeEventListener('keydown', handleKeyDown, { capture: true });
      try { window.mathVirtualKeyboard?.hide?.(); } catch { /* ignore */ }
    };
  }, []);

  return (
    <>
      <style>{`
        math-field::part(menu-toggle) {
          display: none !important;
        }
        math-field::part(virtual-keyboard-toggle) {
          color: #4F46E5;
          border-radius: 6px;
        }
        math-field::part(virtual-keyboard-toggle):hover {
          background: #EEF2FF;
        }
        :root, body {
          --keyboard-background: #F8FAFC;
          --keyboard-border: #CBD5E1;
          --keyboard-toolbar-background: #FFFFFF;
          --keyboard-toolbar-text: #475569;
          --keyboard-toolbar-text-active: #4F46E5;
          --keyboard-toolbar-background-hover: #EEF2FF;
          --keycap-background: #FFFFFF;
          --keycap-background-hover: #EEF2FF;
          --keycap-background-active: #E0E7FF;
          --keycap-border: #CBD5E1;
          --keycap-text: #0F172A;
          --keycap-secondary-text: #64748B;
          --keycap-shift-background: #EEF2FF;
          --keycap-action-background: #4F46E5;
          --keycap-action-text: #FFFFFF;
          --keycap-action-background-hover: #4338CA;
          --keyboard-accent-color: #4F46E5;
        }
      `}</style>
      <math-field
        ref={mfRef}
        class={className}
        style={{
          display: 'block',
          width: '100%',
          fontSize: '1.15rem',
          padding: '8px 12px',
          borderRadius: '10px',
          border: '1px solid #C7D2FE',
          background: '#FFFFFF',
          color: '#0F172A',
          outline: 'none',
          '--caret-color': '#4F46E5',
          '--selection-background-color': 'rgba(79, 70, 229, 0.16)',
          '--contains-highlight-background-color': 'rgba(79, 70, 229, 0.06)'
        }}
      />
    </>
  );
});

export default VisualMathField;
