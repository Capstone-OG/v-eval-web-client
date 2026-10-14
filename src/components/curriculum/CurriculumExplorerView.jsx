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
  CheckCircle,
  AlertCircle,
  Edit3,
  Save,
  Plus,
  Trash2,
  Eye,
  Sliders,
  UploadCloud,
  Code
} from 'lucide-react';
import MathText from '../common/MathText';
import CurriculumStudioEditor from './CurriculumStudioEditor';
import contentService from '../../services/contentService';
import { practiceService } from '../../services/practiceService';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeEditTab, setActiveEditTab] = useState('theory'); // 'theory' | 'method' | 'video' | 'sample' | 'settings'
  const [editingForm, setEditingForm] = useState({
    patternId: '',
    name: '',
    weight: '5',
    theoryRecap: '',
    solutionMethod: '',
    videoUrl: '',
    durationSeconds: 600,
    prerequisiteSkillIds: [],
    sampleQuestion: {
      questionId: null,
      difficultyLevel: 2,
      contentLatex: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A',
      explanation: ''
    }
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

  // Import Dynamic SGK State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importingCurriculum, setImportingCurriculum] = useState(false);

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

  // When switching domains, re-init selection
  useEffect(() => {
    if (currentDomain) {
      initSelection(currentDomain);
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

  // Helper to toggle chapter / lesson accordion
  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => ({
      ...prev,
      [lessonId]: !prev[lessonId]
    }));
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

  // Filter 3-level tree based on search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters;
    const q = searchQuery.toLowerCase();

    return chapters.map(chap => {
      const matchChap = chap.name.toLowerCase().includes(q) || chap.code.toLowerCase().includes(q);
      const filteredLessons = chap.lessons.map(les => {
        const matchLes = les.name.toLowerCase().includes(q) || les.code.toLowerCase().includes(q);
        const filteredPatterns = les.patterns.filter(pat => 
          pat.name.toLowerCase().includes(q) ||
          pat.code.toLowerCase().includes(q) ||
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
  }, [chapters, searchQuery]);

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
        alert("Dạng bài này hiện chưa có câu hỏi được nạp trong cơ sở dữ liệu. Giảng viên hoặc AI đang trong quá trình cập nhật ngân hàng đề.");
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
        alert("Không thể tải câu hỏi củng cố lúc này. Vui lòng kiểm tra kết nối API.");
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
  const handleOpenEditModal = (pattern) => {
    if (!pattern) return;
    const sample = pattern.sampleQuestion;
    setEditingForm({
      patternId: pattern.patternId,
      name: pattern.name || '',
      weight: pattern.weight ? pattern.weight.replace('%', '').trim() : '5',
      theoryRecap: pattern.theoryRecap || '',
      solutionMethod: pattern.solutionMethod || '',
      videoUrl: pattern.videoLesson?.videoUrl || '',
      durationSeconds: pattern.videoLesson?.durationSeconds || 600,
      prerequisiteSkillIds: pattern.prerequisiteIds || [],
      sampleQuestion: {
        questionId: sample?.questionId || null,
        difficultyLevel: 2,
        contentLatex: sample?.content || '',
        optionA: sample?.options?.[0]?.replace(/^A\.\s*/, '') || '',
        optionB: sample?.options?.[1]?.replace(/^B\.\s*/, '') || '',
        optionC: sample?.options?.[2]?.replace(/^C\.\s*/, '') || '',
        optionD: sample?.options?.[3]?.replace(/^D\.\s*/, '') || '',
        correctOption: sample?.correct !== undefined ? String.fromCharCode(65 + sample.correct) : 'A',
        explanation: sample?.explanation || ''
      }
    });
    setActiveEditTab('theory');
    setEditErrorMsg('');
    setEditSuccessMsg('');
    setIsEditModalOpen(true);
  };

  const handleInsertMathFormula = (targetField, snippet) => {
    setEditingForm(prev => {
      const currentText = prev[targetField] || '';
      return {
        ...prev,
        [targetField]: currentText ? `${currentText} $${snippet}$` : `$${snippet}$`
      };
    });
  };

  const handleAIEnhanceMethod = () => {
    const template = `**Bước 1: Tìm tập xác định & Nhận diện bài toán**\n- Xác định tập xác định $D$ của hàm số / biểu thức.\n- Nhận diện các tham số và điều kiện đặc biệt.\n\n**Bước 2: Áp dụng định lý & Phương pháp biến đổi chuyên biệt**\n- Lấy đạo hàm $y' = f'(x)$ hoặc biến đổi tương đương.\n- Giải phương trình $y' = 0$ để tìm các nghiệm tới hạn $x_0 \\in D$.\n\n**Bước 3: Lập bảng biến thiên & Đối chiếu đáp án ĐGNL VNU**\n- Xét dấu trên từng khoảng xác định.\n- Đọc kết quả cực trị, tiệm cận hoặc giá trị lớn nhất/nhỏ nhất theo yêu cầu đề bài.`;
    
    setEditingForm(prev => ({
      ...prev,
      solutionMethod: prev.solutionMethod ? `${prev.solutionMethod}\n\n${template}` : template
    }));
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
        prerequisiteSkillIds: editingForm.prerequisiteSkillIds || [],
        sampleQuestion: editingForm.sampleQuestion?.contentLatex?.trim() ? {
          questionId: editingForm.sampleQuestion.questionId || null,
          difficultyLevel: parseInt(editingForm.sampleQuestion.difficultyLevel, 10) || 2,
          contentLatex: editingForm.sampleQuestion.contentLatex,
          optionA: editingForm.sampleQuestion.optionA,
          optionB: editingForm.sampleQuestion.optionB,
          optionC: editingForm.sampleQuestion.optionC,
          optionD: editingForm.sampleQuestion.optionD,
          correctOption: editingForm.sampleQuestion.correctOption || 'A',
          explanation: editingForm.sampleQuestion.explanation
        } : null
      };

      const updated = await contentService.updatePattern(editingForm.patternId, payload);
      setEditSuccessMsg('Đã lưu thành công hiệu đính sư phạm vào cơ sở dữ liệu PostgreSQL!');

      // Cập nhật selectedPattern ngay lập tức
      setSelectedPattern(prev => ({
        ...prev,
        name: editingForm.name.trim(),
        weight: `${Math.round(weightVal * 100)}%`,
        theoryRecap: editingForm.theoryRecap,
        solutionMethod: editingForm.solutionMethod,
        videoLesson: editingForm.videoUrl ? {
          title: editingForm.name.trim(),
          teacher: "Ban Chuyên Môn / Giảng Viên",
          duration: `${Math.max(5, Math.round((parseInt(editingForm.durationSeconds, 10) || 0) / 60))} phút`,
          durationSeconds: parseInt(editingForm.durationSeconds, 10) || 0,
          views: "Cơ sở dữ liệu",
          videoUrl: editingForm.videoUrl.trim()
        } : prev?.videoLesson,
        sampleQuestion: editingForm.sampleQuestion?.contentLatex?.trim() ? {
          questionId: editingForm.sampleQuestion.questionId || prev?.sampleQuestion?.questionId || 'Q-SAMPLE',
          content: editingForm.sampleQuestion.contentLatex,
          options: [
            `A. ${editingForm.sampleQuestion.optionA}`,
            `B. ${editingForm.sampleQuestion.optionB}`,
            `C. ${editingForm.sampleQuestion.optionC}`,
            `D. ${editingForm.sampleQuestion.optionD}`
          ],
          correct: (editingForm.sampleQuestion.correctOption || 'A').charCodeAt(0) - 65,
          explanation: editingForm.sampleQuestion.explanation
        } : prev?.sampleQuestion
      }));

      // Đồng bộ ngầm cây tri thức
      fetchCurriculumData(editingForm.patternId);

      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccessMsg('');
      }, 1000);
    } catch (err) {
      console.error('Lỗi khi lưu hiệu đính:', err);
      setEditErrorMsg(err?.response?.data?.message || err.message || 'Không thể lưu thay đổi vào cơ sở dữ liệu.');
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
      alert("Vui lòng nhập tên Dạng bài.");
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
      alert("Đã tạo mới dạng bài thành công vào Cây tri thức!");
    } catch (err) {
      alert('Không thể tạo dạng bài: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSavingCreate(false);
    }
  };

  const handleDeletePattern = async (patternId, patternName) => {
    if (!window.confirm(`Thầy/Cô có chắc chắn muốn xóa Dạng bài "${patternName}" không?\nThao tác này sẽ xóa toàn bộ nội dung lý thuyết, phương pháp giải, video và câu hỏi liên quan khỏi cơ sở dữ liệu.`)) {
      return;
    }
    try {
      await contentService.deleteNode(patternId);
      setIsEditModalOpen(false);
      await fetchCurriculumData();
      alert('Đã xóa dạng bài thành công khỏi cơ sở dữ liệu!');
    } catch (err) {
      alert('Lỗi khi xóa dạng bài: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleImportCurriculum = async () => {
    if (!importJsonText.trim()) {
      alert("Vui lòng dán nội dung JSON cây tri thức.");
      return;
    }
    setImportingCurriculum(true);
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await contentService.importCurriculum(parsed);
      alert(`Nạp cây tri thức thành công!\n- Chương: ${res.chaptersImported}\n- Bài học: ${res.lessonsImported}\n- Dạng bài: ${res.patternsImported}\n- Tài liệu: ${res.materialsImported}\n- Câu hỏi: ${res.questionsImported}`);
      setIsImportModalOpen(false);
      setImportJsonText('');
      await fetchCurriculumData();
    } catch (err) {
      alert('Lỗi nạp dữ liệu tri thức: ' + (err?.response?.data?.message || err.message));
    } finally {
      setImportingCurriculum(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade">
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
      
      {/* 1. HERO BANNER: LỘ TRÌNH PHỔ THÔNG PHÂN CẤP */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 lg:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>LỘ TRÌNH HỌC PHỔ THÔNG PHÂN CẤP 3 TẦNG: CHƯƠNG → BÀI → DẠNG BÀI</span>
            </div>
            
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Dàn Kiến Thức Chuẩn SGK & Phương Pháp Giải Từng Dạng Bài
            </h1>
            
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Mỗi dạng bài được trang bị đầy đủ 4 khối nội dung sư phạm: 
              <strong className="text-cyan-300"> (1) Nền tảng SGK</strong>, 
              <strong className="text-amber-300"> (2) Phương pháp giải riêng biệt & Công thức KaTeX</strong>, 
              <strong className="text-emerald-300"> (3) Video bài giảng & Lời giải mẫu chi tiết</strong>, và 
              <strong className="text-rose-300"> (4) Quiz củng cố thích ứng</strong> tự động gom các dạng bài tiên quyết đang bị hổng (&lt;10%).
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xs text-slate-400 font-semibold">Cấu trúc phân cấp</div>
              <div className="text-xl font-extrabold text-cyan-400">Chương • Bài • Dạng</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <div className="text-xs text-slate-400 font-semibold">Trọng số chuẩn hóa</div>
              <div className="text-xl font-extrabold text-emerald-400">1.200 Điểm</div>
            </div>
          </div>
        </div>

        {/* 4 Core Domains Tabs */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-slate-800/80">
          {domains.map((domain) => {
            const Icon = getDomainIcon(domain.icon);
            const isActive = domain.id === activeDomainId;
            return (
              <button
                key={domain.id}
                onClick={() => setActiveDomainId(domain.id)}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all group ${
                  isActive 
                    ? 'bg-white text-slate-900 shadow-xl scale-[1.02] font-bold' 
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-gradient-to-tr ' + domain.gradient + ' text-white shadow-md' : 'bg-slate-700 text-slate-300 group-hover:text-white'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : 'text-slate-200'}`}>
                    {domain.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
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
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            title="Mở toàn màn hình Studio biên soạn sư phạm, đồ thị minh họa và review học sinh"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Vào Studio Sư Phạm</span>
          </button>

          {/* Nút Nạp Cây SGK từ AI Engine */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Nạp dữ liệu tri thức SGK cấu trúc JSON từ AI Engine"
          >
            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
            <span>Nạp Cây SGK (AI Engine)</span>
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
            <span>CẤU TRÚC PHÂN CẤP BÀI HỌC</span>
            <span className="text-slate-400">{filteredChapters.length} Chương học</span>
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
                    onClick={() => toggleChapter(chap.chapterId)}
                    className="p-4 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer border-b border-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shrink-0">
                        {chap.code?.slice(-2) || "CH"}
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-900 leading-tight">
                          {chap.name}
                        </h3>
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          {chap.lessons?.length || 0} bài học • Trọng số: {Math.round((chap.weight || 0.25) * 100)}%
                        </div>
                      </div>
                    </div>
                    {isChapExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
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
                              onClick={() => toggleLesson(les.lessonId)}
                              className="p-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                <span className="text-xs font-extrabold text-slate-800 truncate">
                                  {les.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenCreatePatternModal(les.lessonId, les.name);
                                  }}
                                  title="Thêm Dạng bài mới vào bài học này"
                                  className="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center gap-1 border border-indigo-200/60 transition-colors"
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
                                  className="px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center gap-1 border border-blue-200/60 transition-colors"
                                >
                                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                                  <span>+ Studio</span>
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
                                            <Edit3 className="w-3 h-3" />
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1.5">
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
                  <h2 className="text-lg lg:text-xl font-black text-slate-900 leading-tight">
                    {selectedPattern.name}
                  </h2>
                </div>

                {/* Layer Actions: Edit & Adaptive Quiz Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <button
                    onClick={() => handleOpenStudio(selectedPattern)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all hover:scale-105 active:scale-95"
                    title="Mở Studio sư phạm toàn diện: đồ thị minh họa, bẫy đề thi, Casio, video timestamps và review học sinh"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Mở Studio Biên Soạn Sư Phạm</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(selectedPattern)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="Mở bảng hiệu đính nhanh nội dung dạng bài"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sửa nhanh</span>
                  </button>

                  <button
                    onClick={() => handleLaunchAdaptiveQuiz(selectedPattern)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all shrink-0"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span>Luyện tập củng cố (5 câu)</span>
                  </button>
                </div>
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
                      onClick={() => alert(`Đang phát video bài giảng chuyên sâu: ${selectedPattern.videoLesson.title}`)}
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
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
              <Compass className="w-10 h-10 text-slate-300 mx-auto animate-bounce" />
              <div className="text-sm font-bold text-slate-600">
                Chọn một Dạng bài ở cây phân cấp bên trái để xem đầy đủ 4 khối nội dung sư phạm.
              </div>
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
              <button 
                onClick={() => setIsQuizModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
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

      {/* 5. MODAL HIỆU ĐÍNH TRI THỨC SƯ PHẠM DÀNH RIÊNG CHO GIẢNG VIÊN (CURATION SUITE) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
            
            {/* Header Modal */}
            <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                    <span>Trung Tâm Hiệu Đính Sư Phạm: {editingForm.name || "Dạng bài"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold">
                      {selectedPattern?.code}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Chỉnh sửa trực tiếp 4 khối nội dung • Lưu vào cơ sở dữ liệu PostgreSQL • Chuẩn SGK GDPT 2018
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAIEnhanceMethod}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 text-xs font-bold transition-colors"
                  title="Tự động chèn khung quy trình giải 3 bước chuẩn của Ban Chuyên Môn"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>AI Gợi ý Mẫu giải</span>
                </button>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveEditTab('theory')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                  activeEditTab === 'theory'
                    ? 'bg-white border-blue-600 text-blue-700 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center text-[10px] font-black">1</span>
                <span>Khối 1: Nền Tảng SGK</span>
              </button>

              <button
                onClick={() => setActiveEditTab('method')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                  activeEditTab === 'method'
                    ? 'bg-white border-amber-600 text-amber-700 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">2</span>
                <span>Khối 2: Phương Pháp Giải KaTeX</span>
              </button>

              <button
                onClick={() => setActiveEditTab('video')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                  activeEditTab === 'video'
                    ? 'bg-white border-emerald-600 text-emerald-700 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">3</span>
                <span>Khối 3: Video Bài Giảng</span>
              </button>

              <button
                onClick={() => setActiveEditTab('sample')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                  activeEditTab === 'sample'
                    ? 'bg-white border-indigo-600 text-indigo-700 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black">4</span>
                <span>Khối 4: Bài Toán Mẫu & Lời Giải</span>
              </button>

              <button
                onClick={() => setActiveEditTab('settings')}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 shrink-0 ${
                  activeEditTab === 'settings'
                    ? 'bg-white border-slate-700 text-slate-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Cài Đặt Dạng & Trọng Số</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              {/* TAB 1: KHỐI 1 - NỀN TẢNG SGK */}
              {activeEditTab === 'theory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Nội dung Lý thuyết, Khái niệm và Điều kiện Tiên quyết (SGK GDPT 2018)
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Hỗ trợ Markdown và công thức toán học KaTeX kẹp giữa 2 dấu đô la <code>$công_thức$</code>
                      </p>
                    </div>

                    {/* Quick Math Insert Bar */}
                    <div className="hidden sm:flex items-center gap-1 text-[11px] flex-wrap max-w-md justify-end">
                      {MATH_SNIPPETS.slice(0, 7).map((snip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleInsertMathFormula('theoryRecap', snip.code)}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 font-mono text-[10px] border border-slate-200 transition-colors"
                          title={`Chèn ${snip.label}`}
                        >
                          ${snip.code}$
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                        <span>Trình soạn thảo Markdown / KaTeX</span>
                        <span className="text-[10px] text-slate-400 font-mono">{(editingForm.theoryRecap || '').length} ký tự</span>
                      </div>
                      <textarea
                        rows={12}
                        value={editingForm.theoryRecap}
                        onChange={(e) => setEditingForm(prev => ({ ...prev, theoryRecap: e.target.value }))}
                        placeholder="Nhập kiến thức nền tảng SGK: định nghĩa, điều kiện xác định, định lý cốt lõi..."
                        className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-cyan-800 flex items-center justify-between">
                        <span>Xem trước kết quả trực tiếp (Live KaTeX Preview)</span>
                        <span className="text-[10px] text-emerald-600 font-bold">Hiển thị cho học sinh</span>
                      </div>
                      <div className="p-4 rounded-2xl border border-cyan-200 bg-cyan-50/40 min-h-[260px] max-h-[300px] overflow-y-auto text-xs leading-relaxed text-slate-800">
                        <MathText text={editingForm.theoryRecap || "*(Nội dung xem trước sẽ hiển thị ở đây)*"} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: KHỐI 2 - PHƯƠNG PHÁP GIẢI KATEX TỪNG BƯỚC */}
              {activeEditTab === 'method' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Quy Trình & Phương Pháp Giải Chuyên Biệt Từng Bước
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Giúp học sinh định hình sơ đồ tư duy: Bước 1 (TXĐ) → Bước 2 (Đạo hàm/Biến đổi) → Bước 3 (BBT/Kết luận)
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleAIEnhanceMethod}
                        className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-300 transition-colors shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Chèn mẫu 3 bước</span>
                      </button>
                    </div>
                  </div>

                  {/* Math chips */}
                  <div className="flex items-center gap-1.5 text-[11px] flex-wrap pb-1">
                    <span className="text-slate-400 font-medium text-[10px]">Chèn nhanh:</span>
                    {MATH_SNIPPETS.map((snip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertMathFormula('solutionMethod', snip.code)}
                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 font-mono text-[10px] border border-slate-200 transition-colors"
                      >
                        ${snip.code}$
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                        <span>Quy trình các bước (Markdown / KaTeX)</span>
                        <span className="text-[10px] text-slate-400 font-mono">{(editingForm.solutionMethod || '').length} ký tự</span>
                      </div>
                      <textarea
                        rows={12}
                        value={editingForm.solutionMethod}
                        onChange={(e) => setEditingForm(prev => ({ ...prev, solutionMethod: e.target.value }))}
                        placeholder="Nhập quy trình giải: **Bước 1:** ..., **Bước 2:** ..., **Bước 3:** ..."
                        className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-amber-800 flex items-center justify-between">
                        <span>Xem trước kết quả trực tiếp (Live KaTeX Preview)</span>
                        <span className="text-[10px] text-amber-700 font-bold">Khối 2</span>
                      </div>
                      <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 min-h-[260px] max-h-[300px] overflow-y-auto text-xs leading-relaxed text-slate-800">
                        <MathText text={editingForm.solutionMethod || "*(Nội dung phương pháp giải sẽ hiển thị ở đây)*"} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: KHỐI 3 - VIDEO BÀI GIẢNG */}
              {activeEditTab === 'video' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Đường dẫn Video bài giảng (YouTube, Vimeo, Cloudflare hoặc MP4)
                      </label>
                      <input
                        type="text"
                        value={editingForm.videoUrl || ''}
                        onChange={(e) => setEditingForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="Ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Thời lượng dự kiến (Giây)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="60"
                        value={editingForm.durationSeconds}
                        onChange={(e) => setEditingForm(prev => ({ ...prev, durationSeconds: e.target.value }))}
                        placeholder="600 (tức 10 phút)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Video Live Player Preview */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Kiểm tra phát video trực tiếp (Video Player Test):</span>
                      <span className="text-[11px] text-emerald-600 font-bold">
                        {Math.max(1, Math.round((parseInt(editingForm.durationSeconds, 10) || 0) / 60))} phút
                      </span>
                    </div>

                    {editingForm.videoUrl ? (
                      <div className="aspect-video w-full max-w-xl mx-auto rounded-2xl overflow-hidden border border-slate-300 bg-slate-950 shadow-md flex items-center justify-center">
                        {editingForm.videoUrl.includes('youtube.com') || editingForm.videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={getEmbedVideoUrl(editingForm.videoUrl)}
                            title="Video bài giảng xem trước"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                            <PlayCircle className="w-10 h-10 mx-auto text-emerald-500" />
                            <div>Đường dẫn video ngoài YouTube: <strong>{editingForm.videoUrl}</strong></div>
                            <div className="text-[11px] text-slate-500">Video sẽ được phát bằng trình phát tùy chỉnh của hệ thống trên client.</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-xs space-y-1">
                        <PlayCircle className="w-8 h-8 mx-auto text-slate-300" />
                        <div>Chưa có đường dẫn video bài giảng cho dạng bài này.</div>
                        <div className="text-[11px] text-slate-400">Dán link YouTube ở trên để kích hoạt xem trước.</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: KHỐI 4 - BÀI TOÁN MẪU & MINH HỌA */}
              {activeEditTab === 'sample' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Nội dung câu hỏi mẫu minh họa (Hỗ trợ KaTeX)
                    </label>
                    <textarea
                      rows={3}
                      value={editingForm.sampleQuestion?.contentLatex || ''}
                      onChange={(e) => setEditingForm(prev => ({
                        ...prev,
                        sampleQuestion: { ...prev.sampleQuestion, contentLatex: e.target.value }
                      }))}
                      placeholder="Ví dụ: Tìm số điểm cực trị của hàm số $y = x^3 - 3x^2 + 2$..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50"
                    />
                  </div>

                  {/* 4 Options Grid */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>4 Phương án trắc nghiệm (Chọn đáp án đúng bằng radio button):</span>
                      <span className="text-indigo-600 text-[11px] font-bold">
                        Đáp án đúng: {editingForm.sampleQuestion?.correctOption || 'A'}
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map((optKey) => {
                        const fieldName = `option${optKey}`;
                        const isCorrect = editingForm.sampleQuestion?.correctOption === optKey;
                        return (
                          <div 
                            key={optKey}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-colors ${
                              isCorrect ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400' : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name="correctOptionRadio"
                              checked={isCorrect}
                              onChange={() => setEditingForm(prev => ({
                                ...prev,
                                sampleQuestion: { ...prev.sampleQuestion, correctOption: optKey }
                              }))}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                            />
                            <span className="font-black text-xs text-slate-700 shrink-0">{optKey}.</span>
                            <input
                              type="text"
                              value={editingForm.sampleQuestion?.[fieldName] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditingForm(prev => ({
                                  ...prev,
                                  sampleQuestion: { ...prev.sampleQuestion, [fieldName]: val }
                                }));
                              }}
                              placeholder={`Nội dung phương án ${optKey}...`}
                              className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Explanation */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Lời giải chi tiết theo các bước của Dạng bài (KaTeX)
                    </label>
                    <textarea
                      rows={4}
                      value={editingForm.sampleQuestion?.explanation || ''}
                      onChange={(e) => setEditingForm(prev => ({
                        ...prev,
                        sampleQuestion: { ...prev.sampleQuestion, explanation: e.target.value }
                      }))}
                      placeholder="Trình bày lời giải chi tiết theo từng bước..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: CÀI ĐẶT DẠNG & TRỌNG SỐ */}
              {activeEditTab === 'settings' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Tên Dạng bài
                      </label>
                      <input
                        type="text"
                        value={editingForm.name}
                        onChange={(e) => setEditingForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Trọng số năng lực (%)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={editingForm.weight}
                        onChange={(e) => setEditingForm(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 mt-6">
                    <div className="text-xs font-extrabold text-rose-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>VÙNG THAO TÁC NGUY HIỂM (DANGER ZONE)</span>
                    </div>
                    <p className="text-[11px] text-rose-800 font-medium">
                      Xóa dạng bài này sẽ đồng thời xóa toàn bộ tài liệu lý thuyết, video liên kết và các câu hỏi thuộc dạng bài này trong cơ sở dữ liệu.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeletePattern(editingForm.patternId, editingForm.name)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa Vĩnh Viễn Dạng Bài Này</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
              <div>
                {editSuccessMsg && (
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade">
                    <CheckCircle className="w-4 h-4" />
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
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white transition-colors"
                >
                  Hủy bỏ
                </button>

                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={handleSaveEdit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {savingEdit ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang lưu vào PostgreSQL...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Lưu Thay Đổi (Cập nhật DB)</span>
                    </>
                  )}
                </button>
              </div>
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

      {/* 7. MODAL NẠP CÂY TRI THỨC PHÂN CẤP TỪ AI ENGINE (DYNAMIC INGESTION) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 text-cyan-400 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold">Nạp Cây Tri Thức SGK (AI Engine Ingestion)</h3>
                  <p className="text-[11px] text-blue-200">Kênh nạp dữ liệu phân cấp động chuẩn GDPT 2018 vào Database</p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Dán chuỗi JSON đã được AI Engine (RAG/OCR) trích xuất từ SGK. Hệ thống sẽ tự động cập nhật phân cấp 
                <strong> Miền → Chương → Bài học → Dạng bài → Tài liệu & Câu hỏi</strong> vào PostgreSQL. Giảng viên sau đó có thể dùng nút <strong>"Hiệu đính Sư phạm"</strong> để chỉnh sửa hoàn thiện.
              </p>

              <textarea
                rows={10}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{ "domainId": "6f3765db-943e-4810-bf74-d6a8bdc215da", "domainName": "Toán học & Tư duy định lượng", "chapters": [...] }'
                className="w-full p-3.5 rounded-2xl border border-slate-300 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900"
              />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
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
                className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
              >
                Chèn JSON Mẫu
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-white"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={importingCurriculum}
                  onClick={handleImportCurriculum}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {importingCurriculum ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                  <span>Nạp Tri Thức Vào Hệ Thống</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
