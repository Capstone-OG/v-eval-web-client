import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  Copy, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import paymentService from '../../services/paymentService';
import { monitorPayment } from '../../utils/paymentMonitor';
import { getPaymentStatusView } from '../../utils/paymentStatus';
import { toast } from '../../context/ToastContext';

export default function PayOsCheckoutModal({
  isOpen,
  onClose,
  paymentData, // { orderCode, checkoutUrl, amount, courseName, studentName, durationWeeks }
  onPaymentSuccess,
  onPaymentFailure,
  onNavigateRoadmap
}) {
  const [status, setStatus] = useState('PENDING'); // PENDING | SUCCESS | FAILED
  const [isChecking, setIsChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const callbacks = useRef({ onPaymentSuccess, onPaymentFailure });
  callbacks.current = { onPaymentSuccess, onPaymentFailure };
  const stopMonitor = useRef(null);
  const statusView = getPaymentStatusView(status);

  const checkPaymentStatusOnce = React.useCallback(async () => {
    if (!paymentData?.orderCode || status === 'SUCCESS') return;
    setIsChecking(true);
    try {
      const res = await paymentService.getPaymentStatus(paymentData.orderCode);
      if (res && (res.status === 'SUCCESS' || res.status === 'PAID')) {
        setStatus('SUCCESS');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        if (onPaymentSuccess) onPaymentSuccess(res);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra trạng thái thanh toán:', err);
    } finally {
      setIsChecking(false);
    }
  }, [paymentData?.orderCode, status, onPaymentSuccess]);

  useEffect(() => {
    if (!isOpen || !paymentData?.orderCode) return undefined;

    setStatus('PENDING');

    setConnectionError(false);
    const stop = monitorPayment({
      orderCode: paymentData.orderCode,
      getStatus: (orderCode) => paymentService.getPaymentStatus(orderCode),
      onSuccess: (payment) => {
        setStatus('SUCCESS'); setIsPolling(false);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        callbacks.current.onPaymentSuccess?.(payment);
      },
      onFailure: (payment) => {
        setStatus(payment.status); setIsPolling(false);
        callbacks.current.onPaymentFailure?.(payment);
      },
      onConnected: () => setConnectionError(false),
      onConnectionError: () => {
        setConnectionError(true);
        toast.warning('Chưa kiểm tra được trạng thái thanh toán do kết nối gián đoạn. Hệ thống sẽ tự thử lại.');
      }
    });
    stopMonitor.current = stop;
    return stop;
  }, [isOpen, paymentData?.orderCode]);

  if (!isOpen || !paymentData) return null;

  const handleCopyOrderCode = () => {
    navigator.clipboard.writeText(paymentData.orderCode.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateSuccess = () => {
    stopMonitor.current?.();
    setStatus('SUCCESS');
    setIsChecking(false);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
    if (onPaymentSuccess) {
      onPaymentSuccess({
        orderCode: paymentData.orderCode,
        status: 'SUCCESS',
        paidAt: new Date().toISOString()
      });
    }
  };

  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(paymentData.amount || 2500000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 border border-cyan-400/30 text-cyan-200 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>Cổng Thanh Toán Trực Tuyến PayOS (VietQR)</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Thanh Toán Học Phí Khóa Học
          </h2>
          <p className="text-xs text-blue-100/80 mt-1">
            Giao dịch mã hóa an toàn • Tự động kích hoạt lộ trình học tập PLAR tức thì
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {status === 'SUCCESS' ? (
            /* Success State */
            <div className="text-center py-6 space-y-4 animate-scale-up">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Thanh Toán Thành Công!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Học phí khóa học <strong className="text-slate-800">{paymentData.courseName}</strong> đã được xác nhận. Chu trình học tập thích ứng PLAR đã mở khóa Chặng 1 thành công!
                </p>
              </div>

              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Mã đơn PayOS:</span>
                  <span className="font-mono font-bold text-slate-900">#{paymentData.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Số tiền thanh toán:</span>
                  <span className="font-extrabold text-emerald-700">{formattedAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Học sinh thụ hưởng:</span>
                  <span className="font-bold text-slate-900">{paymentData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Trạng thái lộ trình:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ĐÃ KÍCH HOẠT (ACTIVE)</span>
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose?.();
                    onNavigateRoadmap?.();
                  }}
                  className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Bắt Đầu Lộ Trình Học P-L-A-R Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : ['failed', 'cancelled', 'expired'].includes(statusView.kind) ? (
            <div className="space-y-4 py-5 text-center">
              <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border ${statusView.tone}`}><AlertCircle className="h-9 w-9" /></div>
              <h3 className="text-xl font-extrabold text-slate-900">{statusView.title}</h3>
              <p className="text-xs leading-relaxed text-slate-500">Mã đơn #{paymentData.orderCode}. Bạn có thể quay lại trang học phí để chọn gói và tạo thanh toán mới.</p>
              <button type="button" onClick={onClose} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 cursor-pointer">Về trang học phí</button>
            </div>
          ) : (
            /* Pending / In-progress State */
            <>
              {/* Invoice Summary Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Khóa học đăng ký:</span>
                  <span className="font-extrabold text-slate-800 text-right">{paymentData.courseName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Thời lượng:</span>
                  <span className="font-bold text-slate-700">{paymentData.durationWeeks || 12} tuần học thích ứng</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Học sinh thụ hưởng:</span>
                  <span className="font-bold text-blue-600">{paymentData.studentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Mã đơn hàng:</span>
                  <button 
                    onClick={handleCopyOrderCode}
                    className="font-mono font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-800 cursor-pointer"
                  >
                    <span>#{paymentData.orderCode}</span>
                    <Copy className="w-3 h-3 text-slate-400" />
                    {copied && <span className="text-[10px] text-emerald-600">Đã chép!</span>}
                  </button>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-slate-700 font-bold">Tổng tiền học phí:</span>
                  <span className="text-lg font-black text-blue-600">{formattedAmount}</span>
                </div>
              </div>

              {/* VietQR / PayOS Action Area */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Quét Mã VietQR Hoặc Chuyển Hướng PayOS
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Hỗ trợ quét qua tất cả ứng dụng Ngân hàng (MB, VCB, ACB, VPB...) và Ví điện tử (MoMo, ZaloPay).
                  </p>
                </div>

                <div className="pt-1">
                  <a
                    href={paymentData.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Mở Cổng Thanh Toán PayOS (VietQR)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Real-time Status Listening Indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <span>{connectionError ? 'Kết nối gián đoạn, đang thử kiểm tra lại…' : 'Đang kiểm tra trạng thái thanh toán…'}</span>
                </div>
                <button
                  type="button"
                  disabled={isChecking}
                  onClick={checkPaymentStatusOnce}
                  className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 hover:border-blue-400 px-2.5 py-1 text-[11px] font-bold text-blue-700 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{isChecking ? 'Đang kiểm tra...' : 'Kiểm tra ngay'}</span>
                </button>
              </div>

              {/* Dev Simulation Option (Hidden in Production Builds) */}
              {import.meta.env.DEV && (
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={handleSimulateSuccess}
                    className="text-[11px] text-slate-400 hover:text-indigo-600 underline transition-colors cursor-pointer"
                  >
                    [Dev] Giả lập nhận Webhook PayOS thành công
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}

