import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Target,
  Sparkles,
  Lock,
  Play,
  Copy,
  AlertCircle,
  ShieldAlert,
  BookOpen,
  Zap,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { DOMAINS } from '../diagnostic/diagnosticData';

// Danh mục bài kiểm tra & thi thử chuẩn hóa V-ACT
export const EXAM_CATALOG = [
  {
    id: 'diag_30_vact',
    title: 'Bài Khảo Sát Năng Lực Đầu Vào 30 Câu V-ACT 2026',
    category: 'DIAGNOSTIC',
    courseName: 'Khóa Khảo Thí & Chẩn Đoán Năng Lực Ban Đầu (V-Eval Core)',
    schoolName: 'Hội Đồng Khảo Thí V-Eval & ĐHQG-HCM',
    openTime: '08:00 01/10/2026',
    closeTime: '23:59 31/10/2026',
    status: 'OPEN',
    questionCount: 30,
    durationMinutes: 45,
    domainsCount: 5,
    proctoredMode: 'Azota Fullscreen Anti-Cheat Proctored',
    defaultCode: 'VACT2026',
    badge: 'ĐỀ MẪU NỔI BẬT',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Đánh giá 5 miền năng lực (Toán học, Logic, Ngôn ngữ, KHTN, KHXH) nhằm ước lượng tham số IRT θ₀ và kích hoạt Lộ Trình Học Thích Ứng (DAG).'
  },
  {
    id: 'full_120_mock',
    title: 'Đề Thi Thử Tổng Hợp ĐGNL ĐHQG-HCM Mã Đề 101',
    category: 'MOCK',
    courseName: 'Khóa Luyện Thi Chuyên Sâu ĐGNL ĐHQG-HCM 900+',
    schoolName: 'Hội Đồng Khảo Thí V-Eval & Trung Tâm ĐHQG-HCM',
    openTime: '06:00 05/10/2026',
    closeTime: '23:59 25/10/2026',
    status: 'OPEN',
    questionCount: 120,
    durationMinutes: 150,
    domainsCount: 3,
    proctoredMode: 'Azota Fullscreen Anti-Cheat Proctored',
    defaultCode: 'HCM120',
    badge: 'ĐỀ THI THỬ TỔNG HỢP',
    badgeColor: 'bg-purple-600 text-white',
    description: 'Mô phỏng 100% cấu trúc 120 câu ĐGNL chính thức ĐHQG-HCM. Đánh giá toàn diện 3 phần thi với thang điểm 1200.'
  },
  {
    id: 'logic_15_quick',
    title: 'Đề Kiểm Tra Nhanh Tư Duy Logic & Phân Tích Biểu Đồ',
    category: 'SKILL',
    courseName: 'Chuyên Đề Tư Duy Logic & Phân Tích Số Liệu Nâng Cao',
    schoolName: 'V-Eval AI Psychometrics Lab',
    openTime: '00:00 01/10/2026',
    closeTime: '23:59 31/12/2026',
    status: 'OPEN',
    questionCount: 15,
    durationMinutes: 20,
    domainsCount: 1,
    proctoredMode: 'Azota Fullscreen Anti-Cheat Proctored',
    defaultCode: 'LOGIC15',
    badge: 'CHUYÊN SÂU AI',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Bài kiểm tra phản xạ 15 câu đo lường tốc độ xử lý câu hỏi logic, suy luận mệnh đề và đọc hiểu biểu đồ số liệu.'
  },
  {
    id: 'math_data_20',
    title: 'Đề Luyện Chuyên Sâu Toán Học & Xử Lý Số Liệu Thống Kê',
    category: 'SKILL',
    courseName: 'Chinh Phục 30 Câu Toán ĐGNL 2026',
    schoolName: 'V-Eval Math Academy',
    openTime: '00:00 01/10/2026',
    closeTime: '23:59 31/12/2026',
    status: 'OPEN',
    questionCount: 20,
    durationMinutes: 30,
    domainsCount: 1,
    proctoredMode: 'Azota Fullscreen Anti-Cheat Proctored',
    defaultCode: 'MATH20',
    badge: 'TOÁN & SỐ LIỆU',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Tập trung rèn luyện các dạng bài hàm số, hình học không gian, xác suất thống kê và biểu đồ phân tích thực tế.'
  }
];

export default function QuestionBankPage({ onStartExam, onNavigateDiagnostic }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');
  const [selectedExamForModal, setSelectedExamForModal] = useState(null);
  const [modalAccessCode, setModalAccessCode] = useState('');
  const [modalCodeError, setModalCodeError] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleQuickEnterCode = (e) => {
    e.preventDefault();
    const trimmed = (accessCodeInput || '').trim().toUpperCase();
    if (!trimmed) {
      setAccessCodeError('Vui lòng nhập mã phòng thi để tiếp tục.');
      return;
    }
    const matched = EXAM_CATALOG.find((ex) => ex.defaultCode.toUpperCase() === trimmed);
    if (!matched) {
      setAccessCodeError(`Mã "${trimmed}" không tồn tại hoặc đã hết hạn. Hãy thử mã mẫu: VACT2026`);
      return;
    }
    setAccessCodeError('');
    setSelectedExamForModal(matched);
    setModalAccessCode(matched.defaultCode);
    setModalCodeError('');
  };

  const handleOpenExamModal = (exam) => {
    setSelectedExamForModal(exam);
    setModalAccessCode(exam.defaultCode || 'VACT2026');
    setModalCodeError('');
  };

  const handleConfirmStartExam = (exam) => {
    const trimmed = (modalAccessCode || '').trim().toUpperCase();
    if (!trimmed) {
      setModalCodeError('Vui lòng nhập mật mã truy cập.');
      return;
    }
    if (exam.defaultCode && trimmed !== exam.defaultCode.toUpperCase()) {
      setModalCodeError(`Mật mã không đúng. Mật mã mẫu của đề này là: ${exam.defaultCode}`);
      return;
    }
    setModalCodeError('');
    setSelectedExamForModal(null);
    if (onStartExam) {
      onStartExam(exam);
    }
  };

  const filteredExams = EXAM_CATALOG.filter((exam) => {
    if (filterCategory === 'ALL') return true;
    return exam.category === filterCategory;
  });

  return (
    <div className="space-y-8 animate-fade-in text-slate-900">
      
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-blue-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>NGÂN HÀNG ĐỀ THI & TRUNG TÂM KHẢO THÍ CHUẨN HÓA V-ACT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Ngân Hàng Đề & <span className="text-amber-300">Phòng Thi Thử 2026</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 font-medium leading-relaxed max-w-3xl">
            Tuyển chọn các bộ đề khảo sát năng lực ban đầu, đề thi thử mô phỏng 100% cấu trúc ĐGNL ĐHQG-HCM, và đề rèn luyện phản xạ theo từng kỹ năng với cơ chế giám sát Azota Proctored.
          </p>

          {/* Quick Code Entry Bar */}
          <form onSubmit={handleQuickEnterCode} className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl">
            <div className="relative flex-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={accessCodeInput}
                onChange={(e) => {
                  setAccessCodeInput(e.target.value);
                  if (accessCodeError) setAccessCodeError('');
                }}
                placeholder="Nhập mã phòng thi (ví dụ: VACT2026)..."
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 font-mono font-bold text-xs sm:text-sm rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 border border-white/20 uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Vào Phòng Thi</span>
            </button>
          </form>

          {accessCodeError && (
            <div className="text-xs text-rose-300 font-bold flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-4 h-4" />
              <span>{accessCodeError}</span>
            </div>
          )}
        </div>
      </div>

      {/* 5 Domains Overview Strip */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              5 Miền Năng Lực Chuẩn V-ACT 2026
            </h3>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span>Giám Sát Azota Proctored (Toàn màn hình & chống rời tab)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(DOMAINS).map(([key, domain], idx) => (
            <div key={key} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-600">PHẦN {idx + 1}</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-700">6 câu</span>
              </div>
              <div className="text-xs font-bold text-slate-800 line-clamp-1" title={domain.name}>
                {domain.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Catalog Section with Category Filter */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Danh Sách Đề Thi Sẵn Sàng</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Chọn đề thi bên dưới để xem thông tin chi tiết và bắt đầu làm bài
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filterCategory === 'ALL' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Tất Cả ({EXAM_CATALOG.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('DIAGNOSTIC')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filterCategory === 'DIAGNOSTIC' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Khảo Sát Đầu Vào
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('MOCK')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filterCategory === 'MOCK' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Thi Thử 120 Câu
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('SKILL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filterCategory === 'SKILL' ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Luyện Chuyên Sâu
            </button>
          </div>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const isHighlight = exam.id === 'diag_30_vact';
            return (
              <div
                key={exam.id}
                className={`relative bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between group ${isHighlight
                    ? 'border-blue-500/80 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 shadow-md hover:shadow-xl'
                  }`}
              >
                {/* Top Badges */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${exam.badgeColor || 'bg-blue-600 text-white'}`}>
                      {exam.badge}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>ĐANG MỞ THI</span>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                      {exam.description}
                    </p>
                  </div>

                  {/* Specs Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase">Thời gian</div>
                        <div className="font-extrabold text-slate-800">{exam.durationMinutes} phút</div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-600 font-bold uppercase">Số câu hỏi</div>
                        <div className="font-extrabold text-slate-800">{exam.questionCount} câu</div>
                      </div>
                    </div>
                  </div>

                  {/* Default Passcode Chip */}
                  <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <div className="text-xs text-amber-900 font-semibold truncate">
                        Mã phòng: <strong className="font-mono font-black text-amber-800">{exam.defaultCode}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(exam.defaultCode)}
                      className="px-2 py-1 rounded-lg bg-white border border-amber-300 text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedCode === exam.defaultCode ? 'Đã chép!' : 'Chép mã'}</span>
                    </button>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleOpenExamModal(exam)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${isHighlight
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25'
                        : 'bg-slate-900 hover:bg-blue-600 text-white shadow-slate-900/10'
                      }`}
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>🚀 Bắt Đầu Vào Thi (Xem Chi Tiết)</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* EXAM DETAIL & PASSCODE VERIFICATION MODAL */}
      {selectedExamForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-scale-up">

            {/* Header Banner */}
            <div className="relative overflow-hidden p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white">
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-amber-300 border border-white/20">
                    {selectedExamForModal.badge || 'PHÒNG THI CHUẨN HÓA V-ACT'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                    {selectedExamForModal.title}
                  </h3>
                  <p className="text-xs text-blue-100 font-medium">
                    {selectedExamForModal.schoolName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExamForModal(null)}
                  className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-600">Số lượng câu hỏi</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">{selectedExamForModal.questionCount} câu trắc nghiệm</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-600">Thời gian làm bài</div>
                  <div className="text-sm font-black text-blue-600 mt-0.5">{selectedExamForModal.durationMinutes} phút</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-600">Quy chế phòng thi</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">Azota Proctored Toàn Màn Hình</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-600">Động cơ chấm điểm</div>
                  <div className="text-xs font-black text-indigo-600 mt-0.5">IRT 2PL & Theta 0</div>
                </div>
              </div>

              {/* Proctoring Warning Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cảnh báo giám sát thi trực tuyến Azota</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90 font-medium">
                  Hệ thống tự động kích hoạt <strong>Toàn Màn Hình</strong>. Mọi hành động chuyển tab hoặc rời màn hình quá <strong>3 lần</strong> sẽ khiến bài thi bị khóa và tự động nộp bài!
                </p>
              </div>

              {/* Passcode Input */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800 uppercase tracking-wide">
                  Nhập Mã Phòng Thi / Mật Mã Truy Cập
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={modalAccessCode}
                    onChange={(e) => {
                      setModalAccessCode(e.target.value);
                      if (modalCodeError) setModalCodeError('');
                    }}
                    placeholder={`Mã phòng thi: ${selectedExamForModal.defaultCode}`}
                    className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-sm font-black text-slate-900 tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setModalAccessCode(selectedExamForModal.defaultCode);
                      setModalCodeError('');
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Điền mã mẫu
                  </button>
                </div>

                {modalCodeError && (
                  <div className="text-xs text-rose-600 font-bold flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalCodeError}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedExamForModal(null)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-all border border-slate-200 cursor-pointer"
                >
                  Hủy / Quay Lại
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmStartExam(selectedExamForModal)}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>🚀 Bắt Đầu Vào Làm Bài</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
