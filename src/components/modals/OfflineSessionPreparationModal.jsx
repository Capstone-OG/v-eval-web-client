import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Users,
  CheckCircle2,
  FileText,
  Plus,
  Trash2,
  Flame,
  Target
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';
import {
  getOfflineSessionPlan,
  saveOfflineSessionPlan,
  buildMicroGroupsFromStudents,
  generateDefaultSessionPlan,
  hasMatchingRoster
} from '../../utils/offlineSessionStore';

export default function OfflineSessionPreparationModal({
  isOpen,
  onClose,
  session,
  onSaveSuccess
}) {
  const [activeTab, setActiveTab] = useState('part1'); // 'part1' | 'part2'
  const [plan, setPlan] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load kế hoạch buổi học đồng bộ 100% danh sách học sinh thật từ Backend
  useEffect(() => {
    if (!isOpen || !session) return;

    const sessionId = session.sessionId || session.id;
    const classId = session.classId;

    const loadSessionData = async () => {
      setLoadingHeatmap(true);
      try {
        // Tải đồng thời ma trận nhiệt (heatmap) và dữ liệu chuyên cần để lấy danh sách học sinh thật
        const [hmRes, attRes] = await Promise.allSettled([
          classId ? practiceService.getClassHeatmap(classId) : Promise.resolve(null),
          sessionId ? practiceService.getSessionAttendances(sessionId) : Promise.resolve(null)
        ]);

        const hm = hmRes.status === 'fulfilled' ? hmRes.value : null;
        const attData = attRes.status === 'fulfilled' ? attRes.value : null;

        setHeatmapData(hm);

        // Xây dựng danh sách họ tên thật của học sinh từ dữ liệu lớp học
        const rows = hm?.rows || [];
        const attRecords = attData?.records || attData?.Records || [];
        const nameMap = new Map();
        rows.forEach((r) => {
          if (r.studentId && r.studentName) nameMap.set(r.studentId, r.studentName);
        });

        // Đếm họ tên trùng lặp trong lớp để đánh dấu mã định danh phân biệt
        const nameCountMap = new Map();
        rows.forEach((r) => {
          const n = (r.studentName || '').trim();
          if (n) nameCountMap.set(n, (nameCountMap.get(n) || 0) + 1);
        });
        attRecords.forEach((a) => {
          const n = (a.studentName || nameMap.get(a.studentId) || '').trim();
          if (n) nameCountMap.set(n, (nameCountMap.get(n) || 0) + 1);
        });

        const formatStudentDisplayName = (rawName, studentId) => {
          const trimmed = (rawName || '').trim();
          if (!trimmed) return studentId ? `Học sinh #${String(studentId).slice(-4).toUpperCase()}` : 'Học sinh';
          if ((nameCountMap.get(trimmed) || 0) > 1 && studentId) {
            return `${trimmed} (#${String(studentId).slice(-4).toUpperCase()})`;
          }
          return trimmed;
        };

        let realStudents = [];
        if (rows.length > 0) {
          realStudents = rows.map((r) => ({
            id: r.studentId,
            name: formatStudentDisplayName(r.studentName, r.studentId),
            currentScore: r.overallMastery != null ? `${Math.round(r.overallMastery * 100)}%` : '0%'
          }));
        } else if (attRecords.length > 0) {
          realStudents = attRecords.map((r) => ({
            id: r.studentId,
            name: formatStudentDisplayName(r.studentName || nameMap.get(r.studentId), r.studentId),
            currentScore: '0%'
          }));
        }

        // Đọc kế hoạch hiện có (kiểm tra đối soát đúng học sinh của lớp)
        let currentPlan = getOfflineSessionPlan(sessionId, null);

        if (!currentPlan || !hasMatchingRoster(currentPlan, realStudents)) {
          // Tạo kế hoạch mới bám sát 100% học sinh thật của lớp
          currentPlan = generateDefaultSessionPlan(session, realStudents, hm?.columns || []);
          saveOfflineSessionPlan(sessionId, currentPlan);
        } else if (
          realStudents.length > 0 &&
          (!currentPlan.part2?.microGroups || currentPlan.part2.microGroups.length === 0)
        ) {
          // Cập nhật phân nhóm bàn học bằng học sinh thật nếu trước đó chưa có
          currentPlan = {
            ...currentPlan,
            part2: {
              ...currentPlan.part2,
              microGroups: buildMicroGroupsFromStudents(realStudents, hm?.columns || [])
            }
          };
          saveOfflineSessionPlan(sessionId, currentPlan);
        }

        setPlan(currentPlan);
      } catch (err) {
        console.warn('[OfflineSessionPrep] Error loading session data:', err.message);
        setPlan(getOfflineSessionPlan(sessionId, session));
      } finally {
        setLoadingHeatmap(false);
      }
    };

    loadSessionData();
  }, [isOpen, session]);

  if (!isOpen || !session) return null;

  if (!plan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs font-bold text-slate-800">Đang nạp dữ liệu lớp học...</div>
          <div className="text-[11px] text-slate-500">Đồng bộ danh sách học sinh và điểm yếu</div>
        </div>
      </div>
    );
  }

  // Thêm dạng bài vào danh sách chữa bài chung
  const handleAddTopic = (col) => {
    const skillName = col.skillName || col.SkillName || col.name || col.title || 'Kỹ năng';
    const exists = plan.part1.focusTopics.some((t) => t.skillName === skillName);
    if (exists) {
      toast.info('Dạng bài này đã có trong danh sách chữa bài.');
      return;
    }

    const rawPlt = col.classAveragePlt ?? col.ClassAveragePlt ?? col.averagePlt ?? col.AveragePlt ?? col.plt;
    const masteryPct = rawPlt != null
      ? (rawPlt <= 1 ? Math.round(rawPlt * 100) : Math.round(rawPlt))
      : 50;
    const errorRatePct = Math.max(0, Math.min(100, 100 - masteryPct));

    const newTopic = {
      id: col.skillId || col.SkillId || `TOPIC-${Date.now()}`,
      skillName,
      errorRatePct
    };

    setPlan({
      ...plan,
      part1: {
        ...plan.part1,
        focusTopics: [...plan.part1.focusTopics, newTopic]
      }
    });
    toast.success(`Đã thêm "${skillName}" vào danh sách chữa bài.`);
  };

  // Xóa dạng bài khỏi danh sách
  const handleRemoveTopic = (topicId) => {
    setPlan({
      ...plan,
      part1: {
        ...plan.part1,
        focusTopics: plan.part1.focusTopics.filter((t) => t.id !== topicId)
      }
    });
  };

  // Giảng viên chủ động đổi bàn cho học sinh trong kế hoạch buổi học
  const handleMoveStudentInPlan = (studentId, fromGroupId, toGroupId) => {
    if (!plan?.part2?.microGroups) return;
    const fromGroup = plan.part2.microGroups.find((g) => g.groupId === fromGroupId);
    const toGroup = plan.part2.microGroups.find((g) => g.groupId === toGroupId);
    if (!fromGroup || !toGroup) return;

    const studentToMove = (fromGroup.students || []).find((s) => s.id === studentId);
    if (!studentToMove) return;

    const updatedGroups = plan.part2.microGroups.map((g) => {
      if (g.groupId === fromGroupId) {
        const nextStudents = (g.students || []).filter((s) => s.id !== studentId);
        return { ...g, students: nextStudents, studentCount: nextStudents.length };
      }
      if (g.groupId === toGroupId) {
        const nextStudents = [...(g.students || []), studentToMove];
        return { ...g, students: nextStudents, studentCount: nextStudents.length };
      }
      return g;
    });

    setPlan({
      ...plan,
      part2: {
        ...plan.part2,
        microGroups: updatedGroups
      }
    });

    toast.success(`Đã chuyển ${studentToMove.name} sang ${toGroup.tableName}!`);
  };

  // Lưu kế hoạch buổi học
  const handleSave = () => {
    setSaving(true);
    try {
      const sessionId = session.sessionId || session.id;
      const saved = saveOfflineSessionPlan(sessionId, plan);
      if (saved) {
        toast.success('Đã lưu nội dung buổi học thành công!');
        if (onSaveSuccess) onSaveSuccess(saved);
        onClose();
      } else {
        toast.error('Có lỗi xảy ra khi lưu.');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu kế hoạch buổi học');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Tinh Gọn */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Chuẩn Bị Buổi Học — Buổi số {session.sessionNo}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {session.className} • Phòng {session.room || 'P.301'} • Ngày {session.sessionDate}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 Tabs chuyển đổi thanh lịch */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/60 px-6 pt-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('part1')}
            className={`pb-2.5 px-3.5 font-bold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'part1'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg border-t border-x border-slate-200 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>1. Chữa bài chung cả lớp</span>
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
              {plan.part1.focusTopics.length} dạng
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('part2')}
            className={`pb-2.5 px-3.5 font-bold text-xs transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'part2'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg border-t border-x border-slate-200 shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>2. Nhóm học tập tại bàn</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
              {plan.part2.microGroups.length} bàn
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* TAB 1: CHỮA BÀI CHUNG CẢ LỚP */}
          {activeTab === 'part1' && (
            <div className="space-y-5">
              {/* Gợi ý dạng bài học sinh hay làm sai */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span>Các kỹ năng học sinh làm sai nhiều nhất:</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Bấm để thêm vào danh sách chữa bài</span>
                </div>

                {loadingHeatmap ? (
                  <div className="text-xs text-slate-400 italic py-2">Đang tải dữ liệu của lớp...</div>
                ) : heatmapData?.columns && heatmapData.columns.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {(() => {
                      const sortedCols = (heatmapData.columns || [])
                        .slice()
                        .sort((a, b) => {
                          const pltA = a.classAveragePlt ?? a.ClassAveragePlt ?? a.averagePlt ?? 0.5;
                          const pltB = b.classAveragePlt ?? b.ClassAveragePlt ?? b.averagePlt ?? 0.5;
                          return pltA - pltB;
                        })
                        .slice(0, 6);

                      return sortedCols.map((col) => {
                        const skillName = col.skillName || col.SkillName || col.name || col.title || 'Kỹ năng';
                        const colId = col.skillId || col.SkillId || col.id || skillName;
                        const rawPlt = col.classAveragePlt ?? col.ClassAveragePlt ?? col.averagePlt ?? col.AveragePlt ?? col.plt;
                        const masteryPct = rawPlt != null
                          ? (rawPlt <= 1 ? Math.round(rawPlt * 100) : Math.round(rawPlt))
                          : 50;
                        const errorRatePct = Math.max(0, Math.min(100, 100 - masteryPct));
                        const isAdded = plan.part1.focusTopics.some((t) => t.skillName === skillName);

                        return (
                          <div
                            key={colId}
                            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-800 truncate" title={skillName}>
                                {skillName}
                              </div>
                              <div className="text-[11px] font-semibold text-rose-600">
                                Làm sai: {errorRatePct}%
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isAdded}
                              onClick={() => handleAddTopic(col)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                isAdded
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer'
                              }`}
                            >
                              {isAdded ? 'Đã chọn' : '+ Thêm'}
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : null}
              </div>

              {/* Danh sách dạng bài đã chọn */}
              <div className="space-y-2.5 pt-1">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Dạng bài chữa trên lớp ({plan.part1.focusTopics.length} chuyên đề):</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {plan.part1.focusTopics.map((topic, idx) => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      <div className="text-xs font-black text-slate-900 truncate">
                        #{idx + 1}. {topic.skillName}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer shrink-0"
                        title="Xóa dạng bài này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dặn dò học sinh */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dặn dò học sinh chuẩn bị trước:</span>
                </label>
                <textarea
                  rows={2}
                  value={plan.part1.preClassPreparationNote}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      part1: { ...plan.part1, preClassPreparationNote: e.target.value }
                    })
                  }
                  placeholder="Nhập dặn dò học sinh xem lại bài trước buổi học..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 text-xs font-medium text-slate-800 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: NHÓM HỌC TẬP TẠI BÀN */}
          {activeTab === 'part2' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {plan.part2.microGroups.map((group) => (
                  <div
                    key={group.groupId}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-xs font-black border border-indigo-200/60">
                        {group.tableName}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{group.studentCount} bạn</span>
                      </span>
                    </div>

                    <div className="text-xs text-slate-700">
                      <span className="font-semibold text-slate-500">Trọng tâm: </span>
                      <span className="font-bold text-slate-900">{group.focusWeakness}</span>
                    </div>

                    {/* Danh sách học sinh */}
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                      {group.students.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-[11px] font-semibold text-slate-700 py-0.5"
                        >
                          <span className="truncate max-w-[150px] sm:max-w-[180px]" title={st.name}>{st.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-1">
                            <span className="text-slate-400 font-normal">Đạt: {st.currentScore}</span>
                            {plan.part2.microGroups.length > 1 && (
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) handleMoveStudentInPlan(st.id, group.groupId, e.target.value);
                                }}
                                className="text-[10px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded px-1 py-0.5 cursor-pointer transition-colors"
                                title="Chuyển học sinh này sang bàn khác"
                              >
                                <option value="" disabled>⇄</option>
                                {plan.part2.microGroups
                                  .filter((other) => other.groupId !== group.groupId)
                                  .map((other) => (
                                    <option key={other.groupId} value={other.groupId}>
                                      Sang {other.tableName}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Phiếu bài tập */}
                    <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-bold text-slate-800 text-[11px] truncate">
                          {group.worksheet.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-700 font-bold shrink-0">
                        {group.worksheet.questionCount} câu
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Đang lưu...' : 'Lưu nội dung buổi học'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
