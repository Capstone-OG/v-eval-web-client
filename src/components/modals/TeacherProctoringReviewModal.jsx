import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  Eye,
  RotateCw,
  X,
  Clock,
  User,
  FileText,
  AlertOctagon,
  ExternalLink
} from 'lucide-react';
import { practiceService } from '../../services/practiceService';
import { toast } from '../../context/ToastContext';

export default function TeacherProctoringReviewModal({
  isOpen,
  onClose,
  submissionId,
  fallbackStudentName = '',
  fallbackExamTitle = '',
  onReviewSubmitted
}) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [verdict, setVerdict] = useState('APPROVED'); // 'APPROVED' | 'DISQUALIFIED'
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    let active = true;
    setLoading(true);
    setError('');
    setDetail(null);
    setVerdict('APPROVED');
    setNotes('');

    practiceService.getMockExamSubmissionDetail(submissionId)
      .then((data) => {
        if (!active) return;
        setDetail(data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || 'Không thể tải chi tiết bài thi thử.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [isOpen, submissionId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error('Vui lòng nhập ghi chú / biên bản giải trình sư phạm trước khi xác nhận thẩm duyệt.');
      return;
    }

    try {
      setSubmitting(true);
      await practiceService.submitMentorReview(submissionId, {
        verdict,
        notes: notes.trim()
      });

      toast.success(
        verdict === 'APPROVED'
          ? 'Đã công nhận bài thi hợp lệ thành công!'
          : 'Đã hủy kết quả bài thi do vi phạm quy chế!'
      );

      if (onReviewSubmitted) {
        onReviewSubmitted({ submissionId, verdict, notes: notes.trim() });
      }
      onClose();
    } catch (err) {
      toast.error('Lỗi thẩm duyệt bài thi: ' + (err?.message || 'Không thể lưu thẩm duyệt.'));
    } finally {
      setSubmitting(false);
    }
  };

  const snapshots = detail?.visualAuditTrail || detail?.snapshots || [];
  const tabDepartures = detail?.tabDepartureCount ?? 0;
  const isFlagged = tabDepartures > 3 || detail?.integrityStatus === 'FLAGGED_FOR_REVIEW' || detail?.integrityStatus === 'UNDER_REVIEW';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Kiểm Tra Tính Trung Thực Bài Thi Thử
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${
                  isFlagged
                    ? 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                }`}>
                  {isFlagged ? 'CẦN XEM XÉT' : 'HỢP LỆ'}
                </span>
              </div>
              <p className="text-xs text-rose-200/80 font-medium mt-1">
                Kiểm tra lại bài làm có số lần rời màn hình thi vượt mức hoặc hình ảnh bất thường
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

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RotateCw className="w-8 h-8 text-rose-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Đang tải hồ sơ giám sát bài thi...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Không thể nạp dữ liệu bài thi thử</span>
              </div>
              <p className="font-normal text-slate-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Candidate & Exam Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Thí sinh</div>
                  <div className="text-sm font-black text-slate-900 mt-1 truncate">
                    {detail?.studentName || fallbackStudentName || detail?.studentId || 'Thí sinh'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Đề thi</div>
                  <div className="text-sm font-black text-slate-900 mt-1 truncate" title={detail?.examTitle || fallbackExamTitle}>
                    {detail?.examTitle || fallbackExamTitle || 'Đề thi thử chuẩn hóa'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Điểm số ước tính</div>
                  <div className="text-sm font-black text-indigo-700 mt-1">
                    {(detail?.score ?? detail?.totalScore) != null ? `${detail?.score ?? detail?.totalScore}đ` : '—'}
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      ({detail?.totalCorrect ?? 0}/{detail?.totalQuestions ?? 120} câu)
                    </span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  tabDepartures > 3
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="text-[11px] font-bold uppercase opacity-80">Số lần rời tab (BR-20)</div>
                  <div className="text-sm font-black mt-1 flex items-center gap-1.5">
                    {tabDepartures > 3 && <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />}
                    <span>{tabDepartures} lần</span>
                    {tabDepartures > 3 && (
                      <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-black">
                        Vượt ngưỡng (&gt;3)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Visual Audit Trail Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Chuỗi Bằng Chứng Thị Giác (Webcam Snapshots: {snapshots.length} ảnh)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Chụp định kỳ ngẫu nhiên trong suốt 150 phút làm bài
                  </span>
                </div>

                {snapshots.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                    Không ghi nhận ảnh chụp webcam bất thường nào trong phiên làm bài này.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-slate-200/80">
                    {snapshots.map((snap, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:border-indigo-400 transition-all flex flex-col"
                      >
                        <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
                          {snap.snapshotUrl ? (
                            <img
                              src={snap.snapshotUrl}
                              alt={`Snapshot ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-slate-500 text-[10px] text-center p-2">
                              Ảnh mã hóa an toàn #{idx + 1}
                            </div>
                          )}
                          <div className="absolute top-1 right-1">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                              snap.faceDetected !== false
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}>
                              {snap.faceDetected !== false ? 'Khuôn mặt OK' : 'Vắng mặt'}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 text-[10px] text-slate-500 flex items-center justify-between">
                          <span>Ảnh #{idx + 1}</span>
                          <span>
                            {snap.capturedAt
                              ? new Date(snap.capturedAt).toLocaleTimeString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })
                              : '--:--'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mentor Verdict Form */}
              <form onSubmit={handleSubmit} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Đánh Giá Của Thầy / Cô
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    verdict === 'APPROVED'
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="verdict"
                      value="APPROVED"
                      checked={verdict === 'APPROVED'}
                      onChange={() => setVerdict('APPROVED')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Công nhận bài thi hợp lệ</span>
                      </div>
                      <p className="text-[11px] text-emerald-800/80 mt-1">
                        Công nhận kết quả bài thi này là trung thực và lưu điểm cho học sinh.
                      </p>
                    </div>
                  </label>

                  <label className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    verdict === 'DISQUALIFIED'
                      ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="verdict"
                      value="DISQUALIFIED"
                      checked={verdict === 'DISQUALIFIED'}
                      onChange={() => setVerdict('DISQUALIFIED')}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <div className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Hủy kết quả bài thi do vi phạm quy chế</span>
                      </div>
                      <p className="text-[11px] text-rose-800/80 mt-1">
                        Hủy kết quả bài thi này do vi phạm quy định làm bài trực tuyến.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
                    Ghi chú nhận xét của thầy cô (Bắt buộc)
                  </label>
                  <textarea
                    required
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Ví dụ: Đã kiểm tra hình ảnh và thời gian rời màn hình (do sự cố mạng). Bài thi trung thực và công nhận kết quả..."
                    className="w-full p-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !notes.trim()}
                    className={`px-5 py-2 font-black text-xs text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ${
                      verdict === 'APPROVED'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {submitting && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>
                      {submitting
                        ? 'Đang lưu thẩm duyệt...'
                        : verdict === 'APPROVED'
                          ? 'Xác nhận Công nhận Bài thi'
                          : 'Xác nhận Hủy Bài thi Vi phạm'}
                    </span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

