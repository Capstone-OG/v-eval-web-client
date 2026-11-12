import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ClipboardCheck, Users, ShieldAlert, RefreshCw, GraduationCap, History, X } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { accountGreeting } from '../../utils/accountPresentation';
import { teacherPortalRequests } from '../../services/teacherPortalRequests';

const dateLabel = (value) => value ? new Date(value).toLocaleString('vi-VN') : '—';

function Notice({ children }) {
  return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">{children}</div>;
}

// Teacher requests deliberately bypass services that substitute seeded demo data on failure.
export default function TeacherPortalView({ currentUser, section = 'dashboard', onNavigate }) {
  const mentorId = currentUser?.userId || currentUser?.id;
  const classId = currentUser?.classId;
  const [reload, setReload] = useState(0);
  const [resources, setResources] = useState({});
  const [selectedStudent, setSelectedStudent] = useState('');
  const [history, setHistory] = useState({});
  const [examDetail, setExamDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [resolving, setResolving] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let active = true;
    setResources({});
    if (!mentorId) return () => { active = false; };
    const requests = teacherPortalRequests({ userId: mentorId, classId });
    Object.entries(requests).forEach(async ([key, endpoint]) => {
      try {
        const response = await apiClient.get(endpoint);
        if (active) setResources((old) => ({ ...old, [key]: { data: response.data } }));
      } catch (error) {
        if (active) setResources((old) => ({ ...old, [key]: { error: error.message || 'Không tải được dữ liệu.' } }));
      }
    });
    return () => { active = false; };
  }, [mentorId, classId, reload]);

  useEffect(() => {
    let active = true;
    setHistory({});
    if (!selectedStudent || !mentorId) return () => { active = false; };
    apiClient.get(`/api/practice/diagnostic-submissions/student/${encodeURIComponent(selectedStudent)}`)
      .then(({ data }) => { if (active) setHistory({ data }); })
      .catch((error) => { if (active) setHistory({ error: error.message || 'Không tải được lịch sử.' }); });
    return () => { active = false; };
  }, [selectedStudent, mentorId, reload]);

  const warnings = resources.alerts?.data;
  const heatmap = resources.heatmap?.data;
  const exams = Array.isArray(resources.exams?.data) ? resources.exams.data : [];
  const roster = heatmap?.rows || [];
  const actions = [
    { tab: 'teacher_heatmap', title: 'Lớp học & bản đồ năng lực', text: 'Theo dõi từng học sinh và kỹ năng cần hỗ trợ.', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { tab: 'roadmap', title: 'Biên soạn học liệu', text: 'Quản lý chương, bài học, dạng bài và câu hỏi.', icon: BookOpen, color: 'bg-violet-50 text-violet-600' },
    { tab: 'diagnostic', title: 'Ngân hàng đề thi', text: 'Tra cứu đề thi và trạng thái xuất bản từ hệ thống.', icon: ClipboardCheck, color: 'bg-cyan-50 text-cyan-600' },
    { tab: 'analytics', title: 'Cảnh báo & hỗ trợ', text: 'Theo dõi cảnh báo sớm và ghi nhận xử lý.', icon: ShieldAlert, color: 'bg-orange-50 text-orange-600' }
  ];

  const openExam = async (examId) => {
    setDetailError(''); setDetailLoading(true); setExamDetail(null);
    try { setExamDetail((await apiClient.get(`/api/content/exams/${encodeURIComponent(examId)}`)).data); }
    catch (error) { setDetailError(error.message || 'Không tải được chi tiết đề.'); }
    finally { setDetailLoading(false); }
  };

  const resolveAlert = async (event) => {
    event.preventDefault();
    if (!mentorId || !notes.trim() || saving) return;
    setSaving(true); setSaveError('');
    try {
      await apiClient.post(`/api/practice/early-warnings/${encodeURIComponent(resolving.alertId)}/resolve`, {
        mentor_id: mentorId, resolution_notes: notes.trim()
      });
      setResolving(null); setNotes(''); setReload((n) => n + 1);
    } catch (error) { setSaveError(error.message || 'Chưa lưu được kết quả xử lý.'); }
    finally { setSaving(false); }
  };

  const resourceState = (key) => !resources[key] ? <p className="p-5 text-slate-500" role="status">Đang tải dữ liệu…</p>
    : resources[key].error ? <Notice>Không tải được dữ liệu: {resources[key].error} Bạn có thể bấm làm mới để thử lại.</Notice> : null;

  if (!mentorId) return <Notice>Chưa xác định được tài khoản giáo viên. Vui lòng đăng nhập lại.</Notice>;

  return <div className="space-y-6 animate-fade">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-800 to-blue-600 p-7 text-white shadow-lg md:p-9">
      <GraduationCap className="pointer-events-none absolute -right-6 -top-6 h-56 w-56 rotate-12 text-white/5" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div><span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-200">Không gian giảng dạy</span>
          <h1 className="mt-3 text-2xl font-extrabold md:text-3xl">{accountGreeting('teacher', currentUser)}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">Học liệu, tiến độ học sinh và hoạt động hỗ trợ — tập trung tại một nơi.</p></div>
        <button onClick={() => setReload((n) => n + 1)} className="flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold hover:bg-white/20"><RefreshCw size={16} /> Làm mới</button>
      </div>
    </section>

    {section === 'dashboard' && <>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Học sinh trong lớp', classId ? heatmap?.totalStudents : undefined, 'Theo lớp được trả về trong hồ sơ'],
          ['Cảnh báo cần xử lý', warnings?.activeAlertsCount, 'Các học sinh do bạn phụ trách'],
          ['Đề trong ngân hàng', resources.exams?.data ? exams.length : undefined, 'Dữ liệu từ ngân hàng đề thi']
        ].map(([title, value, caption]) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm font-semibold text-slate-600">{title}</p><p className="my-3 text-3xl font-extrabold text-indigo-700">{value ?? '—'}</p><p className="text-xs text-slate-500">{value == null ? 'Chưa có dữ liệu xác nhận' : caption}</p></div>)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">{actions.map(({ tab, title, text, icon: Icon, color }) => <button key={tab} onClick={() => onNavigate(tab)} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-left transition hover:border-indigo-300 hover:shadow-md"><span className={`rounded-2xl p-3 ${color}`}><Icon size={25} /></span><span className="flex-1"><span className="block text-base font-bold text-slate-900">{title}</span><span className="mt-1 block text-sm leading-6 text-slate-500">{text}</span></span><ArrowRight className="text-slate-300 group-hover:text-indigo-600" size={19} /></button>)}</div>
      {resources.alerts?.error && resourceState('alerts')}
      {resources.exams?.error && resourceState('exams')}
      {!classId && <Notice>Chưa nhận được danh sách lớp bạn phụ trách. Bạn vẫn có thể biên soạn học liệu và xem ngân hàng đề. Bản đồ năng lực, lịch sử và cảnh báo theo lớp sẽ hiển thị khi hệ thống cung cấp thông tin phân công.</Notice>}
    </>}

    {(section === 'teacher_heatmap' || section === 'history') && <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold">{section === 'history' ? 'Lịch sử bài làm học sinh' : 'Lớp học & bản đồ năng lực'}</h2>
      {!classId ? <Notice>Chưa có thông tin lớp được phân công từ hệ thống. Không sử dụng lớp mẫu để hiển thị dữ liệu học sinh.</Notice> : resourceState('heatmap') || <>
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-bold text-indigo-800">{heatmap?.className || 'Lớp được phân công'}</h3><span className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{heatmap?.totalStudents ?? roster.length} học sinh</span></div>
        {section === 'teacher_heatmap' ? roster.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left text-slate-500">Tỉ lệ làm chủ kỹ năng. Ô trống nghĩa là chưa có dữ liệu.</caption><thead><tr className="border-b"><th className="p-3">Học sinh</th>{(heatmap?.columns || []).map((col) => <th key={col.skillId} className="min-w-32 p-3">{col.skillName}</th>)}</tr></thead><tbody>{roster.map((row) => <tr key={row.studentId} className="border-b border-slate-100"><th className="whitespace-nowrap p-3 font-semibold">{row.studentName}</th>{(heatmap?.columns || []).map((col) => { const cell = row.skillCells?.find((c) => c.skillId === col.skillId); return <td key={col.skillId} className="p-2"><span className={`block rounded-lg p-3 text-center font-bold ${cell == null ? 'bg-slate-50 text-slate-400' : cell.plt < 0.5 ? 'bg-rose-100 text-rose-700' : cell.plt < 0.7 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>{cell == null ? '—' : `${Math.round(cell.plt * 100)}%`}</span></td>; })}</tr>)}</tbody></table></div> : <p className="text-slate-500">Lớp chưa có dữ liệu học sinh.</p> : <>
          <label className="block text-sm font-semibold">Chọn học sinh<select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-200 p-3"><option value="">Chọn trong danh sách lớp</option>{roster.map((row) => <option key={row.studentId} value={row.studentId}>{row.studentName}</option>)}</select></label>
          <p className="text-sm text-slate-500">Hiện tra cứu được bài chẩn đoán đầu vào. Lịch sử luyện tập và thi thử theo học sinh cần API danh sách tương ứng.</p>
          {selectedStudent && (!history.data && !history.error ? <p role="status">Đang tải lịch sử…</p> : history.error ? <Notice>{history.error}</Notice> : Array.isArray(history.data) && history.data.length ? <div className="space-y-3">{history.data.map((item) => <div key={item.submissionId} className="flex flex-wrap justify-between gap-2 rounded-xl bg-slate-50 p-4"><span className="font-semibold">Chẩn đoán đầu vào · {item.status}</span><span>{item.totalCorrect ?? '—'}/{item.totalQuestions ?? '—'} câu đúng</span><span className="text-sm text-slate-500">{dateLabel(item.completedAt)}</span></div>)}</div> : <p>Chưa có bài chẩn đoán.</p>)}
        </>}
      </>}
    </section>}

    {section === 'diagnostic' && <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Ngân hàng đề thi</h2><p className="text-sm text-slate-500">Danh sách đề từ hệ thống. Giáo viên xem thông tin đề tại đây; biên soạn nội dung tại Studio học liệu.</p>{resourceState('exams') || (exams.length ? <div className="grid gap-4 md:grid-cols-2">{exams.map((exam) => <button key={exam.examId} onClick={() => openExam(exam.examId)} className="rounded-2xl border border-slate-200 p-5 text-left hover:border-blue-400"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${exam.isPublished ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{exam.isPublished ? 'Đã xuất bản' : 'Bản nháp'}</span><h3 className="mt-4 text-lg font-bold">{exam.title}</h3><p className="mt-2 text-sm text-slate-500">{exam.totalQuestions} câu · {exam.durationMinutes} phút · {exam.examCategory}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">Xem thông tin đề <ArrowRight size={15} /></span></button>)}</div> : <p>Chưa có đề trong ngân hàng.</p>)}
      {detailLoading && <p role="status">Đang tải thông tin đề…</p>}{detailError && <Notice>{detailError}</Notice>}{examDetail && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><button onClick={() => setExamDetail(null)} className="float-right rounded-lg p-1" aria-label="Đóng thông tin đề"><X size={20} /></button><h3 className="pr-8 font-bold">{examDetail.title}</h3><p className="mt-2 text-sm">{examDetail.total_questions ?? examDetail.totalQuestions ?? examDetail.questions?.length ?? '—'} câu · {examDetail.duration_minutes ?? examDetail.durationMinutes ?? '—'} phút</p>{examDetail.description && <p className="mt-3 text-sm leading-6">{examDetail.description}</p>}</div>}
    </section>}

    {section === 'analytics' && <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold">Cảnh báo & hỗ trợ học sinh</h2>{!classId ? <Notice>Chưa nhận được lớp phụ trách. Cảnh báo chỉ được tải khi có thông tin lớp cụ thể.</Notice> : resourceState('alerts') || <><p className="text-sm text-slate-500">{warnings?.activeAlertsCount ?? 0} cảnh báo cần xử lý · {warnings?.resolvedAlertsCount ?? 0} đã xử lý</p>{warnings?.alerts?.length ? warnings.alerts.map((alert) => <article key={alert.alertId} className="rounded-2xl border border-slate-200 p-5"><div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold">{alert.studentName}</h3><span className={`rounded-full px-3 py-1 text-xs font-bold ${alert.resolvedAt ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>{alert.resolvedAt ? 'Đã xử lý' : ({ RED: 'Nguy cơ cao', YELLOW: 'Cần chú ý', UNREALISTIC_GOAL: 'Cần tư vấn mục tiêu' }[alert.alertType] || alert.alertType)}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{alert.message}</p>{alert.resolutionNotes && <p className="mt-3 text-sm text-emerald-800">Ghi nhận: {alert.resolutionNotes}</p>}{!alert.resolvedAt && <button onClick={() => { setResolving(alert); setNotes(''); setSaveError(''); }} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Ghi nhận xử lý</button>}</article>) : <p className="rounded-xl bg-emerald-50 p-5 text-emerald-800">Chưa có cảnh báo cho các học sinh bạn phụ trách.</p>}</>}
      {resolving && <form onSubmit={resolveAlert} className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5"><h3 className="font-bold">Xử lý cảnh báo · {resolving.studentName}</h3><label className="mt-3 block text-sm">Nội dung đã hỗ trợ<textarea required value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 block min-h-28 w-full rounded-xl border border-indigo-200 bg-white p-3" /></label>{saveError && <p role="alert" className="mt-2 text-sm text-red-600">{saveError}</p>}<div className="mt-4 flex gap-3"><button disabled={saving || !notes.trim()} className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu kết quả xử lý'}</button><button type="button" disabled={saving} onClick={() => setResolving(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2">Hủy</button></div></form>}
    </section>}
    {section === 'dashboard' && <button onClick={() => onNavigate('history')} className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"><History size={17} /> Tra cứu lịch sử bài làm học sinh <ArrowRight size={16} /></button>}
  </div>;
}
