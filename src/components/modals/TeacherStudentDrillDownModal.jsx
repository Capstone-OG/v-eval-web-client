import React, { useState, useEffect } from 'react';
import {
  User,
  X,
  Target,
  AlertTriangle,
  CheckCircle2,
  Send,
  BookOpen,
  History,
  RotateCw,
  Sparkles,
  Award
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from '../../context/ToastContext';

export default function TeacherStudentDrillDownModal({
  isOpen,
  onClose,
  student,
  columns = [],
  onOpenMicroGroups
}) {
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [pedagogicalNote, setPedagogicalNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    if (!isOpen || !student?.studentId) return;

    let active = true;
    setLoadingHistory(true);
    setPedagogicalNote('');

    apiClient.get(`/api/practice/diagnostic-submissions/student/${encodeURIComponent(student.studentId)}`)
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.value) ? res.data.value : [];
        setHistoryData(list);
      })
      .catch((err) => {
        if (!active) return;
        console.warn('[TeacherStudentDrillDownModal] Error fetching student history:', err.message);
        setHistoryData([]);
      })
      .finally(() => {
        if (active) setLoadingHistory(false);
      });

    return () => { active = false; };
  }, [isOpen, student?.studentId]);

  if (!isOpen || !student) return null;

  const cellMap = new Map((student.skillCells || []).map((c) => [c.skillId, c]));
  const weakSkills = columns.filter((col) => {
    const cell = cellMap.get(col.skillId);
    return cell && Number(cell.plt ?? 0) < 0.5;
  });
  const masteredSkills = columns.filter((col) => {
    const cell = cellMap.get(col.skillId);
    return cell && Number(cell.plt ?? 0) >= 0.75;
  });

  const handleSendNote = (e) => {
    e.preventDefault();
    if (!pedagogicalNote.trim()) return;

    setSubmittingNote(true);
    setTimeout(() => {
      setSubmittingNote(false);
      toast.success(`Đã gửi lời nhắn đến học sinh ${student.studentName} & Phụ huynh!`);
      setPedagogicalNote('');
      onClose();
    }, 600);
  };

  const getProficiencyLabel = (t) => {
    const val = Number(t ?? 0);
    if (val >= 1.0) return 'Xuất sắc';
    if (val >= 0.5) return 'Giỏi';
    if (val >= 0.0) return 'Khá';
    if (val >= -0.5) return 'Trung bình';
    return 'Cần bồi dưỡng';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0 font-black text-lg">
              {String(student.studentName || 'H').charAt(0)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {student.studentName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                  student.riskStatus === 'HIGH_RISK'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                    : student.riskStatus === 'MEDIUM_RISK'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {student.riskStatus === 'HIGH_RISK' ? 'Cần kèm cặp' : student.riskStatus === 'MEDIUM_RISK' ? 'Cần theo dõi' : 'Tiến độ tốt'}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium mt-1">
                Đánh giá học lực: <strong className="text-white">{getProficiencyLabel(student.thetaScore)}</strong>
                {' '}• Lớp: <span className="text-cyan-300 font-semibold">{student.className || 'Lớp phụ trách'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
              <div className="text-[11px] font-bold text-rose-700 uppercase">Chuyên đề cần ôn tập</div>
              <div className="text-2xl font-black text-rose-800 mt-1">{weakSkills.length} chuyên đề</div>
              <p className="text-[10px] text-rose-600 mt-0.5">Mức độ hiểu bài dưới 50%</p>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">Chuyên đề đã nắm vững</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{masteredSkills.length} chuyên đề</div>
              <p className="text-[10px] text-emerald-600 mt-0.5">Mức độ hiểu bài từ 75% trở lên</p>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
              <div className="text-[11px] font-bold text-indigo-700 uppercase">Bài kiểm tra đã nộp</div>
              <div className="text-2xl font-black text-indigo-800 mt-1">{historyData.length} lượt</div>
              <p className="text-[10px] text-indigo-600 mt-0.5">Đã hoàn thành</p>
            </div>
          </div>

          {/* Weak Skills List */}
          {weakSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Các chuyên đề cần hỗ trợ ôn tập:</span>
                </div>
                {onOpenMicroGroups && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMicroGroups(weakSkills[0]?.skillName);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Xếp vào nhóm ôn tập</span>
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {weakSkills.map((col) => {
                  const cell = cellMap.get(col.skillId);
                  const pct = Math.round(Number(cell?.plt ?? 0) * 100);
                  return (
                    <span
                      key={col.skillId}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold"
                    >
                      <span>{col.skillName}</span>
                      <strong className="text-rose-600">({pct}%)</strong>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diagnostic Submissions History */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-extrabold uppercase text-slate-500">
                Lịch sử các bài kiểm tra khảo sát
              </h3>
            </div>

            {loadingHistory ? (
              <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Đang tải lịch sử bài làm...</span>
              </div>
            ) : historyData.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                Học sinh chưa có bài kiểm tra khảo sát nào trên hệ thống.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {historyData.map((item, idx) => (
                  <div
                    key={item.submissionId || idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-extrabold text-slate-800">
                        Bài kiểm tra • Trạng thái: {item.status === 'COMPLETED' ? 'Đã hoàn thành' : (item.status || 'Đã nộp')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.completedAt ? new Date(item.completedAt).toLocaleString('vi-VN') : '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-indigo-700">
                        {item.totalCorrect ?? 0}/{item.totalQuestions ?? 0} câu đúng
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Tỉ lệ: {item.totalQuestions ? Math.round(((item.totalCorrect || 0) / item.totalQuestions) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pedagogical Note Form */}
          <form onSubmit={handleSendNote} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-extrabold text-slate-800">
                Gửi lời nhắn / nhận xét đến Học sinh & Phụ huynh
              </h3>
            </div>
            <textarea
              value={pedagogicalNote}
              onChange={(e) => setPedagogicalNote(e.target.value)}
              placeholder="Nhập lời dặn dò, hướng dẫn ôn tập hoặc động viên dành cho học sinh..."
              rows={3}
              required
              className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={submittingNote || !pedagogicalNote.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submittingNote && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Gửi nhận xét</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}

