import React, { useState, useEffect } from 'react';
import { Flag, X, AlertTriangle, RefreshCw } from 'lucide-react';
import { FLAG_REASONS } from '../../utils/questionFlagStore';

export default function FlagQuestionModal({
  isOpen,
  onClose,
  onConfirm,
  questionPreview = '',
  busy = false
}) {
  const [reasonCode, setReasonCode] = useState('WRONG_DOMAIN');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReasonCode('WRONG_DOMAIN');
      setNote('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-rose-50/70 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-rose-900">
            <Flag className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-black">Báo Lỗi Câu Hỏi &amp; Đổi Câu Khác</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {questionPreview && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 line-clamp-2">
              {questionPreview}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 block">
              Chọn vấn đề bạn gặp phải:
            </label>
            <div className="space-y-1.5">
              {FLAG_REASONS.map((r) => (
                <label
                  key={r.code}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    reasonCode === r.code
                      ? 'bg-rose-50 border-rose-400 text-rose-950'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="flag-reason"
                    checked={reasonCode === r.code}
                    onChange={() => setReasonCode(r.code)}
                    className="accent-rose-600"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">
              Ghi chú thêm cho Giảng viên / Ban quản lý (không bắt buộc):
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Đang học Toán Tổ hợp nhưng câu này thuộc môn Ngữ văn..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-rose-400"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Ngay sau khi gửi, câu hỏi này sẽ được chuyển tới <strong>Giảng viên / Ban quản lý</strong> xét duyệt lại miền kiến thức và tự động đổi sang câu hỏi mới cho bạn.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onConfirm({ reasonCode, note })}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
              <span>{busy ? 'Đang đổi câu mới...' : 'Gửi Báo Lỗi & Đổi Câu Mới'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
