import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Bot, ChevronDown, ChevronRight, Layers, List, PlayCircle, Search, Sparkles, Zap } from 'lucide-react';
import MathText from '../common/MathText';

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

export default function StudentCurriculumView({ domains, activeDomainId, onSelectDomain, chapters,
  onSelectPattern, onPractice, onAskAi, quizOpen }) {
  const [query, setQuery] = useState('');
  const [lesson, setLesson] = useState(null);
  const [section, setSection] = useState('theory');
  const [outline, setOutline] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState({});
  const [expandedLesson, setExpandedLesson] = useState({});
  const reader = useRef(null);
  const back = useRef(null);
  const previousScroll = useRef(0);
  const currentDomain = domains.find((domain) => domain.id === activeDomainId) || domains[0];
  const entries = chapters.flatMap((chapter) => (chapter.lessons || []).flatMap((item) =>
    (item.patterns || []).map((pattern) => ({ chapter, item, pattern }))));
  const open = (entry) => {
    previousScroll.current = window.scrollY;
    setLesson(entry); setSection('theory'); setOutline(false);
    onSelectPattern(entry.pattern);
  };
  const close = () => { setLesson(null); setOutline(false); };

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
      // Do not consume shortcuts from the existing quiz or AI dialogs.
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

  const ask = () => onAskAi?.({ skill: lesson.pattern.name,
    question: lesson.pattern.sampleQuestion?.content || lesson.pattern.name });
  const needle = query.toLocaleLowerCase('vi').trim();
  const filtered = chapters.map((chapter) => ({ ...chapter, lessons: (chapter.lessons || []).map((item) => ({ ...item,
    patterns: (item.patterns || []).filter((pattern) => !needle || `${chapter.name} ${item.name} ${pattern.name}`.toLocaleLowerCase('vi').includes(needle))
  })).filter((item) => item.patterns.length) })).filter((chapter) => chapter.lessons.length);

  if (lesson) {
    const pattern = lesson.pattern;
    const video = videoSource(pattern.videoLesson?.videoUrl || pattern.videoLesson?.url);
    const sample = pattern.sampleQuestion;
    return <section ref={reader} role="dialog" aria-modal="true" aria-label={`Bài học: ${pattern.name}`} className="fixed inset-0 z-40 overflow-y-auto bg-[#f6f8fc]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <button ref={back} type="button" onClick={close} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"><ArrowLeft className="h-4 w-4" />Danh sách bài</button>
          <div className="hidden min-w-0 flex-1 items-center gap-2 truncate px-4 text-sm text-slate-400 md:flex"><span className="truncate">{lesson.chapter.name}</span><ChevronRight className="h-3 w-3 shrink-0" /><span className="truncate text-slate-600">{lesson.item.name}</span></div>
          <button type="button" aria-expanded={outline} onClick={() => setOutline((value) => !value)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><List className="h-4 w-4" />Mục lục</button>
        </div>
      </header>
      {outline && <nav aria-label={`Mục lục ${lesson.chapter.name}`} className="fixed bottom-0 right-0 top-[73px] z-30 w-80 max-w-[90vw] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Mục lục chương</h2><button type="button" onClick={() => setOutline(false)} className="text-sm text-blue-600">Đóng</button></div>
        <p className="mb-5 rounded-xl bg-indigo-50 p-3 text-sm font-semibold leading-6 text-indigo-800">{lesson.chapter.name}</p>
        <div className="space-y-5">
          {(lesson.chapter.lessons || []).map((item) => <section key={item.lessonId}>
            <h3 className="mb-2 flex items-start gap-2 text-sm font-bold leading-6 text-slate-800"><BookOpen className="mt-1 h-4 w-4 shrink-0 text-indigo-500" />{item.name}</h3>
            <div className="ml-2 space-y-1 border-l border-slate-100 pl-3">
              {(item.patterns || []).map((nextPattern) => {
                const current = item.lessonId === lesson.item.lessonId && nextPattern.patternId === pattern.patternId;
                return <button key={nextPattern.patternId} type="button" aria-current={current ? 'page' : undefined}
                  onClick={() => { setLesson({ chapter: lesson.chapter, item, pattern: nextPattern }); onSelectPattern(nextPattern); setOutline(false); setSection('theory'); reader.current?.scrollTo({ top: 0 }); }}
                  className={`flex w-full items-start gap-2 rounded-xl p-3 text-left text-sm leading-6 ${current ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <span aria-hidden="true" className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${current ? 'bg-blue-600' : 'bg-slate-300'}`} />
                  <span>{nextPattern.name}{current && <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wide text-blue-500">Đang học</span>}</span>
                </button>;
              })}
            </div>
          </section>)}
        </div>
        <button type="button" onClick={close} className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-semibold text-blue-600"><ArrowLeft className="h-4 w-4" />Danh sách chương khác</button>
      </nav>}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-7 space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"><BookOpen className="h-3.5 w-3.5" />{currentDomain?.title || 'Không gian học tập'}</span>
          <h1 className="max-w-4xl text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">{pattern.name}</h1>
          <p className="text-sm text-slate-500">{lesson.item.name}</p>
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Nội dung bài học">{sections.map(({ id, label, icon: Icon }) => <button key={id} type="button" role="tab" aria-selected={section === id} aria-controls="student-lesson-content" id={`lesson-tab-${id}`} onClick={() => setSection(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${section === id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'border border-slate-200 bg-white text-slate-600 hover:bg-blue-50'}`}><Icon className="h-4 w-4" />{label}</button>)}</div>
          <button type="button" onClick={() => onPractice(pattern)} disabled={quizOpen} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"><Zap className="h-4 w-4" />Luyện tập củng cố</button>
        </div>
        <article id="student-lesson-content" role="tabpanel" aria-labelledby={`lesson-tab-${section}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-9">
          {section === 'theory' && <div className="student-study-content"><MathText text={pattern.theoryRecap || 'Nội dung kiến thức đang được cập nhật.'} /></div>}
          {section === 'method' && <div className="space-y-7">
            <div className="student-study-content"><MathText text={pattern.solutionMethod || 'Phương pháp giải đang được cập nhật.'} /></div>
            {pattern.keyFormulas?.length > 0 && <div className="grid gap-3">{pattern.keyFormulas.map((formula, i) => <div key={i} className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5"><h3 className="mb-3 font-semibold text-indigo-900">{formula.label}</h3><div className="student-study-content overflow-x-auto"><MathText text={`$$${formula.latex}$$`} /></div></div>)}</div>}
            {pattern.crossNote && <div className="student-study-content rounded-2xl bg-blue-50 p-5"><MathText text={pattern.crossNote} /></div>}
          </div>}
          {section === 'examples' && <div className="space-y-8">
            {video && <div className="space-y-3"><h2 className="text-lg font-bold">{pattern.videoLesson?.title || 'Video bài giảng'}</h2>
              {video.embed ? <iframe title="Video bài giảng" src={video.embed} allowFullScreen className="aspect-video w-full rounded-2xl border-0" />
                : video.file ? <video controls src={video.file} className="aspect-video w-full rounded-2xl bg-slate-950" />
                : <a href={video.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-700"><PlayCircle className="h-5 w-5" />Mở video bài giảng</a>}
            </div>}
            {sample ? <div className="space-y-5"><h2 className="text-lg font-bold">Bài toán mẫu</h2><div className="student-study-content"><MathText text={sample.content} /></div>
              <div className="grid gap-3 sm:grid-cols-2">{(Array.isArray(sample.options) ? sample.options : Object.values(sample.options || {})).map((option, i) => <div key={i} className="rounded-2xl border border-slate-200 p-4"><span className="mb-2 block text-sm font-bold text-blue-600">{String.fromCharCode(65 + i)}</span><div className="student-study-content"><MathText text={typeof option === 'string' ? option : option.content} /></div></div>)}</div>
              {sample.explanation && <details className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5"><summary className="cursor-pointer font-semibold text-emerald-800">Xem lời giải</summary><div className="student-study-content mt-4"><MathText text={sample.explanation} /></div></details>}
            </div> : <p className="text-base text-slate-500">Ví dụ minh họa đang được cập nhật.</p>}
          </div>}
        </article>
        {onAskAi && <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5"><p className="text-sm text-indigo-900">Có chỗ chưa hiểu? Cùng gia sư AI tìm hướng giải.</p><button type="button" onClick={ask} className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-indigo-700 shadow-sm"><Bot className="h-4 w-4" />Hỏi gia sư AI</button></div>}
      </div>
    </section>;
  }

  return <div className="min-w-0 space-y-6 pb-8">
    <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8">
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-600"><Layers className="h-4 w-4" />Không gian học tập</span>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Hôm nay bạn muốn học gì?</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">Chọn chuyên đề, tìm dạng bài và mở nội dung để bắt đầu học.</p>
      <div className="mt-6 flex flex-wrap gap-2">{domains.map((domain) => <button key={domain.id} type="button" onClick={() => { onSelectDomain(domain.id); setQuery(''); }}
        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${currentDomain?.id === domain.id ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'}`}>{domain.title}</button>)}</div>
    </section>
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><h2 className="text-xl font-bold text-slate-900">{currentDomain?.title || 'Danh sách bài học'}</h2><p className="mt-1 text-sm text-slate-500">{chapters.length} chương · {entries.length} dạng bài</p></div>
      <label className="relative block sm:w-80"><Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Tìm chương, bài học hoặc dạng bài" placeholder="Tìm bài học, dạng bài…" className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
    </div>
    {filtered.length ? filtered.map((chapter, ci) => {
      const chapterKey = currentDomain?.id || 'default';
      const lessonKey = `${chapterKey}:${chapter.chapterId}`;
      const chapterOpen = expandedChapter[lessonKey] ?? (chapter.chapterId === chapters[0]?.chapterId);
      return <details key={chapter.chapterId} open={Boolean(needle) || chapterOpen} className="group/chapter rounded-3xl border border-slate-200 bg-white shadow-sm">
      <summary onClick={(event) => { event.preventDefault(); setExpandedChapter((previous) => ({ ...previous, [lessonKey]: !(previous[lessonKey] ?? (chapter.chapterId === chapters[0]?.chapterId)) })); }} className="flex cursor-pointer list-none items-center gap-4 p-5 sm:p-6 [&::-webkit-details-marker]:hidden"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-600">{String(ci + 1).padStart(2, '0')}</span>
        <div className="min-w-0 flex-1"><h3 className="text-base font-bold text-slate-900 sm:text-lg">{chapter.name}</h3><p className="mt-1 text-sm text-slate-500">{chapter.lessons.length} bài học</p></div><ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open/chapter:rotate-180" /></summary>
      <div className="space-y-3 border-t border-slate-100 p-5 sm:p-6">{chapter.lessons.map((item) => <details key={item.lessonId} open={Boolean(needle) || (expandedLesson[`${lessonKey}:${item.lessonId}`] ?? (item.lessonId === chapter.lessons[0]?.lessonId))} className="group/lesson rounded-2xl border border-slate-100">
        <summary onClick={(event) => { event.preventDefault(); setExpandedLesson((previous) => ({ ...previous, [`${lessonKey}:${item.lessonId}`]: !(previous[`${lessonKey}:${item.lessonId}`] ?? (item.lessonId === chapter.lessons[0]?.lessonId)) })); }} className="flex cursor-pointer list-none items-center gap-3 p-4 text-base font-bold text-slate-800 [&::-webkit-details-marker]:hidden"><BookOpen className="h-4 w-4 shrink-0 text-indigo-500" /><span className="flex-1">{item.name}</span><span className="text-xs font-medium text-slate-400">{item.patterns.length} dạng</span><ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open/lesson:rotate-180" /></summary>
        <div className="grid gap-3 border-t border-slate-100 p-4 xl:grid-cols-2">{item.patterns.map((pattern) => <button key={pattern.patternId} type="button" onClick={() => open({ chapter, item, pattern })}
          className="group/item flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/40 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/50 focus-visible:outline-2 focus-visible:outline-blue-500">
          <span className="text-base font-medium leading-7 text-slate-700">{pattern.name}</span><span className="flex shrink-0 items-center gap-1 text-xs font-bold text-blue-600">Vào học<ArrowRight className="h-4 w-4" /></span>
        </button>)}</div>
      </details>)}</div>
    </details>; }) : <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-base text-slate-500">{query ? 'Không tìm thấy bài học phù hợp.' : 'Nội dung môn học đang được cập nhật.'}</p>}
  </div>;
}
