export function getPaymentStatusView(status) {
  const value = String(status || '').trim().toUpperCase();
  if (['SUCCESS', 'PAID'].includes(value)) return { kind: 'success', label: 'Đã hoàn tất', title: 'Thanh toán thành công', success: true, tone: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconTone: 'bg-emerald-600' };
  if (['FAILED', 'FAILURE'].includes(value)) return { kind: 'failed', label: 'Thất bại', title: 'Thanh toán không thành công', success: false, tone: 'bg-rose-50 text-rose-700 border-rose-200', iconTone: 'bg-rose-600' };
  if (['CANCELLED', 'CANCELED'].includes(value)) return { kind: 'cancelled', label: 'Đã hủy', title: 'Giao dịch đã hủy', success: false, tone: 'bg-slate-50 text-slate-600 border-slate-200', iconTone: 'bg-slate-500' };
  if (value === 'EXPIRED') return { kind: 'expired', label: 'Hết hạn', title: 'Giao dịch đã hết hạn', success: false, tone: 'bg-slate-50 text-slate-600 border-slate-200', iconTone: 'bg-slate-500' };
  if (['PENDING', 'PROCESSING'].includes(value)) return { kind: 'pending', label: 'Chờ xử lý', title: 'Đang chờ xác nhận thanh toán', success: false, tone: 'bg-amber-50 text-amber-700 border-amber-200', iconTone: 'bg-amber-500' };
  return { kind: 'unknown', label: 'Chưa xác định', title: 'Chưa xác định trạng thái giao dịch', success: false, tone: 'bg-slate-50 text-slate-600 border-slate-200', iconTone: 'bg-slate-500' };
}

export async function refreshPendingPayments(items, getStatus, studentId) {
  return Promise.all(items.map(async (payment) => {
    if (!payment.orderCode || !['pending', 'unknown'].includes(getPaymentStatusView(payment.status).kind)) return payment;
    try {
      const latest = await getStatus(payment.orderCode);
      if (String(latest?.orderCode) !== String(payment.orderCode)
        || (latest.studentId && latest.studentId !== studentId)
        || (payment.paymentId && latest.paymentId !== payment.paymentId)
        || getPaymentStatusView(latest.status).kind === 'unknown') return payment;
      return { ...payment, status: latest.status, paidAt: latest.paidAt ?? payment.paidAt,
        counterAccountBankName: latest.counterAccountBankName || payment.counterAccountBankName };
    } catch {
      return payment;
    }
  }));
}

export function getPaymentContinuation(payment, latest, studentId) {
  if (!payment.orderCode || String(latest?.orderCode) !== String(payment.orderCode)
    || (latest.studentId && latest.studentId !== studentId)
    || (payment.paymentId && latest.paymentId !== payment.paymentId)) {
    throw new Error('Không xác nhận được đơn thanh toán này. Vui lòng làm mới lịch sử.');
  }
  const view = getPaymentStatusView(latest.status);
  if (view.kind === 'unknown') throw new Error('Chưa xác minh được trạng thái đơn. Vui lòng thử lại sau.');
  const updated = { ...payment, ...latest };
  if (view.success) return { kind: 'success', payment: updated };
  if (view.kind !== 'pending') return { kind: 'unavailable', payment: updated, message: `${view.title}. Vui lòng chọn gói học để tạo thanh toán mới nếu cần.` };
  try {
    const url = new URL(latest.checkoutUrl);
    if (url.protocol !== 'https:') throw new Error('Invalid checkout URL');
  } catch {
    return { kind: 'unavailable', payment: updated, message: 'Đơn này chưa có liên kết thanh toán hợp lệ. Vui lòng làm mới lịch sử hoặc tạo thanh toán mới.' };
  }
  return { kind: 'continue', payment: updated };
}
