import React, { useState } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Sigma,
  Sparkles,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import MathText from '../common/MathText';
import CurriculumStudioEditor from './CurriculumStudioEditor';
import { useToast } from '../../context/ToastContext';

const BLOOM_LEVELS = [
  { level: 1, label: 'L1 · Nhớ' },
  { level: 2, label: 'L2 · Hiểu' },
  { level: 3, label: 'L3 · Vận dụng' },
  { level: 4, label: 'L4 · Phân tích' },
  { level: 5, label: 'L5 · Đánh giá' },
  { level: 6, label: 'L6 · Sáng tạo' }
];

const KATEX_SNIPPETS = [
  { label: 'Phân số', code: '$\\frac{a}{b}$' },
  { label: 'Mũ', code: '$x^2$' },
  { label: 'Căn', code: '$\\sqrt{x}$' },
  { label: 'Tích phân', code: '$\\int_{a}^{b} f(x)\\,dx$' },
  { label: 'Tổng', code: '$\\sum_{i=1}^{n} x_i$' },
  { label: 'Suy ra', code: '$\\Rightarrow$' }
];

export default function ExamParserStudioView() {
  const { toast } = useToast();
  const [examFile, setExamFile] = useState(null);
  const [grade, setGrade] = useState(12);
  const [subject, setSubject] = useState('Toán học');
  const [versionTag, setVersionTag] = useState('2025-2026');
  const [isLocked, setIsLocked] = useState(false);

  const [questions, setQuestions] = useState([
    {
      id: 1,
      stem: 'Cho hàm số $y = x^3 - 3x + 1$. Tìm giá trị cực đại của hàm số.',
      options: ['A. $3$', 'B. $-1$', 'C. $1$', 'D. $2$'],
      correctIndex: 0,
      bloomLevel: 2,
      solution: 'Ta có $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Tại $x = -1$, $y_{CD} = 3$.'
    }
  ]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [studioOpen, setStudioOpen] = useState(false);
  const activeQ = questions[selectedIdx] || null;

  const updateQuestion = (updater) => {
    if (isLocked || !activeQ) return;
    setQuestions(prev => prev.map((q, idx) => (idx === selectedIdx ? updater({ ...q }) : q)));
  };

  const addQuestion = () => {
    if (isLocked) return;
    const nextId = questions.length + 1;
    setQuestions(prev => [
      ...prev,
      {
        id: nextId,
        stem: `Câu ${nextId}: Nhập nội dung câu hỏi...`,
        options: ['A. ', 'B. ', 'C. ', 'D. '],
        correctIndex: 0,
        bloomLevel: 2,
        solution: ''
      }
    ]);
    setSelectedIdx(questions.length);
  };

  return (
    <div className="min-h-screen bg-emerald-50/40 text-slate-900 flex flex-col">
      <header className="bg-white border-b border-emerald-200 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-sm font-black text-emerald-950 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Studio Đề thi</span>
        </h1>

        <button
          type="button"
          onClick={() => setIsLocked(v => !v)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
            isLocked ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-emerald-200 text-emerald-800'
          }`}
        >
          {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          <span>{isLocked ? `Đã khóa · ${versionTag}` : `Mở khóa · ${versionTag}`}</span>
        </button>
      </header>

      <div className="bg-white border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2.5 flex-wrap">
        <select
          disabled={isLocked}
          value={grade}
          onChange={e => setGrade(Number(e.target.value))}
          className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs font-bold text-emerald-900"
        >
          <option value={10}>Lớp 10</option>
          <option value={11}>Lớp 11</option>
          <option value={12}>Lớp 12</option>
        </select>

        <input
          disabled={isLocked}
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs font-bold w-36"
        />

        <input
          disabled={isLocked}
          value={versionTag}
          onChange={e => setVersionTag(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-xs font-mono w-28"
        />

        <label className="px-3 py-1.5 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/60 hover:bg-emerald-100 text-xs font-bold text-emerald-800 cursor-pointer flex items-center gap-1.5">
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{examFile ? examFile.name : 'Chọn PDF / DOCX'}</span>
          <input type="file" accept=".pdf,.docx" className="hidden" onChange={e => setExamFile(e.target.files?.[0] || null)} />
        </label>

        <button
          type="button"
          onClick={() => toast.info('Đã sẵn sàng tách câu hỏi từ file đề thi.')}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tách đề</span>
        </button>
      </div>

      <div className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-white rounded-2xl border border-emerald-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase text-emerald-900">Câu hỏi ({questions.length})</h2>
            {!isLocked && (
              <button
                type="button"
                onClick={addQuestion}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Thêm
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-[65vh] overflow-y-auto">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  idx === selectedIdx ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50/40 border-emerald-100 hover:border-emerald-300'
                }`}
              >
                <div className="text-xs font-bold line-clamp-2">Câu {idx + 1}: {q.stem}</div>
                <div className={`mt-1 text-[10.5px] ${idx === selectedIdx ? 'text-emerald-100' : 'text-emerald-700'}`}>
                  L{q.bloomLevel}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-2xl border border-emerald-200 p-5 space-y-4">
          {!activeQ ? (
            <div className="text-xs text-slate-500 text-center py-12">Chọn câu hỏi để chỉnh sửa.</div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-emerald-950">Câu {selectedIdx + 1}</span>
                <div className="flex items-center gap-2">
                  <select
                    disabled={isLocked}
                    value={activeQ.bloomLevel}
                    onChange={e => updateQuestion(q => ({ ...q, bloomLevel: Number(e.target.value) }))}
                    className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800"
                  >
                    {BLOOM_LEVELS.map(b => (
                      <option key={b.level} value={b.level}>{b.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setStudioOpen(true)}
                    className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Mở Studio</span>
                  </button>
                </div>
              </div>

              {!isLocked && (
                <div className="flex flex-wrap gap-1 items-center">
                  <Sigma className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                  {KATEX_SNIPPETS.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => updateQuestion(q => ({ ...q, stem: `${q.stem} ${s.code}` }))}
                      className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-[10.5px] font-medium text-emerald-800 cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                disabled={isLocked}
                rows={3}
                value={activeQ.stem}
                onChange={e => updateQuestion(q => ({ ...q, stem: e.target.value }))}
                className="w-full p-3 rounded-xl border border-emerald-200 text-xs font-mono"
              />

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Xem trước
                </div>
                <MathText text={activeQ.stem} />
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-emerald-900">Lời giải</div>
                <textarea
                  disabled={isLocked}
                  rows={2}
                  value={activeQ.solution}
                  onChange={e => updateQuestion(q => ({ ...q, solution: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-emerald-200 text-xs font-mono"
                />
              </div>
            </>
          )}
        </div>
      </div>
      {studioOpen && activeQ && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <CurriculumStudioEditor
            mode="exam"
            pattern={{
              patternId: `EXAM_Q${activeQ.id}`,
              name: `Câu ${selectedIdx + 1} (${subject} Lớp ${grade})`,
              theoryRecap: activeQ.stem,
              solutionMethod: activeQ.solution,
              level: `L${activeQ.bloomLevel || 2}`
            }}
            domain={{ name: subject, code: 'MATH' }}
            chapter={{ name: `Đề thi Lớp ${grade}` }}
            lesson={{ name: `Câu ${selectedIdx + 1}` }}
            onClose={() => setStudioOpen(false)}
            onSaveSuccess={(updated) => {
              if (updated) {
                updateQuestion(q => ({
                  ...q,
                  stem: updated.theoryRecap !== undefined ? updated.theoryRecap : q.stem,
                  solution: updated.solutionMethod !== undefined ? updated.solutionMethod : q.solution
                }));
              }
              setStudioOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}

