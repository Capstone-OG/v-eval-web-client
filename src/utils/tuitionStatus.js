export function normalizeTuitionStatus(status, payments, studentId) {
  if (status?.studentId && status.studentId !== studentId) throw new Error('Trạng thái học phí không thuộc tài khoản hiện tại.');
  const ownPayments = (Array.isArray(payments) ? payments : []).filter((payment) => !payment.studentId || payment.studentId === studentId);
  return { ...status, payments: ownPayments,
    isPaid: status?.isPaid === true };
}
