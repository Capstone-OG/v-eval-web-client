import { useEffect, useRef, useState } from 'react';
import { practiceService } from '../../services/practiceService';
import contentService from '../../services/contentService';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../services/apiClient';
import MathText from '../common/MathText';

const getVideoEmbedUrl = (rawUrl) => {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (url.hostname === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.endsWith('youtube.com')) {
      const videoId = url.searchParams.get('v') || url.pathname.split('/embed/')[1];
      return videoId ? `https://www.youtube.com/embed/${encodeURIComponent(videoId)}` : null;
    }
    return null;
  } catch {
    return null;
  }
};

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
  const [materials, setMaterials] = useState([]);
  const [materialsError, setMaterialsError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [stage, setStage] = useState(null);
  const [stageAnswers, setStageAnswers] = useState({});
  const [stageBusy, setStageBusy] = useState(false);
  const [stageMessage, setStageMessage] = useState('');
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
    setMaterials([]);
    setMaterialsError('');
    setDetailError('');
    setStage(null);
    setStageAnswers({});
    setStageMessage('');
    setDetailLoading(true);
    try {
      const [result, materialResponse] = await Promise.all([
        practiceService.getRoadmapNodeDetail(node.nodeId),
        contentService.getMaterialsBySkill(node.skillId).catch((err) => {
          if (request === detailRequest.current) setMaterialsError(err.message || 'Không tải được học liệu cho kỹ năng này.');
          return null;
        })
      ]);
      if (result.nodeId !== node.nodeId || result.studentId !== studentId) throw new Error('Chi tiết chặng không hợp lệ.');
      if (request === detailRequest.current) {
        setDetail(result);
        setMaterials(materialResponse?.materials || materialResponse?.data?.materials || []);
      }
    } catch (err) {
      if (request === detailRequest.current) setDetailError(err.message);
    } finally {
      if (request === detailRequest.current) setDetailLoading(false);
    }
  };

  const startStageQuiz = async () => {
    if (!detail || stageBusy) return;
    setStageBusy(true);
    setStageMessage('');
    try {
      const started = await practiceService.startRoadmapStage(detail.nodeId, studentId);
      setStage(started);
      setStageAnswers({});
    } catch (err) {
      setStageMessage(err.message || 'Không tải được quiz của chặng này.');
    } finally {
      setStageBusy(false);
    }
  };

  const submitStageQuiz = async () => {
    if (!stage || stageBusy) return;
    setStageBusy(true);
    setStageMessage('');
    try {
      const answers = (stage.previewQuestions || []).map((question) => ({
        questionId: question.questionId,
        selectedOption: stageAnswers[question.questionId] || '',
        timeSpentSeconds: 0
      }));
      const submitted = await practiceService.submitRoadmapPreview(stage.stageProgressId, answers);
      setStage((current) => ({ ...current, submitted }));
      setStageMessage('Đã ghi nhận quiz khởi động. Bạn có thể xem học liệu của kỹ năng này bên dưới.');
    } catch (err) {
      setStageMessage(err.message || 'Không gửi được câu trả lời. Vui lòng thử lại.');
    } finally {
      setStageBusy(false);
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
    {detail && <section className="rounded-2xl border bg-white p-6 space-y-5">
      <div>
        <h2 className="font-bold">{detail.skillName}</h2>
        <p className="text-sm text-slate-500">{detail.domainName} · Trạng thái chặng: {detail.status}</p>
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-bold">Quiz khởi động theo kỹ năng</h3>
            <p className="text-xs text-slate-500">Câu hỏi được Practice Service lấy an toàn từ Content Service theo Skill ID của chặng.</p>
          </div>
          {!stage && <button type="button" onClick={startStageQuiz} disabled={stageBusy} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{stageBusy ? 'Đang tải…' : 'Tải quiz'}</button>}
        </div>
        {stage?.previewQuestions?.map((question) => (
          <fieldset key={question.questionId} className="rounded-lg border bg-white p-3 space-y-2">
            <legend className="px-1 text-sm font-semibold"><MathText text={`${question.questionOrder}. ${question.content}`} /></legend>
            {question.options?.map((option) => (
              <label key={option.optionId} className="flex cursor-pointer items-start gap-2 text-sm">
                <input type="radio" name={`question-${question.questionId}`} value={option.optionId} checked={stageAnswers[question.questionId] === option.optionId} onChange={() => setStageAnswers((current) => ({ ...current, [question.questionId]: option.optionId }))} />
                <MathText text={option.content} />
              </label>
            ))}
          </fieldset>
        ))}
        {stage?.previewQuestions?.length > 0 && !stage.submitted && <button type="button" onClick={submitStageQuiz} disabled={stageBusy || stage.previewQuestions.some((question) => !stageAnswers[question.questionId])} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{stageBusy ? 'Đang gửi…' : 'Gửi quiz khởi động'}</button>}
        {stageMessage && <p role="status" className="text-sm text-slate-600">{stageMessage}</p>}
        {stage && !stage.previewQuestions?.length && <p className="text-sm text-amber-700">Chưa có câu hỏi quiz cho kỹ năng này.</p>}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-bold">Video và học liệu theo kỹ năng</h3>
          <p className="text-xs text-slate-500">Tải từ Content Service bằng Skill ID của chặng; mỗi chương/miền hiển thị bên trên nhóm các kỹ năng.</p>
        </div>
        {materialsError && <p role="alert" className="text-sm text-amber-700">{materialsError}</p>}
        {!materials.length && !materialsError && <p className="rounded-lg border border-dashed p-4 text-sm text-slate-500">Content Service chưa có học liệu cho kỹ năng này.</p>}
        {materials.map((material) => {
          const embedUrl = getVideoEmbedUrl(material.videoUrl);
          return <article key={material.materialId} className="rounded-xl border p-4 space-y-3">
            <h4 className="font-semibold">{material.title || 'Học liệu kỹ năng'}</h4>
            {material.content && <p className="whitespace-pre-wrap text-sm text-slate-600">{material.content}</p>}
            {embedUrl && <div className="aspect-video overflow-hidden rounded-lg bg-slate-950"><iframe className="h-full w-full" src={embedUrl} title={material.title || detail.skillName} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>}
            {material.videoUrl && !embedUrl && <video className="w-full rounded-lg bg-black" controls preload="metadata" src={material.videoUrl} />}
            {material.fileUrl && <a className="text-sm font-semibold text-blue-700 underline" href={material.fileUrl} target="_blank" rel="noreferrer">Mở tài liệu đính kèm</a>}
            {!material.videoUrl && !material.content && !material.fileUrl && <p className="text-sm text-slate-500">Học liệu này chưa có nội dung, video hoặc tệp đính kèm.</p>}
          </article>;
        })}
      </div>
    </section>}
  </div>;
}
