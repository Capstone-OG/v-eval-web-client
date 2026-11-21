import React, { useState, useEffect, useMemo } from 'react';
import {
  Flag,
  CheckCircle2,
  Trash2,
  ArrowRightLeft,
  Clock,
  Search,
  RefreshCw,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import MathText from '../common/MathText';
import contentService from '../../services/contentService';
import {
  getFlaggedQuestions,
  resolveFlaggedQuestion
} from '../../utils/questionFlagStore';
import { toast } from '../../context/ToastContext';

export default function FlaggedQuestionsReviewPanel({ currentUser }) {
  const [flags, setFlags] = useState(() => getFlaggedQuestions());
  const [statusFilter, setStatusFilter] = useState('PENDING'); // 'PENDING' | 'RESOLVED' | 'ALL'
  const [searchText, setSearchText] = useState('');
  const [skillCatalog, setSkillCatalog] = useState([]);
  const [targetSkillByFlag, setTargetSkillByFlag] = useState({});
  const [skillFilterByFlag, setSkillFilterByFlag] = useState({});
  const [busyFlagId, setBusyFlagId] = useState('');

  const reviewerName = currentUser?.fullName || currentUser?.email || 'Giảng viên / Quản lý';

  useEffect(() => {
    const sync = () => setFlags(getFlaggedQuestions());
    window.addEventListener('veval:question-flags-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('veval:question-flags-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    contentService
      .getCurriculum()
      .then((res) => {
        if (!mounted) return;
        const domains = Array.isArray(res) ? res : (res?.domains || res?.data || []);
        const list = [];
        const seen = new Set();
        domains.forEach((dom) => {
          const domTitle = dom.title || dom.name || '';
          (dom.chapters || []).forEach((ch) => {
            (ch.lessons || []).forEach((les) => {
              (les.patterns || []).forEach((pat) => {
                const sid = String(pat.patternId || pat.skillId || pat.id || '');
                if (!sid || seen.has(sid)) return;
                seen.add(sid);
                list.push({
                  skillId: sid,
                  label: `${domTitle} › ${les.name || ch.name || ''} › ${pat.name || ''}`
                });
              });
            });
          });
        });
        setSkillCatalog(list);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const filteredFlags = useMemo(() => {
    return flags.filter((f) => {
      if (statusFilter === 'PENDING' && f.status !== 'PENDING') return false;
      if (statusFilter === 'RESOLVED' && f.status === 'PENDING') return false;
      if (searchText.trim()) {
        const q = searchText.toLowerCase();
        const hay = `${f.questionContent} ${f.skillName} ${f.subjectName} ${f.reasonLabel} ${f.note}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [flags, statusFilter, searchText]);

  const pendingCount = flags.filter((f) => f.status === 'PENDING').length;

  const handleReassignDomain = async (flag) => {
    const newSkillId = targetSkillByFlag[flag.flagId];
    if (!newSkillId) {
      toast.warning('Vui lòng chọn đúng miền / dạng bài mới trước khi chuyển.');
      return;
    }
    const targetObj = skillCatalog.find((s) => s.skillId === newSkillId);
    setBusyFlagId(flag.flagId);
    try {
      const opts = flag.options || [];
      await contentService.updateQuestion(flag.questionId, {
        skillId: newSkillId,
        passageId: null,
        difficultyLevel: flag.difficultyLevel || 2,
        contentLatex: flag.questionContent,
        optionA: opts[0] || '',
        optionB: opts[1] || '',
        optionC: opts[2] || '',
        optionD: opts[3] || '',
        correctOption: flag.correctOption || 'A',
        explanation: flag.explanation || ''
      });
      setFlags(
        resolveFlaggedQuestion(flag.flagId, {
          status: 'REASSIGNED',
          newSkillName: targetObj?.label || newSkillId,
          resolvedBy: reviewerName
        })
      );
      toast.success('Đã chuyển câu hỏi sang đúng miền kiến thức trong CSDL Supabase!');
    } catch (err) {
      toast.error('Không thể cập nhật câu hỏi trên CSDL: ' + (err?.response?.data?.message || err.message));
    } finally {
      setBusyFlagId('');
    }
  };

  const handleDeleteFlaggedQuestion = async (flag) => {
    if (!window.confirm('Xóa vĩnh viễn câu hỏi này khỏi ngân hàng câu hỏi CSDL?')) return;
    setBusyFlagId(flag.flagId);
    try {
      await contentService.deleteQuestion(flag.questionId);
      setFlags(
        resolveFlaggedQuestion(flag.flagId, {
          status: 'DELETED',
          resolutionNote: 'Đã xóa câu hỏi lỗi khỏi ngân hàng CSDL',
          resolvedBy: reviewerName
        })
      );
      toast.success('Đã xóa câu hỏi khỏi ngân hàng đề CSDL!');
    } catch (err) {
      toast.error('Lỗi khi xóa câu hỏi: ' + (err?.response?.data?.message || err.message));
    } finally {
      setBusyFlagId('');
    }
  };

  const handleKeepQuestion = (flag) => {
    setFlags(
      resolveFlaggedQuestion(flag.flagId, {
        status: 'KEPT',
        resolutionNote: 'Đã thẩm định — Câu hỏi đúng miền và đạt chuẩn.',
        resolvedBy: reviewerName
      })
    );
    toast.success('Đã xác nhận câu hỏi đúng miền và đóng cờ báo lỗi.');
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          {[
            { id: 'PENDING', label: `Chờ xét duyệt (${pendingCount})` },
            { id: 'RESOLVED', label: `Đã xử lý (${flags.length - pendingCount})` },
            { id: 'ALL', label: `Tất cả (${flags.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                statusFilter === tab.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm theo nội dung câu hỏi, môn, lý do..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* List */}
      {filteredFlags.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-2">
          <Flag className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-black text-slate-700">
            {statusFilter === 'PENDING'
              ? 'Không có câu hỏi nào đang chờ xét duyệt'
              : 'Chưa có lịch sử báo lỗi câu hỏi nào'}
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Khi học sinh bấm <strong>Báo lỗi &amp; Đổi câu</strong> trong Lộ trình PLAR, Luyện tập ZPD hoặc Phòng Thi thử V-ACT, câu hỏi sẽ xuất hiện ngay tại đây để Giảng viên &amp; Ban quản lý xét duyệt.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlags.map((flag) => {
            const isBusy = busyFlagId === flag.flagId;
            const searchSkill = (skillFilterByFlag[flag.flagId] || '').toLowerCase().trim();
            const matchingSkills = searchSkill
              ? skillCatalog.filter((s) => s.label.toLowerCase().includes(searchSkill)).slice(0, 40)
              : skillCatalog.slice(0, 40);

            return (
              <div
                key={flag.flagId}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                {/* Meta header */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black inline-flex items-center gap-1 ${
                        flag.status === 'PENDING'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {flag.status === 'PENDING' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>
                        {flag.status === 'PENDING'
                          ? 'Chờ xét duyệt'
                          : flag.status === 'REASSIGNED'
                            ? 'Đã chuyển đúng miền'
                            : flag.status === 'DELETED'
                              ? 'Đã xóa khỏi CSDL'
                              : 'Đã xác nhận đúng miền'}
                      </span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                      Lý do: {flag.reasonLabel}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
                      Miền hiện tại: {flag.subjectName} › {flag.skillName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(flag.reportedAt).toLocaleString('vi-VN')} • {flag.sourcePage}
                  </span>
                </div>

                {flag.note && (
                  <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200 text-xs text-rose-950">
                    <strong>Ghi chú của học sinh:</strong> {flag.note}
                  </div>
                )}

                {/* Question Content */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-sm font-bold text-slate-900 leading-relaxed">
                    <MathText text={flag.questionContent} />
                  </div>
                  {flag.options?.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {flag.options.map((opt, idx) => {
                        const letter = ['A', 'B', 'C', 'D'][idx];
                        const isCorr = letter === flag.correctOption;
                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border flex items-start gap-2 ${
                              isCorr ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-950' : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-black">{letter}.</span>
                            <div className="flex-1 min-w-0 break-words"><MathText text={opt} /></div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                {flag.status === 'PENDING' ? (
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                    <div className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Xét duyệt &amp; Điều chuyển Miền Kiến Thức (Cập nhật trực tiếp CSDL Supabase)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5">
                      <input
                        type="text"
                        value={skillFilterByFlag[flag.flagId] || ''}
                        onChange={(e) =>
                          setSkillFilterByFlag((prev) => ({ ...prev, [flag.flagId]: e.target.value }))
                        }
                        placeholder="Lọc nhanh tên môn / bài / dạng bài..."
                        className="md:col-span-4 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs outline-none focus:border-blue-400"
                      />
                      <select
                        value={targetSkillByFlag[flag.flagId] || ''}
                        onChange={(e) =>
                          setTargetSkillByFlag((prev) => ({ ...prev, [flag.flagId]: e.target.value }))
                        }
                        className="md:col-span-8 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 outline-none focus:border-blue-400"
                      >
                        <option value="">-- Chọn đúng Miền / Dạng bài mới để chuyển --</option>
                        {matchingSkills.map((sk) => (
                          <option key={sk.skillId} value={sk.skillId}>
                            {sk.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleReassignDomain(flag)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ArrowRightLeft className="w-3.5 h-3.5" />}
                          <span>Chuyển Đúng Miền</span>
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleKeepQuestion(flag)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Giữ Nguyên (Đúng Miền)</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleDeleteFlaggedQuestion(flag)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa Câu Khỏi Ngân Hàng</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2">
                    <strong>Kết quả xử lý ({flag.resolvedBy}):</strong> {flag.resolutionNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
