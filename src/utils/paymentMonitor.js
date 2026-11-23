import { getPaymentStatusView } from './paymentStatus.js';

export function monitorPayment({ orderCode, getStatus, onSuccess, onFailure, onConnectionError, onConnected,
  intervalMs = 3000, schedule = setTimeout, cancel = clearTimeout }) {
  let stopped = false;
  let timer;
  let connectionWarning = false;
  const poll = async () => {
    try {
      const payment = await getStatus(orderCode);
      if (stopped) return;
      if (String(payment?.orderCode) !== String(orderCode)) throw new Error('Payment order mismatch');
      const view = getPaymentStatusView(payment.status);
      connectionWarning = false;
      onConnected?.();
      if (view.success || ['failed', 'cancelled', 'expired'].includes(view.kind)) {
        stopped = true;
        if (view.success) onSuccess(payment);
        else onFailure(payment);
        return;
      }
    } catch (error) {
      if (stopped) return;
      if (!connectionWarning) { connectionWarning = true; onConnectionError?.(error); }
    }
    if (!stopped) timer = schedule(poll, intervalMs);
  };
  void poll();
  return () => { stopped = true; if (timer !== undefined) cancel(timer); };
}
