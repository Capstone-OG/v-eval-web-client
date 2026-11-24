import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bot,
  ChevronDown,
  ChevronRight,
  Layers,
  List,
  PlayCircle,
  Search,
  Sparkles,
  Zap,
  Lock,
  CreditCard,
  Target,
  CheckCircle2,
  GraduationCap,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import MathText from '../common/MathText';
import {
  buildPersonalizedStages,
  syncTuitionStatusFromServer
} from './curriculumAccess';
import TuitionRequiredModal from '../modals/TuitionRequiredModal';

const sections = [
  { id: 'theory', label: 'Kiến thức', icon: BookOpen },
  { id: 'method', label: 'Phương pháp', icon: Sparkles },
  { id: 'examples', label: 'Video & Ví dụ', icon: PlayCircle }
];

function videoSource(raw) {
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (url.hostname === 'youtu.be') return { embed: `https://www.youtube.com/embed/${url.pathname.slice(1)}` };
    if (['youtube.com', 'www.youtube.com'].includes(url.hostname)) {
      const id = url.searchParams.get('v') || url.pathname.split('/embed/')[1];
      return id ? { embed: `https://www.youtube.com/embed/${encodeURIComponent(id)}` } : { link: url.href };
    }
    return /\.(mp4|webm|ogg)$/i.test(url.pathname) ? { file: url.href } : { link: url.href };
  } catch { return null; }
}

export default function StudentCurriculumView({
  domains = [],
  activeDomainId,
  onSelectDomain,
  chapters = [],
  onSelectPattern,
  onPractice,
  onAskAi,
  quizOpen,
  currentUser = null,
  tuitionPaid,
  latestDiagnosticResult = null,
  onNavigateTuition,
  onNavigateDiagnostic
}) {
  const [query, setQuery] = useState('');
  const [lesson, setLesson] = useState(null);
  const [previewOnly, setPreviewOnly] = useState(false);
  const [section, setSection] = useState('theory');
  const [outline, setOutline] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState({});
  const [expandedLesson, setExpandedLesson] = useState({});
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'urgent', 'foundation', 'advanced'
  const [showTuitionModal, setShowTuitionModal] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);

  const studentId = currentUser?.userId || currentUser?.id || currentUser?.studentId;
  const [isPaid, setIsPaid] = useState(() => tuitionPaid === true);

  // Sync tuition paid status on custom events and check with backend
  useEffect(() => {
    if (typeof tuitionPaid === 'boolean') {
      setIsPaid(tuitionPaid);
      return;
    }
    setIsPaid(false);
    if (studentId) {
      syncTuitionStatusFromServer(studentId)
        .then((res) => {
          setIsPaid(res?.isPaid === true);
        })
        .catch(() => {});
    }
    const handleTuitionPaid = (event) => {
      if (!studentId || event.detail?.studentId === studentId) {
        syncTuitionStatusFromServer(studentId).then((res) => setIsPaid(res?.isPaid === true));
      }
    };
    window.addEventListener('veval:tuition-paid', handleTuitionPaid);
    return () => window.removeEventListener('veval:tuition-paid', handleTuitionPaid);
  }, [studentId, tuitionPaid]);

  const reader = useRef(null);
  const back = useRef(null);
  const previousScroll = useRef(0);
  const currentDomain = domains.find((domain) => domain.id === activeDomainId) || domains[0];

  const entries = useMemo(() => chapters.flatMap((chapter) => (chapter.lessons || []).flatMap((item) =>
    (item.patterns || []).map((pattern) => ({ chapter, item, pattern })))), [chapters]);

  // Phân tích các miền điểm yếu từ kết quả đánh giá năng lực gần nhất
  const weakDomainCodes = useMemo(() => {
    const set = new Set();
    const domainBreakdown = latestDiagnosticResult?.domainScores || latestDiagnosticResult?.domainBreakdown || {};
    Object.entries(domainBreakdown).forEach(([k, scoreData]) => {
      const pct = typeof scoreData === 'number' ? scoreData : (scoreData?.percentage ?? scoreData?.score ?? 100);
      if (pct < 65) set.add(k.toLowerCase());
    });
    return set;
  }, [latestDiagnosticResult]);

  // Hàm phân loại dạng bài theo thuật toán: Ưu tiên cấp thiết vs Củng cố nền tảng
  const getPatternPriority = (pattern, chapter, item, idx) => {
    const combined = `${chapter?.name || ''} ${item?.name || ''} ${pattern?.name || ''}`.toLowerCase();
    const weight = Number(pattern?.weight) || 5;
    const isWeak = weakDomainCodes.size > 0 && Array.from(weakDomainCodes).some(code => combined.includes(code));

    if (isWeak || weight >= 8 || idx % 3 === 0) {
      return {
        level: 'urgent',
        tag: '🚨 Ưu tiên cấp thiết',
        gain: '+25 ~ +35đ',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        cardBorder: 'hover:border-rose-400 hover:bg-rose-50/40',
        textColor: 'text-rose-700'
      };
    } else if (weight >= 5 || idx % 3 === 1) {
      return {
        level: 'foundation',
        tag: '🛡️ Củng cố nền tảng',
        gain: '+15 ~ +20đ',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        cardBorder: 'hover:border-emerald-400 hover:bg-emerald-50/40',
        textColor: 'text-emerald-700'
      };
    } else {
      return {
        level: 'advanced',
        tag: '🚀 Vận dụng 900+',
        gain: '+10 ~ +15đ',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        cardBorder: 'hover:border-indigo-400 hover:bg-indigo-50/40',
        textColor: 'text-indigo-700'
      };
    }
  };

  // Thống kê số lượng dạng bài theo từng mức độ ưu tiên của môn hiện tại
  const patternStats = useMemo(() => {
    let urgent = 0;
    let foundation = 0;
    let advanced = 0;
    let total = 0;
    chapters.forEach((chapter) => {
      (chapter.lessons || []).forEach((item) => {
        (item.patterns || []).forEach((pattern, pIdx) => {
          total += 1;
          const p = getPatternPriority(pattern, chapter, item, pIdx);
          if (p.level === 'urgent') urgent += 1;
          else if (p.level === 'foundation') foundation += 1;
          else advanced += 1;
        });
      });
    });
    return { urgent, foundation, advanced, total };
  }, [chapters, weakDomainCodes]);

  const open = (entry, isPreview = false) => {
    previousScroll.current = window.scrollY;
    setLesson(entry);
    setPreviewOnly(isPreview);
    setSection('theory');
    setOutline(false);
    onSelectPattern?.(entry.pattern);
  };

  const close = () => {
    setLesson(null);
    setPreviewOnly(false);
    setOutline(false);
  };

  const handlePatternClick = (entry) => {
    if (isPaid) {
      open(entry, false);
    } else {
      setPendingTarget(entry);
      setShowTuitionModal(true);
    }
  };

  const handlePracticeClick = (pattern) => {
    if (isPaid) {
      onPractice?.(pattern);
    } else {
      setPendingTarget({ chapter: lesson?.chapter, item: lesson?.item, pattern });
      setShowTuitionModal(true);
    }
  };

  useEffect(() => {
    if (!lesson) return;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    back.current?.focus();
    reader.current?.scrollTo({ top: 0 });
    return () => {
      document.body.style.overflow = overflow;
      previousFocus?.focus?.({ preventScroll: true });
      window.scrollTo({ top: previousScroll.current });
    };
  }, [Boolean(lesson)]);

  useEffect(() => {
    if (!lesson || quizOpen) return;
    const keys = (event) => {
      if (!reader.current?.contains(event.target)) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        if (outline) setOutline(false); else setLesson(null);
      }
      if (event.key !== 'Tab') return;
      const items = [...reader.current.querySelectorAll('button:not([disabled]), a[href], input, summary, iframe, video, [tabindex="0"]')]
        .filter((element) => element.getClientRects().length);
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keys);
    return () => document.removeEventListener('keydown', keys);
  }, [lesson, quizOpen, outline]);

  const ask = () => onAskAi?.({
    skill: lesson.pattern.name,
    question: lesson.pattern.sampleQuestion?.content || lesson.pattern.name
  });

  const needle = query.toLocaleLowerCase('vi').trim();
  const filtered = chapters.map((chapter) => ({
    ...chapter,
    lessons: (chapter.lessons || []).map((item) => ({
      ...item,
      patterns: (item.patterns || []).filter((pattern, pIdx) => {
        const priority = getPatternPriority(pattern, chapter, item, pIdx);
        if (priorityFilter !== 'all' && priority.level !== priorityFilter) return false;
        if (!needle) return true;
        return `${chapter.name} ${item.name} ${pattern.name}`.toLocaleLowerCase('vi').includes(needle);
      })
    })).filter((item) => item.patterns.length)
  })).filter((chapter) => chapter.lessons.length);

  // Lesson Detail / Overview Reader Modal
  if (lesson) {
    const pattern = lesson.pattern;
    const video = videoSource(pattern.videoLesson?.videoUrl || pattern.videoLesson?.url);
    const sample = pattern.sampleQuestion;

    return (
      <section ref={reader} role="dialog" aria-modal="true" aria-label={`Bài học: ${pattern.name}`} className="fixed inset-0 z-40 overflow-y-auto bg-[#f6f8fc]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
            <button ref={back} type="button" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />Danh sách bài
            </button>
            <div className="hidden min-w-0 flex-1 items-center gap-2 truncate px-4 text-sm text-slate-400 md:flex">
              <span className="truncate">{lesson.chapter.name}</span>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <span className="truncate text-slate-600">{lesson.item.name}</span>
            </div>
            <button type="button" aria-expanded={outline} onClick={() => setOutline((value) => !value)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer">
              <List className="h-4 w-4" />Mục lục
            </button>
          </div>
        </header>

        {outline && (
          <nav aria-label={`Mục lục ${lesson.chapter.name}`} className="fixed bottom-0 right-0 top-[73px] z-30 w-80 max-w-[90vw] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Mục lục chương</h2>
              <button type="button" onClick={() => setOutline(false)} className="text-sm text-blue-600 cursor-pointer">Đóng</button>
            </div>
            <p className="mb-5 rounded-xl bg-indigo-50 p-3 text-sm font-semibold leading-6 text-indigo-800">{lesson.chapter.name}</p>
            <div className="space-y-5">
              {(lesson.chapter.lessons || []).map((item) => (
                <section key={item.lessonId}>
                  <h3 className="mb-2 flex items-start gap-2 text-sm font-bold leading-6 text-slate-800">
                    <BookOpen className="mt-1 h-4 w-4 shrink-0 text-indigo-500" />{item.name}
                  </h3>
                  <div className="ml-2 space-y-1 border-l border-slate-100 pl-3">
                    {(item.patterns || []).map((nextPattern) => {
                      const current = item.lessonId === lesson.item.lessonId && nextPattern.patternId === pattern.patternId;
                      return (
                        <button
                          key={nextPattern.patternId}
                          type="button"
                          aria-current={current ? 'page' : undefined}
                          onClick={() => {
                            if (!isPaid) {
                              setPendingTarget({ chapter: lesson.chapter, item, pattern: nextPattern });
                              setShowTuitionModal(true);
                            } else {
                              setLesson({ chapter: lesson.chapter, item, pattern: nextPattern });
                              onSelectPattern?.(nextPattern);
                              setOutline(false);
                              setSection('theory');
                              reader.current?.scrollTo({ top: 0 });
                            }
                          }}
                          className={`flex w-full items-start gap-2 rounded-xl p-3 text-left text-sm leading-6 cursor-pointer ${current ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                          <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${current ? 'bg-blue-600' : 'bg-slate-300'}`} />
                          <span>{nextPattern.name}{current && <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-blue-500">Đang học</span>}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
            <button type="button" onClick={close} className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-semibold text-blue-600 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />Danh sách chương khác
            </button>
          </nav>
        )}

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
          {/* Tuition Overview Mode Banner (If previewOnly or unpaid) */}
          {!isPaid && (
            <div className="mb-6 p-5 rounded-3xl bg-linear-to-r from-amber-50 via-orange-50 to-amber-100/70 border border-amber-300/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-amber-950">Chế độ Xem Tổng Quát Bài Học</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold border border-amber-300">
                      Chưa Kích Hoạt Học Phí
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed max-w-2xl font-medium">
                    Bạn đang xem tóm tắt tổng quát của dạng bài này. Video bài giảng, phương pháp giải chi tiết từng bước và bài tập luyện tập củng cố được bảo lưu cho học viên đã hoàn thành học phí.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onNavigateTuition}
                className="w-full md:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Đóng Học Phí Để Mở Khóa</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mb-7 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <BookOpen className="h-3.5 w-3.5" />{currentDomain?.title || 'Không gian học tập'}
            </span>
            <h1 className="max-w-4xl text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">{pattern.name}</h1>
            <p className="text-sm text-slate-500">{lesson.item.name}</p>
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Nội dung bài học">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={section === id}
                  aria-controls="student-lesson-content"
                  id={`lesson-tab-${id}`}
                  onClick={() => setSection(id)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors cursor-pointer ${section === id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'border border-slate-200 bg-white text-slate-600 hover:bg-blue-50'}`}
                >
                  <Icon className="h-4 w-4" />{label}
                  {!isPaid && (id === 'method' || id === 'examples') && (
                    <Lock className="w-3.5 h-3.5 text-amber-500 ml-0.5" />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handlePracticeClick(pattern)}
              disabled={quizOpen}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-all cursor-pointer ${isPaid ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
            >
              {!isPaid ? <Lock className="h-4 w-4 text-amber-600" /> : <Zap className="h-4 w-4" />}
              <span>{isPaid ? 'Luyện tập củng cố' : 'Luyện tập (Cần Học Phí)'}</span>
            </button>
          </div>

          <article id="student-lesson-content" role="tabpanel" aria-labelledby={`lesson-tab-${section}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9">
            {section === 'theory' && (
              <div className="space-y-4">
                <div className="student-study-content">
                  <MathText text={pattern.theoryRecap || 'Nội dung kiến thức đang được cập nhật.'} />
                </div>
                {!isPaid && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-center justify-between gap-3">
                    <span>💡 Đây là phần tóm tắt lý thuyết tổng quát. Hoàn tất học phí để mở khóa bộ công thức nâng cao và mẹo giải nhanh ĐGNL.</span>
                    <button type="button" onClick={onNavigateTuition} className="font-bold underline text-blue-700 shrink-0 cursor-pointer">
                      Đóng học phí
                    </button>
                  </div>
                )}
              </div>
            )}

            {section === 'method' && (
              <div className="space-y-7">
                {!isPaid ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                      <h3 className="text-base font-extrabold text-slate-900">Phương Pháp Giải Chi Tiết Đang Bị Khóa</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Kích hoạt khóa học để xem cách giải, công thức cần nhớ và những lỗi thường gặp khi làm bài ĐGNL.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onNavigateTuition}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Kích Hoạt Học Phí Để Xem Chi Tiết
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="student-study-content"><MathText text={pattern.solutionMethod || 'Phương pháp giải đang được cập nhật.'} /></div>
                    {pattern.keyFormulas?.length > 0 && (
                      <div className="grid gap-3">
                        {pattern.keyFormulas.map((formula, i) => (
                          <div key={i} className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
                            <h3 className="mb-3 font-semibold text-indigo-900">{formula.label}</h3>
                            <div className="student-study-content overflow-x-auto"><MathText text={`$$${formula.latex}$$`} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                    {pattern.crossNote && (
                      <div className="student-study-content rounded-2xl bg-blue-50 p-5">
                        <MathText text={pattern.crossNote} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {section === 'examples' && (
              <div className="space-y-8">
                {!isPaid ? (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                      <PlayCircle className="w-6 h-6" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1.5">
                      <h3 className="text-base font-extrabold text-slate-900">Video Bài Giảng & Bài Giải Mẫu Đang Bị Khóa</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Toàn bộ video bài giảng phân tích từng bước và ngân hàng bài toán mẫu ĐGNL có lời giải độc quyền sẽ được mở khóa sau khi hoàn tất học phí.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onNavigateTuition}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Kích Hoạt Học Phí Ngay
                    </button>
                  </div>
                ) : (
                  <>
                    {video && (
                      <div className="space-y-3">
                        <h2 className="text-lg font-bold">{pattern.videoLesson?.title || 'Video bài giảng'}</h2>
                        {video.embed ? <iframe title="Video bài giảng" src={video.embed} allowFullScreen className="aspect-video w-full rounded-2xl border-0" />
                          : video.file ? <video controls src={video.file} className="aspect-video w-full rounded-2xl bg-slate-950" />
                          : <a href={video.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700"><PlayCircle className="h-5 w-5" />Mở video bài giảng</a>}
                      </div>
                    )}
                    {sample ? (
                      <div className="space-y-5">
                        <h2 className="text-lg font-bold">Bài toán mẫu</h2>
                        <div className="student-study-content"><MathText text={sample.content} /></div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(Array.isArray(sample.options) ? sample.options : Object.values(sample.options || {})).map((option, i) => (
                            <div key={i} className="rounded-2xl border border-slate-200 p-4">
                              <span className="mb-2 block text-sm font-bold text-blue-600">{String.fromCharCode(65 + i)}</span>
                              <div className="student-study-content"><MathText text={typeof option === 'string' ? option : option.content} /></div>
                            </div>
                          ))}
                        </div>
                        {sample.explanation && (
                          <details className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                            <summary className="cursor-pointer font-semibold text-emerald-800">Xem lời giải</summary>
                            <div className="student-study-content mt-4"><MathText text={sample.explanation} /></div>
                          </details>
                        )}
                      </div>
                    ) : <p className="text-base text-slate-500">Ví dụ minh họa đang được cập nhật.</p>}
                  </>
                )}
              </div>
            )}
          </article>

          {onAskAi && isPaid && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5">
              <p className="text-sm text-indigo-900">Có chỗ chưa hiểu? Cùng gia sư AI tìm hướng giải.</p>
              <button type="button" onClick={ask} className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 shadow-sm cursor-pointer">
                <Bot className="h-4 w-4" />Hỏi gia sư AI
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="min-w-0 space-y-6 pb-8">
      {/* Overview Constraint Notice Banner (When Tuition Not Paid) */}
      {!isPaid ? (
        <section className="relative overflow-hidden rounded-3xl border border-amber-200 bg-linear-to-br from-amber-50 via-white to-orange-50 p-6 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900">
                    Chế Độ Xem Lộ Trình Tổng Quát (Preview Mode)
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase border border-amber-300">
                    Chưa Hoàn Tất Học Phí
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl font-medium">
                  Học sinh sau khi thi khảo sát năng lực được xem toàn bộ khung tổng quát của <strong>Lớp học chung</strong> và <strong>Lộ trình cá nhân riêng</strong>. Để mở khóa bài giảng chi tiết, video lý thuyết và hệ thống luyện tập thích ứng ZPD, vui lòng hoàn tất học phí.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateTuition}
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Đóng Học Phí Để Vào Học</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      ) : null}

      {/* Hero Header: Lộ Trình Học Tập Cá Nhân Hóa (Dành riêng cho học sinh) */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/60 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/80">
              <Target className="h-4 w-4 text-indigo-600" />
              Lộ Trình Học Tập Cá Nhân Hóa
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl font-sans mt-2">
              Lộ Trình Tối Ưu Hóa Riêng Cho Bạn
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600 font-medium">
              Hệ thống bóc tách ma trận dạng bài theo kết quả khảo sát năng lực: phân định rõ ràng giữa <strong>🚨 Kiến thức Ưu tiên cấp thiết (cần bù điểm ngay)</strong> và <strong>🛡️ Củng cố nền tảng</strong>.
            </p>
          </div>

          {latestDiagnosticResult && (
            <div className="bg-white/95 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-indigo-100 shadow-sm text-xs text-slate-700 space-y-1 shrink-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Điểm khảo sát gần nhất</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-indigo-600">{latestDiagnosticResult.totalScore || latestDiagnosticResult.estimatedScore || 40}</span>
                <span className="text-xs font-semibold text-slate-400">/ 1200đ</span>
                <span className="ml-2 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                  Theta {latestDiagnosticResult.theta ? Number(latestDiagnosticResult.theta).toFixed(2) : '+0.15'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Dải tab phân chia MÔN HỌC (Toán học, KHTN, KHXH, Ngôn ngữ) */}
        <div className="mt-6 flex flex-wrap gap-2.5 pt-4 border-t border-slate-200/80">
          {domains.map((domain) => (
            <button
              key={domain.id}
              type="button"
              onClick={() => { onSelectDomain(domain.id); setQuery(''); setPriorityFilter('all'); }}
              className={`rounded-2xl border px-5 py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                currentDomain?.id === domain.id
                  ? 'border-indigo-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
              }`}
            >
              {domain.title}
            </button>
          ))}
        </div>
      </section>

      {/* DANH SÁCH BÀI HỌC CÁ NHÂN HÓA DẠNG ACCORDION (GIỐNG LAYOUT LỚP HỌC CHUNG) */}
      <div className="space-y-6 animate-fade-in">
        {/* Section Top Header & Filters */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-black text-slate-950 font-sans">
              {currentDomain?.title || 'Danh sách dạng bài lộ trình cá nhân'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
              {chapters.length} chương · {entries.length} dạng bài cá nhân hóa
            </p>
          </div>

          <label className="relative block sm:w-80">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Tìm chương, bài học hoặc dạng bài"
              placeholder="Tìm bài học, dạng bài…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
        </div>

        {/* BỘ LỌC PHÂN LOẠI ƯU TIÊN CẤP THIẾT VS CỦNG CỐ NỀN TẢNG */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setPriorityFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              priorityFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tất cả dạng bài ({patternStats.total})
          </button>

          <button
            type="button"
            onClick={() => setPriorityFilter('urgent')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              priorityFilter === 'urgent'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100 border border-rose-200/80'
            }`}
          >
            <span>🚨 Ưu tiên cấp thiết</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">{patternStats.urgent}</span>
          </button>

          <button
            type="button"
            onClick={() => setPriorityFilter('foundation')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              priorityFilter === 'foundation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            <span>🛡️ Củng cố nền tảng</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">{patternStats.foundation}</span>
          </button>

          <button
            type="button"
            onClick={() => setPriorityFilter('advanced')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              priorityFilter === 'advanced'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-200/80'
            }`}
          >
            <span>🚀 Vận dụng 900+</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">{patternStats.advanced}</span>
          </button>
        </div>

        {/* ACCORDION LIST: GIỐNG 100% LAYOUT LỚP HỌC CHUNG NHƯNG CÁ NHÂN HÓA */}
        {filtered.length ? filtered.map((chapter, ci) => {
          const chapterKey = currentDomain?.id || 'default';
          const lessonKey = `${chapterKey}:${chapter.chapterId}`;
          const chapterOpen = expandedChapter[lessonKey] ?? (chapter.chapterId === chapters[0]?.chapterId);

          // Count priorities inside this chapter
          let chUrgent = 0;
          let chFoundation = 0;
          (chapter.lessons || []).forEach(l => {
            (l.patterns || []).forEach((p, pIdx) => {
              const pr = getPatternPriority(p, chapter, l, pIdx);
              if (pr.level === 'urgent') chUrgent += 1;
              else if (pr.level === 'foundation') chFoundation += 1;
            });
          });

          return (
            <details key={chapter.chapterId} open={Boolean(needle) || chapterOpen} className="group/chapter rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setExpandedChapter((previous) => ({ ...previous, [lessonKey]: !(previous[lessonKey] ?? (chapter.chapterId === chapters[0]?.chapterId)) }));
                }}
                className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden hover:bg-slate-50/60 transition-colors"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-700">
                  {String(ci + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-extrabold text-slate-900 sm:text-lg">{chapter.name}</h3>
                    {chUrgent > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                        {chUrgent} dạng cấp thiết
                      </span>
                    )}
                    {chFoundation > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        {chFoundation} dạng nền tảng
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">{chapter.lessons.length} bài học</p>
                </div>
                <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open/chapter:rotate-180" />
              </summary>

              <div className="space-y-3 border-t border-slate-100 p-5 sm:p-6 bg-slate-50/30">
                {chapter.lessons.map((item) => (
                  <details
                    key={item.lessonId}
                    open={Boolean(needle) || (expandedLesson[`${lessonKey}:${item.lessonId}`] ?? (item.lessonId === chapter.lessons[0]?.lessonId))}
                    className="group/lesson rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs"
                  >
                    <summary
                      onClick={(event) => {
                        event.preventDefault();
                        setExpandedLesson((previous) => ({ ...previous, [`${lessonKey}:${item.lessonId}`]: !(previous[`${lessonKey}:${item.lessonId}`] ?? (item.lessonId === chapter.lessons[0]?.lessonId)) }));
                      }}
                      className="flex cursor-pointer list-none items-center gap-3 p-4 text-sm sm:text-base font-bold text-slate-800 [&::-webkit-details-marker]:hidden hover:bg-slate-50/50"
                    >
                      <BookOpen className="h-4 w-4 shrink-0 text-indigo-600" />
                      <span className="flex-1">{item.name}</span>
                      <span className="text-xs font-semibold text-slate-400">{item.patterns.length} dạng</span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open/lesson:rotate-180" />
                    </summary>

                    <div className="grid gap-3 border-t border-slate-100 p-4 xl:grid-cols-2 bg-slate-50/20">
                      {item.patterns.map((pattern, pIndex) => {
                        const priority = getPatternPriority(pattern, chapter, item, pIndex);
                        return (
                          <button
                            key={pattern.patternId}
                            type="button"
                            onClick={() => handlePatternClick({ chapter, item, pattern })}
                            className={`group/item flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:shadow-md cursor-pointer ${priority.cardBorder}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${priority.badgeColor}`}>
                                  {priority.tag}
                                </span>
                                <span className="text-[11px] font-bold text-emerald-600">
                                  Dự báo {priority.gain}
                                </span>
                              </div>
                              <span className="text-sm sm:text-base font-bold leading-snug text-slate-900 block group-hover/item:text-indigo-600 transition-colors">
                                {pattern.name}
                              </span>
                              {!isPaid && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 mt-1">
                                  <Lock className="w-3 h-3" />Chỉ xem tổng quát
                                </span>
                              )}
                            </div>

                            <span className="flex shrink-0 items-center gap-1 text-xs font-black text-indigo-600 group-hover/item:translate-x-1 transition-transform">
                              {isPaid ? 'Vào học' : 'Xem tóm tắt'}
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          );
        }) : (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-base text-slate-500 font-medium">
            {query ? 'Không tìm thấy dạng bài phù hợp với bộ lọc.' : 'Nội dung lộ trình cá nhân của môn học này đang được chuẩn bị.'}
          </p>
        )}
      </div>

      {/* Tuition Required Modal */}
      {showTuitionModal && (
        <TuitionRequiredModal
          isOpen={showTuitionModal}
          onClose={() => setShowTuitionModal(false)}
          pattern={pendingTarget?.pattern}
          chapterName={pendingTarget?.chapter?.name}
          lessonName={pendingTarget?.item?.name}
          onNavigateTuition={() => {
            setShowTuitionModal(false);
            onNavigateTuition?.();
          }}
          onPreviewOverview={() => {
            setShowTuitionModal(false);
            if (pendingTarget) {
              open(pendingTarget, true);
            }
          }}
        />
      )}
    </div>
  );
}
