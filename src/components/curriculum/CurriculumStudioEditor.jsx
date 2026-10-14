import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Edit3, 
  Columns, 
  Sparkles, 
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  BookOpen, 
  HelpCircle, 
  Layers, 
  Compass, 
  FileText, 
  RefreshCw, 
  Check, 
  X, 
  Clock, 
  ExternalLink,
  Sliders,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import MathText from '../common/MathText';
import contentService from '../../services/contentService';

const MATH_CATEGORIES = {
  algebra: {
    name: 'Đại số & Giải tích',
    items: [
      { label: 'Phân số', code: '\\frac{a}{b}' },
      { label: 'Căn bậc 2', code: '\\sqrt{x}' },
      { label: 'Căn bậc n', code: '\\sqrt[n]{x}' },
      { label: 'Lũy thừa', code: 'x^n' },
      { label: 'Chỉ số dưới', code: 'x_0' },
      { label: 'Đạo hàm', code: "f'(x)" },
      { label: 'Đạo hàm cấp 2', code: "f''(x)" },
      { label: 'Tích phân', code: '\\int_{a}^{b} f(x)dx' },
      { label: 'Giới hạn', code: '\\lim_{x \\to x_0}' },
      { label: 'Logarit', code: '\\log_a b' },
      { label: 'Logarit tự nhiên', code: '\\ln x' },
      { label: 'Delta', code: '\\Delta = b^2 - 4ac' },
      { label: 'Tổng xích-ma', code: '\\sum_{i=1}^{n}' }
    ]
  },
  geometry: {
    name: 'Hình học & Không gian Oxyz',
    items: [
      { label: 'Vector a', code: '\\vec{a}' },
      { label: 'Vector AB', code: '\\vec{AB}' },
      { label: 'Độ dài vector', code: '|\\vec{a}|' },
      { label: 'Vector pháp tuyến', code: '\\vec{n} = (A; B; C)' },
      { label: 'Vuông góc', code: '\\perp' },
      { label: 'Song song', code: '\\parallel' },
      { label: 'Góc', code: '\\angle ABC' },
      { label: 'Khoảng cách', code: 'd(M, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}' },
      { label: 'Mặt phẳng Alpha', code: '(\\alpha)' },
      { label: 'Mặt cầu S', code: '(S)' },
      { label: 'Pi', code: '\\pi' }
    ]
  },
  logic: {
    name: 'Logic & Tập hợp',
    items: [
      { label: 'Suy ra', code: '\\Rightarrow' },
      { label: 'Tương đương', code: '\\Leftrightarrow' },
      { label: 'Với mọi', code: '\\forall x \\in D' },
      { label: 'Tồn tại', code: '\\exists x' },
      { label: 'Thuộc', code: '\\in' },
      { label: 'Không thuộc', code: '\\notin' },
      { label: 'Tập rỗng', code: '\\emptyset' },
      { label: 'Tập số thực R', code: '\\mathbb{R}' },
      { label: 'Tập con', code: '\\subset' },
      { label: 'Hợp', code: '\\cup' },
      { label: 'Giao', code: '\\cap' },
      { label: 'Lớn hơn bằng', code: '\\ge' },
      { label: 'Nhỏ hơn bằng', code: '\\le' },
      { label: 'Khác', code: '\\neq' }
    ]
  }
};

const SAMPLE_DIAGRAM_IMAGES = [
  { label: 'Đồ thị hàm bậc ba (2 cực trị)', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bảng biến thiên mẫu', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hình chóp tam giác S.ABC', url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hệ trục tọa độ Oxyz', url: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=800&q=80' }
];

const getEmbedVideoUrl = (url) => {
  if (!url) return null;
  try {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  } catch (e) {
    return url;
  }
};

export default function CurriculumStudioEditor({ pattern, domain, chapter, lesson, onClose, onSaveSuccess }) {
  // View mode: 'editor' | 'preview' | 'split'
  const [viewMode, setViewMode] = useState('split');
  const [activeSection, setActiveSection] = useState('theory'); // 'theory' | 'method' | 'video' | 'questions' | 'settings'
  const [mathCategory, setMathCategory] = useState('algebra');

  // Form State for Pattern Content
  const [form, setForm] = useState({
    patternId: pattern?.patternId || '',
    name: pattern?.name || '',
    weight: pattern?.weight ? String(pattern.weight).replace('%', '').trim() : '5',
    level: pattern?.level || 'Vận dụng',
    theoryRecap: pattern?.theoryRecap || '',
    solutionMethod: pattern?.solutionMethod || '',
    examTraps: '',
    casioTricks: '',
    videoUrl: pattern?.videoLesson?.videoUrl || '',
    durationSeconds: pattern?.videoLesson?.durationSeconds || 600,
    videoTimestamps: [
      { time: '00:00', title: 'Giới thiệu & Lý thuyết cốt lõi' },
      { time: '03:15', title: 'Quy trình giải chi tiết từng bước' },
      { time: '07:30', title: 'Ví dụ minh họa & Phân tích bẫy đề thi' }
    ],
    sampleQuestion: {
      questionId: pattern?.sampleQuestion?.questionId || null,
      difficultyLevel: 2,
      contentLatex: pattern?.sampleQuestion?.content || '',
      optionA: pattern?.sampleQuestion?.options?.[0]?.replace(/^A\.\s*/, '') || '',
      optionB: pattern?.sampleQuestion?.options?.[1]?.replace(/^B\.\s*/, '') || '',
      optionC: pattern?.sampleQuestion?.options?.[2]?.replace(/^C\.\s*/, '') || '',
      optionD: pattern?.sampleQuestion?.options?.[3]?.replace(/^D\.\s*/, '') || '',
      correctOption: pattern?.sampleQuestion?.correct !== undefined ? String.fromCharCode(65 + pattern.sampleQuestion.correct) : 'A',
      explanation: pattern?.sampleQuestion?.explanation || ''
    }
  });

  // Question Bank State for this Pattern
  const [questionsList, setQuestionsList] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [newQuestionModalOpen, setNewQuestionModalOpen] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageModalTarget, setImageModalTarget] = useState(null); // 'theory' | 'method' | 'question'

  // Status & saving
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Fetch Questions from Database for this Pattern
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!pattern?.patternId) return;
      setLoadingQuestions(true);
      try {
        const data = await contentService.getQuestionsBySkill(pattern.patternId);
        if (data && Array.isArray(data)) {
          setQuestionsList(data);
        }
      } catch (err) {
        console.warn("Chưa tải được danh sách câu hỏi:", err);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [pattern?.patternId]);

  // Insert math formula at target field
  const handleInsertMath = (targetField, snippet) => {
    setForm(prev => {
      const current = prev[targetField] || '';
      return {
        ...prev,
        [targetField]: current ? `${current} $${snippet}$` : `$${snippet}$`
      };
    });
  };

  // Insert image markdown
  const handleInsertImage = (targetField, url, label = 'Hình minh họa') => {
    if (!url) return;
    const imgMarkdown = `\n\n![${label}](${url})\n\n`;
    setForm(prev => {
      const current = prev[targetField] || '';
      return {
        ...prev,
        [targetField]: `${current}${imgMarkdown}`
      };
    });
    setCustomImageUrl('');
    setImageModalTarget(null);
  };

  // AI Pedagogical Assistant Template
  const handleAIApplyStandardMethod = () => {
    const standardProcedure = `### Quy trình tư duy giải nhanh chuẩn ĐGNL VNU-HCM:
**Bước 1: Tìm tập xác định & Phân tích cấu trúc hàm số**
- Xác định tập xác định $D$ của biểu thức / hàm số.
- Nhận diện các tham số $m$ và điều kiện ràng buộc.

**Bước 2: Tính đạo hàm / Biến đổi đại số tương đương**
- Tính đạo hàm $y' = f'(x)$.
- Giải phương trình $y' = 0$ để tìm các điểm tới hạn $x_1, x_2, ... \\in D$.

**Bước 3: Lập bảng biến thiên hoặc trục số xét dấu**
- Lập bảng biến thiên trên các khoảng xác định.
- Xác định chiều biến thiên, điểm cực đại, cực tiểu hoặc tiệm cận.

**Bước 4: Đối chiếu điều kiện & Kết luận trắc nghiệm**
- Rút ra kết quả thỏa mãn yêu cầu đề bài.
- Loại trừ các phương án nhiễu (bẫy đề thi).`;

    setForm(prev => ({
      ...prev,
      solutionMethod: prev.solutionMethod ? `${prev.solutionMethod}\n\n${standardProcedure}` : standardProcedure,
      examTraps: prev.examTraps || `- Học sinh hay quên kiểm tra điều kiện tập xác định trước khi tính đạo hàm.\n- Nhầm lẫn giữa "giá trị cực trị" ($y_{CT}$) và "điểm cực trị" ($x_{CT}$).\n- Khi xét dấu đạo hàm hàm chứa tham số, quên xét trường hợp hệ số $a = 0$.`,
      casioTricks: prev.casioTricks || `- Dùng tính năng TABLE [Menu 8]: Nhập hàm số, Start: -5, End: 5, Step: 0.5 để quan sát chiều tăng/giảm giá trị $f(x)$.\n- Dùng đạo hàm tại điểm [Shift $\\frac{d}{dx}$] để thử các giá trị nghiệm biên.`
    }));
  };

  // Save all changes to PostgreSQL Database
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveErrorMsg('');
    setSaveSuccessMsg('');
    try {
      const rawWeight = parseFloat(form.weight);
      const weightVal = !isNaN(rawWeight) ? (rawWeight > 1 ? rawWeight / 100 : rawWeight) : 0.05;

      // Combine step-by-step method with traps & tricks
      let fullSolutionMethod = form.solutionMethod || '';
      if (form.examTraps?.trim()) {
        fullSolutionMethod += `\n\n### ⚠️ Các bẫy đề thi ĐGNL thường gặp:\n${form.examTraps.trim()}`;
      }
      if (form.casioTricks?.trim()) {
        fullSolutionMethod += `\n\n### 💡 Kỹ thuật Casio & Mẹo tư duy nhanh:\n${form.casioTricks.trim()}`;
      }

      const payload = {
        name: form.name.trim(),
        weight: weightVal,
        theoryRecap: form.theoryRecap,
        solutionMethod: fullSolutionMethod,
        videoUrl: form.videoUrl?.trim() || null,
        durationSeconds: parseInt(form.durationSeconds, 10) || 600,
        prerequisiteSkillIds: pattern?.prerequisiteIds || [],
        sampleQuestion: form.sampleQuestion?.contentLatex?.trim() ? {
          questionId: form.sampleQuestion.questionId || null,
          difficultyLevel: parseInt(form.sampleQuestion.difficultyLevel, 10) || 2,
          contentLatex: form.sampleQuestion.contentLatex,
          optionA: form.sampleQuestion.optionA,
          optionB: form.sampleQuestion.optionB,
          optionC: form.sampleQuestion.optionC,
          optionD: form.sampleQuestion.optionD,
          correctOption: form.sampleQuestion.correctOption || 'A',
          explanation: form.sampleQuestion.explanation
        } : null
      };

      let updated;
      if (form.patternId) {
        updated = await contentService.updatePattern(form.patternId, payload);
      } else {
        const createPayload = {
          domainId: domain?.domainId || (domain?.id ? domain.id.replace('domain-', '') : '6f3765db-943e-4810-bf74-d6a8bdc215da'),
          parentId: lesson?.lessonId,
          name: form.name.trim(),
          weight: weightVal,
          theoryRecap: form.theoryRecap,
          solutionMethod: fullSolutionMethod,
          videoUrl: form.videoUrl?.trim() || null,
          durationSeconds: parseInt(form.durationSeconds, 10) || 600
        };
        const newId = await contentService.createNode(createPayload);
        setForm(prev => ({ ...prev, patternId: newId }));
        updated = { ...form, patternId: newId, weight: `${Math.round(weightVal * 100)}%` };
      }

      setSaveSuccessMsg('Đã lưu thành công toàn bộ nội dung sư phạm & đồ thị vào cơ sở dữ liệu PostgreSQL!');
      
      if (onSaveSuccess) {
        onSaveSuccess(updated || { ...form, weight: `${Math.round(weightVal * 100)}%` });
      }

      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error("Lỗi khi lưu Studio:", err);
      setSaveErrorMsg(err?.response?.data?.message || err.message || 'Không thể lưu vào cơ sở dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade pb-16">
      
      {/* 1. TOP STUDIO CONTROL BAR */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors border border-slate-700 shrink-0"
            title="Trở về Dàn kiến thức"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono font-bold flex-wrap">
              <span>{domain?.title || "Môn học"}</span>
              <span>/</span>
              <span>{chapter?.name || "Chương"}</span>
              <span>/</span>
              <span>{lesson?.name || "Bài học"}</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {pattern?.code}
              </span>
            </div>
            <h1 className="text-lg lg:text-xl font-black text-white mt-0.5 flex items-center gap-2">
              <span>Studio Hiệu Đính Sư Phạm: {form.name}</span>
            </h1>
          </div>
        </div>

        {/* View mode switcher & Actions */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
          <div className="p-1 rounded-2xl bg-slate-800 border border-slate-700 flex items-center gap-1 text-xs font-bold text-slate-300">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'editor' ? 'bg-blue-600 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Biên soạn</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Chia đôi (Split)</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                viewMode === 'preview' ? 'bg-emerald-600 text-white shadow-sm' : 'hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Review Học sinh</span>
            </button>
          </div>

          <button
            onClick={handleAIApplyStandardMethod}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Tự động nạp khung quy trình giải 4 bước & bẫy đề thi chuẩn GDPT 2018"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Chuẩn Hóa</span>
          </button>

          <button
            disabled={saving}
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu Vào PostgreSQL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-sm animate-fade">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}
      {saveErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2 shadow-sm animate-fade">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* 2. MAIN WORKSPACE (Split view or single view) */}
      <div className={`grid gap-6 ${viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
        
        {/* ================= LEFT: AUTHORING STUDIO (7 Cols in Split, Full in Editor) ================= */}
        {(viewMode === 'editor' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'w-full'} space-y-6`}>
            
            {/* Studio Navigation Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'theory', label: 'Khối 1: Nền tảng SGK & Hình ảnh', icon: BookOpen, color: 'text-cyan-600' },
                { id: 'method', label: 'Khối 2: Phương pháp giải & Bẫy', icon: Compass, color: 'text-amber-600' },
                { id: 'video', label: 'Khối 3: Video bài giảng', icon: Video, color: 'text-emerald-600' },
                { id: 'questions', label: `Khối 4: Ngân hàng câu hỏi (${questionsList.length || 1})`, icon: FileText, color: 'text-indigo-600' },
                { id: 'settings', label: 'Cài đặt định danh', icon: Sliders, color: 'text-slate-600' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* ================= SECTION: KHỐI 1 - NỀN TẢNG SGK & HÌNH ẢNH ================= */}
            {activeSection === 'theory' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center text-xs font-black">1</span>
                      <span>Khối 1: Kiến Thức Nền Tảng & Hình Ảnh Minh Họa SGK</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Định nghĩa, định lý, điều kiện xác định, đồ thị hàm số và hình học không gian chuẩn GDPT 2018
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setImageModalTarget('theoryRecap')}
                    className="px-3 py-1.5 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1.5 border border-cyan-200 transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-600" />
                    <span>+ Đính kèm Hình ảnh</span>
                  </button>
                </div>

                {/* Formula Palette Toolbar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Bảng ký hiệu KaTeX chuyên sâu (Click để chèn)
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      {Object.keys(MATH_CATEGORIES).map(catKey => (
                        <button
                          key={catKey}
                          onClick={() => setMathCategory(catKey)}
                          className={`px-2 py-0.5 rounded-md transition-colors ${
                            mathCategory === catKey ? 'bg-blue-600 text-white' : 'hover:bg-slate-200'
                          }`}
                        >
                          {MATH_CATEGORIES[catKey].name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {MATH_CATEGORIES[mathCategory].items.map((snip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertMath('theoryRecap', snip.code)}
                        className="px-2 py-1 rounded-lg bg-white hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 text-slate-700 font-mono text-[11px] border border-slate-200 transition-all shadow-2xs"
                        title={snip.label}
                      >
                        ${snip.code}$
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea for Theory */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Nội dung Markdown & KaTeX (Hỗ trợ chèn công thức và ảnh `![alt](url)`):</span>
                    <span className="text-slate-400 font-mono">{(form.theoryRecap || '').length} ký tự</span>
                  </div>
                  <textarea
                    rows={12}
                    value={form.theoryRecap}
                    onChange={(e) => setForm(prev => ({ ...prev, theoryRecap: e.target.value }))}
                    placeholder="Nhập kiến thức nền tảng SGK: Định lý, công thức, bảng biến thiên..."
                    className="w-full p-4 rounded-2xl border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-slate-50 text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* ================= SECTION: KHỐI 2 - PHƯƠNG PHÁP GIẢI & BẪY ĐỀ THI ================= */}
            {activeSection === 'method' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">2</span>
                      <span>Khối 2: Phương Pháp Giải Chuyên Biệt, Bẫy Đề Thi & Mẹo Casio</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Giúp học sinh định hình thuật toán giải từng bước và khắc phục các sai lầm kinh điển
                    </p>
                  </div>

                  <button
                    onClick={handleAIApplyStandardMethod}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 border border-amber-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Nạp mẫu chuẩn 4 bước</span>
                  </button>
                </div>

                {/* Step-by-Step Procedure */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>1. Quy trình giải chi tiết từng bước (Bước 1 $\to$ Bước 4):</span>
                    <button 
                      onClick={() => setImageModalTarget('solutionMethod')}
                      className="text-[11px] text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Chèn sơ đồ giải</span>
                    </button>
                  </label>
                  <textarea
                    rows={8}
                    value={form.solutionMethod}
                    onChange={(e) => setForm(prev => ({ ...prev, solutionMethod: e.target.value }))}
                    placeholder="Bước 1: ..., Bước 2: ..., Bước 3: ..., Bước 4: ..."
                    className="w-full p-4 rounded-2xl border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-slate-900"
                  />
                </div>

                {/* Exam Traps Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>2. Các bẫy đề thi ĐGNL thường gặp & Lưu ý học sinh hay sai:</span>
                  </label>
                  <textarea
                    rows={4}
                    value={form.examTraps}
                    onChange={(e) => setForm(prev => ({ ...prev, examTraps: e.target.value }))}
                    placeholder="- Quên xét điều kiện tập xác định...\n- Nhầm lẫn giữa cực đại và giá trị cực đại..."
                    className="w-full p-3.5 rounded-2xl border border-rose-200 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500 bg-rose-50/30 text-rose-950"
                  />
                </div>

                {/* Casio Tricks Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>3. Kỹ thuật Casio & Mẹo tư duy nhanh độc quyền:</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.casioTricks}
                    onChange={(e) => setForm(prev => ({ ...prev, casioTricks: e.target.value }))}
                    placeholder="- Dùng tính năng TABLE [Menu 8] để dò nghiệm...\n- Kỹ thuật Cal x = 1000..."
                    className="w-full p-3.5 rounded-2xl border border-indigo-200 font-sans text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/30 text-indigo-950"
                  />
                </div>
              </div>
            )}

            {/* ================= SECTION: KHỐI 3 - VIDEO BÀI GIẢNG & TIMESTAMPS ================= */}
            {activeSection === 'video' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">3</span>
                    <span>Khối 3: Video Bài Giảng & Phân Đoạn Thời Gian (Timestamps)</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Hỗ trợ phát video trực tiếp, gắn nhãn thời lượng FSM Gate ≥ 80% và phân đoạn mục lục video
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Link Video bài giảng (YouTube, Cloudflare Stream, Vimeo, MP4):</label>
                    <input
                      type="text"
                      value={form.videoUrl}
                      onChange={(e) => setForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Thời lượng (Giây):</label>
                    <input
                      type="number"
                      min="60"
                      step="60"
                      value={form.durationSeconds}
                      onChange={(e) => setForm(prev => ({ ...prev, durationSeconds: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* Embedded Video Test Player */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Trình phát thử nghiệm video trực tiếp (Embedded Live Test):</span>
                    <span className="text-[11px] text-emerald-600 font-bold">
                      {Math.max(1, Math.round((parseInt(form.durationSeconds, 10) || 0) / 60))} phút
                    </span>
                  </div>

                  {form.videoUrl ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 shadow-md">
                      {form.videoUrl.includes('youtube.com') || form.videoUrl.includes('youtu.be') ? (
                        <iframe
                          src={getEmbedVideoUrl(form.videoUrl)}
                          title="Video preview"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                          <PlayCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                          <div>Đường dẫn video ngoài YouTube: <strong>{form.videoUrl}</strong></div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs space-y-1">
                      <PlayCircle className="w-8 h-8 text-slate-300 mx-auto" />
                      <div>Chưa có link video bài giảng. Nhập link YouTube ở trên để phát thử nghiệm.</div>
                    </div>
                  )}
                </div>

                {/* Timestamps Table */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Mục lục các mốc thời gian trong video (Timestamps):</label>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({
                        ...prev,
                        videoTimestamps: [...prev.videoTimestamps, { time: '10:00', title: 'Ví dụ củng cố mới' }]
                      }))}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Thêm mốc</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {form.videoTimestamps.map((ts, tIdx) => (
                      <div key={tIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ts.time}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm(prev => {
                              const updated = [...prev.videoTimestamps];
                              updated[tIdx].time = val;
                              return { ...prev, videoTimestamps: updated };
                            });
                          }}
                          placeholder="00:00"
                          className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 text-center"
                        />
                        <input
                          type="text"
                          value={ts.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm(prev => {
                              const updated = [...prev.videoTimestamps];
                              updated[tIdx].title = val;
                              return { ...prev, videoTimestamps: updated };
                            });
                          }}
                          placeholder="Tiêu đề phân đoạn..."
                          className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({
                            ...prev,
                            videoTimestamps: prev.videoTimestamps.filter((_, idx) => idx !== tIdx)
                          }))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= SECTION: KHỐI 4 - NGÂN HÀNG CÂU HỎI DẠNG BÀI ================= */}
            {activeSection === 'questions' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">4</span>
                      <span>Khối 4: Ngân Hàng Câu Hỏi Dạng Bài & Bài Toán Mẫu</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Quản lý ngân hàng câu hỏi thích ứng (API 16-18) bốc tự động cho học sinh luyện tập vi mô
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setNewQuestionModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Câu Hỏi Mới</span>
                  </button>
                </div>

                {/* Flagship Sample Question of Pattern */}
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-4">
                  <div className="flex items-center justify-between text-xs font-extrabold text-indigo-900">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Bài toán mẫu minh họa chính của Dạng bài:</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Đáp án đúng: {form.sampleQuestion?.correctOption || 'A'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Đề bài (KaTeX & Markdown):</label>
                    <textarea
                      rows={3}
                      value={form.sampleQuestion?.contentLatex || ''}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        sampleQuestion: { ...prev.sampleQuestion, contentLatex: e.target.value }
                      }))}
                      placeholder="Cho hàm số y = f(x)..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map((optKey) => {
                      const fieldName = `option${optKey}`;
                      const isCorrect = form.sampleQuestion?.correctOption === optKey;
                      return (
                        <div 
                          key={optKey}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 transition-colors ${
                            isCorrect ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400' : 'bg-white border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="sampleCorrectRadio"
                            checked={isCorrect}
                            onChange={() => setForm(prev => ({
                              ...prev,
                              sampleQuestion: { ...prev.sampleQuestion, correctOption: optKey }
                            }))}
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="font-bold text-xs text-slate-800">{optKey}.</span>
                          <input
                            type="text"
                            value={form.sampleQuestion?.[fieldName] || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setForm(prev => ({
                                ...prev,
                                sampleQuestion: { ...prev.sampleQuestion, [fieldName]: val }
                              }));
                            }}
                            placeholder={`Phương án ${optKey}...`}
                            className="w-full text-xs font-medium focus:outline-none bg-transparent"
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Lời giải chi tiết từng bước:</label>
                    <textarea
                      rows={3}
                      value={form.sampleQuestion?.explanation || ''}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        sampleQuestion: { ...prev.sampleQuestion, explanation: e.target.value }
                      }))}
                      placeholder="Lời giải chi tiết theo các bước của Dạng bài..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                {/* Additional Questions from Database */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                    <span>Các câu hỏi khác thuộc Dạng bài trong cơ sở dữ liệu ({questionsList.length} câu):</span>
                    {loadingQuestions && <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />}
                  </div>

                  {questionsList.length === 0 ? (
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs">
                      Chưa có câu hỏi bổ sung nào. Bấm <strong>"+ Thêm Câu Hỏi Mới"</strong> để làm phong phú ngân hàng đề.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto">
                      {questionsList.map((q, idx) => (
                        <div key={q.questionId || idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3 text-xs">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-700">Câu #{idx + 1}</span>
                              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                                Bloom L{q.difficultyLevel || 2}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Đáp án: {q.correctOption}
                              </span>
                            </div>
                            <div className="text-slate-800 font-medium">
                              <MathText text={q.contentLatex} />
                            </div>
                          </div>
                          
                          <button
                            onClick={async () => {
                              if (!window.confirm("Thầy/Cô có chắc chắn muốn xóa câu hỏi này?")) return;
                              try {
                                await contentService.deleteQuestion(q.questionId);
                                setQuestionsList(prev => prev.filter(item => item.questionId !== q.questionId));
                              } catch (e) {
                                alert("Không thể xóa câu hỏi: " + e.message);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Xóa câu hỏi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= SECTION: CÀI ĐẶT ĐỊNH DANH & TRỌNG SỐ ================= */}
            {activeSection === 'settings' && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-slate-700" />
                    <span>Cài Đặt Định Danh & Thuộc Tính Sư Phạm Dạng Bài</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Tên Dạng bài:</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Trọng số năng lực (%):</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={form.weight}
                      onChange={(e) => setForm(prev => ({ ...prev, weight: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Mức độ nhận thức chuẩn Bloom:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {['Nhận biết (L1)', 'Thông hiểu (L2)', 'Vận dụng (L3)', 'Vận dụng cao (L4)'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, level: lvl }))}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                          form.level === lvl 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ================= RIGHT: HIGH-FIDELITY LIVE STUDENT PREVIEW (5 Cols in Split, Full in Preview) ================= */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'lg:col-span-5' : 'w-full'} space-y-4`}>
            
            {/* Preview Banner Header */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-200" />
                <span className="text-xs font-extrabold uppercase tracking-wide">
                  Giao Diện Trực Quan Học Sinh Nhìn Thấy (Live Preview)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                Thời gian thực
              </span>
            </div>

            {/* The Actual Simulated Student Container */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-6">
              
              {/* Pattern Header */}
              <div className="space-y-1.5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black font-mono">
                    {pattern?.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">
                    Trọng số: {form.weight}%
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                    {form.level}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {form.name}
                </h2>
              </div>

              {/* Khối 1: Nền tảng SGK & Hình ảnh */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[10px] font-black">1</span>
                  <span>Khối 1: Kiến thức nền tảng SGK</span>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 text-xs text-slate-800 font-medium leading-relaxed">
                  <MathText text={form.theoryRecap || "*(Chưa nhập lý thuyết)*"} />
                </div>
              </div>

              {/* Khối 2: Phương pháp giải & Bẫy đề thi */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">2</span>
                  <span>Khối 2: Phương pháp giải chi tiết</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 text-xs text-slate-800 font-medium leading-relaxed space-y-2">
                  <MathText text={form.solutionMethod || "*(Chưa nhập phương pháp giải)*"} />
                  {form.examTraps && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs mt-2">
                      <div className="font-bold mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Bẫy đề thi ĐGNL cần tránh:</span>
                      </div>
                      <MathText text={form.examTraps} />
                    </div>
                  )}
                  {form.casioTricks && (
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs mt-2">
                      <div className="font-bold mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Kỹ thuật Casio & Mẹo tư duy nhanh:</span>
                      </div>
                      <MathText text={form.casioTricks} />
                    </div>
                  )}
                </div>
              </div>

              {/* Khối 3: Video bài giảng */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">3</span>
                  <span>Khối 3: Video bài giảng & Lời giải</span>
                </div>
                {form.videoUrl ? (
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <iframe
                      src={getEmbedVideoUrl(form.videoUrl)}
                      title="Video preview student"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center">
                    Chưa đính kèm video bài giảng.
                  </div>
                )}
              </div>

              {/* Khối 4: Bài toán mẫu */}
              <div className="space-y-2">
                <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">4</span>
                  <span>Khối 4: Bài toán mẫu & Luyện tập củng cố</span>
                </div>
                {form.sampleQuestion?.contentLatex ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <div className="font-bold text-slate-900">
                      <MathText text={form.sampleQuestion.contentLatex} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <div 
                          key={opt}
                          className={`p-2 rounded-xl border text-xs ${
                            form.sampleQuestion.correctOption === opt 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <MathText text={`${opt}. ${form.sampleQuestion[`option${opt}`]}`} />
                        </div>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
                      <strong>Lời giải: </strong>
                      <MathText text={form.sampleQuestion.explanation} />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-400 text-center">
                    Chưa nhập câu hỏi mẫu.
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 3. MODAL ĐÍNH KÈM HÌNH ẢNH MINH HỌA (IMAGE UPLOADER & LINKER) */}
      {imageModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold">Đính Kèm Hình Ảnh Minh Họa / Đồ Thị</h3>
              </div>
              <button 
                onClick={() => setImageModalTarget(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nhập URL hình ảnh (Đồ thị hàm số, Bảng biến thiên, Hình Oxyz):</label>
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="https://example.com/graph-derivative.png"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Sample images list for quick testing */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Hoặc chọn hình vẽ mẫu chuẩn:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_DIAGRAM_IMAGES.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertImage(imageModalTarget, img.url, img.label)}
                      className="p-2 rounded-xl border border-slate-200 hover:border-cyan-500 bg-slate-50 hover:bg-cyan-50/50 text-left transition-all space-y-1"
                    >
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200">
                        <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-700 truncate">{img.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setImageModalTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
              >
                Đóng
              </button>
              <button
                type="button"
                disabled={!customImageUrl.trim()}
                onClick={() => handleInsertImage(imageModalTarget, customImageUrl.trim(), 'Hình đồ thị minh họa')}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-sm disabled:opacity-40"
              >
                Chèn Ảnh Vào Nội Dung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL THÊM CÂU HỎI MỚI VÀO NGÂN HÀNG ĐỀ (API 16) */}
      {newQuestionModalOpen && (
        <NewQuestionDialog
          skillId={form.patternId || pattern?.patternId}
          onClose={() => setNewQuestionModalOpen(false)}
          onCreated={(newQ) => {
            setQuestionsList(prev => [newQ, ...prev]);
            setNewQuestionModalOpen(false);
          }}
        />
      )}

    </div>
  );
}

// Subcomponent: New Question Modal
function NewQuestionDialog({ skillId, onClose, onCreated }) {
  const [contentLatex, setContentLatex] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [difficultyLevel, setDifficultyLevel] = useState(2);
  const [explanation, setExplanation] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contentLatex.trim()) {
      alert("Vui lòng nhập đề bài câu hỏi.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        skillId: skillId,
        difficultyLevel: parseInt(difficultyLevel, 10) || 2,
        contentLatex: contentLatex.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctOption: correctOption,
        explanation: explanation.trim()
      };
      const result = await contentService.createQuestion(payload);
      alert("Đã thêm câu hỏi thành công vào ngân hàng đề!");
      if (onCreated) onCreated(result || payload);
    } catch (err) {
      alert("Lỗi khi thêm câu hỏi: " + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-extrabold">Thêm Câu Hỏi Mới Vào Ngân Hàng Đề (API 16)</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Đề bài (KaTeX / Markdown):</label>
            <textarea
              rows={3}
              value={contentLatex}
              onChange={(e) => setContentLatex(e.target.value)}
              placeholder="Cho hàm số y = f(x)..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D'].map((opt) => (
              <div key={opt} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2">
                <input
                  type="radio"
                  name="newQuestionRadio"
                  checked={correctOption === opt}
                  onChange={() => setCorrectOption(opt)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-bold text-xs text-slate-800">{opt}.</span>
                <input
                  type="text"
                  value={opt === 'A' ? optionA : opt === 'B' ? optionB : opt === 'C' ? optionC : optionD}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (opt === 'A') setOptionA(val);
                    if (opt === 'B') setOptionB(val);
                    if (opt === 'C') setOptionC(val);
                    if (opt === 'D') setOptionD(val);
                  }}
                  placeholder={`Phương án ${opt}...`}
                  className="w-full text-xs font-medium focus:outline-none bg-transparent"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Mức độ Bloom (1-4):</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              >
                <option value={1}>Bloom L1: Nhận biết</option>
                <option value={2}>Bloom L2: Thông hiểu</option>
                <option value={3}>Bloom L3: Vận dụng</option>
                <option value={4}>Bloom L4: Vận dụng cao</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Đáp án đúng đã chọn:</label>
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-800 text-center">
                Phương án {correctOption}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Lời giải chi tiết từng bước:</label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Giải thích từng bước..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu Câu Hỏi Vào Database"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
