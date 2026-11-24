import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { practiceService } from '../services/practiceService';
import paymentService from '../services/paymentService';
import { completedDiagnosticExamIds } from '../components/diagnostic/diagnosticEligibility';
import { getStudentActivation } from '../utils/studentActivation';
import { ensurePaidRoadmap } from '../utils/paidRoadmap';
import { toast } from '../context/ToastContext';

const READY_CACHE_KEY = (uid) => `veval_activation_ready_${uid}`;

function readCachedReady(uid) {
  if (!uid) return null;
  try {
    if (sessionStorage.getItem(READY_CACHE_KEY(uid)) === '1') {
      return { step: 'ready', missing: [], diagnosticComplete: true, paid: true, owner: uid };
    }
  } catch { /* ignore */ }
  return null;
}

export default function useStudentActivation(user, enabled) {
  const userId = user?.userId || user?.id || user?.studentId;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState(() => readCachedReady(userId) || { step: 'loading', missing: [] });
  const refresh = useCallback(({ background = false } = {}) => {
    if (!background) setState({ step: 'loading', missing: [] });
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    if (!enabled || !userId) return;
    let active = true;
    setState((previous) => {
      if (previous.owner === userId && previous.step === 'ready') return previous;
      return readCachedReady(userId) || { step: 'loading', missing: [], owner: userId };
    });
    const isCurrent = () => {
      const current = authService.getCurrentUser();
      return active && (current?.userId || current?.id || current?.studentId) === userId;
    };
    (async () => {
      try {
        const [history, account, profile] = await Promise.all([
          practiceService.getDiagnosticHistory(userId),
          authService.fetchCurrentUserProfile(),
          authService.getStudentProfile().catch((error) => { if (error.status === 404) return {}; throw error; })
        ]);
        if (!isCurrent()) return;
        if ((account?.userId || account?.id) !== userId || (profile?.studentId && profile.studentId !== userId)) {
          throw new Error('Không xác nhận được hồ sơ của tài khoản hiện tại.');
        }
        const diagnosticComplete = completedDiagnosticExamIds(history, userId).size >= 1;
        const base = { diagnosticComplete, user: account, profile, paid: false };
        const eligibility = getStudentActivation(base);
        // Profile comes first; do not let payment failures hide a missing-profile instruction.
        if (eligibility.step !== 'payment') { setState({ ...eligibility, owner: userId }); return; }
        const payment = await paymentService.getStudentTuitionStatus(userId, { throwOnError: true });
        if (!isCurrent()) return;
        let roadmapError = null;
        if (payment?.isPaid === true) {
          try {
            await ensurePaidRoadmap({ studentId: userId, paid: true, profile, history }, practiceService);
            if (isCurrent()) window.dispatchEvent(new CustomEvent('veval:roadmap-updated', { detail: { studentId: userId } }));
          } catch (error) {
            roadmapError = error.message;
            if (isCurrent()) toast.warning(error.message || 'Chưa thể tạo lộ trình. Vui lòng làm mới để thử lại.');
          }
        }
        if (isCurrent()) {
          const finalActivation = getStudentActivation({ ...base, paid: payment?.isPaid });
          try {
            if (finalActivation.step === 'ready') sessionStorage.setItem(READY_CACHE_KEY(userId), '1');
            else sessionStorage.removeItem(READY_CACHE_KEY(userId));
          } catch { /* ignore */ }
          setState({ ...finalActivation, roadmapError, owner: userId });
        }
      } catch (error) {
        if (isCurrent()) setState((previous) => previous.owner === userId && previous.step === 'ready'
          ? { ...previous, refreshError: error.message }
          : { step: 'error', missing: [], owner: userId, error: error.message });
      }
    })();
    return () => { active = false; };
  }, [userId, enabled, revision]);
  useEffect(() => {
    const handle = (event) => { if (!event.detail?.studentId || event.detail.studentId === userId) refresh({ background: true }); };
    for (const name of ['veval:submission-updated', 'veval:tuition-paid']) window.addEventListener(name, handle);
    return () => { for (const name of ['veval:submission-updated', 'veval:tuition-paid']) window.removeEventListener(name, handle); };
  }, [userId, refresh]);
  return { ...(state.owner === userId ? state : { step: 'loading', missing: [] }), refresh };
}
