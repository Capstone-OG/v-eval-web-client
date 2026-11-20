import { useCallback, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { practiceService } from '../services/practiceService';
import paymentService from '../services/paymentService';
import { completedDiagnosticExamIds } from '../components/diagnostic/diagnosticEligibility';
import { readLocalAspiration } from '../utils/localAspiration';
import { getStudentActivation } from '../utils/studentActivation';

export default function useStudentActivation(user, enabled) {
  const userId = user?.userId || user?.id || user?.studentId;
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ step: 'loading', missing: [] });
  const refresh = useCallback(() => {
    setState({ step: 'loading', missing: [] });
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    if (!enabled || !userId) return;
    let active = true;
    setState({ step: 'loading', missing: [] });
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
        const base = { diagnosticComplete, user: account, profile, aspiration: readLocalAspiration(localStorage, userId), paid: false };
        const eligibility = getStudentActivation(base);
        // Profile comes first; do not let payment failures hide a missing-profile instruction.
        if (eligibility.step !== 'payment') { setState({ ...eligibility, owner: userId }); return; }
        const payment = await paymentService.getStudentTuitionStatus(userId, { throwOnError: true });
        if (isCurrent()) setState({ ...getStudentActivation({ ...base, paid: payment?.isPaid }), owner: userId });
      } catch (error) {
        if (isCurrent()) setState({ step: 'error', missing: [], owner: userId, error: error.message });
      }
    })();
    return () => { active = false; };
  }, [userId, enabled, revision]);
  useEffect(() => {
    const handle = (event) => { if (!event.detail?.studentId || event.detail.studentId === userId) refresh(); };
    for (const name of ['veval:submission-updated', 'veval:tuition-paid']) window.addEventListener(name, handle);
    return () => { for (const name of ['veval:submission-updated', 'veval:tuition-paid']) window.removeEventListener(name, handle); };
  }, [userId, refresh]);
  return { ...(state.owner === userId ? state : { step: 'loading', missing: [] }), refresh };
}
