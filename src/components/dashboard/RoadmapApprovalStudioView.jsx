import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { contentService } from '../../services/contentService';

const STATUS_META = {
  DRAFT_PENDING_TEACHER: {
    label: 'Bản nháp • Chờ GV duyệt',
    cls: 'bg-amber-50 text-amber-800 border-amber-200'
  },
  PENDING_MANAGER_APPROVAL: {
    label: 'Chờ Quản lý cơ sở duyệt',
    cls: 'bg-sky-50 text-sky-800 border-sky-200'
  },
  PENDING_DIRECTOR_APPROVAL: {
    label: 'Ngoại lệ • Chờ Giám đốc duyệt',
    cls: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  },
  ACTIVE: {
    label: 'Đã kích hoạt (ACTIVE)',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200'
  }
};

const formatDate = (val) => (val ? new Date(val).toLocaleString('vi-VN') : '—');

export default function RoadmapApprovalStudioView({ mode = 'teacher', campusId = null }) {
  const isDirector = mode === 'director';
  const isManager = mode === 'manager';
  const isApprover = isDirector || isManager;
  const [statusTab, setStatusTab] = useState(
    isDirector ? 'PENDING_DIRECTOR_APPROVAL' : isManager ? 'PENDING_MANAGER_APPROVAL' : 'DRAFT_PENDING_TEACHER'
  );
  const [queue, setQueue] = useState([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [queueSearch, setQueueSearch] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Editable state for Teacher review
  const [editTargetScore, setEditTargetScore] = useState(900);
  const [editNote, setEditNote] = useState('');
  const [editNodes, setEditNodes] = useState([]);
  const [nodeSearch, setNodeSearch] = useState('');
  const [showAllNodes, setShowAllNodes] = useState(false);

  // Skill catalog for Teacher to add extra milestones
  const [curriculumSkills, setCurriculumSkills] = useState([]);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [pendingAddSkillIds, setPendingAddSkillIds] = useState([]);

  // Director decision note
  const [directorNote, setDirectorNote] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [actionBanner, setActionBanner] = useState(null);

  const loadQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError('');
    try {
      const data = await practiceService.getRoadmapReviewQueue('ALL', {
        campusId: isManager ? campusId : null
      });
      const list = Array.isArray(data) ? data : [];
      setQueue(list);
    } catch (err) {
      setQueueError(err?.data?.detail || err?.message || 'Không tải được hàng đợi phê duyệt lộ trình.');
    } finally {
      setQueueLoading(false);
    }
  }, [isManager, campusId]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (!isApprover) {
      contentService.getCurriculum().then((res) => {
        const domains = Array.isArray(res) ? res : (res?.domains || res?.data || []);
        const flat = [];
        domains.forEach((dom) => {
          (dom.chapters || []).forEach((ch) => {
            (ch.lessons || []).forEach((les) => {
              (les.patterns || []).forEach((pat) => {
                const sid = pat.patternId || pat.skillId || pat.id;
                if (!sid) return;
                flat.push({
                  skillId: String(sid),
                  skillName: pat.name || 'Kỹ năng chuyên đề',
                  chapterName: ch.name || '',
                  lessonName: les.name || '',
                  domainName: dom.title || dom.name || ''
                });
              });
            });
          });
        });
        setCurriculumSkills(flat);
      }).catch(() => {});
    }
  }, [isDirector]);

  const loadRoadmapDetail = useCallback(async (roadmapId) => {
    if (!roadmapId) {
      setDetail(null);
      setEditNodes([]);
      return;
    }
    setDetailLoading(true);
    setActionBanner(null);
    setPendingAddSkillIds([]);
    setShowAllNodes(false);
    try {
      const data = await practiceService.getRoadmapById(roadmapId);
      setDetail(data);
      setEditTargetScore(data?.targetScore != null ? Number(data.targetScore) : 900);
      setEditNote(data?.prunedReason || '');
      setDirectorNote('');
      setEditNodes(
        (data?.nodes || [])
          .slice()
          .sort((a, b) => a.stepOrder - b.stepOrder)
          .map((n) => ({
            ...n,
            _pruned: Boolean(n.isPruned || n.status === 'SKIPPED_PRUNED')
          }))
      );
    } catch (err) {
      setActionBanner({ type: 'error', text: err?.data?.detail || err?.message || 'Không tải được chi tiết lộ trình.' });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const counts = useMemo(() => {
    let draft = 0;
    let pendingManager = 0;
    let pendingDirector = 0;
    let active = 0;
    queue.forEach((item) => {
      if (item.status === 'DRAFT_PENDING_TEACHER') draft++;
      else if (item.status === 'PENDING_MANAGER_APPROVAL') pendingManager++;
      else if (item.status === 'PENDING_DIRECTOR_APPROVAL') pendingDirector++;
      else if (item.status === 'ACTIVE') active++;
    });
    return { draft, pendingManager, pendingDirector, active, all: queue.length };
  }, [queue]);

  const filteredQueue = useMemo(() => {
    const q = queueSearch.trim().toLowerCase();
    return queue.filter((item) => {
      if (statusTab !== 'ALL' && item.status !== statusTab) return false;
      if (q) {
        const hay = `${item.studentName || ''} ${item.placementClass || ''} ${item.reviewNote || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [queue, statusTab, queueSearch]);

  useEffect(() => {
    if (filteredQueue.length === 0) {
      setSelectedId(null);
      setDetail(null);
      return;
    }
    if (!selectedId || !filteredQueue.some((x) => x.roadmapId === selectedId)) {
      const firstId = filteredQueue[0].roadmapId;
      setSelectedId(firstId);
      loadRoadmapDetail(firstId);
    }
  }, [filteredQueue, selectedId, loadRoadmapDetail]);

  const selectedQueueItem = useMemo(
    () => queue.find((x) => x.roadmapId === selectedId) || null,
    [queue, selectedId]
  );

  const visibleEditNodes = useMemo(() => {
    const q = nodeSearch.trim().toLowerCase();
    const list = q
      ? editNodes.filter((n) =>
          `${n.skillName || ''} ${n.chapterName || ''} ${n.subjectName || ''}`.toLowerCase().includes(q)
        )
      : editNodes;
    return showAllNodes ? list : list.slice(0, 40);
  }, [editNodes, nodeSearch, showAllNodes]);

  const moveNode = (nodeId, direction) => {
    setEditNodes((prev) => {
      const idx = prev.findIndex((n) => n.nodeId === nodeId);
      if (idx < 0) return prev;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy.map((item, i) => ({ ...item, stepOrder: i + 1 }));
    });
  };

  const togglePruneNode = (nodeId) => {
    setEditNodes((prev) =>
      prev.map((n) => (n.nodeId === nodeId ? { ...n, _pruned: !n._pruned } : n))
    );
  };

  const handleTeacherSave = async (submitForDirectorApproval) => {
    if (!selectedId || actionBusy) return;
    setActionBusy(true);
    setActionBanner(null);
    try {
      const pruneNodeIds = editNodes.filter((n) => n._pruned).map((n) => n.nodeId);
      const restoreNodeIds = editNodes.filter((n) => !n._pruned).map((n) => n.nodeId);
      const orderedNodeIds = editNodes.slice(0, 60).map((n) => n.nodeId);

      const res = await practiceService.submitTeacherRoadmapReview(selectedId, {
        targetScore: Number(editTargetScore) || 850,
        teacherNote: editNote.trim() || null,
        pruneNodeIds,
        restoreNodeIds,
        orderedNodeIds,
        addSkillIds: pendingAddSkillIds,
        submitForDirectorApproval
      });
      setActionBanner({ type: 'success', text: res?.message || 'Đã cập nhật lộ trình thành công.' });
      setPendingAddSkillIds([]);
      await loadQueue();
      await loadRoadmapDetail(selectedId);
    } catch (err) {
      setActionBanner({ type: 'error', text: err?.data?.detail || err?.message || 'Không thể lưu chỉnh sửa lộ trình.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleApproverDecision = async ({ approve = false, escalateToDirector = false }) => {
    if (!selectedId || actionBusy) return;
    setActionBusy(true);
    setActionBanner(null);
    try {
      const res = await practiceService.submitDirectorRoadmapDecision(selectedId, {
        approve,
        escalateToDirector,
        reviewerRole: isManager ? 'manager' : 'director',
        directorNote: directorNote.trim() || null
      });
      setActionBanner({
        type: 'success',
        text: res?.message || (
          escalateToDirector
            ? 'Đã chuyển lộ trình lên Giám đốc Học thuật xem xét.'
            : approve
              ? 'Đã phê duyệt và kích hoạt lộ trình!'
              : 'Đã trả lại Giảng viên chỉnh sửa.'
        )
      });
      await loadQueue();
      await loadRoadmapDetail(selectedId);
    } catch (err) {
      setActionBanner({ type: 'error', text: err?.data?.detail || err?.message || 'Không thể thực hiện quyết định phê duyệt.' });
    } finally {
      setActionBusy(false);
    }
  };

  const availableSkillsToAdd = useMemo(() => {
    const existing = new Set([
      ...editNodes.map((n) => String(n.skillId || '').toLowerCase()),
      ...pendingAddSkillIds.map((id) => id.toLowerCase())
    ]);
    const q = skillSearch.trim().toLowerCase();
    return curriculumSkills
      .filter((s) => !existing.has(s.skillId.toLowerCase()))
      .filter((s) => !q || `${s.skillName} ${s.chapterName} ${s.domainName}`.toLowerCase().includes(q))
      .slice(0, 20);
  }, [curriculumSkills, editNodes, pendingAddSkillIds, skillSearch]);

  const canTeacherEdit = !isApprover && detail?.status !== 'ARCHIVED';

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm ${
            isDirector
              ? 'bg-gradient-to-br from-indigo-600 to-blue-700'
              : isManager
                ? 'bg-gradient-to-br from-sky-600 to-blue-600'
                : 'bg-gradient-to-br from-emerald-600 to-teal-700'
          }`}>
            {isApprover ? <ShieldCheck className="w-6 h-6" /> : <ClipboardCheck className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900">
              {isDirector
                ? 'Giám Sát & Phê Duyệt Lộ Trình (Liên Cơ Sở)'
                : isManager
                  ? 'Phê Duyệt Lộ Trình Học Sinh (Cấp Cơ Sở)'
                  : 'Tinh Chỉnh & Gửi Duyệt Bản Nháp Lộ Trình Học Sinh'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isDirector
                ? 'Duyệt các ca ngoại lệ được Quản lý cơ sở chuyển lên và hậu kiểm chất lượng lộ trình ACTIVE trên toàn hệ thống.'
                : isManager
                  ? 'Phê duyệt thường quy lộ trình của học sinh thuộc cơ sở mình để kích hoạt (ACTIVE) ngay, hoặc chuyển ca ngoại lệ lên Giám đốc.'
                  : 'Hệ thống tự tạo bản nháp sau bài thi đầu vào 30 câu. Giảng viên rà soát, thêm/ẩn/đổi thứ tự chặng rồi gửi Quản lý cơ sở duyệt.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadQueue}
          disabled={queueLoading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-extrabold text-slate-700 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${queueLoading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </section>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/70">
          {[
            { key: 'DRAFT_PENDING_TEACHER', label: 'Chờ GV rà soát', count: counts.draft },
            { key: 'PENDING_MANAGER_APPROVAL', label: 'Chờ Quản lý cơ sở', count: counts.pendingManager },
            { key: 'PENDING_DIRECTOR_APPROVAL', label: 'Ngoại lệ (Giám đốc)', count: counts.pendingDirector },
            { key: 'ACTIVE', label: 'Đã kích hoạt', count: counts.active },
            { key: 'ALL', label: 'Tất cả', count: counts.all }
          ].map((tab) => {
            const active = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer transition-all ${
                  active ? 'bg-white text-blue-700 shadow-xs ring-1 ring-blue-200/80' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                  active ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={queueSearch}
            onChange={(e) => setQueueSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {queueError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {queueError}
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Student Roadmap Queue */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800">Danh sách lộ trình ({filteredQueue.length})</span>
          </div>

          {queueLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Đang tải danh sách...</div>
          ) : filteredQueue.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 space-y-1">
              <div className="font-bold text-slate-700">Chưa có lộ trình nào ở trạng thái này</div>
              <p>Khi học sinh hoàn thành bài thi đầu vào 30 câu, bản nháp sẽ tự xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
              {filteredQueue.map((item) => {
                const isSelected = item.roadmapId === selectedId;
                const badge = STATUS_META[item.status] || { label: item.status, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
                return (
                  <button
                    key={item.roadmapId}
                    type="button"
                    onClick={() => {
                      setSelectedId(item.roadmapId);
                      loadRoadmapDetail(item.roadmapId);
                    }}
                    className={`w-full text-left p-4 transition-colors cursor-pointer space-y-2 ${
                      isSelected ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 truncate">{item.studentName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Cập nhật: {formatDate(item.updatedAt)}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600">
                      {item.diagnosticCorrect != null && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5">
                          Đầu vào: {item.diagnosticCorrect}/{item.diagnosticTotal || 30} câu
                        </span>
                      )}
                      <span className="rounded-md bg-indigo-50 text-indigo-700 px-2 py-0.5">
                        Mục tiêu: {item.targetScore}
                      </span>
                      <span className="rounded-md bg-emerald-50 text-emerald-700 px-2 py-0.5">
                        {item.activeMilestones} chặng
                      </span>
                    </div>

                    {item.reviewNote && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 bg-white/80 rounded-lg border border-slate-100 px-2.5 py-1.5">
                        {item.reviewNote}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Roadmap Inspector & Editor */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
          {detailLoading ? (
            <div className="py-16 text-center text-sm text-slate-500">Đang tải chi tiết lộ trình...</div>
          ) : !detail ? (
            <div className="py-16 text-center text-sm text-slate-500">
              Chọn một học sinh ở danh sách bên trái để xem và phê duyệt lộ trình.
            </div>
          ) : (
            <>
              {/* Selected Student Summary */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {selectedQueueItem?.studentName || 'Lộ trình học sinh'}
                    </h2>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${
                      (STATUS_META[detail.status] || {}).cls || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {(STATUS_META[detail.status] || {}).label || detail.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Chặng kích hoạt: <strong>{editNodes.filter((n) => !n._pruned).length}</strong> • Đã ẩn/cắt tỉa: <strong>{editNodes.filter((n) => n._pruned).length}</strong> • Hoàn thành: <strong>{detail.completedMilestones}</strong>
                  </p>
                </div>

                {canTeacherEdit && (
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <span>Mục tiêu điểm:</span>
                      <input
                        type="number"
                        min={400}
                        max={1200}
                        step={10}
                        value={editTargetScore}
                        onChange={(e) => setEditTargetScore(e.target.value)}
                        className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-black text-indigo-700 focus:bg-white focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                  </div>
                )}
              </div>

              {actionBanner && (
                <div className={`rounded-2xl border px-4 py-3 text-xs font-bold flex items-center gap-2 ${
                  actionBanner.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}>
                  {actionBanner.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                  <span>{actionBanner.text}</span>
                </div>
              )}

              {/* Teacher Note / Add Skill Toolbar */}
              {canTeacherEdit && (
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-emerald-950">Ghi chú sư phạm của Giảng viên (gửi kèm lên Giám đốc)</span>
                    <button
                      type="button"
                      onClick={() => setSkillPickerOpen((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-800 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm chặng kỹ năng ({pendingAddSkillIds.length})</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    placeholder="Ví dụ: Đã đẩy 3 chặng Toán Oxyz và Ngữ văn 10 lên đầu vì học sinh sai câu đầu vào, ẩn bớt các dạng đã đạt 90%..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />

                  {skillPickerOpen && (
                    <div className="rounded-xl border border-emerald-200 bg-white p-3 space-y-2.5">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={skillSearch}
                          onChange={(e) => setSkillSearch(e.target.value)}
                          placeholder="Tìm kỹ năng / dạng bài trong khung SGK để thêm vào lộ trình..."
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-slate-100">
                        {availableSkillsToAdd.map((sk) => (
                          <div key={sk.skillId} className="py-1.5 flex items-center justify-between gap-2 text-xs">
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate">{sk.skillName}</div>
                              <div className="text-[11px] text-slate-500 truncate">{sk.chapterName}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setPendingAddSkillIds((prev) => [...prev, sk.skillId])}
                              className="shrink-0 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold cursor-pointer"
                            >
                              + Thêm
                            </button>
                          </div>
                        ))}
                        {availableSkillsToAdd.length === 0 && (
                          <div className="py-3 text-center text-[11px] text-slate-400">Không tìm thấy kỹ năng phù hợp.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Director Review Note Banner */}
              {isDirector && detail.prunedReason && (
                <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 px-4 py-3 text-xs text-indigo-950">
                  <strong className="font-black">Ghi chú từ Giảng viên: </strong>
                  {detail.prunedReason}
                </div>
              )}

              {/* Milestone List */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-800">
                    Danh sách chặng học ({editNodes.length} chặng)
                  </span>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={nodeSearch}
                      onChange={(e) => setNodeSearch(e.target.value)}
                      placeholder="Lọc nhanh chặng / môn..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:bg-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                  {visibleEditNodes.map((n, idx) => (
                    <div
                      key={n.nodeId}
                      className={`px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs ${
                        n._pruned ? 'bg-slate-50 opacity-55' : 'bg-white'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-blue-700 shrink-0">#{n.stepOrder}</span>
                          <span className={`font-bold truncate ${n._pruned ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {n.skillName}
                          </span>
                          {n.assessmentStatus === 'WEAK' && (
                            <span className="rounded-full bg-rose-50 text-rose-700 px-2 py-0.5 text-[10px] font-extrabold shrink-0">
                              Ưu tiên
                            </span>
                          )}
                          {n._pruned && (
                            <span className="rounded-full bg-slate-200 text-slate-600 px-2 py-0.5 text-[10px] font-bold shrink-0">
                              Đã ẩn
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {[n.subjectName, n.chapterName].filter(Boolean).join(' • ') || n.domainName}
                        </div>
                      </div>

                      {canTeacherEdit && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveNode(n.nodeId, -1)}
                            title="Đưa lên ưu tiên trước"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5 text-slate-700" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === editNodes.length - 1}
                            onClick={() => moveNode(n.nodeId, 1)}
                            title="Đẩy xuống sau"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5 text-slate-700" />
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePruneNode(n.nodeId)}
                            title={n._pruned ? 'Khôi phục chặng này' : 'Ẩn / cắt tỉa chặng này'}
                            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold cursor-pointer ${
                              n._pruned
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-600'
                            }`}
                          >
                            {n._pruned ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{n._pruned ? 'Hiện' : 'Ẩn'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {editNodes.length > 40 && !showAllNodes && (
                  <button
                    type="button"
                    onClick={() => setShowAllNodes(true)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2 text-xs font-bold text-slate-600 cursor-pointer"
                  >
                    Xem thêm toàn bộ {editNodes.length} chặng
                  </button>
                )}
              </div>

              {/* Action Footer */}
              {canTeacherEdit ? (
                <div className="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => handleTeacherSave(false)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-extrabold text-slate-700 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu nháp chỉnh sửa</span>
                  </button>
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={() => handleTeacherSave(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{actionBusy ? 'Đang gửi...' : 'Gửi Quản Lý Cơ Sở Phê Duyệt'}</span>
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-extrabold text-slate-800">
                      Nhận xét / Lý do phê duyệt (hoặc chuyển Giám đốc / yêu cầu Giảng viên chỉnh lại)
                    </span>
                    <textarea
                      rows={2}
                      value={directorNote}
                      onChange={(e) => setDirectorNote(e.target.value)}
                      placeholder="Ví dụ: Đồng ý lộ trình đã tinh chỉnh, kích hoạt cho học sinh bắt đầu học tuần này..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
                    />
                  </label>
                  <div className="flex flex-wrap items-center justify-end gap-2.5">
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => handleApproverDecision({ approve: false })}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50 px-4 py-2.5 text-xs font-extrabold text-rose-700 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Trả lại Giảng viên sửa</span>
                    </button>
                    {isManager && detail?.status !== 'PENDING_DIRECTOR_APPROVAL' && (
                      <button
                        type="button"
                        disabled={actionBusy}
                        onClick={() => handleApproverDecision({ escalateToDirector: true })}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 text-xs font-extrabold text-indigo-700 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>Chuyển Giám Đốc Duyệt (Ngoại lệ)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => handleApproverDecision({ approve: true })}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-extrabold text-white shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{actionBusy ? 'Đang xử lý...' : 'Phê Duyệt & Kích Hoạt Lộ Trình (ACTIVE)'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
