const keys = ['veval_exam_history', 'veval_latest_diagnostic_result', 'veval_theta_0', 'veval_placement_class', 'veval_diagnostic_submission_id', 'veval_pending_exam_result', 'veval_latest_diagnostic', 'veval_last_diagnostic_result'];
export function clearLegacyDiagnosticData(...storages) {
  for (const storage of storages) for (const key of keys) {
    try { storage.removeItem(key); } catch { /* Storage may be disabled. */ }
  }
}
export const diagnosticUserId = (user) => user?.userId || user?.id || user?.studentId;
