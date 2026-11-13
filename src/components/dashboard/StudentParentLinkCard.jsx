import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  QrCode,
  Link2,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  X,
  KeyRound,
  BellRing
} from 'lucide-react';
import { userService } from '../../services/userService';
import { toast } from '../../context/ToastContext';

export default function StudentParentLinkCard({ currentUser }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  const studentId = currentUser?.id || currentUser?.userId;

  const fetchOverview = useCallback(
    async (regeneratePin = false) => {
      if (!studentId) return;
      setLoading(true);
      try {
        const data = await userService.getStudentParentLinkOverview({
          studentId,
          regeneratePin
        });
        setOverview(data);
      } catch (err) {
        console.warn('[StudentParentLinkCard] Error loading overview:', err);
      } finally {
        setLoading(false);
      }
    },
    [studentId]
  );

  useEffect(() => {
    fetchOverview(false);
  }, [fetchOverview]);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Đã sao chép vào bộ nhớ tạm!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRespondRequest = async (requestId, approve) => {
    setRespondingId(requestId);
    try {
      const res = await userService.respondParentLinkRequest({
        requestId,
        approve,
        studentId
      });
      toast.success(
        res?.message ||
          (approve
            ? 'Đã xác nhận liên kết với Phụ huynh thành công!'
            : 'Đã từ chối yêu cầu liên kết.')
      );
      await fetchOverview(false);
    } catch (err) {
      toast.error(err.message || 'Không thể xử lý yêu cầu liên kết.');
    } finally {
      setRespondingId(null);
    }
  };

  const accountCode =
    overview?.studentAccountCode ||
    (studentId ? `VE-${String(studentId).replace(/-/g, '').slice(0, 6).toUpperCase()}` : 'VE-STUDENT');
  const pinCode = overview?.activePinCode || '------';
  const shareUrl = `${window.location.origin}/?parentLinkCode=${encodeURIComponent(
    pinCode !== '------' ? pinCode : accountCode
  )}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    shareUrl
  )}`;

  const pendingRequests = overview?.pendingRequests || [];
  const linkedParents = overview?.linkedParents || [];

  return (
    <div className="@container flex min-w-0 flex-col gap-3">
      {/* 1. Banner thông báo nổi bật nếu có Phụ huynh vừa gửi yêu cầu liên kết */}
      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-md animate-fade">
          <div className="flex flex-col @[32rem]:flex-row @[32rem]:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                    Yêu Cầu Liên Kết Phụ Huynh ({pendingRequests.length})
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    Xác nhận 2 chiều trực tiếp trên Web
                  </span>
                </div>
                {pendingRequests.map((req) => (
                  <div
                    key={req.requestId}
                    className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/90 border border-amber-200 rounded-2xl p-3"
                  >
                    <div>
                      <div className="text-sm font-black text-slate-900">
                        Phụ huynh: {req.parentName}{' '}
                        <span className="text-xs font-semibold text-slate-500">
                          ({req.parentEmail})
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                        <span>SĐT: {req.parentPhone || 'Chưa cập nhật'}</span>
                        <span>•</span>
                        <span>
                          Mã xác nhận của yêu cầu:{' '}
                          <strong className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {req.verificationCode}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={respondingId === req.requestId}
                        onClick={() => handleRespondRequest(req.requestId, true)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Chấp Nhận Liên Kết</span>
                      </button>
                      <button
                        type="button"
                        disabled={respondingId === req.requestId}
                        onClick={() => handleRespondRequest(req.requestId, false)}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer disabled:opacity-60"
                      >
                        Từ chối
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Thanh thẻ gọn trên Cổng Học Viên để mở Mã Liên Kết / Link / QR */}
      <div className="flex flex-1 flex-col justify-between gap-4 rounded-[28px] border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/70 p-5 shadow-sm">
        <div className="flex min-w-0 items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span>Liên kết tài khoản phụ huynh</span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-xs sm:text-sm font-bold tracking-wide">
                {accountCode}
              </span>
              {linkedParents.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  ✓ Đã liên kết {linkedParents.length} phụ huynh
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-slate-500 leading-5">
              Chia sẻ mã liên kết hoặc mã QR để phụ huynh theo dõi tiến độ và đóng học phí.
            </p>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleCopy(accountCode, 'quickCode')}
            className="px-2 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            {copiedField === 'quickCode' ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{copiedField === 'quickCode' ? 'Đã sao chép' : 'Sao chép mã'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsModalOpen(true);
              fetchOverview(false);
            }}
            title="Mở mã PIN, đường liên kết và mã QR"
            className="px-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Mở QR & PIN</span>
          </button>
        </div>
      </div>

      {/* 3. Modal chi tiết 3 phương thức Liên kết Phụ huynh (Code + Link + QR + Xác nhận) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-slate-900 space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Liên Kết Tài Khoản Phụ Huynh Đồng Hành
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Phụ huynh có thể dùng 1 trong 3 cách dưới đây để kết nối với tài khoản của bạn
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Cột trái: Mã Tài Khoản, Mã PIN 6 số & Đường liên kết */}
              <div className="md:col-span-7 space-y-4">
                {/* Cách 1: Mã tài khoản & Mã PIN 6 số */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Cách 1: Nhập Mã Tài Khoản hoặc Mã PIN 6 Số</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => fetchOverview(true)}
                      disabled={loading}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>Đổi PIN mới</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Mã học sinh cố định
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-mono text-base font-black text-slate-900">
                          {accountCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(accountCode, 'accCode')}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          {copiedField === 'accCode' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                      <div className="text-[10px] font-bold text-blue-600 uppercase">
                        Mã PIN 6 số (30 phút)
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="font-mono text-base font-black text-blue-900 tracking-wider">
                          {pinCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(pinCode, 'pinCode')}
                          className="p-1.5 rounded-lg bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
                        >
                          {copiedField === 'pinCode' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cách 2: Đường liên kết mời 1-Click */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Cách 2: Gửi Đường Liên Kết Mời 1-Click</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Sao chép đường liên kết dưới đây gửi qua Zalo/Messenger cho Phụ huynh:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(shareUrl, 'shareUrl')}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedField === 'shareUrl' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy Link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Cột phải: Mã QR */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b from-blue-50/70 to-indigo-50/50 border border-blue-200/80 text-center space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-blue-800">
                  Cách 3: Quét Mã QR Liên Kết
                </div>
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                  <img
                    src={qrImageUrl}
                    alt="Mã QR liên kết Phụ huynh"
                    className="w-40 h-40 object-contain mx-auto"
                  />
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Phụ huynh dùng Camera hoặc Zalo quét mã QR này để tự động mở trang xác nhận liên kết.
                </p>
              </div>
            </div>

            {/* Danh sách Phụ huynh đã liên kết */}
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Phụ huynh đang đồng hành ({linkedParents.length})</span>
              </div>
              {linkedParents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  Chưa có tài khoản phụ huynh nào được liên kết.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {linkedParents.map((p) => (
                    <div
                      key={p.parentId}
                      className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{p.fullName}</div>
                        <div className="text-[11px] text-slate-500">{p.email}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Đã liên kết
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
