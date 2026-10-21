import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Cpu, 
  BarChart2, 
  Atom, 
  Search, 
  Sparkles, 
  PlayCircle, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  Share2, 
  HelpCircle, 
  Award, 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown,
  Compass,
  FileText,
  Clock,
  Zap,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  Target,
  Folder,
  FolderOpen,
  Bookmark,
  AlertCircle,
  Edit3,
  Pencil,
  Save,
  Plus,
  Trash2,
  Eye,
  Sliders,
  UploadCloud,
  Code,
  Wand2,
  FileUp,
  FileType,
  CheckCheck,
  Upload,
  Filter,
  Calendar,
  GraduationCap,
  Book
} from 'lucide-react';
import MathText from '../common/MathText';
import CurriculumStudioEditor, { parseSolutionMethodSections, parseTheoryRecapSections, isMathOrStemDomain } from './CurriculumStudioEditor';
import InteractiveMathWorkbenchModal from './InteractiveMathWorkbenchModal';
import contentService from '../../services/contentService';
import { practiceService } from '../../services/practiceService';
import { aiService } from '../../services/aiService';
import { toast } from '../../context/ToastContext';

// Cấu hình phân môn riêng biệt theo từng Miền tri thức
export const SUB_SUBJECTS_BY_DOMAIN = {
  // Khoa học tự nhiên: Vật lí, Hóa học, Sinh học
  'NATURAL_SCIENCES': [
    { id: 'all', name: 'Tất cả môn KHTN', keywords: [] },
    { id: 'physics', name: 'Vật lí', keywords: ['vật lí', 'vật lý', 'dao động', 'sóng', 'điện', 'quang', 'hạt nhân', 'nhiệt', 'khí', 'lực', 'chuyển động', 'năng lượng', 'cơ học', 'physics'] },
    { id: 'chemistry', name: 'Hóa học', keywords: ['hóa', 'hóa học', 'este', 'lipit', 'cacbohidrat', 'amin', 'polime', 'kim loại', 'hữu cơ', 'vô cơ', 'nguyên tử', 'dung dịch', 'phản ứng', 'axit', 'bazơ', 'muối', 'chemistry'] },
    { id: 'biology', name: 'Sinh học', keywords: ['sinh', 'sinh học', 'di truyền', 'tiến hóa', 'sinh thái', 'tế bào', 'nhiễm sắc thể', 'adn', 'arn', 'quần thể', 'hệ sinh thái', 'đột biến', 'gen', 'biology'] }
  ],
  // Khoa học xã hội: Lịch sử, Địa lí, GDKT & Pháp luật
  'SOCIAL_SCIENCES': [
    { id: 'all', name: 'Tất cả môn KHXH', keywords: [] },
    { id: 'history', name: 'Lịch sử', keywords: ['lịch sử', 'sử', 'cách mạng', 'chiến tranh', 'kháng chiến', 'đảng', 'thế giới', 'việt nam 19', 'việt nam 1945', 'phục hưng', 'phong kiến', 'chiến tranh thế giới', 'history'] },
    { id: 'geography', name: 'Địa lí', keywords: ['địa lí', 'địa lý', 'địa hình', 'khí hậu', 'dân cư', 'kinh tế vùng', 'biển đảo', 'đồng bằng', 'sông ngòi', 'khoáng sản', 'tự nhiên việt nam', 'đô thị hóa', 'geography'] },
    { id: 'civics', name: 'GDKT & Pháp luật', keywords: ['pháp luật', 'kinh tế', 'hiến pháp', 'quyền', 'nghĩa vụ', 'doanh nghiệp', 'thị trường', 'tiền tệ', 'công dân', 'gdkt', 'luật'] }
  ],
  // Sử dụng ngôn ngữ: Tiếng Việt / Ngữ văn, Tiếng Anh
  'LANGUAGE': [
    { id: 'all', name: 'Tất cả môn Ngôn ngữ', keywords: [] },
    { id: 'vietnamese', name: 'Tiếng Việt / Ngữ văn', keywords: ['tiếng việt', 'ngữ văn', 'văn học', 'đọc hiểu', 'nghị luận', 'biện pháp tu từ', 'phương thức biểu đạt', 'từ ngữ', 'văn bản', 'liên kết câu', 'phong cách ngôn ngữ', 'thơ', 'truyện', 'tác phẩm'] },
    { id: 'english', name: 'Tiếng Anh', keywords: ['tiếng anh', 'english', 'reading', 'cloze', 'grammar', 'vocabulary', 'pronoun', 'sentence', 'inference', 'factual', 'passage', 'comprehension'] }
  ],
  // Toán học & Tư duy định lượng
  'DOM_MATH': [
    { id: 'all', name: 'Tất cả phân môn Toán', keywords: [] },
    { id: 'algebra', name: 'Đại số & Giải tích', keywords: ['đại số', 'giải tích', 'hàm số', 'đạo hàm', 'tích phân', 'nguyên hàm', 'mũ', 'logarit', 'phương trình', 'bất đẳng thức', 'dãy số', 'cấp số'] },
    { id: 'geometry', name: 'Hình học & Đo lường', keywords: ['hình học', 'không gian', 'tọa độ', 'vectơ', 'khối đa diện', 'mặt nón', 'mặt trụ', 'mặt cầu', 'tam giác', 'đường tròn', 'song song', 'vuông góc'] },
    { id: 'probability', name: 'Xác suất & Thống kê', keywords: ['xác suất', 'thống kê', 'biến cố', 'tổ hợp', 'chỉnh hợp', 'mẫu số liệu', 'độ lệch chuẩn', 'kỳ vọng', 'phương sai', 'tần số', 'trung vị'] },
    { id: 'logic', name: 'Tư duy logic & Dữ liệu', keywords: ['logic', 'mệnh đề', 'suy luận', 'biểu đồ', 'bảng biểu', 'phân tích số liệu', 'xử lý số liệu', 'tư duy', 'suy đoán'] }
  ]
};

// Nhận diện Khối lớp từ tên chương hoặc bài học
export const detectGrade = (text) => {
  if (!text) return '12';
  const lower = text.toLowerCase();
  if (lower.includes('lớp 10') || lower.includes('grade 10') || lower.includes('[10]') || lower.includes('khối 10')) return '10';
  if (lower.includes('lớp 11') || lower.includes('grade 11') || lower.includes('[11]') || lower.includes('khối 11')) return '11';
  if (lower.includes('lớp 12') || lower.includes('grade 12') || lower.includes('[12]') || lower.includes('khối 12')) return '12';
  return '12'; // Trọng tâm chuẩn ĐGNL V-ACT
};

// Nhận diện Năm học từ tên chương hoặc mô tả
export const detectAcademicYear = (text) => {
  if (!text) return '2025-2026';
  const lower = text.toLowerCase();
  if (lower.includes('2023-2024') || lower.includes('2023 - 2024')) return '2023-2024';
  if (lower.includes('2024-2025') || lower.includes('2024 - 2025')) return '2024-2025';
  if (lower.includes('2025-2026') || lower.includes('2025 - 2026')) return '2025-2026';
  return '2025-2026'; // Khung chuẩn GDPT 2018 Mới
};

// Xác định key của domain
export const getDomainKey = (domain) => {
  if (!domain) return 'DOM_MATH';
  const code = (domain.domainCode || domain.code || domain.id || '').toUpperCase();
  const title = (domain.title || domain.name || '').toLowerCase();
  if (code.includes('NATURAL') || title.includes('tự nhiên')) return 'NATURAL_SCIENCES';
  if (code.includes('SOCIAL') || title.includes('xã hội')) return 'SOCIAL_SCIENCES';
  if (code.includes('LANG') || title.includes('ngôn ngữ')) return 'LANGUAGE';
  if (code.includes('MATH') || title.includes('toán')) return 'DOM_MATH';
  return 'DOM_MATH';
};

// Kiểm tra xem chương/bài học có khớp với phân môn không
export const matchesSubSubject = (chap, subSubjectId, domainKey) => {
  if (!subSubjectId || subSubjectId === 'all') return true;
  const config = SUB_SUBJECTS_BY_DOMAIN[domainKey] || [];
  const target = config.find(s => s.id === subSubjectId);
  if (!target || !target.keywords || target.keywords.length === 0) return true;

  const combinedText = `${chap.name || ''} ${chap.description || ''} ${(chap.lessons || []).map(l => l.name + ' ' + (l.patterns || []).map(p => p.name).join(' ')).join(' ')}`.toLowerCase();
  return target.keywords.some(kw => combinedText.includes(kw.toLowerCase()));
};

const DOMAIN_ICONS = {
  Cpu,
  BookOpen,
  Atom,
  BarChart2,
  Layers
};

const getDomainIcon = (iconName) => DOMAIN_ICONS[iconName] || Cpu;

const MATH_SNIPPETS = [
  { label: 'Phân số', code: '\\frac{a}{b}' },
  { label: 'Căn bậc 2', code: '\\sqrt{x}' },
  { label: 'Lũy thừa', code: 'x^2' },
  { label: 'Đạo hàm', code: "f'(x)" },
  { label: 'Tích phân', code: '\\int_{a}^{b} f(x)dx' },
  { label: 'Giới hạn', code: '\\lim_{x \\to x_0}' },
  { label: 'Delta', code: '\\Delta = b^2 - 4ac' },
  { label: 'Suy ra', code: '\\Rightarrow' },
  { label: 'Thuộc', code: '\\in' },
  { label: 'Với mọi', code: '\\forall' },
  { label: 'Tồn tại', code: '\\exists' },
  { label: 'Lớn hơn bằng', code: '\\ge' },
  { label: 'Nhỏ hơn bằng', code: '\\le' }
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

export default function CurriculumExplorerView({ onStartQuizModal, onNavigateDiagnostic }) {
  const [domains, setDomains] = useState([]);
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);
  const [activeDomainId, setActiveDomainId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // 3-Level Hierarchy State: Chapter -> Lesson -> Pattern
  const [expandedChapters, setExpandedChapters] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [selectedPattern, setSelectedPattern] = useState(null);
  
  // Dynamic Assessment & Mastery State
  const [userAssessment, setUserAssessment] = useState(null);
  const [skillMasteryMap, setSkillMasteryMap] = useState({});

  // Interactive Quiz State (API 19)
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizUserAnswers, setQuizUserAnswers] = useState({});
  const [quizShowResults, setQuizShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // =========================================================================
  // Giảng viên & Ban Chuyên Môn Curation Suite State (Tối đa hóa hỗ trợ chỉnh sửa)
  // =========================================================================
  const [instructorMode, setInstructorMode] = useState(true);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState('settings');
  const [editingForm, setEditingForm] = useState({
    patternId: '',
    name: '',
    weight: '5',
    level: 'Vận dụng',
    grade: '12',
    chapterId: '',
    lessonId: '',
    theoryRecap: '',
    solutionMethod: '',
    videoUrl: '',
    durationSeconds: 600,
    prerequisiteSkillIds: []
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');
  const [editErrorMsg, setEditErrorMsg] = useState('');

  // =========================================================================
  // Studio Sư Phạm Chuyên Sâu (Toàn trang / Live Split 50-50 / Review Học sinh)
  // =========================================================================
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTargetPattern, setStudioTargetPattern] = useState(null);
  const [studioTargetChapter, setStudioTargetChapter] = useState(null);
  const [studioTargetLesson, setStudioTargetLesson] = useState(null);

  // Multi-Dimensional Classification & Filter States (Lớp, Năm học, Phân môn riêng biệt)
  const [selectedGrade, setSelectedGrade] = useState('all'); // 'all' | '12' | '11' | '10'
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('all'); // 'all' | '2025-2026' | '2024-2025'
  const [selectedSubSubject, setSelectedSubSubject] = useState('all');

  // Node Deletion Tracking
  const [deletingNodeId, setDeletingNodeId] = useState(null);

  // Create Chapter State
  const [isCreateChapterModalOpen, setIsCreateChapterModalOpen] = useState(false);
  const [createChapterForm, setCreateChapterForm] = useState({
    domainId: '',
    name: '',
    grade: '12',
    academicYear: '2025-2026',
    subSubject: '',
    weight: '25',
    description: ''
  });
  const [savingCreateChapter, setSavingCreateChapter] = useState(false);

  // Create Lesson State
  const [isCreateLessonModalOpen, setIsCreateLessonModalOpen] = useState(false);
  const [createLessonForm, setCreateLessonForm] = useState({
    chapterId: '',
    chapterName: '',
    name: '',
    weight: '10',
    summary: ''
  });
  const [savingCreateLesson, setSavingCreateLesson] = useState(false);

  // Create Pattern State
  const [isCreatePatternModalOpen, setIsCreatePatternModalOpen] = useState(false);
  const [createPatternForm, setCreatePatternForm] = useState({
    lessonId: '',
    lessonName: '',
    name: '',
    weight: '5',
    theoryRecap: '',
    solutionMethod: '',
    videoUrl: '',
    durationSeconds: 600
  });
  const [savingCreate, setSavingCreate] = useState(false);

  // Import Dynamic SGK & AI Document Ingestion State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState('document'); // 'document' | 'json'
  const [importFile, setImportFile] = useState(null);
  const [importTextSnippet, setImportTextSnippet] = useState('');
  const [importTargetDomainId, setImportTargetDomainId] = useState('');
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [aiExtractStep, setAiExtractStep] = useState(0); // 0: Idle, 1: Reading, 2: Structure, 3: Patterns, 4: Done
  const [extractedCurriculum, setExtractedCurriculum] = useState(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importingCurriculum, setImportingCurriculum] = useState(false);

  // Large Document (e.g. 99-page books) & Deep Extraction Controls
  const [importPageMode, setImportPageMode] = useState('all'); // 'all' | 'custom'
  const [importStartPage, setImportStartPage] = useState(1);
  const [importEndPage, setImportEndPage] = useState(35);
  const [importExtractionDepth, setImportExtractionDepth] = useState('deep'); // 'deep' | 'standard'

  // Panoramic Verification Workspace State
  const [previewSelectedLessonKey, setPreviewSelectedLessonKey] = useState('0-0'); // 'cIdx-lIdx'
  const [previewSelectedPattern, setPreviewSelectedPattern] = useState(null);
  const [previewBloomFilter, setPreviewBloomFilter] = useState('all');
  const [previewQuestionBloomTab, setPreviewQuestionBloomTab] = useState('all');
  const [previewActiveQuestionIdx, setPreviewActiveQuestionIdx] = useState(0);
  const [isGeneratingPracticeQuestions, setIsGeneratingPracticeQuestions] = useState(false);

  // Interactive MathLab & 3D Spatial Geometry Modal (Flow 3 & Flow 2 Testing)
  const [isMathLabModalOpen, setIsMathLabModalOpen] = useState(false);
  const [mathLabEngine, setMathLabEngine] = useState('jsxgraph');

  // 1. Fetch Curriculum from Backend Content Service API (Database Dynamic)
  const fetchCurriculumData = async (preservePatternId = null) => {
    setLoadingCurriculum(true);
    try {
      const data = await contentService.getCurriculum();
      if (data && Array.isArray(data) && data.length > 0) {
        setDomains(data);
        const targetDomain = data.find(d => d.id === activeDomainId) || data[0];
        if (!activeDomainId) {
          setActiveDomainId(targetDomain.id);
        }

        if (preservePatternId) {
          let foundPat = null;
          for (const d of data) {
            for (const c of (d.chapters || [])) {
              for (const l of (c.lessons || [])) {
                for (const p of (l.patterns || [])) {
                  if (p.patternId === preservePatternId) {
                    foundPat = p;
                    break;
                  }
                }
              }
            }
          }
          if (foundPat) {
            setSelectedPattern(foundPat);
          }
        } else if (!selectedPattern) {
          initSelection(targetDomain);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải dàn kiến thức từ Content Service:", err);
    } finally {
      setLoadingCurriculum(false);
    }
  };

  useEffect(() => {
    fetchCurriculumData();
  }, []);

  const initSelection = (domain) => {
    if (!domain) return;
    const chapters = domain.chapters || [];
    if (chapters.length > 0) {
      const firstChap = chapters[0];
      setExpandedChapters({ [firstChap.chapterId]: true });
      if (firstChap.lessons && firstChap.lessons.length > 0) {
        const firstLes = firstChap.lessons[0];
        setExpandedLessons({ [firstLes.lessonId]: true });
        if (firstLes.patterns && firstLes.patterns.length > 0) {
          setSelectedPattern(firstLes.patterns[0]);
        }
      }
    } else if (domain.skills && domain.skills.length > 0) {
      // Fallback: Map flat skill to pattern structure
      const s = domain.skills[0];
      setSelectedPattern({
        patternId: s.skillId,
        name: s.name,
        code: s.code,
        level: s.level,
        weight: s.weight,
        theoryRecap: s.theory,
        solutionMethod: "Phương pháp tư duy chuẩn hóa ĐGNL ĐHQG-HCM.",
        keyFormulas: s.keyFormulas || [],
        crossModel: s.crossModel,
        crossNote: s.crossNote,
        prerequisiteIds: s.prerequisiteIds || [],
        videoLesson: s.videoLesson,
        sampleQuestion: s.sampleQuestion,
        questionBankCount: 5
      });
    }
  };

  const currentDomain = domains.find(d => d.id === activeDomainId) || domains[0] || { chapters: [], skills: [] };

  // When switching domains, re-init selection and reset sub-subject
  useEffect(() => {
    if (currentDomain) {
      initSelection(currentDomain);
      setSelectedSubSubject('all');
    }
  }, [activeDomainId]);

  // Load User Assessment & Mastery from Backend Practice Service / LocalStorage
  useEffect(() => {
    const loadRoadmapAndAssessment = async () => {
      let diagData = null;
      try {
        const stored = localStorage.getItem('veval_last_diagnostic_result');
        if (stored) {
          diagData = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Cannot read cached diagnostic:', e);
      }

      let roadmapData = null;
      try {
        roadmapData = await practiceService.getMyRoadmap();
      } catch (e) {
        // Not found is normal when student hasn't completed diagnostic
      }

      if (diagData) {
        const masteryMap = {};
        (diagData.domain_scores || []).forEach(ds => {
          masteryMap[ds.domain_id] = ds.accuracy_pct;
        });

        // Dynamic mapping from actual skill/pattern scores returned by diagnostic engine
        (diagData.skill_scores || []).forEach(ss => {
          const score = Math.round((ss.bkt_mastery ?? ss.accuracy_pct ?? (ss.accuracy ? ss.accuracy * 100 : 0)));
          if (ss.skill_id) masteryMap[ss.skill_id] = score;
          if (ss.code) masteryMap[ss.code] = score;
        });

        // Also incorporate roadmap node mastery if available
        if (roadmapData && roadmapData.data && Array.isArray(roadmapData.data.nodes)) {
          roadmapData.data.nodes.forEach(node => {
            if (node.skillId) {
              masteryMap[node.skillId] = Math.round((node.masteryScore ?? 0.5) * 100);
            }
          });
        }

        const weakCount = Object.values(masteryMap).filter(v => v < 60).length;

        setUserAssessment({
          theta0: diagData.theta_0 ?? 0.0,
          placementClassLabel: diagData.placement_class === 'BREAKTHROUGH' 
            ? 'Lớp Bứt Phá (900+)' 
            : diagData.placement_class === 'ACCELERATION' 
            ? 'Lớp Tăng Tốc (750 - 900)' 
            : 'Lớp Nền Tảng (<750)',
          totalCorrect: diagData.pacing?.totalCorrect ?? 18,
          weakCount: weakCount
        });
        setSkillMasteryMap(masteryMap);
      } else if (roadmapData && roadmapData.data) {
        const rm = roadmapData.data;
        const masteryMap = {};
        if (Array.isArray(rm.nodes)) {
          rm.nodes.forEach(node => {
            if (node.skillId) {
              masteryMap[node.skillId] = Math.round((node.masteryScore ?? 0.5) * 100);
            }
          });
        }
        setSkillMasteryMap(masteryMap);
        setUserAssessment({
          theta0: 0.25,
          placementClassLabel: 'Lớp Tăng Tốc (750 - 900)',
          totalCorrect: rm.completedMilestones || 15,
          weakCount: rm.nodes ? rm.nodes.filter(n => n.status !== 'COMPLETED').length : 3
        });
      }
    };

    loadRoadmapAndAssessment();
  }, []);

  // Helper to toggle chapter / lesson accordion & auto-load content
  const toggleChapter = (chapterId, chap) => {
    setExpandedChapters(prev => {
      const willExpand = !prev[chapterId];
      if (willExpand && chap?.lessons?.length > 0) {
        const firstLes = chap.lessons[0];
        setExpandedLessons(lPrev => ({ ...lPrev, [firstLes.lessonId]: true }));
        if (firstLes.patterns && firstLes.patterns.length > 0) {
          setSelectedPattern(firstLes.patterns[0]);
        }
      }
      return {
        ...prev,
        [chapterId]: willExpand
      };
    });
  };

  const toggleLesson = (lessonId, les) => {
    setExpandedLessons(prev => {
      const willExpand = !prev[lessonId];
      if (willExpand && les?.patterns && les.patterns.length > 0) {
        setSelectedPattern(les.patterns[0]);
      }
      return {
        ...prev,
        [lessonId]: willExpand
      };
    });
  };

  // Get effective chapters (handling fallback if domain only has flat skills)
  const chapters = useMemo(() => {
    if (currentDomain.chapters && currentDomain.chapters.length > 0) {
      return currentDomain.chapters;
    }
    if (currentDomain.skills && currentDomain.skills.length > 0) {
      return [{
        chapterId: `chap-core-${currentDomain.domainCode}`,
        name: `Chuyên đề Cốt lõi: ${currentDomain.title}`,
        code: `${currentDomain.domainCode}_CORE`,
        description: "Hệ thống bài học và dạng bài phân loại chuẩn ĐHQG-HCM",
        lessons: currentDomain.skills.map((s, idx) => ({
          lessonId: s.skillId,
          name: s.name,
          code: `L${idx + 1}`,
          summary: s.theory,
          patterns: [{
            patternId: s.skillId,
            name: s.name,
            code: s.code,
            level: s.level,
            weight: s.weight,
            theoryRecap: s.theory,
            solutionMethod: "Phương pháp tư duy chuẩn hóa ĐGNL ĐHQG-HCM.",
            keyFormulas: s.keyFormulas || [],
            crossModel: s.crossModel,
            crossNote: s.crossNote,
            prerequisiteIds: s.prerequisiteIds || [],
            videoLesson: s.videoLesson,
            sampleQuestion: s.sampleQuestion,
            questionBankCount: 5
          }]
        }))
      }];
    }
    return [];
  }, [currentDomain]);

  const domainKey = useMemo(() => getDomainKey(currentDomain), [currentDomain]);
  const subSubjectsList = useMemo(() => SUB_SUBJECTS_BY_DOMAIN[domainKey] || [], [domainKey]);

  // Bộ lọc đa chiều 3 tầng: Tìm kiếm văn bản + Khối lớp + Năm học + Phân môn riêng biệt
  const filteredChapters = useMemo(() => {
    let result = chapters;

    // 1. Lọc theo Khối Lớp
    if (selectedGrade !== 'all') {
      result = result.filter(chap => {
        const text = `${chap.name} ${chap.description || ''} ${(chap.lessons || []).map(l => l.name).join(' ')}`;
        return detectGrade(text) === selectedGrade;
      });
    }

    // 2. Lọc theo Năm học
    if (selectedAcademicYear !== 'all') {
      result = result.filter(chap => {
        const text = `${chap.name} ${chap.description || ''}`;
        return detectAcademicYear(text) === selectedAcademicYear;
      });
    }

    // 3. Lọc theo Phân môn riêng biệt (Sub-Subject)
    if (selectedSubSubject !== 'all') {
      result = result.filter(chap => matchesSubSubject(chap, selectedSubSubject, domainKey));
    }

    // 4. Lọc theo Search Query (Chương, Bài học, Dạng bài, KaTeX)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.map(chap => {
        const matchChap = chap.name.toLowerCase().includes(q) || (chap.code && chap.code.toLowerCase().includes(q));
        const filteredLessons = (chap.lessons || []).map(les => {
          const matchLes = les.name.toLowerCase().includes(q) || (les.code && les.code.toLowerCase().includes(q));
          const filteredPatterns = (les.patterns || []).filter(pat => 
            pat.name.toLowerCase().includes(q) ||
            (pat.code && pat.code.toLowerCase().includes(q)) ||
            (pat.theoryRecap && pat.theoryRecap.toLowerCase().includes(q)) ||
            (pat.crossModel && pat.crossModel.toLowerCase().includes(q))
          );
          if (matchLes || filteredPatterns.length > 0) {
            return { ...les, patterns: matchLes ? les.patterns : filteredPatterns };
          }
          return null;
        }).filter(Boolean);

        if (matchChap || filteredLessons.length > 0) {
          return { ...chap, lessons: matchChap ? chap.lessons : filteredLessons };
        }
        return null;
      }).filter(Boolean);
    }

    return result;
  }, [chapters, selectedGrade, selectedAcademicYear, selectedSubSubject, domainKey, searchQuery]);

  // Helper to get Mastery percentage for a Pattern
  const getPatternMastery = (pattern) => {
    if (!pattern) return undefined;
    return skillMasteryMap[pattern.patternId] ?? skillMasteryMap[pattern.code];
  };

  // Trigger Content Service API 19 (POST /api/content/exams/quiz) with Adjacent Bundling (<10%)
  const handleLaunchAdaptiveQuiz = async (pattern) => {
    setQuizLoading(true);
    setIsQuizModalOpen(true);
    setQuizCurrentIndex(0);
    setQuizUserAnswers({});
    setQuizShowResults(false);
    setQuizScore(0);

    // Identify weak prerequisite / adjacent skills (< 10%) to bundle into quiz
    const weakAdjacentIds = (pattern.prerequisiteIds || []).filter(prereqId => {
      const mastery = skillMasteryMap[prereqId];
      return mastery !== undefined && mastery < 10;
    });

    const targetSkillIds = [pattern.patternId, ...weakAdjacentIds];

    try {
      // Call Content Service API 19
      const quizData = await contentService.createAdaptiveQuiz({
        title: `Phiếu củng cố: ${pattern.name}${weakAdjacentIds.length > 0 ? ' (Kèm củng cố tiên quyết hổng)' : ''}`,
        skillIds: targetSkillIds,
        questionCount: 5,
        minBloomLevel: 1,
        maxBloomLevel: 3
      });

      if (quizData && quizData.questions && quizData.questions.length > 0) {
        setActiveQuiz({
          examId: quizData.examId,
          title: quizData.title || `Phiếu củng cố: ${pattern.name}`,
          questions: quizData.questions.map((q, idx) => ({
            id: q.questionId || `Q-${idx + 1}`,
            content: q.content,
            options: (q.options || []).map(opt => typeof opt === 'string' ? opt : (opt.content || `${opt.optionId}. Option`)),
            correct: (q.options || []).findIndex(opt => opt.isCorrect) >= 0 
              ? (q.options || []).findIndex(opt => opt.isCorrect)
              : 0,
            explanation: q.explanation || "Lời giải chi tiết chuẩn hóa theo phương pháp tư duy ĐHQG-HCM."
          }))
        });
      } else if (pattern.sampleQuestion) {
        // Use verified sample question from database if available
        setActiveQuiz({
          examId: pattern.patternId,
          title: `Phiếu bài tập củng cố: ${pattern.name}`,
          questions: [
            {
              id: pattern.sampleQuestion.questionId || 'Q-SAMPLE',
              content: pattern.sampleQuestion.content,
              options: pattern.sampleQuestion.options,
              correct: pattern.sampleQuestion.correct,
              explanation: pattern.sampleQuestion.explanation
            }
          ]
        });
      } else {
        toast.info("Dạng bài này hiện chưa có câu hỏi được nạp trong cơ sở dữ liệu. Giảng viên hoặc AI đang trong quá trình cập nhật ngân hàng đề.");
        setIsQuizModalOpen(false);
      }
    } catch (err) {
      console.warn("Lỗi gọi API 19 Content Service:", err);
      if (pattern.sampleQuestion) {
        setActiveQuiz({
          examId: pattern.patternId,
          title: `Phiếu bài tập củng cố: ${pattern.name}`,
          questions: [
            {
              id: pattern.sampleQuestion.questionId || 'Q-SAMPLE',
              content: pattern.sampleQuestion.content,
              options: pattern.sampleQuestion.options,
              correct: pattern.sampleQuestion.correct,
              explanation: pattern.sampleQuestion.explanation
            }
          ]
        });
      } else {
        toast.error("Không thể tải câu hỏi củng cố lúc này. Vui lòng kiểm tra kết nối API.");
        setIsQuizModalOpen(false);
      }
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectQuizAnswer = (optIndex) => {
    if (quizShowResults) return;
    setQuizUserAnswers(prev => ({
      ...prev,
      [quizCurrentIndex]: optIndex
    }));
  };

  const handleFinishQuiz = () => {
    if (!activeQuiz) return;
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (quizUserAnswers[idx] === q.correct) {
        correctCount++;
      }
    });
    setQuizScore(correctCount);
    setQuizShowResults(true);
  };

  // =========================================================================
  // HANDLERS HIỆU ĐÍNH TRI THỨC SƯ PHẠM DÀNH RIÊNG CHO GIẢNG VIÊN (CURATION SUITE)
  // =========================================================================
  // HANDLERS HIỆU ĐÍNH THÔNG TIN NHANH DÀNH CHO GIẢNG VIÊN
  // (Chỉ sửa Tiêu đề, Chương trực thuộc, Khối lớp, Mức độ Bloom, Trọng số)
  // =========================================================================
  const handleOpenEditModal = (pattern) => {
    if (!pattern) return;
    let currentChapId = '';
    let currentLesId = '';
    for (const chap of (chapters || [])) {
      for (const les of (chap.lessons || [])) {
        if (les.patterns?.some(p => p.patternId === pattern.patternId)) {
          currentChapId = chap.chapterId;
          currentLesId = les.lessonId;
          break;
        }
      }
      if (currentChapId) break;
    }

    setEditingForm({
      patternId: pattern.patternId,
      name: pattern.name || '',
      weight: pattern.weight ? String(pattern.weight).replace('%', '').trim() : '5',
      level: pattern.level || 'Vận dụng',
      grade: pattern.name?.includes('12') ? '12' : pattern.name?.includes('11') ? '11' : pattern.name?.includes('10') ? '10' : '12',
      chapterId: currentChapId,
      lessonId: currentLesId,
      theoryRecap: pattern.theoryRecap || '',
      solutionMethod: pattern.solutionMethod || '',
      videoUrl: pattern.videoLesson?.videoUrl || '',
      durationSeconds: pattern.videoLesson?.durationSeconds || 600,
      prerequisiteSkillIds: pattern.prerequisiteIds || []
    });
    setEditErrorMsg('');
    setEditSuccessMsg('');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingForm.patternId) return;
    setSavingEdit(true);
    setEditErrorMsg('');
    setEditSuccessMsg('');
    try {
      const rawWeight = parseFloat(editingForm.weight);
      const weightVal = !isNaN(rawWeight) ? (rawWeight > 1 ? rawWeight / 100 : rawWeight) : 0.05;

      const payload = {
        name: editingForm.name.trim(),
        weight: weightVal,
        theoryRecap: editingForm.theoryRecap,
        solutionMethod: editingForm.solutionMethod,
        videoUrl: editingForm.videoUrl?.trim() || null,
        durationSeconds: parseInt(editingForm.durationSeconds, 10) || 0,
        prerequisiteSkillIds: editingForm.prerequisiteSkillIds || []
      };

      await contentService.updatePattern(editingForm.patternId, payload);
      
      setSelectedPattern(prev => ({
        ...prev,
        name: editingForm.name.trim(),
        weight: `${Math.round(weightVal * 100)}%`,
        level: editingForm.level
      }));

      await fetchCurriculumData(editingForm.patternId);
      toast.success('Đã cập nhật thông tin dạng bài thành công!');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Lỗi khi lưu thông tin nhanh:', err);
      toast.error('Không thể cập nhật: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenCreatePatternModal = (lessonId, lessonName) => {
    setCreatePatternForm({
      lessonId,
      lessonName: lessonName || 'Bài học hiện tại',
      name: '',
      weight: '5',
      theoryRecap: '',
      solutionMethod: '',
      videoUrl: '',
      durationSeconds: 600
    });
    setIsCreatePatternModalOpen(true);
  };

  const handleCreatePattern = async () => {
    if (!createPatternForm.name.trim() || !createPatternForm.lessonId) {
      toast.warning("Vui lòng nhập tên Dạng bài.");
      return;
    }
    setSavingCreate(true);
    try {
      const rawWeight = parseFloat(createPatternForm.weight);
      const weightVal = !isNaN(rawWeight) ? (rawWeight > 1 ? rawWeight / 100 : rawWeight) : 0.05;

      const payload = {
        domainId: currentDomain.domainId || (currentDomain.id ? currentDomain.id.replace('domain-', '') : '6f3765db-943e-4810-bf74-d6a8bdc215da'),
        parentId: createPatternForm.lessonId,
        name: createPatternForm.name.trim(),
        weight: weightVal,
        theoryRecap: createPatternForm.theoryRecap,
        solutionMethod: createPatternForm.solutionMethod,
        videoUrl: createPatternForm.videoUrl?.trim() || null,
        durationSeconds: parseInt(createPatternForm.durationSeconds, 10) || 600
      };

      const newId = await contentService.createNode(payload);
      setIsCreatePatternModalOpen(false);
      await fetchCurriculumData(newId);
      toast.success("Đã tạo mới dạng bài thành công vào Cây tri thức!");
    } catch (err) {
      toast.error('Không thể tạo dạng bài: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingCreate(false);
    }
  };

  const executeDeletePattern = async (patternId) => {
    try {
      await contentService.deleteNode(patternId);
      setIsEditModalOpen(false);
      await fetchCurriculumData();
      toast.success('Đã xóa dạng bài thành công khỏi cơ sở dữ liệu!');
    } catch (err) {
      toast.error('Lỗi khi xóa dạng bài: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleDeletePattern = (patternId, patternName) => {
    setConfirmDeleteDialog({
      title: '⚠️ Xác Nhận Xóa Dạng Bài',
      message: `Thầy/Cô có chắc chắn muốn xóa Dạng bài "${patternName}" không?\n\nThao tác này sẽ xóa toàn bộ nội dung lý thuyết, phương pháp giải, video và câu hỏi liên quan khỏi cơ sở dữ liệu.`,
      onConfirm: () => executeDeletePattern(patternId)
    });
  };

  const executeDeleteChapter = async (chap) => {
    setDeletingNodeId(chap.chapterId);
    try {
      await contentService.deleteNode(chap.chapterId);
      if (selectedPattern && chap.lessons?.some(l => l.patterns?.some(p => p.patternId === selectedPattern.patternId))) {
        setSelectedPattern(null);
      }
      await fetchCurriculumData();
      toast.success(`Đã xóa thành công Chương "${chap.name}" và toàn bộ bài học trực thuộc!`);
    } catch (err) {
      console.error('Lỗi khi xóa chương:', err);
      toast.error('Không thể xóa chương: ' + (err?.response?.data?.message || err.message || 'Lỗi kết nối cơ sở dữ liệu'));
    } finally {
      setDeletingNodeId(null);
    }
  };

  // Giảng viên xóa toàn bộ Chương (và các bài học, dạng bài bên trong)
  const handleDeleteChapter = (chap) => {
    setConfirmDeleteDialog({
      title: '⚠️ Xác Nhận Xóa Chương Học',
      message: `Thầy/Cô có chắc chắn muốn xóa Chương "${chap.name}" không?\n\n❗ CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn:\n- Toàn bộ ${chap.lessons?.length || 0} bài học trong chương\n- Toàn bộ các dạng bài, lý thuyết và ngân hàng câu hỏi trực thuộc\n- Quan hệ đồ thị tri thức DAG liên quan trong cơ sở dữ liệu.`,
      onConfirm: () => executeDeleteChapter(chap)
    });
  };

  const executeDeleteLesson = async (les) => {
    setDeletingNodeId(les.lessonId);
    try {
      await contentService.deleteNode(les.lessonId);
      if (selectedPattern && les.patterns?.some(p => p.patternId === selectedPattern.patternId)) {
        setSelectedPattern(null);
      }
      await fetchCurriculumData();
      toast.success(`Đã xóa thành công Bài học "${les.name}"!`);
    } catch (err) {
      console.error('Lỗi khi xóa bài học:', err);
      toast.error('Không thể xóa bài học: ' + (err?.response?.data?.message || err.message || 'Lỗi kết nối cơ sở dữ liệu'));
    } finally {
      setDeletingNodeId(null);
    }
  };

  // Giảng viên xóa Bài học (và các dạng bài bên trong)
  const handleDeleteLesson = (les, chapName) => {
    setConfirmDeleteDialog({
      title: '⚠️ Xác Nhận Xóa Bài Học',
      message: `Thầy/Cô có chắc chắn muốn xóa Bài học "${les.name}" (thuộc ${chapName}) không?\n\n❗ Thao tác này sẽ xóa vĩnh viễn ${les.patterns?.length || 0} dạng bài và các câu hỏi trực thuộc.`,
      onConfirm: () => executeDeleteLesson(les)
    });
  };

  // Giảng viên mở modal tạo mới Chương
  const handleOpenCreateChapterModal = () => {
    setCreateChapterForm({
      domainId: currentDomain.domainId || (currentDomain.id ? currentDomain.id.replace('domain-', '') : ''),
      name: '',
      grade: selectedGrade !== 'all' ? selectedGrade : '12',
      academicYear: selectedAcademicYear !== 'all' ? selectedAcademicYear : '2025-2026',
      subSubject: selectedSubSubject !== 'all' ? selectedSubSubject : '',
      weight: '25',
      description: ''
    });
    setIsCreateChapterModalOpen(true);
  };

  // Giảng viên tạo mới Chương
  const handleCreateChapter = async () => {
    if (!createChapterForm.name.trim()) {
      toast.warning("Vui lòng nhập Tên chương.");
      return;
    }
    setSavingCreateChapter(true);
    try {
      const rawWeight = parseFloat(createChapterForm.weight);
      const weightVal = !isNaN(rawWeight) ? (rawWeight > 1 ? rawWeight / 100 : rawWeight) : 0.25;

      let formattedName = createChapterForm.name.trim();
      const tagPrefix = `[Lớp ${createChapterForm.grade}]`;
      if (!formattedName.toLowerCase().includes(`lớp ${createChapterForm.grade}`)) {
        formattedName = `${tagPrefix} ${formattedName}`;
      }
      if (createChapterForm.academicYear && !formattedName.includes(createChapterForm.academicYear)) {
        formattedName = `${formattedName} (${createChapterForm.academicYear})`;
      }

      const payload = {
        domainId: createChapterForm.domainId || currentDomain.domainId || (currentDomain.id ? currentDomain.id.replace('domain-', '') : '6f3765db-943e-4810-bf74-d6a8bdc215da'),
        parentId: null, // Level 1 Chương
        name: formattedName,
        weight: weightVal,
        theoryRecap: createChapterForm.description?.trim() || `Hệ thống kiến thức: ${formattedName}`
      };

      const newId = await contentService.createNode(payload);
      setIsCreateChapterModalOpen(false);
      await fetchCurriculumData();
      toast.success(`Đã tạo thành công Chương mới: "${formattedName}"!`);
    } catch (err) {
      console.error('Lỗi khi tạo chương:', err);
      toast.error('Không thể tạo chương mới: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingCreateChapter(false);
    }
  };

  // Giảng viên mở modal thêm Bài học mới
  const handleOpenCreateLessonModal = (chap) => {
    setCreateLessonForm({
      chapterId: chap.chapterId,
      chapterName: chap.name,
      name: '',
      weight: '10',
      summary: ''
    });
    setIsCreateLessonModalOpen(true);
  };

  // Giảng viên thêm Bài học mới
  const handleCreateLesson = async () => {
    if (!createLessonForm.name.trim() || !createLessonForm.chapterId) {
      toast.warning("Vui lòng nhập Tên bài học.");
      return;
    }
    setSavingCreateLesson(true);
    try {
      const rawWeight = parseFloat(createLessonForm.weight);
      const weightVal = !isNaN(rawWeight) ? (rawWeight > 1 ? rawWeight / 100 : rawWeight) : 0.10;

      const payload = {
        domainId: currentDomain.domainId || (currentDomain.id ? currentDomain.id.replace('domain-', '') : '6f3765db-943e-4810-bf74-d6a8bdc215da'),
        parentId: createLessonForm.chapterId, // Level 2 Bài học
        name: createLessonForm.name.trim(),
        weight: weightVal,
        theoryRecap: createLessonForm.summary?.trim() || `Bài học: ${createLessonForm.name.trim()}`
      };

      const newId = await contentService.createNode(payload);
      setIsCreateLessonModalOpen(false);
      setExpandedChapters(prev => ({ ...prev, [createLessonForm.chapterId]: true }));
      await fetchCurriculumData();
      toast.success(`Đã thêm bài học "${createLessonForm.name}" vào chương thành công!`);
    } catch (err) {
      console.error('Lỗi khi tạo bài học:', err);
      toast.error('Không thể tạo bài học mới: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingCreateLesson(false);
    }
  };

  const handleImportCurriculum = async () => {
    if (!importJsonText.trim()) {
      toast.warning("Vui lòng dán nội dung JSON cây tri thức.");
      return;
    }
    setImportingCurriculum(true);
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await contentService.importCurriculum(parsed);
      toast.success(`Nạp cây tri thức thành công!\n- Chương: ${res.chaptersImported}\n- Bài học: ${res.lessonsImported}\n- Dạng bài: ${res.patternsImported}\n- Tài liệu: ${res.materialsImported}\n- Câu hỏi: ${res.questionsImported}`, 'Nạp CSDL Thành Công');
      setIsImportModalOpen(false);
      setImportJsonText('');
      await fetchCurriculumData();
    } catch (err) {
      const detail = err?.response?.data?.errors 
        ? Object.entries(err.response.data.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
        : (err?.response?.data?.message || err?.response?.data?.title || err.message);
      toast.error('Lỗi nạp dữ liệu tri thức:\n' + detail, 'Lỗi Nạp Dữ Liệu');
    } finally {
      setImportingCurriculum(false);
    }
  };

  const handleRunAiExtraction = async () => {
    if (!importFile && !importTextSnippet.trim()) {
      toast.warning("Vui lòng tải lên tệp tài liệu (.pdf, .docx, .txt) hoặc nhập trích đoạn văn bản chuyên đề.");
      return;
    }

    setIsExtractingAi(true);
    setAiExtractStep(1);
    setExtractedCurriculum(null);

    try {
      const currentD = domains.find(d => d.id === (importTargetDomainId || activeDomainId)) || domains[0];
      const targetDomId = currentD?.domainId || (currentD?.id ? currentD.id.replace('domain-', '') : '6f3765db-943e-4810-bf74-d6a8bdc215da');
      const targetDomName = currentD?.title || currentD?.name || 'Toán học & Tư duy định lượng';

      const formData = new FormData();
      if (importFile) {
        formData.append('file', importFile);
      }
      if (importTextSnippet.trim()) {
        formData.append('text_content', importTextSnippet.trim());
      }
      formData.append('domain_id', targetDomId);
      formData.append('domain_name', targetDomName);

      if (importPageMode === 'custom') {
        if (importStartPage) formData.append('start_page', importStartPage.toString());
        if (importEndPage) formData.append('end_page', importEndPage.toString());
      }
      formData.append('extraction_depth', importExtractionDepth);

      setAiExtractStep(2);

      const result = await aiService.extractCurriculumFromDocument(formData);
      setAiExtractStep(3);

      if (result && result.chapters && result.chapters.length > 0) {
        setExtractedCurriculum(result);
        setAiExtractStep(4);
        setPreviewSelectedLessonKey('0-0');
        const firstPat = result.chapters[0]?.lessons?.[0]?.patterns?.[0] || null;
        setPreviewSelectedPattern(firstPat);
      } else {
        throw new Error("AI không trích xuất được dạng bài từ tài liệu đã cung cấp.");
      }
    } catch (err) {
      toast.error("Lỗi bóc tách tài liệu bằng AI: " + (err?.response?.data?.detail || err.message));
      setAiExtractStep(0);
    } finally {
      setIsExtractingAi(false);
    }
  };

  const handleSaveExtractedCurriculum = async () => {
    if (!extractedCurriculum) return;
    setImportingCurriculum(true);
    try {
      const res = await contentService.importCurriculum(extractedCurriculum);
      toast.success(`Nạp cây tri thức thành công!\n- Chương: ${res.chaptersImported}\n- Bài học: ${res.lessonsImported}\n- Dạng bài nhận diện: ${res.patternsImported}\n- Câu hỏi trắc nghiệm: ${res.questionsImported}`, 'Nạp CSDL Thành Công');
      setIsImportModalOpen(false);
      setExtractedCurriculum(null);
      setImportFile(null);
      setImportTextSnippet('');
      await fetchCurriculumData();
    } catch (err) {
      const detail = err?.response?.data?.errors 
        ? Object.entries(err.response.data.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('\n')
        : (err?.response?.data?.message || err?.response?.data?.title || err.message);
      toast.error('Lỗi nạp dữ liệu tri thức vào CSDL:\n' + detail, 'Lỗi Nạp CSDL');
    } finally {
      setImportingCurriculum(false);
    }
  };

  const handleAddAiPracticeQuestions = async (targetPattern) => {
    if (!targetPattern || isGeneratingPracticeQuestions) return;
    
    setIsGeneratingPracticeQuestions(true);
    const patName = targetPattern.patternName || "Dạng bài";
    const currentCount = targetPattern.questions ? targetPattern.questions.length : 0;

    // Lấy tên bài học an toàn từ đối tượng hoặc cây bóc tách
    let currentLessonName = targetPattern.lessonName || '';
    if (!currentLessonName && extractedCurriculum?.chapters) {
      const [cIdx, lIdx] = (previewSelectedLessonKey || '0-0').split('-').map(Number);
      const activeChap = extractedCurriculum.chapters?.[cIdx] || extractedCurriculum.chapters?.[0];
      const activeLes = activeChap?.lessons?.[lIdx] || activeChap?.lessons?.[0];
      currentLessonName = activeLes?.lessonName || '';
    }

    const domainCandidate = extractedCurriculum?.domainName || 
      domains?.find(d => d.id === (importTargetDomainId || activeDomainId))?.title || 
      targetPattern.domainName || '';

    // Lấy danh sách đề bài các câu hỏi đã có để gửi sang Gemini AI chống trùng lặp
    const existingQuestions = (targetPattern.questions || [])
      .map(q => q.contentLatex || '')
      .filter(Boolean);

    try {
      const res = await aiService.generatePatternQuestions({
        patternName: patName,
        lessonName: currentLessonName,
        domainName: domainCandidate,
        theoryRecap: targetPattern.theoryRecap || '',
        solutionMethod: targetPattern.solutionMethod || '',
        count: 2,
        existingQuestions
      });

      if (res && res.questions && res.questions.length > 0) {
        const newQuestions = res.questions.map((q, idx) => ({
          difficultyLevel: q.difficultyLevel || q.difficulty_level || (idx === 0 ? 3 : 4),
          contentLatex: q.contentLatex || q.content_latex || `[Bài tập rèn luyện ${currentCount + idx + 1}]`,
          optionA: q.optionA || q.option_a || '',
          optionB: q.optionB || q.option_b || '',
          optionC: q.optionC || q.option_c || '',
          optionD: q.optionD || q.option_d || '',
          correctOption: q.correctOption || q.correct_option || 'A',
          explanation: q.explanation || ''
        }));

        if (!targetPattern.questions) {
          targetPattern.questions = [];
        }
        targetPattern.questions.push(...newQuestions);

        if (extractedCurriculum) {
          setExtractedCurriculum({ ...extractedCurriculum });
          setPreviewActiveQuestionIdx(targetPattern.questions.length - 1);
        }
      } else {
        throw new Error("AI Engine không trả về danh sách câu hỏi hợp lệ.");
      }
    } catch (apiErr) {
      console.error("[AI Engine Generate Questions Error]:", apiErr);
      toast.error("Lỗi khi AI sinh câu hỏi: " + (apiErr?.data?.detail || apiErr?.data?.message || apiErr?.message || "Không thể kết nối đến AI Engine."));
    } finally {
      setIsGeneratingPracticeQuestions(false);
    }
  };

  if (loadingCurriculum) {
    return (
      <div className="py-24 text-center space-y-4 animate-fade bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <h3 className="text-base font-extrabold text-slate-800">
          Đang Nạp Cây Tri Thức 3 Tầng Từ Database...
        </h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          Đang truy vấn API <code className="bg-slate-100 text-blue-600 px-1.5 py-0.5 rounded font-mono font-bold text-[11px]">GET /api/content/curriculum</code> để tải toàn bộ cấu trúc: <strong className="text-slate-700">Môn học → Chương → Bài học → Dạng bài</strong> cùng 4 khối sư phạm từ cơ sở dữ liệu PostgreSQL.
        </p>
      </div>
    );
  }

  const selectedMastery = selectedPattern ? getPatternMastery(selectedPattern) : undefined;
  const isSelectedWeak = selectedMastery !== undefined && selectedMastery < 60;
  const isSelectedSeverelyWeak = selectedMastery !== undefined && selectedMastery <= 10;
  const weakPrerequisites = (selectedPattern?.prerequisiteIds || []).filter(prereqId => {
    const mastery = skillMasteryMap[prereqId];
    return mastery !== undefined && mastery < 10;
  });

  // Mở Studio Biên Soạn Sư Phạm (Toàn trang / Split Live 50-50 / Chèn đồ thị)
  const handleOpenStudio = (pattern = null, chapter = null, lesson = null) => {
    let targetPat = pattern || selectedPattern;
    let chap = chapter;
    let les = lesson;
    if (targetPat && (!chap || !les)) {
      for (const c of chapters) {
        for (const l of (c.lessons || [])) {
          if ((l.patterns || []).some(p => p.patternId === targetPat.patternId)) {
            chap = chap || c;
            les = les || l;
            break;
          }
        }
      }
    }
    setStudioTargetPattern(targetPat);
    setStudioTargetChapter(chap || chapters[0] || null);
    setStudioTargetLesson(les || chapters[0]?.lessons?.[0] || null);
    setIsStudioOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isStudioOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden">
        <CurriculumStudioEditor
          pattern={studioTargetPattern}
          domain={currentDomain}
          chapter={studioTargetChapter}
          lesson={studioTargetLesson}
          onClose={() => {
            setIsStudioOpen(false);
            setStudioTargetPattern(null);
          }}
          onSaveSuccess={(updatedPattern) => {
            if (updatedPattern?.patternId) {
              setSelectedPattern(prev => ({
                ...prev,
                ...updatedPattern,
                videoLesson: updatedPattern.videoUrl ? {
                  title: updatedPattern.name,
                  teacher: "Ban Chuyên Môn / Giảng Viên",
                  duration: `${Math.max(5, Math.round((parseInt(updatedPattern.durationSeconds, 10) || 0) / 60))} phút`,
                  durationSeconds: parseInt(updatedPattern.durationSeconds, 10) || 0,
                  views: "Cơ sở dữ liệu",
                  videoUrl: updatedPattern.videoUrl
                } : prev?.videoLesson
              }));
              fetchCurriculumData(updatedPattern.patternId);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade pb-12">
      
      {/* 1. HERO BANNER: LỘ TRÌNH PHỔ THÔNG PHÂN CẤP (CLEAN LIGHT THEME) */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/80 shadow-xs p-5 lg:p-6 transition-all">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[11px] font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>LỘ TRÌNH HỌC PHỔ THÔNG PHÂN CẤP: CHƯƠNG → BÀI → DẠNG BÀI</span>
            </div>
            
            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              Dàn Kiến Thức Chuẩn SGK & Phương Pháp Giải Từng Dạng Bài
            </h1>
            
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Mỗi dạng bài được trang bị đầy đủ 4 khối nội dung sư phạm: 
              <strong className="text-indigo-600 font-bold"> (1) Nền tảng SGK</strong>, 
              <strong className="text-amber-600 font-bold"> (2) Phương pháp giải KaTeX</strong>, 
              <strong className="text-emerald-600 font-bold"> (3) Video & Bài toán mẫu</strong>, và 
              <strong className="text-rose-600 font-bold"> (4) Quiz thích ứng</strong> tự động gom các dạng bài cần cải thiện.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() => {
                setMathLabEngine('jsxgraph');
                setIsMathLabModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-black shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              title="Phòng thí nghiệm MathLab 2D & Hình học không gian 3D (JSXGraph Native Engine)"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>⚡ MathLab 2D/3D (JSXGraph)</span>
            </button>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50/90 border border-slate-200/80 text-left">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cấu trúc phân cấp</div>
              <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                Chương <span className="text-slate-300">•</span> Bài <span className="text-slate-300">•</span> Dạng
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-50/90 border border-slate-200/80 text-left">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Trọng số chuẩn hóa</div>
              <div className="text-xs font-black text-emerald-700 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                1.200 Điểm
              </div>
            </div>
          </div>
        </div>

        {/* 4/5 Core Domains Tabs */}
        <div className="relative z-10 mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-4 border-t border-slate-100">
          {domains.map((domain) => {
            const Icon = getDomainIcon(domain.icon);
            const isActive = domain.id === activeDomainId;
            return (
              <button
                key={domain.id}
                onClick={() => setActiveDomainId(domain.id)}
                className={`flex items-center gap-2.5 p-2.5 px-3 rounded-xl text-left transition-all group ${
                  isActive 
                    ? 'bg-indigo-50/90 border-2 border-indigo-600 text-slate-900 shadow-sm font-bold ring-2 ring-indigo-500/15' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive 
                    ? 'bg-gradient-to-tr ' + domain.gradient + ' text-white shadow-xs' 
                    : 'bg-slate-100/90 border border-slate-200/80 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 shadow-2xs transition-colors'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold leading-tight truncate ${isActive ? 'text-indigo-950 font-black' : 'text-slate-800 group-hover:text-slate-900'}`}>
                    {domain.title}
                  </div>
                  <div className={`text-[10px] font-medium truncate mt-0.5 ${isActive ? 'text-indigo-700/80' : 'text-slate-500'}`}>
                    {domain.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1.5 DYNAMIC ASSESSMENT STATUS BANNER */}
      {!userAssessment ? (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/15 border border-amber-500/30 text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-2">
                <span>BẠN CHƯA LÀM BÀI KHẢO SÁT NĂNG LỰC ĐẦU VÀO</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black">
                  Khung Chuẩn 120 Câu (Ontology)
                </span>
              </div>
              <p className="text-xs text-amber-900/90 font-medium mt-1 leading-relaxed max-w-3xl">
                Cây tri thức bên dưới đang hiển thị toàn bộ lộ trình SGK chuẩn. Hãy làm bài <strong>Khảo sát năng lực đầu vào (30 câu)</strong> để hệ thống tự động gắn cờ các dạng bài yếu hoặc hổng kiến thức (&lt;10%) của riêng bạn!
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateDiagnostic}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-extrabold shrink-0 shadow-md shadow-amber-600/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <span>Làm bài khảo sát ngay (30 câu)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-900/5 via-indigo-900/5 to-cyan-900/10 border border-blue-500/30 text-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-blue-700 flex items-center gap-2">
                <span>HỒ SƠ ĐỊNH VỊ NĂNG LỰC CÁ NHÂN THEO DẠNG BÀI</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black border border-blue-200">
                  {userAssessment.placementClassLabel || 'Lớp Tăng Tốc'}
                </span>
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1.5 flex flex-wrap items-center gap-3">
                <span>Năng lực ước lượng: <strong className="text-blue-700 font-mono text-sm">{userAssessment.theta0 > 0 ? `+${userAssessment.theta0.toFixed(2)}` : userAssessment.theta0.toFixed(2)}</strong></span>
                <span className="text-slate-300">•</span>
                <span>Điểm thô: <strong className="text-slate-800">{userAssessment.totalCorrect}/30 câu</strong></span>
                <span className="text-slate-300">•</span>
                <span>AI phát hiện: <strong className="text-rose-600">{userAssessment.weakCount} dạng bài vùng trũng</strong> (cần củng cố)</span>
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateDiagnostic}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shrink-0 shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>Khảo sát lại đề khác</span>
          </button>
        </div>
      )}

      {/* 1.8 MULTI-DIMENSIONAL CLASSIFICATION & FILTER SUITE (Môn học riêng biệt • Khối lớp • Năm học) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">Bộ Lọc Phân Loại Tri Thức</h4>
              <p className="text-[11px] text-slate-500 font-medium">Phân tách rõ ràng theo phân môn riêng biệt, khối lớp và năm học chuẩn GDPT 2018</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(selectedGrade !== 'all' || selectedAcademicYear !== 'all' || selectedSubSubject !== 'all' || searchQuery.trim()) && (
              <button
                onClick={() => {
                  setSelectedGrade('all');
                  setSelectedAcademicYear('all');
                  setSelectedSubSubject('all');
                  setSearchQuery('');
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
            <span className="text-[11px] font-bold text-slate-600 px-2.5 py-1 rounded-lg bg-slate-100">
              Khớp: <strong className="text-blue-700 font-mono">{filteredChapters.length}</strong> Chương • <strong className="text-indigo-700 font-mono">{filteredChapters.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)}</strong> Bài học
            </span>
          </div>
        </div>

        {/* Dòng 1: Môn học riêng biệt (Sub-Subjects) */}
        {subSubjectsList.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0 w-24 flex items-center gap-1.5">
              <Book className="w-3.5 h-3.5 text-indigo-600" />
              <span>Phân môn:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {subSubjectsList.map(subj => {
                const isActive = selectedSubSubject === subj.id;
                return (
                  <button
                    key={subj.id}
                    onClick={() => setSelectedSubSubject(subj.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/20' 
                        : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    {subj.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dòng 2: Khối lớp & Năm học */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Khối lớp */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0 w-24 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              <span>Khối lớp:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'Tất cả lớp' },
                { id: '12', label: 'Lớp 12 (Trọng tâm ĐGNL)', badge: 'V-ACT' },
                { id: '11', label: 'Lớp 11' },
                { id: '10', label: 'Lớp 10' }
              ].map(g => {
                const isActive = selectedGrade === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGrade(g.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <span>{g.label}</span>
                    {g.badge && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-black ${isActive ? 'bg-blue-800 text-white' : 'bg-blue-100 text-blue-700'}`}>
                        {g.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Năm học */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0 w-24 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Năm học:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'Tất cả năm' },
                { id: '2025-2026', label: '2025 - 2026', badge: 'Mới' },
                { id: '2024-2025', label: '2024 - 2025' }
              ].map(y => {
                const isActive = selectedAcademicYear === y.id;
                return (
                  <button
                    key={y.id}
                    onClick={() => setSelectedAcademicYear(y.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60'
                    }`}
                  >
                    <span>{y.label}</span>
                    {y.badge && (
                      <span className={`text-[9px] px-1 py-0.2 rounded font-black ${isActive ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                        {y.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & SUMMARY BAR (KÈM CÔNG CỤ HIỆU ĐÍNH GIẢNG VIÊN & NẠP AI SGK) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm theo Chương, Bài học, Dạng bài, công thức KaTeX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
          {/* Nút Vào Studio Biên Soạn Sư Phạm */}
          <button
            onClick={() => handleOpenStudio(selectedPattern)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Mở toàn màn hình Studio biên soạn sư phạm, đồ thị minh họa và review học sinh"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Vào Studio Sư Phạm</span>
          </button>

          {/* Nút AI Bóc Tách Tài Liệu & Dạng Bài */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-purple-800 text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Kéo thả file PDF/DOCX SGK để AI Tri Thức tự động bóc tách Chương, Bài và các Dạng bài toán"
          >
            <Wand2 className="w-3.5 h-3.5 text-purple-600" />
            <span>AI Bóc Tách Tài Liệu & Dạng Bài</span>
          </button>

          {/* Badge Chế độ Giảng viên Hiệu đính */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Chế độ Hiệu đính Sư phạm: BẬT</span>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500 font-medium pl-2 border-l border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Hổng (&lt;10%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Vùng trũng (&lt;60%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Vững (≥60%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN VIEW: (Left: 3-Level Tree Accordion | Right: 4 Pedagogical Layers) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 3-Level Hierarchical Accordion (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>CẤU TRÚC PHÂN CẤP BÀI HỌC</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">
                {filteredChapters.length} Chương
              </span>
            </div>
            {/* Nút Thêm Chương Mới */}
            <button
              onClick={handleOpenCreateChapterModal}
              className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Thêm một Chương mới vào miền tri thức này"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm Chương Mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredChapters.map((chap) => {
              const isChapExpanded = expandedChapters[chap.chapterId] ?? true;
              return (
                <div 
                  key={chap.chapterId} 
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-sm transition-all"
                >
                  {/* Chapter Header */}
                  <div 
                    onClick={() => toggleChapter(chap.chapterId, chap)}
                    className="p-3.5 bg-slate-50/90 hover:bg-slate-100/90 flex items-center justify-between cursor-pointer border-b border-slate-100 transition-colors group/chap"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                        {chap.code?.slice(-2) || "CH"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-slate-900 leading-tight truncate">
                          {chap.name}
                        </h3>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                          <span>{chap.lessons?.length || 0} bài học</span>
                          <span>•</span>
                          <span>Trọng số: {Math.round((chap.weight || 0.25) * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Nút Thêm Bài Học Mới vào Chương */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenCreateLessonModal(chap);
                        }}
                        title="Thêm Bài học mới vào chương này"
                        className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-indigo-600" />
                        <span>Thêm bài</span>
                      </button>

                      {/* Nút Xóa Chương */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChapter(chap);
                        }}
                        disabled={deletingNodeId === chap.chapterId}
                        title="Xóa chương này và toàn bộ bài học, dạng bài bên trong"
                        className="p-1.5 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {deletingNodeId === chap.chapterId ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>

                      {isChapExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Lessons List (Level 2) */}
                  {isChapExpanded && (
                    <div className="p-2 space-y-2 bg-slate-50/30">
                      {(chap.lessons || []).map((les) => {
                        const isLesExpanded = expandedLessons[les.lessonId] ?? true;
                        return (
                          <div 
                            key={les.lessonId}
                            className="rounded-xl border border-slate-200/60 bg-white overflow-hidden"
                          >
                            {/* Lesson Header */}
                            <div 
                              onClick={() => toggleLesson(les.lessonId, les)}
                              className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group/les"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="text-xs font-extrabold text-slate-800 truncate">
                                  {les.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCreatePatternModal(les.lessonId, les.name);
                                  }}
                                  title="Thêm Dạng bài mới vào bài học này"
                                  className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center gap-1 border border-indigo-200/60 transition-colors cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Thêm dạng</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStudio(null, chap, les);
                                  }}
                                  title="Mở Studio thiết kế dạng bài mới toàn diện với đồ thị và phương pháp"
                                  className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1 border border-blue-200/60 transition-colors cursor-pointer"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                  <span>+ Studio</span>
                                </button>

                                {/* Nút Xóa Bài Học */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLesson(les, chap.name);
                                  }}
                                  disabled={deletingNodeId === les.lessonId}
                                  title="Xóa bài học này và toàn bộ dạng bài bên trong"
                                  className="p-1 rounded-md bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition-all disabled:opacity-50 cursor-pointer"
                                >
                                  {deletingNodeId === les.lessonId ? (
                                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-rose-500" />
                                  ) : (
                                    <Trash2 className="w-2.5 h-2.5" />
                                  )}
                                </button>

                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                                  {les.patterns?.length || 0} dạng
                                </span>
                                {isLesExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Patterns List (Level 3 - Selectable Leaves) */}
                            {isLesExpanded && (
                              <div className="px-2 pb-2 pt-1 space-y-1.5 border-t border-slate-100/80 bg-slate-50/40">
                                {(les.patterns || []).map((pat) => {
                                  const isSelected = selectedPattern?.patternId === pat.patternId;
                                  const mastery = getPatternMastery(pat);
                                  const isSevere = mastery !== undefined && mastery <= 10;
                                  const isWeak = mastery !== undefined && mastery < 60;
                                  const isGood = mastery !== undefined && mastery >= 60;

                                  return (
                                    <div
                                      key={pat.patternId}
                                      onClick={() => setSelectedPattern(pat)}
                                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                                        isSelected 
                                          ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500' 
                                          : isSevere
                                          ? 'bg-rose-50/50 border-rose-300 hover:border-rose-400'
                                          : isWeak
                                          ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                                          : 'bg-white border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50'
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-600"></div>
                                      )}

                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black font-mono">
                                            {pat.code?.split('_').pop() || "Dạng"}
                                          </span>
                                          
                                          {/* Mastery Badge */}
                                          {isSevere ? (
                                            <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center gap-1 animate-pulse">
                                              <AlertCircle className="w-2.5 h-2.5" />
                                              <span>Hổng ({mastery}%)</span>
                                            </span>
                                          ) : isWeak ? (
                                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                              <span>Vùng trũng ({mastery}%)</span>
                                            </span>
                                          ) : isGood ? (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                              <span>Vững ({mastery}%)</span>
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                              {pat.level || "Vận dụng"}
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-[10px] font-bold text-slate-400">
                                            {pat.weight}
                                          </span>
                                          {/* Nút Mở Studio / Hiệu đính nhanh */}
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenStudio(pat, chap, les);
                                            }}
                                            title="Mở Studio sư phạm & đồ thị cho dạng bài này"
                                            className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center gap-1 text-[10px] font-bold"
                                          >
                                            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                            <span>Studio</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleOpenEditModal(pat);
                                            }}
                                            title="Sửa nhanh dạng bài này"
                                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-white border border-slate-200 hover:border-slate-400 text-slate-500 hover:text-slate-800 transition-all shadow-xs"
                                          >
                                            <Pencil className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>

                                      <div className={`text-xs font-bold mt-1.5 leading-snug line-clamp-2 ${
                                        isSelected ? 'text-blue-900 font-extrabold' : 'text-slate-800 group-hover:text-blue-600'
                                      }`}>
                                        {pat.name}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 4 Pedagogical Layers for the Selected Pattern (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedPattern ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 lg:p-8 space-y-6">
              
              {/* Header: Pattern Identity & Mastery Status */}
              <div className="pb-5 border-b border-slate-100 space-y-3">
                {/* Top Row: Meta Badges & Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black font-mono">
                      {selectedPattern.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-bold">
                      Trọng số: {selectedPattern.weight}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                      {selectedPattern.level || "Vận dụng"}
                    </span>
                  </div>

                  {/* Layer Actions: Edit & Adaptive Quiz Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <button
                      onClick={() => handleOpenStudio(selectedPattern)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
                      title="Mở Studio sư phạm toàn diện: đồ thị minh họa, bẫy đề thi, Casio, video timestamps và review học sinh"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Mở Studio Biên Soạn Sư Phạm</span>
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(selectedPattern)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-slate-600 hover:text-indigo-600 transition-all shadow-2xs cursor-pointer"
                      title="Sửa thông tin nhanh (Tên dạng bài, Chương, Khối lớp, Mức độ Bloom)"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleLaunchAdaptiveQuiz(selectedPattern)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all shrink-0"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                      <span>Luyện tập củng cố (5 câu)</span>
                    </button>
                  </div>
                </div>

                {/* Main Title - Spans full width without being squished */}
                <h2 className="text-xl lg:text-2xl font-black text-slate-900 leading-tight">
                  {selectedPattern.name}
                </h2>
              </div>

              {/* Severe Weakness & Adjacent Remedial Notification */}
              {isSelectedSeverelyWeak ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 flex items-start gap-3.5 text-xs text-rose-950 animate-fade">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="font-black text-rose-900 text-sm">
                      CẢNH BÁO: DẠNG BÀI ĐANG HỔNG KIẾN THỨC NẶNG (Độ thành thạo: {selectedMastery}%)
                    </div>
                    <p className="text-rose-800 leading-relaxed font-medium">
                      Học sinh chưa nắm vững điều kiện tiên quyết và thuật toán giải dạng bài này. Hệ thống đã tự động kích hoạt chế độ <strong>Phục hồi Vi mô (Micro-Remediation)</strong>: hãy đọc kỹ Khối 1 và Khối 2 bên dưới trước khi bấm làm bài tập củng cố.
                    </p>
                  </div>
                </div>
              ) : isSelectedWeak ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs text-amber-900 animate-fade">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-amber-900">VÙNG TRŨNG: Độ thành thạo ước tính {selectedMastery}% (&lt;60%)</div>
                      <div className="text-[11px] text-amber-700 font-medium">Cần hoàn thiện phương pháp giải và làm thêm 5 câu củng cố để vượt ngưỡng.</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleLaunchAdaptiveQuiz(selectedPattern)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-sm"
                  >
                    Củng cố ngay
                  </button>
                </div>
              ) : null}

              {/* Automatic Adjacent Weak Skill Warning (Layer 4 Feature) */}
              {weakPrerequisites.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 to-indigo-500/10 border border-rose-300 text-xs flex items-center gap-3">
                  <Zap className="w-4 h-4 text-rose-600 shrink-0" />
                  <div className="text-slate-700 font-medium leading-relaxed">
                    <strong className="text-rose-700">Tự động gom dạng bài tiên quyết: </strong> 
                    Phát hiện bạn đang bị hổng kiến thức nền ở dạng bài liên kết. Khi bạn bấm nút luyện tập, đề thi vi mô sẽ tự động gom thêm câu hỏi từ dạng tiên quyết để bạn củng cố dứt điểm gốc rễ!
                  </div>
                </div>
              )}

              {/* ================= KHỐI 1: KIẾN THỨC NỀN TẢNG & TIÊN QUYẾT ================= */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[10px] font-black">1</span>
                    <span>Khối 1: Kiến Thức Nền Tảng & Điều Kiện Tiên Quyết (SGK Chuẩn)</span>
                  </h4>
                  <span className="text-[10px] text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full font-bold">
                    SGK GDPT 2018
                  </span>
                </div>
                
                <div className="p-4 rounded-2xl bg-cyan-50/40 border border-cyan-100 text-xs text-slate-800 font-medium leading-relaxed">
                  <MathText text={selectedPattern.theoryRecap || "Kiến thức nền tảng chuẩn theo chương trình phổ thông."} />
                </div>
              </div>

              {/* ================= KHỐI 2: CÔNG THỨC, ĐỊNH LÝ & PHƯƠNG PHÁP GIẢI RIÊNG ================= */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">2</span>
                    <span>Khối 2: Phương Pháp Giải Chuyên Biệt & Công Thức KaTeX</span>
                  </h4>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                    Cách giải riêng từng bước
                  </span>
                </div>

                {/* Step-by-Step Method */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-medium">
                  <div className="font-extrabold text-indigo-900 mb-1.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Quy trình giải chi tiết cho dạng bài này:</span>
                  </div>
                  <MathText text={selectedPattern.solutionMethod || "Áp dụng định lý đạo hàm và lập bảng biến thiên để tìm nghiệm tối ưu."} />
                </div>

                {/* KaTeX Formulas */}
                {selectedPattern.keyFormulas && selectedPattern.keyFormulas.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {selectedPattern.keyFormulas.map((f, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-slate-800 shadow-sm">
                        <span className="text-xs font-bold text-slate-300 shrink-0">
                          {f.label}:
                        </span>
                        <div className="text-cyan-300 text-sm font-semibold tracking-wide overflow-x-auto py-0.5">
                          <MathText text={`$$${f.latex}$$`} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* GraphRAG Cross-Model Badge */}
                {selectedPattern.crossModel && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white border border-indigo-500/30 shadow-sm">
                    <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-[11px] mb-1.5">
                      <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>MÔ HÌNH LIÊN MÔN GRAPHRAG (ỨNG DỤNG ĐGNL ĐHQG-HCM)</span>
                    </div>
                    <div className="text-xs font-bold text-white mb-1">
                      {selectedPattern.crossModel}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium leading-relaxed">
                      <MathText text={selectedPattern.crossNote || "Kế thừa trực tiếp trong các bài toán thực tiễn đa môn."} />
                    </div>
                  </div>
                )}
              </div>

              {/* ================= KHỐI 3: VIDEO BÀI GIẢNG & LỜI GIẢI MẪU CHI TIẾT ================= */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">3</span>
                    <span>Khối 3: Video Bài Giảng Phương Pháp & Lời Giải Mẫu</span>
                  </h4>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                    FSM Gate ≥ 80%
                  </span>
                </div>

                {/* Video Lesson Mini Player */}
                {selectedPattern.videoLesson && (
                  <div className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/40 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-snug">
                          {selectedPattern.videoLesson.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                          <span>{selectedPattern.videoLesson.teacher}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {selectedPattern.videoLesson.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toast.info(`Đang phát video bài giảng chuyên sâu: ${selectedPattern.videoLesson.title}`, 'Video Bài Giảng')}
                      className="px-3.5 py-2 bg-white border border-slate-200 hover:border-emerald-500 text-emerald-700 text-xs font-bold rounded-xl shadow-sm shrink-0 transition-colors flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Xem bài giảng</span>
                    </button>
                  </div>
                )}

                {/* Sample Exemplar Question with Step-by-Step Explanation */}
                {selectedPattern.sampleQuestion && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Bài toán mẫu minh họa (Ngân hàng khảo thí):</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Đáp án đúng: {String.fromCharCode(65 + (selectedPattern.sampleQuestion.correct || 0))}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 leading-relaxed">
                      <MathText text={selectedPattern.sampleQuestion.content} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(selectedPattern.sampleQuestion.options || []).map((opt, oIdx) => (
                        <div 
                          key={oIdx}
                          className={`p-2.5 rounded-xl text-xs border ${
                            oIdx === selectedPattern.sampleQuestion.correct
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <MathText text={opt} />
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900 font-bold">Lời giải chi tiết theo phương pháp của dạng: </strong>
                      <div className="mt-1 whitespace-pre-line">
                        <MathText text={selectedPattern.sampleQuestion.explanation} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ================= KHỐI 4: QUIZ THÍCH ỨNG CỦNG CỐ DẠNG BÀI (API 19) ================= */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-xs font-black uppercase tracking-wider text-cyan-200 flex items-center gap-1.5 justify-center sm:justify-start">
                    <span className="w-5 h-5 rounded-full bg-white text-blue-700 flex items-center justify-center text-[10px] font-black">4</span>
                    <span>Khối 4: Luyện Tập Thích Ứng Củng Cố Dạng Bài (API 19)</span>
                  </div>
                  <h4 className="text-base font-extrabold text-white">
                    Kiểm Tra Nhanh 5 Câu Vi Mô Cho Dạng Này
                  </h4>
                  <p className="text-xs text-blue-100 font-medium max-w-xl">
                    Hệ thống sẽ bốc 5 câu hỏi từ ngân hàng câu hỏi chuẩn Bloom (L1 - L3), đồng thời tự động gom các câu hỏi thuộc dạng bài tiên quyết nếu bạn đang yếu (&lt;10%).
                  </p>
                </div>
                <button
                  onClick={() => handleLaunchAdaptiveQuiz(selectedPattern)}
                  className="px-6 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 text-xs font-black shadow-md shrink-0 flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Bắt đầu luyện tập ngay</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-12 text-center text-slate-400 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto shadow-2xs">
                <Compass className="w-8 h-8 animate-pulse text-indigo-600" />
              </div>
              <div className="space-y-1">
                <div className="text-base font-extrabold text-slate-800">
                  Chưa chọn Dạng bài nào
                </div>
                <div className="text-xs text-slate-500 max-w-md mx-auto">
                  Nhấp vào một Chương hoặc Dạng bài ở cây phân cấp bên trái để tải nội dung lý thuyết, phương pháp KaTeX và câu hỏi luyện tập.
                </div>
              </div>
              {chapters.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const firstChap = chapters[0];
                    const firstLes = firstChap.lessons?.[0];
                    if (firstChap) {
                      setExpandedChapters(prev => ({ ...prev, [firstChap.chapterId]: true }));
                    }
                    if (firstLes) {
                      setExpandedLessons(prev => ({ ...prev, [firstLes.lessonId]: true }));
                      if (firstLes.patterns?.[0]) {
                        setSelectedPattern(firstLes.patterns[0]);
                      }
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Tự Động Mở Dạng Bài Đầu Tiên</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 4. MODAL LUYỆN TẬP 5 CÂU CỦNG CỐ (API 19 TEST RUNNER) */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-bold">
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    {activeQuiz ? activeQuiz.title : "Phiếu Luyện Tập Củng Cố Dạng Bài (API 19)"}
                  </h3>
                  <p className="text-[11px] text-blue-100 font-medium">
                    Đóng gói tự động từ ngân hàng đề • Đạt chuẩn Bloom L1 - L3
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setMathLabEngine('jsxgraph');
                    setIsMathLabModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Mở phòng thí nghiệm Toán học & Hình học không gian 3D"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-300" />
                  <span>MathLab 3D/2D</span>
                </button>
                <button 
                  onClick={() => setIsQuizModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {quizLoading ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <div className="text-sm font-bold text-slate-700">
                    Đang gửi yêu cầu tới Content Service API 19 (`POST /api/content/exams/quiz`)...
                  </div>
                  <div className="text-xs text-slate-400">
                    Hệ thống đang bốc 5 câu hỏi phân loại theo chuẩn Bloom từ ngân hàng câu hỏi.
                  </div>
                </div>
              ) : activeQuiz && !quizShowResults ? (
                <div className="space-y-5">
                  
                  {/* Stepper bar */}
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                    <span>Câu {quizCurrentIndex + 1} / {activeQuiz.questions.length}</span>
                    <span className="text-blue-600 font-extrabold">Đề củng cố tức thì</span>
                  </div>

                  {/* Question content */}
                  <div className="text-sm font-bold text-slate-900 leading-relaxed p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <MathText text={activeQuiz.questions[quizCurrentIndex]?.content} />
                  </div>

                  {/* Options */}
                  <div className="space-y-2.5">
                    {activeQuiz.questions[quizCurrentIndex]?.options.map((opt, optIdx) => {
                      const isChosen = quizUserAnswers[quizCurrentIndex] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectQuizAnswer(optIdx)}
                          className={`w-full text-left p-3.5 rounded-2xl border text-xs font-medium transition-all flex items-center justify-between ${
                            isChosen
                              ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold shadow-sm ring-1 ring-blue-500'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <MathText text={opt} />
                          {isChosen && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation footer inside modal */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      disabled={quizCurrentIndex === 0}
                      onClick={() => setQuizCurrentIndex(prev => Math.max(0, prev - 1))}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Câu trước
                    </button>

                    {quizCurrentIndex < activeQuiz.questions.length - 1 ? (
                      <button
                        onClick={() => setQuizCurrentIndex(prev => prev + 1)}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <span>Câu tiếp theo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishQuiz}
                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/25"
                      >
                        <Check className="w-4 h-4" />
                        <span>Nộp bài & Chấm điểm</span>
                      </button>
                    )}
                  </div>

                </div>
              ) : activeQuiz && quizShowResults ? (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <Award className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900">
                      Hoàn Thành Phiếu Bài Tập Củng Cố!
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Kết quả của bạn đã được ghi nhận vào hệ thống học tập thích ứng.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">Số câu đúng</div>
                      <div className="text-2xl font-extrabold text-blue-600">{quizScore} / {activeQuiz.questions.length}</div>
                    </div>
                    <div className="w-px h-8 bg-slate-200"></div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-semibold uppercase">Độ chính xác</div>
                      <div className="text-2xl font-extrabold text-emerald-600">
                        {Math.round((quizScore / activeQuiz.questions.length) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Review Questions */}
                  <div className="text-left space-y-4 pt-4 border-t border-slate-100 max-h-60 overflow-y-auto">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Xem Lại Lời Giải Chi Tiết
                    </div>
                    {activeQuiz.questions.map((q, idx) => {
                      const userAns = quizUserAnswers[idx];
                      const isCorrect = userAns === q.correct;
                      return (
                        <div key={idx} className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          isCorrect ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                        }`}>
                          <div className="font-bold text-slate-900 flex items-center justify-between">
                            <span>Câu {idx + 1}: <MathText text={q.content} /></span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                              {isCorrect ? 'ĐÚNG' : 'CHƯA ĐÚNG'}
                            </span>
                          </div>
                          <div className="text-slate-600">
                            <strong>Lời giải: </strong>
                            <MathText text={q.explanation} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsQuizModalOpen(false)}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md"
                    >
                      Đóng & Trở về Dàn kiến thức
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

          </div>
        </div>
      )}

      {/* 5. MODAL SỬA THÔNG TIN NHANH (QUICK METADATA EDIT) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                    <span>Sửa Thông Tin Nhanh</span>
                    {selectedPattern?.code && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 text-[10px] font-mono font-bold">
                        {selectedPattern.code}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Hiệu chỉnh định danh, phân bổ chương học, khối lớp và trọng số
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              
              {/* Studio Banner Hint */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cần chỉnh sửa nội dung bài học chuyên sâu?</span>
                  </div>
                  <p className="text-[11px] text-blue-700/80 font-medium">
                    Để soạn công thức KaTeX, phương pháp giải, video và câu hỏi mẫu, vui lòng mở Studio Sư Phạm.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    handleOpenStudio(selectedPattern);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Mở Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Tên Dạng bài / Tiêu đề */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên Dạng bài / Tiêu đề <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingForm.name}
                  onChange={(e) => setEditingForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Dạng 01: Khảo sát sự biến thiên và vẽ đồ thị hàm số"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 text-xs"
                />
              </div>

              {/* Chương học trực thuộc */}
              {currentDomain?.chapters && currentDomain.chapters.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Chương học trực thuộc</span>
                  </label>
                  <select
                    value={editingForm.chapterId || ''}
                    onChange={(e) => {
                      const newChapId = e.target.value;
                      const targetChap = currentDomain.chapters.find(c => c.chapterId === newChapId);
                      const firstLes = targetChap?.lessons?.[0];
                      setEditingForm(prev => ({
                        ...prev,
                        chapterId: newChapId,
                        lessonId: firstLes ? firstLes.lessonId : prev.lessonId
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs"
                  >
                    {currentDomain.chapters.map(chap => (
                      <option key={chap.chapterId} value={chap.chapterId}>
                        {chap.name} ({chap.lessons?.length || 0} bài học)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Khối lớp */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Khối lớp</span>
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: '12', label: 'Lớp 12' },
                    { id: '11', label: 'Lớp 11' },
                    { id: '10', label: 'Lớp 10' }
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setEditingForm(prev => ({ ...prev, grade: g.id }))}
                      className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        editingForm.grade === g.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mức độ tư duy Bloom & Trọng số (%) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-purple-600" />
                    <span>Mức độ nhận thức</span>
                  </label>
                  <select
                    value={editingForm.level || 'Vận dụng'}
                    onChange={(e) => setEditingForm(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs"
                  >
                    <option value="Nhận biết">Nhận biết</option>
                    <option value="Thông hiểu">Thông hiểu</option>
                    <option value="Vận dụng">Vận dụng</option>
                    <option value="Vận dụng cao">Vận dụng cao</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Trọng số năng lực (%)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={editingForm.weight}
                    onChange={(e) => setEditingForm(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Danger Zone: Xóa dạng bài */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    handleDeletePattern(editingForm.patternId, editingForm.name);
                  }}
                  className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  <span>Xóa Dạng Bài Này</span>
                </button>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                {editSuccessMsg && (
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editSuccessMsg}</span>
                  </div>
                )}
                {editErrorMsg && (
                  <div className="text-xs font-bold text-rose-600 flex items-center gap-1.5 animate-fade">
                    <AlertCircle className="w-4 h-4" />
                    <span>{editErrorMsg}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSaveEdit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu Thay Đổi</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5.1 MODAL XÁC NHẬN XÓA CHUYÊN NGHIỆP (ZERO NATIVE BROWSER ALERTS) */}
      {confirmDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{confirmDeleteDialog.title}</h3>
                <p className="text-xs text-slate-500 font-medium">Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-100 text-xs text-rose-950 whitespace-pre-line leading-relaxed font-medium">
              {confirmDeleteDialog.message}
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteDialog(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmDeleteDialog.onConfirm;
                  setConfirmDeleteDialog(null);
                  action();
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL THÊM DẠNG BÀI MỚI (ADD NEW PATTERN) */}
      {isCreatePatternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold">Thêm Dạng Bài Mới</h3>
                <p className="text-[11px] text-slate-400">Thuộc bài học: {createPatternForm.lessonName}</p>
              </div>
              <button 
                onClick={() => setIsCreatePatternModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Studio Direct Transition Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Muốn chèn hình ảnh đồ thị & KaTeX chi tiết?</span>
                  </div>
                  <p className="text-[11px] text-blue-700/80 font-medium">
                    Mở toàn màn hình Studio biên soạn sư phạm để soạn 4 khối kiến thức kèm live review mô phỏng học sinh.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const lName = createPatternForm.lessonName;
                    const lId = createPatternForm.lessonId;
                    setIsCreatePatternModalOpen(false);
                    handleOpenStudio(null, null, { lessonId: lId, name: lName });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs"
                >
                  Mở Studio
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tên Dạng bài (*)</label>
                <input
                  type="text"
                  value={createPatternForm.name}
                  onChange={(e) => setCreatePatternForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Dạng 4 - Cực trị hàm chứa dấu giá trị tuyệt đối"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kiến thức nền tảng SGK (Khối 1)</label>
                <textarea
                  rows={3}
                  value={createPatternForm.theoryRecap}
                  onChange={(e) => setCreatePatternForm(prev => ({ ...prev, theoryRecap: e.target.value }))}
                  placeholder="Khái niệm và định lý nền tảng..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phương pháp giải chi tiết từng bước (Khối 2)</label>
                <textarea
                  rows={4}
                  value={createPatternForm.solutionMethod}
                  onChange={(e) => setCreatePatternForm(prev => ({ ...prev, solutionMethod: e.target.value }))}
                  placeholder="Bước 1: ..., Bước 2: ..., Bước 3: ..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Trọng số (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={createPatternForm.weight}
                    onChange={(e) => setCreatePatternForm(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Video URL (tùy chọn)</label>
                  <input
                    type="text"
                    value={createPatternForm.videoUrl}
                    onChange={(e) => setCreatePatternForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                    placeholder="Link YouTube..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreatePatternModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={savingCreate}
                onClick={handleCreatePattern}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {savingCreate ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Tạo Dạng Bài Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6.1 MODAL THÊM CHƯƠNG MỚI (CREATE CHAPTER) */}
      {isCreateChapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>Thêm Chương Học Mới</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Thuộc Miền: {currentDomain?.title}</p>
              </div>
              <button 
                onClick={() => setIsCreateChapterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Phân môn nếu có */}
              {subSubjectsList.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Book className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Phân môn trực thuộc:</span>
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {subSubjectsList.filter(s => s.id !== 'all').map(subj => {
                      const isSel = createChapterForm.subSubject === subj.id;
                      return (
                        <button
                          key={subj.id}
                          type="button"
                          onClick={() => setCreateChapterForm(prev => ({ ...prev, subSubject: subj.id }))}
                          className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                            isSel 
                              ? 'bg-indigo-600 text-white shadow-xs' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {subj.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Khối lớp & Năm học */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Khối lớp:</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[
                      { id: '12', label: 'Lớp 12' },
                      { id: '11', label: 'Lớp 11' },
                      { id: '10', label: 'Lớp 10' }
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setCreateChapterForm(prev => ({ ...prev, grade: g.id }))}
                        className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          createChapterForm.grade === g.id
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Năm học áp dụng:</span>
                  </label>
                  <select
                    value={createChapterForm.academicYear}
                    onChange={(e) => setCreateChapterForm(prev => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2025-2026">2025 - 2026 (GDPT 2018 Mới)</option>
                    <option value="2024-2025">2024 - 2025</option>
                  </select>
                </div>
              </div>

              {/* Tên chương */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên Chương học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chương 01: Dao động cơ và Sóng cơ học"
                  value={createChapterForm.name}
                  onChange={(e) => setCreateChapterForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Trọng số */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trọng số phân bổ trong kỳ thi ĐGNL (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={createChapterForm.weight}
                  onChange={(e) => setCreateChapterForm(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">Mặc định 25% (0.25) phân bổ trong miền tri thức</p>
              </div>

              {/* Mô tả chương học */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô tả / Mục tiêu chuẩn đầu ra của Chương
                </label>
                <textarea
                  rows="3"
                  placeholder="Khái quát nội dung cốt lõi và các năng lực cần đạt theo chuẩn Bộ GD&ĐT..."
                  value={createChapterForm.description}
                  onChange={(e) => setCreateChapterForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateChapterModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={savingCreateChapter}
                onClick={handleCreateChapter}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {savingCreateChapter ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Tạo Chương Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6.2 MODAL THÊM BÀI HỌC MỚI (CREATE LESSON) */}
      {isCreateLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>Thêm Bài Học Mới</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Thuộc Chương: {createLessonForm.chapterName}</p>
              </div>
              <button 
                onClick={() => setIsCreateLessonModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* Tên bài học */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tên Bài học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bài 01: Dao động điều hòa và các đại lượng đặc trưng"
                  value={createLessonForm.name}
                  onChange={(e) => setCreateLessonForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              {/* Trọng số */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trọng số phân bổ (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={createLessonForm.weight}
                  onChange={(e) => setCreateLessonForm(prev => ({ ...prev, weight: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">Mặc định 10% (0.10)</p>
              </div>

              {/* Tóm tắt bài học */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tóm tắt nội dung cốt lõi của Bài học
                </label>
                <textarea
                  rows="3"
                  placeholder="Tóm tắt ngắn gọn phạm vi kiến thức mà bài học này bao quát..."
                  value={createLessonForm.summary}
                  onChange={(e) => setCreateLessonForm(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsCreateLessonModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={savingCreateLesson}
                onClick={handleCreateLesson}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {savingCreateLesson ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                <span>Thêm Bài Học Mới</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. PHÂN HỆ AI TRI THỨC BÓC TÁCH TÀI LIỆU & TỰ ĐỘNG NHẬN DIỆN DẠNG BÀI */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className={`relative w-full ${extractedCurriculum ? 'max-w-[1580px] h-[95vh]' : 'max-w-4xl max-h-[92vh]'} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300`}>
            
            {/* Header (Clean White Theme) */}
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-200 bg-white text-slate-900 flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs shrink-0">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-900">
                      {extractedCurriculum ? "Không Gian Xem Trước & Thẩm Định Tri Thức AI (Panoramic Workspace)" : "AI Tri Thức Bóc Tách Tài Liệu & Nhận Diện Dạng Bài"}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[9.5px] font-bold text-purple-700">
                      C# .NET 9 AI Engine • Gemini RAG
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[10.5px] text-slate-500 font-medium">
                    Hỗ trợ tài liệu SGK/Chuyên đề nhiều trang (lên tới 99+ trang) • Trích xuất Chương → Bài học → Dạng bài kèm 4 khối Sư phạm
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsImportModalOpen(false);
                  setExtractedCurriculum(null);
                  setAiExtractStep(0);
                  setPreviewSelectedPattern(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tab Switcher (Only visible before extraction) */}
            {!extractedCurriculum && (
              <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200/80 bg-slate-50/70 shrink-0">
                <button
                  type="button"
                  onClick={() => setImportTab('document')}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-extrabold transition-all ${
                    importTab === 'document'
                      ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileUp className="w-4 h-4" />
                  <span>Nạp File Tài Liệu (PDF / DOCX / Text)</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-black">AI Auto</span>
                </button>

                <button
                  type="button"
                  onClick={() => setImportTab('json')}
                  className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-extrabold transition-all ${
                    importTab === 'json'
                      ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  <span>Dán JSON Cấu Trúc Thủ Công</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            {extractedCurriculum ? (
              /* ================= PANORAMIC 3-COLUMN STUDIO WORKSPACE ================= */
              <div className="flex-1 flex flex-col min-h-0 bg-slate-100 overflow-hidden">
                {/* Summary Header Banner */}
                <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border-b border-emerald-200/80 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
                      <CheckCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                        <span>AI ĐÃ BÓC TÁCH & CHUẨN HÓA THÀNH CÔNG TOÀN BỘ CÂY TRI THỨC</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-200 text-emerald-900 text-[9px] font-bold">Chuẩn GDPT 2018</span>
                      </div>
                      <div className="text-[10px] sm:text-[10.5px] text-emerald-800 font-medium">
                        <strong>{extractedCurriculum.chapters?.length || 0} Chương</strong> • 
                        <strong> {extractedCurriculum.chapters?.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)} Bài học</strong> • 
                        <strong> {extractedCurriculum.chapters?.reduce((acc, c) => acc + (c.lessons?.reduce((a, l) => a + (l.patterns?.length || 0), 0) || 0), 0)} Dạng bài chi tiết</strong> • 
                        <strong className="text-indigo-950 font-black"> {extractedCurriculum.chapters?.reduce((acc, c) => acc + (c.lessons?.reduce((a, l) => a + (l.patterns?.reduce((aq, p) => aq + (p.questions?.length || 0), 0) || 0), 0) || 0), 0)} Bài tập mẫu chuyên sâu</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setExtractedCurriculum(null);
                      setAiExtractStep(0);
                      setPreviewSelectedPattern(null);
                      setPreviewActiveQuestionIdx(0);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-100 text-[11px] font-bold text-emerald-900 transition-colors shadow-2xs"
                  >
                    Phân Tích Tệp Khác
                  </button>
                </div>

                {/* 2-Master-Pane Balanced Workspace Grid */}
                <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden min-h-0">
                  
                  {/* PANE 1: CỘT TRÁI ĐIỀU HƯỚNG PHÂN CẤP (4 Cols / ~33%) */}
                  <div className="col-span-12 lg:col-span-4 border-r border-slate-200 bg-slate-50/70 flex flex-col min-h-0 overflow-hidden">
                    
                    {/* TẦNG 1: CÂY CHƯƠNG & BÀI HỌC (Top Section: max 38% height, scrollable) */}
                    <div className="flex-none max-h-[38%] border-b border-slate-200 bg-white p-2.5 overflow-y-auto space-y-1.5 shadow-2xs">
                      <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center justify-between pb-1 border-b border-slate-100">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-indigo-600" />
                          <span>1. Cây Chương & Bài Học</span>
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-normal">Click chọn bài</span>
                      </div>

                      <div className="space-y-1.5">
                        {extractedCurriculum.chapters?.map((chap, cIdx) => (
                          <div key={cIdx} className="space-y-1">
                            <div className="text-[10.5px] font-extrabold text-slate-900 flex items-center justify-between gap-1.5 px-2 py-0.5 bg-slate-100/80 rounded-md">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="w-3.5 h-3.5 rounded bg-indigo-600 text-white flex items-center justify-center text-[8.5px] font-black shrink-0">C{cIdx+1}</span>
                                <span className="truncate">{chap.chapterName}</span>
                              </div>
                              <span className="text-[9.5px] text-slate-500 font-mono shrink-0">
                                {chap.lessons?.length || 0} bài
                              </span>
                            </div>

                            <div className="pl-1.5 space-y-0.5 border-l-2 border-indigo-100">
                              {chap.lessons?.map((les, lIdx) => {
                                const key = `${cIdx}-${lIdx}`;
                                const isSelected = (previewSelectedLessonKey || '0-0') === key;
                                const totalQ = les.patterns?.reduce((acc, p) => acc + (p.questions?.length || 0), 0) || 0;
                                return (
                                  <button
                                    key={lIdx}
                                    type="button"
                                    onClick={() => {
                                      setPreviewSelectedLessonKey(key);
                                      setPreviewSelectedPattern(les.patterns?.[0] || null);
                                      setPreviewActiveQuestionIdx(0);
                                    }}
                                    className={`w-full text-left px-2 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-between gap-1.5 ${
                                      isSelected
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                  >
                                    <span className="truncate">{les.lessonName}</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <span className={`px-1 py-0.2 rounded text-[9.5px] font-mono ${
                                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                                      }`}>
                                        {les.patterns?.length || 0} dạng
                                      </span>
                                      {totalQ > 0 && (
                                        <span className={`px-1 py-0.2 rounded text-[9.5px] font-mono ${
                                          isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-amber-100 text-amber-800 font-bold'
                                        }`}>
                                          {totalQ} bài mẫu
                                        </span>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 2: DANH MỤC DẠNG BÀI THEO BÀI HỌC (Bottom Section: flex-1 overflow-y-auto) */}
                    <div className="flex-1 p-2.5 overflow-y-auto space-y-1.5 min-h-0 bg-slate-50/50">
                      {(() => {
                        const [cIdx, lIdx] = (previewSelectedLessonKey || '0-0').split('-').map(Number);
                        const activeChap = extractedCurriculum.chapters?.[cIdx] || extractedCurriculum.chapters?.[0];
                        const activeLes = activeChap?.lessons?.[lIdx] || activeChap?.lessons?.[0];
                        const allPatterns = activeLes?.patterns || [];
                        const filteredPatterns = previewBloomFilter === 'all' 
                          ? allPatterns 
                          : allPatterns.filter(p => String(p.bloomLevel || p.difficultyLevel || '') === previewBloomFilter);

                        return (
                          <>
                            <div className="space-y-1 pb-1.5 border-b border-slate-200">
                              <div className="flex items-center justify-between">
                                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles className="w-3 h-3 text-amber-500" />
                                  <span>2. Dạng Bài ({filteredPatterns.length}/{allPatterns.length})</span>
                                </div>
                                <span className="text-[10.5px] font-bold text-indigo-700 truncate max-w-[150px]">
                                  {activeLes?.lessonName}
                                </span>
                              </div>

                              {/* Filter pills */}
                              <div className="flex items-center gap-1 overflow-x-auto text-[9.5px] font-bold pb-0.5">
                                {[
                                  { id: 'all', label: 'Tất cả' },
                                  { id: '1', label: 'L1 Nhận biết' },
                                  { id: '2', label: 'L2 Thông hiểu' },
                                  { id: '3', label: 'L3 Vận dụng' },
                                  { id: '4', label: 'L4 Vận dụng cao' }
                                ].map(f => (
                                  <button
                                    key={f.id}
                                    type="button"
                                    onClick={() => setPreviewBloomFilter(f.id)}
                                    className={`px-1.5 py-0.5 rounded-md transition-colors whitespace-nowrap ${
                                      previewBloomFilter === f.id
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {f.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Pattern cards */}
                            <div className="space-y-1.5">
                              {filteredPatterns.length === 0 ? (
                                <div className="p-4 text-center text-slate-400 text-[11px]">
                                  Không có dạng bài nào ở cấp độ này.
                                </div>
                              ) : (
                                filteredPatterns.map((pat, pIdx) => {
                                  const isSelected = (previewSelectedPattern?.patternName === pat.patternName) || (!previewSelectedPattern && pIdx === 0);
                                  const qCount = pat.questions?.length || 0;
                                  return (
                                    <div
                                      key={pIdx}
                                      onClick={() => {
                                        setPreviewSelectedPattern(pat);
                                        setPreviewActiveQuestionIdx(0);
                                      }}
                                      className={`p-2 rounded-xl border text-[11px] space-y-1 cursor-pointer transition-all ${
                                        isSelected
                                          ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                                          : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:shadow-2xs'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-1.5">
                                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-black shrink-0">
                                            {pIdx + 1}
                                          </span>
                                          <span className="leading-snug text-[11px]">{pat.patternName}</span>
                                        </div>
                                        {isSelected && (
                                          <span className="p-0.5 rounded-full bg-indigo-600 text-white shrink-0">
                                            <Check className="w-2.5 h-2.5" />
                                          </span>
                                        )}
                                      </div>

                                      {(() => {
                                        const qL1 = pat.questions?.filter(q => q.difficultyLevel === 1).length || 0;
                                        const qL2 = pat.questions?.filter(q => q.difficultyLevel === 2).length || 0;
                                        const qL3 = pat.questions?.filter(q => q.difficultyLevel === 3).length || 0;
                                        const qL4 = pat.questions?.filter(q => q.difficultyLevel === 4).length || 0;
                                        return (
                                          <>
                                            <div className="flex items-center gap-1 flex-wrap">
                                              {pat.classification && (
                                                <span className="px-1.5 py-0.2 rounded-md bg-purple-50 text-purple-700 text-[9px] font-bold border border-purple-200 truncate max-w-[160px]">
                                                  {pat.classification}
                                                </span>
                                              )}
                                              <span className="px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-bold border border-indigo-100">
                                                Trọng số: {Math.round((pat.weight || 0.05) * 100)}%
                                              </span>
                                              <span className="px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 text-[9px] font-extrabold border border-amber-200 flex items-center gap-0.5">
                                                <span>🎯</span>
                                                <span>{qCount} bài (L1:{qL1} • L2:{qL2} • L3:{qL3} • L4:{qL4})</span>
                                              </span>
                                            </div>

                                            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                                              <span className="text-slate-500 font-medium truncate max-w-[180px]">
                                                {qCount > 0 ? `ĐGNL: L3 (${qL3}) • L4 (${qL4})` : 'Chưa có câu mẫu'}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setIsImportModalOpen(false);
                                                  handleOpenStudio(pat, activeChap, activeLes);
                                                }}
                                                className="px-1.5 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1 text-[10px] transition-colors"
                                              >
                                                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                                <span>Studio</span>
                                              </button>
                                            </div>
                                          </>
                                        );
                                      })()}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* PANE 2: KHUNG CHÍNH CHI TIẾT SƯ PHẠM & BỘ SƯU TẬP BÀI MẪU (8 Cols / ~67%) */}
                  <div className="col-span-12 lg:col-span-8 bg-white flex flex-col min-h-0 overflow-hidden">
                    {(() => {
                      const [cIdx, lIdx] = (previewSelectedLessonKey || '0-0').split('-').map(Number);
                      const activeChap = extractedCurriculum.chapters?.[cIdx] || extractedCurriculum.chapters?.[0];
                      const activeLes = activeChap?.lessons?.[lIdx] || activeChap?.lessons?.[0];
                      const pat = previewSelectedPattern || activeLes?.patterns?.[0];

                      if (!pat) {
                        return (
                          <div className="p-8 text-center text-slate-400 text-xs">
                            Chọn một dạng bài ở cột bên trái để xem trước chi tiết sư phạm & bài tập chuyên sâu.
                          </div>
                        );
                      }

                      const parsedTheory = parseTheoryRecapSections(pat.theoryRecap || '');
                      const parsedMethod = parseSolutionMethodSections(pat.solutionMethod || '');
                      const isStem = isMathOrStemDomain(currentDomain);
                      const questions = pat.questions || [];
                      const currentQuestion = questions[previewActiveQuestionIdx] || questions[0];

                      return (
                        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                          
                          {/* Header Dạng Bài (Clean White Theme) */}
                          <div className="px-4 py-2.5 bg-white text-slate-900 shrink-0 border-b border-slate-200 shadow-2xs flex items-center justify-between gap-2.5">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[9.5px] font-bold border border-slate-200">
                                  Trọng số: {Math.round((pat.weight || 0.05) * 100)}%
                                </span>
                                {pat.classification && (
                                  <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[9.5px] font-bold border border-purple-200">
                                    Phân loại: {pat.classification}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[9.5px] font-black border border-amber-200">
                                  🎯 Nguồn bài: {questions.length} bài mẫu chuyên sâu
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-[13px] font-black leading-tight text-slate-900 truncate">{pat.patternName}</h4>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setIsImportModalOpen(false);
                                handleOpenStudio(pat, activeChap, activeLes);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Mở Trong Studio Sư Phạm</span>
                            </button>
                          </div>

                          {/* Khung Chia Đôi Song Song 2 Cột Cân Đối: [Lý Thuyết & Bẫy] vs [Ngân Hàng Bài Mẫu Chuyên Sâu] */}
                          <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden min-h-0">
                            
                            {/* CỘT A: KIẾN THỨC NỀN TẢNG & PHƯƠNG PHÁP GIẢI (6 Cols / 50%) */}
                            <div className="col-span-12 lg:col-span-6 border-r border-slate-200 overflow-y-auto p-3 space-y-2.5 bg-white">
                              
                              {/* Khối 1: Nền tảng SGK */}
                              <div className="space-y-1.5">
                                <div className="text-[11px] font-extrabold text-cyan-800 uppercase tracking-wider flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[9px] font-black">1</span>
                                    <span>Khối 1: Kiến thức nền tảng SGK</span>
                                  </div>
                                  <span className="text-[9.5px] text-cyan-600 font-medium">{isStem ? 'Định lý & Công thức' : 'Kiến thức cốt lõi & Khái niệm'}</span>
                                </div>

                                {/* Định lý & Công thức cốt lõi */}
                                <div className="p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-200 text-[11px] text-slate-800 font-medium leading-relaxed shadow-2xs">
                                  <MathText text={parsedTheory.theory || pat.theoryRecap || 'Chưa nhập lý thuyết'} />
                                </div>

                                {/* Ví Dụ Minh Họa SGK */}
                                {parsedTheory.example && (
                                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-50/80 via-emerald-50/50 to-cyan-50/80 border border-teal-200/90 text-[11px] text-slate-800 space-y-1 shadow-2xs">
                                    <div className="font-extrabold flex items-center gap-1 text-teal-800 border-b border-teal-200/60 pb-1 text-[11px]">
                                      <BookOpen className="w-3 h-3 text-teal-600" />
                                      <span>Ví Dụ Minh Họa SGK:</span>
                                    </div>
                                    <div className="leading-relaxed">
                                      <MathText text={parsedTheory.example} />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Khối 2: Phương pháp giải chi tiết & Bẫy */}
                              <div className="space-y-1.5">
                                <div className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[9px] font-black">2</span>
                                    <span>Khối 2: Phương pháp giải chi tiết & Bẫy</span>
                                  </div>
                                  <span className="text-[9.5px] text-amber-600 font-medium">{isStem ? 'Thuật toán giải' : 'Phương pháp làm bài'}</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-200 text-[11px] text-slate-800 font-medium leading-relaxed space-y-2 shadow-2xs">
                                  {/* Thuật toán các bước */}
                                  <MathText text={parsedMethod.method || pat.solutionMethod || 'Chưa nhập phương pháp giải'} />

                                  {/* Bài Toán Mẫu Áp Dụng Phương Pháp */}
                                  {parsedMethod.sampleProblem && (
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-100/70 via-orange-50/80 to-amber-50/90 border border-amber-300 text-amber-950 text-[10.5px] space-y-1 shadow-2xs">
                                      <div className="font-bold flex items-center gap-1 text-amber-900 border-b border-amber-200/80 pb-0.5">
                                        <FileText className="w-3 h-3 text-amber-700" />
                                        <span>{isStem ? 'Bài Toán Mẫu Áp Dụng Phương Pháp:' : 'Bài Mẫu Áp Dụng Phương Pháp:'}</span>
                                      </div>
                                      <div className="leading-relaxed text-slate-800">
                                        <MathText text={parsedMethod.sampleProblem} />
                                      </div>
                                    </div>
                                  )}

                                  {parsedMethod.traps && (
                                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[10.5px] space-y-0.5 shadow-2xs">
                                      <div className="font-bold flex items-center gap-1 text-rose-700">
                                        <AlertTriangle className="w-3 h-3" />
                                        <span>Bẫy đề thi ĐGNL thường gặp:</span>
                                      </div>
                                      <MathText text={parsedMethod.traps} />
                                    </div>
                                  )}

                                  {parsedMethod.casio && (
                                    <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-[10.5px] space-y-0.5 shadow-2xs">
                                      <div className="font-bold flex items-center gap-1 text-indigo-700">
                                        <Sparkles className="w-3 h-3" />
                                        <span>{isStem ? 'Kỹ thuật Casio & Mẹo tư duy nhanh:' : 'Mẹo tư duy & Chiến thuật làm bài:'}</span>
                                      </div>
                                      <MathText text={parsedMethod.casio} />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Khối 3: Video bài giảng */}
                              <div className="space-y-1">
                                <div className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-black">3</span>
                                  <span>Khối 3: Video bài giảng sư phạm</span>
                                </div>
                                <div className="p-2 rounded-xl bg-emerald-50/40 border border-emerald-200 text-[10.5px] text-emerald-900 font-medium flex items-center justify-between shadow-2xs">
                                  <span>Thời lượng bài giảng khuyến nghị:</span>
                                  <span className="font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                                    {Math.round((pat.durationSeconds || 600) / 60)} phút ({pat.durationSeconds || 600}s)
                                  </span>
                                </div>
                              </div>

                            </div>

                            {/* CỘT B: BỘ SƯU TẬP BÀI MẪU & LUYỆN TẬP CHUYÊN SÂU (6 Cols / 50%) */}
                            <div className="col-span-12 lg:col-span-6 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
                              
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <div className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black">4</span>
                                    <span>Khối 4: Ngân Hàng Bài Mẫu Chuyên Sâu ({questions.length} Câu)</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      disabled={isGeneratingPracticeQuestions}
                                      onClick={() => handleAddAiPracticeQuestions(pat)}
                                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-2xs flex items-center gap-1 transition-all ${
                                        isGeneratingPracticeQuestions ? 'opacity-70 cursor-wait' : 'hover:scale-105 active:scale-95 cursor-pointer'
                                      }`}
                                      title="AI tự động phân tích dạng bài và tạo thêm 2 bài tập rèn luyện bám sát 100%"
                                    >
                                      <Sparkles className={`w-2.5 h-2.5 text-amber-300 ${isGeneratingPracticeQuestions ? 'animate-spin' : ''}`} />
                                      <span>{isGeneratingPracticeQuestions ? 'Đang Sinh Câu Hỏi...' : '+ AI Tạo Thêm 2 Bài Mẫu'}</span>
                                    </button>
                                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded-md">
                                      Chuẩn VNU-HCM
                                    </span>
                                  </div>
                                </div>

                                {(() => {
                                  const l1Questions = questions.filter(q => q.difficultyLevel === 1);
                                  const l2Questions = questions.filter(q => q.difficultyLevel === 2);
                                  const l3Questions = questions.filter(q => q.difficultyLevel === 3);
                                  const l4Questions = questions.filter(q => q.difficultyLevel === 4);

                                  const visibleQuestions = previewQuestionBloomTab === 'all'
                                    ? questions
                                    : questions.filter(q => String(q.difficultyLevel) === previewQuestionBloomTab);

                                  return (
                                    <div className="space-y-1.5">
                                      {/* Cấp Độ Bloom Filter Tabs */}
                                      <div className="flex items-center gap-1 flex-wrap bg-slate-100 p-1 rounded-lg border border-slate-200">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreviewQuestionBloomTab('all');
                                            setPreviewActiveQuestionIdx(0);
                                          }}
                                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                                            previewQuestionBloomTab === 'all'
                                              ? 'bg-indigo-600 text-white shadow-2xs'
                                              : 'text-slate-700 hover:bg-white'
                                          }`}
                                        >
                                          Tất cả ({questions.length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreviewQuestionBloomTab('1');
                                            const idx = questions.findIndex(q => q.difficultyLevel === 1);
                                            if (idx >= 0) setPreviewActiveQuestionIdx(idx);
                                          }}
                                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                                            previewQuestionBloomTab === '1'
                                              ? 'bg-emerald-600 text-white shadow-2xs'
                                              : 'text-emerald-800 hover:bg-emerald-50'
                                          }`}
                                        >
                                          L1: Nhận biết ({l1Questions.length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreviewQuestionBloomTab('2');
                                            const idx = questions.findIndex(q => q.difficultyLevel === 2);
                                            if (idx >= 0) setPreviewActiveQuestionIdx(idx);
                                          }}
                                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                                            previewQuestionBloomTab === '2'
                                              ? 'bg-cyan-600 text-white shadow-2xs'
                                              : 'text-cyan-800 hover:bg-cyan-50'
                                          }`}
                                        >
                                          L2: Thông hiểu ({l2Questions.length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreviewQuestionBloomTab('3');
                                            const idx = questions.findIndex(q => q.difficultyLevel === 3);
                                            if (idx >= 0) setPreviewActiveQuestionIdx(idx);
                                          }}
                                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                                            previewQuestionBloomTab === '3'
                                              ? 'bg-amber-500 text-white shadow-2xs'
                                              : 'text-amber-900 hover:bg-amber-50'
                                          }`}
                                        >
                                          L3: Vận dụng ({l3Questions.length})
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setPreviewQuestionBloomTab('4');
                                            const idx = questions.findIndex(q => q.difficultyLevel === 4);
                                            if (idx >= 0) setPreviewActiveQuestionIdx(idx);
                                          }}
                                          className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold transition-all ${
                                            previewQuestionBloomTab === '4'
                                              ? 'bg-rose-600 text-white shadow-2xs'
                                              : 'text-rose-800 hover:bg-rose-50'
                                          }`}
                                        >
                                          L4: Vận dụng cao ({l4Questions.length})
                                        </button>
                                      </div>

                                      {/* Thanh Chuyển Đổi Câu Hỏi Tương Tác */}
                                      {visibleQuestions.length > 0 && (
                                        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 pt-0.5">
                                          {visibleQuestions.map((q) => {
                                            const originalIdx = questions.indexOf(q);
                                            const isActive = (previewActiveQuestionIdx === originalIdx);
                                            const bloomLabel = q.difficultyLevel === 1 ? 'L1: Nhận biết'
                                              : q.difficultyLevel === 2 ? 'L2: Thông hiểu'
                                              : q.difficultyLevel === 3 ? 'L3: Vận dụng'
                                              : 'L4: Vận dụng cao';
                                            return (
                                              <button
                                                key={originalIdx}
                                                type="button"
                                                onClick={() => setPreviewActiveQuestionIdx(originalIdx)}
                                                className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                                                  isActive
                                                    ? 'bg-indigo-600 text-white shadow-2xs ring-1 ring-indigo-400/40'
                                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                                }`}
                                              >
                                                <span>Câu {originalIdx + 1}</span>
                                                <span className={`text-[8.5px] px-1 py-0.2 rounded font-medium ${
                                                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                  {bloomLabel}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Chi Tiết Bài Mẫu Đang Chọn */}
                              {currentQuestion ? (
                                <div className="p-3 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-2">
                                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-black">
                                        {previewActiveQuestionIdx + 1}
                                      </span>
                                      <span className="text-[11px] font-extrabold text-slate-900">
                                        Bài Toán Mẫu {previewActiveQuestionIdx + 1}
                                      </span>
                                    </div>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold border ${
                                      currentQuestion.difficultyLevel === 1
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : currentQuestion.difficultyLevel === 2
                                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                        : currentQuestion.difficultyLevel === 3
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-rose-50 text-rose-700 border-rose-200'
                                    }`}>
                                      Cấp độ: {currentQuestion.difficultyLevel === 1 ? 'L1 - Nhận biết'
                                        : currentQuestion.difficultyLevel === 2 ? 'L2 - Thông hiểu'
                                        : currentQuestion.difficultyLevel === 3 ? 'L3 - Vận dụng'
                                        : 'L4 - Vận dụng cao'} (Độ khó: {currentQuestion.difficultyLevel}/4)
                                    </span>
                                  </div>

                                  {/* Đề bài KaTeX */}
                                  <div className="text-[11px] font-semibold text-slate-900 leading-relaxed p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                    <MathText text={currentQuestion.contentLatex} />
                                  </div>

                                  {/* Lưới 4 phương án A-B-C-D */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {['A', 'B', 'C', 'D'].map((optKey) => {
                                      const optText = currentQuestion[`option${optKey}`];
                                      const isCorrect = currentQuestion.correctOption === optKey;
                                      return (
                                        <div
                                          key={optKey}
                                          className={`p-1.5 px-2 rounded-lg border text-[11px] flex items-start gap-1.5 transition-all ${
                                            isCorrect
                                              ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950 font-bold ring-1 ring-emerald-400/30 shadow-2xs'
                                              : 'bg-white border-slate-200 text-slate-700'
                                          }`}
                                        >
                                          <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                                          }`}>
                                            {optKey}
                                          </span>
                                          <div className="flex-1 min-w-0 leading-snug">
                                            <MathText text={optText || ''} />
                                          </div>
                                          {isCorrect && (
                                            <span className="text-emerald-700 text-[9.5px] font-extrabold shrink-0">
                                              ✓ Đúng
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Khung Lời Giải Chi Tiết */}
                                  {currentQuestion.explanation && (
                                    <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200/80 text-slate-800 text-[11px] space-y-1">
                                      <div className="font-extrabold text-indigo-950 flex items-center gap-1 text-[11px]">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        <span>Lời giải chi tiết từng bước:</span>
                                      </div>
                                      <div className="leading-relaxed text-slate-800 font-medium">
                                        <MathText text={currentQuestion.explanation} />
                                      </div>
                                    </div>
                                  )}

                                  {/* Pagination / Điều hướng câu hỏi */}
                                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10.5px]">
                                    <button
                                      type="button"
                                      disabled={previewActiveQuestionIdx <= 0}
                                      onClick={() => setPreviewActiveQuestionIdx(p => Math.max(0, p - 1))}
                                      className="px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-colors"
                                    >
                                      ← Câu trước
                                    </button>
                                    <span className="text-slate-500 font-medium">
                                      Câu {previewActiveQuestionIdx + 1} / {questions.length}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={previewActiveQuestionIdx >= questions.length - 1}
                                      onClick={() => setPreviewActiveQuestionIdx(p => Math.min(questions.length - 1, p + 1))}
                                      className="px-2 py-0.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 transition-colors"
                                    >
                                      Câu tiếp theo →
                                    </button>
                                  </div>

                                </div>
                              ) : (
                                <div className="p-6 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-400 text-center space-y-1.5">
                                  <BookOpen className="w-6 h-6 text-slate-300 mx-auto" />
                                  <div>Dạng bài này chưa có câu hỏi mẫu.</div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsImportModalOpen(false);
                                      handleOpenStudio(pat, activeChap, activeLes);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100 transition-colors"
                                  >
                                    Mở Studio để thêm câu hỏi mẫu
                                  </button>
                                </div>
                              )}

                            </div>

                          </div>

                        </div>
                      );
                    })()}
                  </div>

                </div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* TAB 1: NẠP FILE TÀI LIỆU BẰNG AI */}
                {importTab === 'document' && (
                  <div className="space-y-5">
                    {/* Chọn Miền Năng Lực Mục Tiêu */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 flex items-center gap-2">
                        <span>1. Chọn Miền Năng Lực Mục Tiêu Của Tài Liệu:</span>
                      </label>
                      <select
                        value={importTargetDomainId || activeDomainId}
                        onChange={(e) => setImportTargetDomainId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {domains.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.title} ({d.subtitle || 'Chuẩn GDPT 2018'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dropzone Tải Tệp Tài Liệu */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                        <span>2. Tải Lên Tệp Sách Giáo Khoa / Tài Liệu Chuyên Đề:</span>
                        <span className="text-[11px] text-slate-400 font-normal">Hỗ trợ: .pdf, .docx, .txt (Tối đa 250MB)</span>
                      </label>

                      {!importFile ? (
                        <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-3xl bg-indigo-50/30 hover:bg-indigo-50/60 cursor-pointer transition-all group text-center space-y-3">
                          <input
                            type="file"
                            accept=".pdf,.docx,.txt,.md"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setImportFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-md text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-7 h-7 text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              Kéo & thả tệp tài liệu vào đây hoặc <span className="text-indigo-600 underline">bấm để chọn từ máy tính</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">
                              Ví dụ: <em>SGK_Toan_12_Tap_1.pdf</em>, <em>Chuyen_de_Khao_sat_Ham_so.pdf</em>, <em>Tai_lieu_Cuc_tri.docx</em>
                            </div>
                          </div>
                        </label>
                      ) : (
                        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                              <FileType className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="text-xs font-extrabold text-slate-900">{importFile.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                Dung lượng: {(importFile.size / 1024 / 1024).toFixed(2)} MB • Sẵn sàng để AI phân tích
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setImportFile(null)}
                            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition-colors"
                            title="Xóa tệp chọn lại"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Cấu Hình Tài Liệu Nhiều Trang (VD: Sách 99 trang) & Độ Sâu Trích Xuất */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
                      {/* 1. Phạm vi trang */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                          <span>Phạm vi trang (Hỗ trợ sách 99+ trang):</span>
                          <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded-full">PDF Page Filter</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setImportPageMode('all')}
                            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                              importPageMode === 'all'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Toàn bộ tài liệu
                          </button>
                          <button
                            type="button"
                            onClick={() => setImportPageMode('custom')}
                            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                              importPageMode === 'custom'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            Khoảng trang
                          </button>
                        </div>

                        {importPageMode === 'custom' && (
                          <div className="flex items-center gap-2 pt-1 animate-fade">
                            <div className="flex-1">
                              <span className="text-[10px] text-slate-500 font-bold">Từ trang:</span>
                              <input
                                type="number"
                                min="1"
                                value={importStartPage}
                                onChange={(e) => setImportStartPage(parseInt(e.target.value, 10) || 1)}
                                className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] text-slate-500 font-bold">Đến trang:</span>
                              <input
                                type="number"
                                min={importStartPage}
                                value={importEndPage}
                                onChange={(e) => setImportEndPage(parseInt(e.target.value, 10) || importStartPage)}
                                className="w-full mt-0.5 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Chế độ phân tích chuyên sâu */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                          <span>Độ sâu nhận diện dạng bài:</span>
                          <span className="text-[10px] text-purple-700 font-bold bg-purple-100 px-2 py-0.5 rounded-full">Bloom L1-L4</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setImportExtractionDepth('deep')}
                            className={`flex-1 p-2 rounded-xl text-xs font-bold transition-all text-left ${
                              importExtractionDepth === 'deep'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-extrabold">Chuyên sâu ĐGNL</div>
                            <div className="text-[10px] opacity-80">2-4 dạng/bài, chuẩn 4 khối KaTeX</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setImportExtractionDepth('standard')}
                            className={`flex-1 p-2 rounded-xl text-xs font-bold transition-all text-left ${
                              importExtractionDepth === 'standard'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-extrabold">Tiêu chuẩn</div>
                            <div className="text-[10px] opacity-80">Trọng tâm cốt lõi mục lục</div>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Hoặc Nhập Trích Đoạn Văn Bản / Mục Lục */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 flex items-center justify-between">
                        <span>Hoặc dán trực tiếp trích đoạn văn bản chuyên đề (tùy chọn):</span>
                        <span className="text-[11px] text-slate-400">Nếu không muốn tải file</span>
                      </label>
                      <textarea
                        rows={3}
                        value={importTextSnippet}
                        onChange={(e) => setImportTextSnippet(e.target.value)}
                        placeholder="Dán nội dung lý thuyết, mục lục hoặc các dạng bài tập tại đây..."
                        className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-800"
                      />
                    </div>

                    {/* Tiến Trình Phân Tích AI (Nếu đang chạy) */}
                    {isExtractingAi && (
                      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 space-y-3 animate-fade">
                        <div className="flex items-center justify-between text-xs font-extrabold text-purple-900">
                          <span className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                            <span>AI Tri Thức Đang Bóc Tách & Nhận Diện Dạng Bài...</span>
                          </span>
                          <span>{aiExtractStep * 25}%</span>
                        </div>

                        <div className="w-full h-2 rounded-full bg-purple-100 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 rounded-full"
                            style={{ width: `${aiExtractStep * 25}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-slate-600">
                          <div className={aiExtractStep >= 1 ? "text-purple-700 font-black" : "text-slate-400"}>
                            1. Đọc tệp & OCR
                          </div>
                          <div className={aiExtractStep >= 2 ? "text-purple-700 font-black" : "text-slate-400"}>
                            2. Phân tích Chương - Bài
                          </div>
                          <div className={aiExtractStep >= 3 ? "text-purple-700 font-black" : "text-slate-400"}>
                            3. Nhận diện Dạng bài
                          </div>
                          <div className={aiExtractStep >= 4 ? "text-purple-700 font-black" : "text-slate-400"}>
                            4. Chuẩn hóa KaTeX
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: DÁN JSON THỦ CÔNG */}
                {importTab === 'json' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Dán chuỗi JSON cấu trúc cây tri thức. Hệ thống sẽ tự động cập nhật phân cấp 
                      <strong> Miền → Chương → Bài học → Dạng bài → Tài liệu & Câu hỏi</strong> vào PostgreSQL.
                    </p>

                    <textarea
                      rows={12}
                      value={importJsonText}
                      onChange={(e) => setImportJsonText(e.target.value)}
                      placeholder='{ "domainId": "6f3765db-943e-4810-bf74-d6a8bdc215da", "domainName": "Toán học & Tư duy định lượng", "chapters": [...] }'
                      className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="px-4 py-2 sm:px-5 sm:py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              {importTab === 'json' ? (
                <button
                  type="button"
                  onClick={() => {
                    const sample = {
                      domainId: "6f3765db-943e-4810-bf74-d6a8bdc215da",
                      domainName: "Toán học & Tư duy định lượng",
                      chapters: [
                        {
                          chapterName: "Chương 1: Ứng dụng đạo hàm khảo sát hàm số",
                          weight: 0.25,
                          lessons: [
                            {
                              lessonName: "Bài 1: Tính đơn điệu của hàm số",
                              weight: 0.08,
                              patterns: [
                                {
                                  patternName: "Dạng 1: Xét tính đơn điệu bằng dấu đạo hàm",
                                  weight: 0.04,
                                  theoryRecap: "Hàm số đồng biến trên K khi và chỉ khi f'(x) >= 0 với mọi x thuộc K.",
                                  solutionMethod: "Bước 1: Tìm TXĐ.\nBước 2: Tính đạo hàm f'(x).\nBước 3: Lập bảng biến thiên.",
                                  durationSeconds: 600
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    };
                    setImportJsonText(JSON.stringify(sample, null, 2));
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Chèn JSON Mẫu
                </button>
              ) : (
                <div className="text-[10.5px] text-slate-500 font-medium">
                  {extractedCurriculum ? "Xem trước toàn cảnh 3 cột • Bấm nạp để cập nhật CSDL PostgreSQL" : "AI phân tích tự động chuẩn SGK 2018"}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setExtractedCurriculum(null);
                    setAiExtractStep(0);
                    setPreviewSelectedPattern(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
                >
                  Đóng
                </button>

                {importTab === 'document' ? (
                  !extractedCurriculum ? (
                    <button
                      type="button"
                      disabled={isExtractingAi || (!importFile && !importTextSnippet.trim())}
                      onClick={handleRunAiExtraction}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-500/25 flex items-center gap-1.5 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                    >
                      {isExtractingAi ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>AI Đang Nhận Diện Dạng Bài...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>Khởi Chạy AI Nhận Diện Dạng Bài</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const [cIdx, lIdx] = (previewSelectedLessonKey || '0-0').split('-').map(Number);
                          const activeChap = extractedCurriculum.chapters?.[cIdx] || extractedCurriculum.chapters?.[0];
                          const activeLes = activeChap?.lessons?.[lIdx] || activeChap?.lessons?.[0];
                          const pat = previewSelectedPattern || activeLes?.patterns?.[0];
                          setIsImportModalOpen(false);
                          handleOpenStudio(pat, activeChap, activeLes);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Mở Trong Studio Sư Phạm</span>
                      </button>

                      <button
                        type="button"
                        disabled={importingCurriculum}
                        onClick={handleSaveExtractedCurriculum}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm shadow-emerald-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {importingCurriculum ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Nạp Vào CSDL PostgreSQL</span>
                      </button>
                    </div>
                  )
                ) : (
                  <button
                    type="button"
                    disabled={importingCurriculum}
                    onClick={handleImportCurriculum}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {importingCurriculum ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                    <span>Nạp Tri Thức Vào Hệ Thống</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 5. INTERACTIVE MATHLAB & 3D SPATIAL GEOMETRY MODAL (FLOW 3 & FLOW 2 TEST) */}
      {isMathLabModalOpen && (
        <InteractiveMathWorkbenchModal
          isOpen={isMathLabModalOpen}
          initialTab={mathLabEngine}
          onClose={() => setIsMathLabModalOpen(false)}
        />
      )}

    </div>
  );
}
