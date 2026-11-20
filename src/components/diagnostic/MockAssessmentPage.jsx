import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileCheck2, LoaderCircle, RefreshCw, ShieldAlert } from 'lucide-react';
import { mockExamService } from '../../services/mockExamService';
import { mockExamAnswers, mockExamDraftKey } from '../../utils/mockExam';
import { createExamClock } from './examClock';
import { ExamRoomBody, ExamRoomHeader, ExamSubmitConfirmation } from './ExamRoom';
import { toast } from '../../context/ToastContext';

export default function MockAssessmentPage({ currentUser, onClose }) {
  const studentId = currentUser?.userId || currentUser?.id || currentUser?.studentId;
  const [exams, setExams] = useState([]);
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [timeSpent, setTimeSpent] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [reload, setReload] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showViolation, setShowViolation] = useState(false);
  const [violationReason, setViolationReason] = useState('tab_switch');
  const [resumePrompt, setResumePrompt] = useState(false);
  const clock = useRef(null);
  const draft = useRef(null);
  const submitBusy = useRef(false);
  const autoSubmitAttempted = useRef(false);
  const lastViolation = useRef(0);
  const owner = useRef(studentId);
  useEffect(() => { owner.current = studentId; }, [studentId]);
  const takingExam = Boolean(session && !result);

  const persist = () => {
    if (!draft.current || !clock.current) return;
    try { sessionStorage.setItem(mockExamDraftKey(draft.current.studentId), JSON.stringify({ ...draft.current, timing: clock.current.serialize(Date.now()) })); }
    catch { setError('Trình duyệt không lưu được bản nháp. Đừng tải lại hoặc đóng trang trước khi nộp bài.'); }
  };
  const requestFullscreen = () => {
    try {
      const element = document.documentElement;
      const request = element.requestFullscreen || element.webkitRequestFullscreen;
      if (!request) return Promise.resolve(false);
      return Promise.resolve(request.call(element)).then(() => { setIsFullscreen(true); return true; }).catch(() => { setIsFullscreen(false); return false; });
    } catch { return Promise.resolve(false); }
  };

  useEffect(() => {
    if (!studentId) return;
    let active = true;
    setError(''); setResult(null); setConfirmSubmit(false); setSession(null); clock.current = null; draft.current = null;
    try {
      const saved = JSON.parse(sessionStorage.getItem(mockExamDraftKey(studentId)) || 'null');
      if (saved?.studentId === studentId && saved.session?.studentId === studentId && saved.session?.questions?.length && saved.timing) {
        setSession(saved.session); setAnswers(saved.answers || {}); setFlagged(saved.flagged || {});
        setTabSwitchCount(saved.tabSwitchCount || 0); setIndex(0); setResumePrompt(true); setBusy(false);
        clock.current = createExamClock(saved.timing.startedAt, saved.timing.durationMs, saved.session.questions[0].questionId, saved.timing.elapsed, Date.now());
        draft.current = saved;
        autoSubmitAttempted.current = false;
        return () => { active = false; persist(); };
      }
    } catch { /* Malformed drafts cannot supply a valid session. */ }
    setBusy(true);
    mockExamService.getExams().then((items) => { if (active) setExams(items); })
      .catch((err) => { if (active) setError(err.message || 'Chưa tải được đề thi.'); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; persist(); };
  }, [studentId, reload]);

  useEffect(() => {
    if (!takingExam || session.studentId !== studentId) return;
    const update = () => {
      setRemaining(clock.current?.remaining(Date.now()) || 0);
      setTimeSpent(clock.current?.snapshot(Date.now()) || {});
      persist();
    };
    update();
    const timer = setInterval(update, 1000);
    const save = () => persist();
    const beforeUnload = (event) => { persist(); event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('pagehide', save);
    window.addEventListener('beforeunload', beforeUnload);
    return () => { clearInterval(timer); window.removeEventListener('pagehide', save); window.removeEventListener('beforeunload', beforeUnload); };
  }, [session, takingExam, studentId]);

  useEffect(() => {
    if (!takingExam || busy || confirmSubmit || resumePrompt) return;
    const originalTitle = document.title;
    let blink;
    const warn = (reason) => {
      const now = Date.now();
      if (now - lastViolation.current < 1500 || !draft.current || draft.current.tabSwitchCount >= 3) return;
      lastViolation.current = now;
      const count = (draft.current.tabSwitchCount || 0) + 1;
      draft.current.tabSwitchCount = count;
      setTabSwitchCount(count); setViolationReason(reason); setShowViolation(true); persist();
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (Audio) {
          const context = new Audio(); const oscillator = context.createOscillator(); const gain = context.createGain();
          oscillator.type = 'sawtooth'; oscillator.frequency.value = 800; gain.gain.value = 0.1;
          oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.25);
          oscillator.onended = () => { void context.close(); };
        }
      } catch { /* Some browsers require an audio gesture. */ }
      clearInterval(blink);
      let toggle = false;
      blink = setInterval(() => { document.title = toggle ? '⚠️ CẢNH BÁO RỜI PHÒNG THI' : 'V-Eval · Giám sát thi'; toggle = !toggle; }, 600);
      mockExamService.logTabDeparture(session.submissionId, reason === 'exit_fullscreen' ? 'Học sinh thoát chế độ toàn màn hình.' : undefined)
        .catch(() => { if (owner.current === studentId) setError('Chưa gửi được thông tin giám sát. Vui lòng kiểm tra kết nối.'); });
    };
    const visibility = () => { if (document.hidden) warn('tab_switch'); else { clearInterval(blink); document.title = originalTitle; } };
    const blur = () => warn('tab_switch');
    const fullscreen = () => {
      const full = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(full);
      if (!full) warn('exit_fullscreen');
    };
    document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', blur);
    document.addEventListener('fullscreenchange', fullscreen);
    return () => { clearInterval(blink); document.title = originalTitle; document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', blur); document.removeEventListener('fullscreenchange', fullscreen); };
  }, [takingExam, session, studentId, busy, confirmSubmit, resumePrompt]);

  useEffect(() => {
    if (!result) return;
    setShowViolation(false); setResumePrompt(false);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, [result]);

  useEffect(() => () => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }, []);

  const acceptResult = (data) => {
    if (data?.studentId !== studentId || data?.submissionId !== session?.submissionId) throw new Error('Kết quả không thuộc phiên thi hiện tại.');
    setResult(data); setConfirmSubmit(false); setShowViolation(false); setError('');
    try { sessionStorage.removeItem(mockExamDraftKey(studentId)); } catch { /* Submission success must not depend on browser storage. */ }
    draft.current = null;
    window.dispatchEvent(new CustomEvent('veval:submission-updated', { detail: { studentId } }));
    toast.success(data.isUnderReview || data.status === 'UNDER_REVIEW' ? 'Đã nộp bài. Kết quả đang chờ thẩm định.' : 'Đã nộp bài thi thử thành công!');
  };
  const submit = async () => {
    if (submitBusy.current || !session || result || owner.current !== session.studentId) return;
    submitBusy.current = true; setBusy(true); setError(''); persist();
    try {
      const data = await mockExamService.submit(session.submissionId, mockExamAnswers(session.questions, answers, clock.current.snapshot(Date.now())));
      if (owner.current === studentId) acceptResult(data);
    } catch (err) {
      // A timed-out response may already have been committed by the server.
      try {
        const existing = await mockExamService.getResult(session.submissionId);
        if (existing.status === 'IN_PROGRESS') throw err;
        if (owner.current === studentId) acceptResult(existing);
      } catch { if (owner.current === studentId) setError(err.message || 'Nộp bài chưa thành công. Câu trả lời được giữ lại để thử lại.'); }
    } finally { submitBusy.current = false; if (owner.current === studentId) setBusy(false); }
  };
  useEffect(() => {
    if (session && !result && !busy && (clock.current?.remaining(Date.now()) === 0 || tabSwitchCount >= 3) && !autoSubmitAttempted.current) {
      autoSubmitAttempted.current = true;
      void submit();
    }
  });

  const start = async (exam) => {
    if (submitBusy.current) return;
    submitBusy.current = true; setBusy(true); setError('');
    void requestFullscreen();
    try {
      const data = await mockExamService.start(exam.examId, studentId);
      if (owner.current !== studentId) return;
      const now = Date.now();
      if (!(data.durationMinutes > 0)) throw new Error('Thời lượng phiên thi không hợp lệ.');
      clock.current = createExamClock(now, data.durationMinutes * 60000, data.questions[0].questionId);
      setSession(data); setAnswers({}); setFlagged({}); setTabSwitchCount(0); setIndex(0); setRemaining(data.durationMinutes * 60);
      draft.current = { studentId, session: data, answers: {}, flagged: {}, tabSwitchCount: 0 }; autoSubmitAttempted.current = false; persist();
    } catch (err) {
      if (owner.current === studentId) {
        setError(err.message || 'Chưa bắt đầu được phiên thi.');
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
      }
    }
    finally { submitBusy.current = false; if (owner.current === studentId) setBusy(false); }
  };
  const visit = (next) => {
    const position = typeof next === 'function' ? next(index) : next;
    clock.current?.visit(session.questions[position].questionId, Date.now()); setIndex(position); persist();
  };
  const selectOption = (questionId, optionId) => {
    if (busy || tabSwitchCount >= 3 || clock.current?.remaining(Date.now()) === 0) return;
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next); draft.current.answers = next; persist();
  };
  const toggleFlag = (questionId) => {
    if (busy || tabSwitchCount >= 3) return;
    const next = { ...flagged, [questionId]: !flagged[questionId] };
    setFlagged(next); draft.current.flagged = next; persist();
  };
  const close = () => { persist(); onClose(); };
  const roomQuestions = session?.questions.map((item) => ({ id: item.questionId, content: item.content,
    options: item.options.map((option) => option.content), optionIds: item.options.map((option) => option.optionId),
    skill_name: item.skillName, domain_name: 'Thi thử V-ACT', bloom: item.difficultyLevel, levelLabel: 'Độ khó',
    passage_content: item.passageContent || '', passage_title: item.passageTitle || '' })) || [];
  const question = roomQuestions[index];


  const button = 'rounded-xl px-4 py-2.5 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  return (
    <div className={`flex min-h-screen flex-col bg-[#F4F7FC] font-sans text-slate-900 selection:bg-blue-600 selection:text-white ${takingExam ? 'fixed inset-0 z-50 h-full w-full overflow-y-auto' : 'rounded-3xl'}`}>
      {takingExam && <ExamRoomHeader examData={{ title: session.examTitle }} questionCount={roomQuestions.length} timeRemaining={remaining} isFullscreen={isFullscreen} tabSwitchCount={tabSwitchCount} requestFullScreenMode={requestFullscreen} handlePromptSubmitExam={() => setConfirmSubmit(true)} />}
      {error && <div role="alert" className="mx-5 mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}{takingExam && <button type="button" disabled={busy} onClick={submit} className="ml-3 font-bold underline">Thử gửi lại</button>}</div>}
      {!studentId ? <p>Vui lòng đăng nhập tài khoản học sinh để thi thử.</p> : result ? <div className="mx-auto max-w-2xl space-y-5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" /><h2 className="text-2xl font-extrabold">{result.isUnderReview || result.status === 'UNDER_REVIEW' ? 'Đã nộp bài · Chờ thẩm định' : 'Kết quả thi thử'}</h2>
        <p className="text-4xl font-black text-blue-600">{result.totalScore}<span className="ml-2 text-sm font-medium text-slate-500">điểm</span></p>
        <p className="text-sm text-slate-600">Đúng {result.totalCorrect}/{result.totalQuestions} câu · {Math.ceil(result.totalTimeSpentSeconds / 60)} phút làm bài</p>
        <p className="text-sm text-slate-500">{result.message || (result.status === 'UNDER_REVIEW' ? 'Giáo viên sẽ thẩm định kết quả bài thi của bạn.' : 'Kết quả đã được ghi nhận trên hệ thống.')}</p>
        <button type="button" onClick={close} className={`${button} bg-blue-600 text-white hover:bg-blue-700`}>Hoàn tất</button>
      </div> : !session ? <div className="space-y-5 p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4"><p className="text-sm text-slate-500">Chọn đề thi và vào phòng thi toàn màn hình.</p><button type="button" disabled={busy} onClick={() => setReload((value) => value + 1)} className={`${button} flex shrink-0 items-center gap-2 border border-slate-200 bg-white`}><RefreshCw className="h-4 w-4" />Làm mới</button></div>
        {busy ? <p role="status" className="flex items-center justify-center gap-2 py-12 text-slate-500"><LoaderCircle className="h-5 w-5 animate-spin" />Đang tải…</p> : !exams.length ? <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">Chưa có đề thi thử được xuất bản. Vui lòng quay lại sau.</p> : <div className="grid gap-4 sm:grid-cols-2">{exams.map((exam) => <article key={exam.examId} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"><FileCheck2 className="h-7 w-7 text-blue-600" /><h3 className="font-extrabold">{exam.title}</h3><p className="text-sm text-slate-500">{exam.totalQuestions} câu · {exam.durationMinutes} phút</p><button type="button" disabled={busy} onClick={() => start(exam)} className={`${button} bg-blue-600 text-white hover:bg-blue-700`}>Bắt đầu làm bài</button></article>)}</div>}
      </div> : <>
        <fieldset disabled={busy || tabSwitchCount >= 3 || remaining === 0} className="contents">
          <ExamRoomBody currentQ={question} currentIndex={index} questions={roomQuestions} answers={answers} flagged={flagged} timeSpentPerQ={timeSpent} handleSelectOption={selectOption} handleToggleFlag={toggleFlag} setCurrentIndex={visit} handlePromptSubmitExam={() => setConfirmSubmit(true)} />
        </fieldset>
        {busy && <p role="status" className="pb-5 text-center text-sm font-bold text-blue-600">Đang nộp bài và nhận kết quả…</p>}
      </>}
      {confirmSubmit && takingExam && <ExamSubmitConfirmation title="Xác Nhận Nộp Bài Thi Thử?" answers={answers} questions={roomQuestions} busy={busy} onCancel={() => setConfirmSubmit(false)} onSubmit={submit} />}
      {takingExam && (showViolation || resumePrompt) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
        <div role="alertdialog" aria-modal="true" aria-labelledby="mock-violation-title" className="w-full max-w-md space-y-5 rounded-3xl border-2 border-rose-400 bg-white p-7 text-center shadow-2xl">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-600" /><h2 id="mock-violation-title" className="text-xl font-black">{resumePrompt ? 'Tiếp tục phiên thi đang làm' : tabSwitchCount >= 3 ? 'Bài thi đã khóa và đang được nộp' : 'Phát hiện vi phạm quy chế bài thi'}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{resumePrompt ? 'Câu trả lời và thời hạn làm bài được giữ nguyên. Quay lại toàn màn hình để tiếp tục.' : violationReason === 'exit_fullscreen' ? 'Bạn vừa thoát khỏi chế độ toàn màn hình bài thi.' : 'Bạn vừa chuyển tab hoặc rời khỏi cửa sổ làm bài.'}</p>
          <p className="rounded-xl bg-rose-50 p-3 font-mono text-sm font-bold text-rose-700">Số lần rời màn hình: {Math.min(tabSwitchCount, 3)} / 3</p>
          <p className="text-xs text-amber-700">Đủ 3 lần rời màn hình sẽ tự động khóa và nộp bài.</p>
          <button type="button" disabled={busy} onClick={() => { if (tabSwitchCount >= 3) { void submit(); return; } void requestFullscreen(); setShowViolation(false); setResumePrompt(false); }} className={`${button} w-full bg-rose-600 text-white`}>{tabSwitchCount >= 3 ? 'Nộp bài & Chấm điểm' : 'Quay lại toàn màn hình & Tiếp tục làm bài'}</button>
        </div>
      </div>}
    </div>
  );
}
