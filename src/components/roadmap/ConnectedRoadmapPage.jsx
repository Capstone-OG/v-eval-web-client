import { useEffect, useRef, useState } from 'react';
import { practiceService } from '../../services/practiceService';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../services/apiClient';

const validateRoadmap = (value, studentId) => {
  if (!value?.roadmapId || value.studentId !== studentId || !Array.isArray(value.stages) || !Array.isArray(value.nodes)) {
    throw new Error('Máy chủ trả về lộ trình không hợp lệ.');
  }
  return value;
};

export default function ConnectedRoadmapPage({ onNavigateDiagnostic, onNavigateDashboard }) {
  const [roadmap, setRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [submissionId, setSubmissionId] = useState('');
  const [diagnostic, setDiagnostic] = useState(null);
  const [examDate, setExamDate] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const detailRequest = useRef(0);
  const creatingRef = useRef(false);
  const user = tokenStorage.getUser();
  const studentId = user?.userId || user?.id || user?.studentId;

  const load = async () => {
    setLoading(true);
    setError('');
    setDetail(null);
    try {
      if (!studentId || !tokenStorage.getAccessToken()) throw new Error('Vui lòng đăng nhập bằng tài khoản học sinh.');
      let current = null;
      try {
        current = validateRoadmap(await practiceService.getMyRoadmap(studentId), studentId);
      } catch (err) {
        if (err.status !== 404) throw err;
      }
      setRoadmap(current);
      const attempts = await practiceService.getDiagnosticHistory(studentId);
      if (!Array.isArray(attempts)) throw new Error('Không đọc được lịch sử bài kiểm tra.');
      const completed = attempts.filter((item) => item.status === 'COMPLETED' && item.studentId === studentId)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
      setHistory(completed);
      setSubmissionId(current?.diagnosticSubmissionId || completed[0]?.submissionId || '');
      if (!current) {
        try {
          const profile = await authService.getStudentProfile();
          setExamDate(profile?.examDate?.slice(0, 10) || '');
          setHours(profile?.studyHoursDay ?? '');
        } catch (err) {
          if (err.status !== 404) throw err;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [studentId]);

  useEffect(() => {
    let active = true;
    setDiagnostic(null);
    if (submissionId) practiceService.getDiagnosticResult(submissionId).then((result) => {
      if (active && result.studentId === studentId) setDiagnostic(result);
    }).catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [submissionId, studentId]);

  const generate = async (event) => {
    event.preventDefault();
    if (creatingRef.current) return;
    creatingRef.current = true;
    setCreating(true);
    setError('');
    try {
      if (!history.some((item) => item.submissionId === submissionId)) throw new Error('Chọn bài kiểm tra đã nộp thành công.');
      if (!examDate || new Date(`${examDate}T23:59:59`) <= new Date() || !(Number(hours) > 0 && Number(hours) <= 24)) {
        throw new Error('Ngày thi phải ở tương lai, thời gian học từ trên 0 đến 24 giờ/ngày.');
      }
      const result = await practiceService.generateRoadmap({
        studentId, diagnosticSubmissionId: submissionId,
        examDate: `${examDate}T00:00:00`, studyHoursPerDay: Number(hours)
      });
      setRoadmap(validateRoadmap(result, studentId));
    } catch (err) {
      setError(`${err.message} Nếu mất kết nối, hãy tải lại để kiểm tra lộ trình trước khi tạo lại.`);
    } finally {
      creatingRef.current = false;
      setCreating(false);
    }
  };

  const openNode = async (node) => {
    const request = ++detailRequest.current;
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const result = await practiceService.getRoadmapNodeDetail(node.nodeId);
      if (result.nodeId !== node.nodeId || result.studentId !== studentId) throw new Error('Chi tiết chặng không hợp lệ.');
      if (request === detailRequest.current) setDetail(result);
    } catch (err) {
      if (request === detailRequest.current) setDetailError(err.message);
    } finally {
      if (request === detailRequest.current) setDetailLoading(false);
    }
  };

  return <div className="space-y-5 text-slate-900">
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
      <h1 className="text-2xl font-extrabold">Lộ trình học cá nhân</h1>
      <p className="text-sm text-slate-500">Lộ trình từ kết quả kiểm tra đầu vào đã lưu trên hệ thống.</p>
      <p className="text-sm text-amber-700">Hiện hệ thống trả lộ trình theo miền năng lực và kỹ năng; chưa trả phân giai đoạn 1–2–3 riêng cho từng môn.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={load} disabled={loading || creating} className="rounded-xl border px-4 py-2 disabled:opacity-50">Tải lại lộ trình</button>
        <button type="button" onClick={onNavigateDiagnostic} className="rounded-xl border px-4 py-2">Kết quả kiểm tra đầu vào</button>
        {onNavigateDashboard && <button type="button" onClick={onNavigateDashboard} className="rounded-xl border px-4 py-2">Về tổng quan</button>}
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && <p role="status">Đang tải dữ liệu...</p>}
      {!loading && !error && !roadmap && !history.length && <p className="text-sm">Chưa có bài kiểm tra đầu vào đã hoàn thành trên hệ thống. Vui lòng làm và nộp bài trước khi tạo lộ trình.</p>}
    </section>
    {!loading && !roadmap && history.length > 0 && <form onSubmit={generate} className="rounded-2xl border bg-white p-6 space-y-4">
      <h2 className="font-bold">Khởi tạo từ bài kiểm tra đầu vào</h2>
      {!history.length ? <p>Chưa có bài kiểm tra hoàn thành trên hệ thống. Vui lòng làm và nộp bài trước.</p> : <>
        <label className="block text-sm">Bài kiểm tra<select required value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} className="mt-1 block w-full rounded-xl border p-3">{history.map((item) => <option key={item.submissionId} value={item.submissionId}>{new Date(item.completedAt).toLocaleString('vi-VN')} · {item.totalCorrect}/{item.totalQuestions} câu</option>)}</select></label>
        <label className="block text-sm">Ngày thi dự kiến<input required type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="mt-1 block rounded-xl border p-3" /></label>
        <label className="block text-sm">Giờ học mỗi ngày<input required type="number" min="0.1" max="24" step="0.1" value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1 block rounded-xl border p-3" /></label>
        <button disabled={creating} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white disabled:opacity-50">{creating ? 'Đang tạo...' : 'Tạo lộ trình'}</button>
      </>}
    </form>}
    {diagnostic && <section className="rounded-2xl border bg-white p-6 space-y-3">
      <h2 className="font-bold">Kết quả theo kỹ năng từ bài đầu vào</h2>
      {(diagnostic.skillBreakdowns || []).map((skill) => <div key={skill.skillId} className="flex justify-between gap-4 border-b py-2 text-sm"><span>{skill.skillName} <span className="text-slate-500">· {skill.domainName}</span></span><strong>{skill.correctCount}/{skill.totalQuestions} câu · {skill.accuracyPercentage}%</strong></div>)}
      {!diagnostic.skillBreakdowns?.length && <p className="text-sm text-slate-500">Chưa có phân tích theo kỹ năng.</p>}
    </section>}
    {roadmap && <section className="rounded-2xl border bg-white p-6 space-y-4">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">Các chặng theo miền năng lực</h2><span className="text-sm">{roadmap.completedMilestones}/{roadmap.totalMilestones} chặng · Mục tiêu BE: {roadmap.targetScore}</span></div>
      {roadmap.isPruned && <p className="text-sm text-amber-700">{roadmap.prunedReason || 'Lộ trình đã được rút gọn theo quỹ thời gian.'}</p>}
      {roadmap.stages.map((stage) => <div key={stage.domainId} className="rounded-xl border p-4 space-y-2"><h3 className="font-bold">{stage.domainName || 'Chưa có tên miền'}</h3>{stage.nodes.map((node) => <button key={node.nodeId} type="button" onClick={() => openNode(node)} className="flex w-full justify-between gap-4 rounded-lg p-3 text-left text-sm hover:bg-blue-50"><span>{node.stepOrder}. {node.skillName}</span><span>{node.status}</span></button>)}</div>)}
      {!roadmap.stages.length && <p>Máy chủ chưa trả chặng học.</p>}
    </section>}
    {detailLoading && <p role="status">Đang tải chi tiết chặng...</p>}
    {detailError && <p role="alert" className="text-red-600">{detailError}</p>}
    {detail && <section className="rounded-2xl border bg-white p-6 space-y-3"><h2 className="font-bold">{detail.skillName}</h2><p className="text-sm">Trạng thái: {detail.status} · Video: {detail.videoWatchedSeconds}/{detail.videoTotalSeconds} giây</p><p className="text-sm text-slate-500">{detail.materialId ? 'Chặng đã có mã học liệu; API chi tiết hiện chưa trả nội dung hoặc URL video để phát.' : 'Chặng chưa có học liệu.'} {detail.quizExamId ? 'Chặng đã có mã quiz; chưa tích hợp làm quiz ở bước nối lộ trình này.' : 'Chặng chưa có quiz.'}</p>{detail.liveSession && <div className="text-sm"><p>{detail.liveSession.title} · {new Date(detail.liveSession.scheduledAt).toLocaleString('vi-VN')}</p><p>Lịch học: {detail.liveSession.status}</p></div>}</section>}
  </div>;
}
