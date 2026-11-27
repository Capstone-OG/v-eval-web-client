import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flag,
  Layers
} from 'lucide-react';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  Divider,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import MathText from '../common/MathText';
import { DOMAINS } from './diagnosticData';
import { cleanVietnameseDiacritics } from '../../utils/vietnameseUtils';

/**
 * Tách các bảng Markdown chuẩn (| ... |) ra khỏi nội dung câu hỏi để hiển thị gọn trong Dropdown (Zero hardcode).
 */
function splitMarkdownTables(rawText) {
  if (!rawText || typeof rawText !== 'string') return { cleanText: rawText || '', tables: [] };

  const lines = rawText.split(/\r?\n/);
  const remainingLines = [];
  const tables = [];

  let i = 0;
  while (i < lines.length) {
    const l1 = lines[i].trim();
    const l2 = i + 1 < lines.length ? lines[i + 1].trim() : '';
    if (l1.startsWith('|') && l1.endsWith('|') && /^\|[\s:|-]+\|$/.test(l2)) {
      const parseRow = (line) =>
        line
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());
      const headers = parseRow(l1);
      const rows = [];
      let j = i + 2;
      while (j < lines.length && lines[j].trim().startsWith('|') && lines[j].trim().endsWith('|')) {
        rows.push(parseRow(lines[j].trim()));
        j++;
      }
      if (headers.length >= 2 && rows.length >= 1) {
        tables.push({ headers, rows });
        i = j;
        continue;
      }
    }
    remainingLines.push(lines[i]);
    i++;
  }

  return {
    cleanText: remainingLines.join('\n').trim(),
    tables
  };
}

function SimulatedTableDropdown({ tables, questionKey }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [questionKey]);

  if (!tables || tables.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-300 bg-white shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-2.5 bg-slate-50 hover:bg-blue-50/50 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
      >
        <span className="text-xs font-semibold text-slate-800">Bảng số liệu</span>
        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 shrink-0">
          <span>{open ? 'Thu gọn' : 'Mở bảng'}</span>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <Collapse in={open} timeout="auto">
        <div className="border-t border-slate-200 overflow-x-auto p-3 bg-white space-y-3">
          {tables.map((tableData, tIdx) => (
            <table key={tIdx} className="w-full text-left border-collapse text-xs sm:text-[13px]">
              <thead>
                <tr className="bg-blue-50/80 border-b border-slate-200">
                  {tableData.headers.map((h, idx) => (
                    <th
                      key={idx}
                      className={`py-2 px-3 font-semibold text-slate-800 border-r last:border-r-0 border-slate-200 ${
                        idx === 0 ? 'text-left' : 'text-center'
                      }`}
                    >
                      <MathText text={h} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2 px-3 border-r last:border-r-0 border-slate-200 ${
                          cIdx === 0 ? 'font-semibold text-slate-800 text-left' : 'text-slate-700 text-center tabular-nums'
                        }`}
                      >
                        <MathText text={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </div>
      </Collapse>
    </div>
  );
}

export function ExamRoomHeader({
  examData,
  questionCount,
  timeRemaining,
  isFullscreen,
  tabSwitchCount,
  requestFullScreenMode,
  handlePromptSubmitExam
}) {
  const formatTime = (seconds) =>
    `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #eff6ff 0%, #f8fafc 50%, #eef2ff 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #cbd5e1',
        boxShadow: '0 2px 10px rgba(15, 23, 42, 0.06)',
        zIndex: 40,
        pt: isFullscreen ? 3.5 : 0,
        transition: 'padding 0.2s ease'
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 56, sm: 60 },
          px: { xs: 2, sm: 3 },
          maxWidth: 1480,
          width: '100%',
          mx: 'auto',
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        {/* Left: Clean Typographic Title & Question Count (Zero Icons) */}
        <Box sx={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: { xs: '0.825rem', sm: '0.925rem' },
              letterSpacing: '-0.01em'
            }}
          >
            {examData?.title || 'Bài Đánh Giá Năng Lực Đầu Vào'}
          </Typography>
          <Chip
            label={`${questionCount} câu`}
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 700,
              bgcolor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #dbeafe',
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Box>

        {/* Right: Clean Text-Only MUI Controls */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={requestFullScreenMode}
            sx={{
              display: { xs: 'none', md: 'inline-flex' },
              height: 32,
              px: 1.5,
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderColor: isFullscreen ? '#6ee7b7' : '#cbd5e1',
              bgcolor: isFullscreen ? '#ecfdf5' : '#ffffff',
              color: isFullscreen ? '#047857' : '#334155',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
              '&:hover': {
                bgcolor: isFullscreen ? '#d1fae5' : '#f8fafc',
                borderColor: isFullscreen ? '#34d399' : '#94a3b8'
              }
            }}
          >
            {isFullscreen ? 'Toàn màn hình' : 'Mở toàn màn hình'}
          </Button>

          <Chip
            label={`Rời tab: ${tabSwitchCount}/3`}
            size="small"
            variant="outlined"
            sx={{
              height: 32,
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontVariantNumeric: 'tabular-nums',
              bgcolor: tabSwitchCount > 0 ? '#fef2f2' : '#ffffff',
              borderColor: tabSwitchCount > 0 ? '#fca5a5' : '#cbd5e1',
              color: tabSwitchCount > 0 ? '#b91c1c' : '#0f172a',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
              '& .MuiChip-label': { px: 1.5 }
            }}
          />

          <Chip
            label={formatTime(timeRemaining)}
            size="small"
            variant="outlined"
            sx={{
              height: 32,
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontVariantNumeric: 'tabular-nums',
              bgcolor: '#ffffff',
              color: '#0f172a',
              borderColor: '#cbd5e1',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
              '& .MuiChip-label': { px: 1.5 }
            }}
          />

          <Divider orientation="vertical" flexItem sx={{ my: 1.5, borderColor: '#cbd5e1', display: { xs: 'none', sm: 'block' } }} />

          <Button
            variant="contained"
            size="small"
            onClick={handlePromptSubmitExam}
            sx={{
              height: 32,
              px: 2,
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              bgcolor: '#059669',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.28)',
              '&:hover': {
                bgcolor: '#047857',
                boxShadow: '0 3px 8px rgba(5, 150, 105, 0.35)'
              }
            }}
          >
            Nộp bài
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

export function ExamRoomBody({
  currentQ,
  currentIndex,
  questions,
  answers,
  flagged,
  timeSpentPerQ,
  handleSelectOption,
  handleToggleFlag,
  setCurrentIndex,
  handlePromptSubmitExam
}) {
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const { cleanText: questionTextWithoutTables, tables: questionTables } = useMemo(
    () => splitMarkdownTables(currentQ?.content || ''),
    [currentQ?.content]
  );

  return (
    <div className="flex-1 w-full bg-linear-to-br from-slate-200/85 via-blue-50/75 to-indigo-100/65">
      <div className="w-full max-w-[1480px] mx-auto px-4 sm:px-6 py-4 lg:h-[calc(100vh-61px)] flex flex-col lg:flex-row items-stretch gap-4">
        {/* Main Question Card — Fixed height with clear 3-zone separation */}
        <div className="flex-1 min-w-0 bg-slate-50/60 border border-slate-300 rounded-2xl shadow-lg shadow-slate-900/10 text-slate-900 flex flex-col overflow-hidden lg:h-full">
          {/* Zone 1: Top Metadata Bar */}
          <div className="shrink-0 px-5 py-3 border-b border-slate-200 bg-linear-to-r from-blue-50/90 via-slate-50 to-indigo-50/60 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              <span
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0 shadow-2xs ${
                  DOMAINS[currentQ.domain_id]?.badge || 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {currentQ.domain_name || DOMAINS[currentQ.domain_id]?.name || 'Toán học & Tư duy định lượng'}
              </span>
              {currentQ.skill_name && (
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[260px] sm:max-w-lg">
                  Kỹ năng: <strong className="text-slate-700 font-semibold">{currentQ.skill_name}</strong>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleToggleFlag(currentQ.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors border cursor-pointer shrink-0 shadow-2xs ${
                flagged[currentQ.id]
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${flagged[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{flagged[currentQ.id] ? 'Đã gắn cờ' : 'Đánh dấu phân vân'}</span>
            </button>
          </div>

          {/* Zone 2: Middle Scrollable Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 py-5 bg-slate-50/50">
            {currentQ.passage_content ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start h-full">
                {/* Left Column: Reading Passage Context */}
                <div className="xl:col-span-6 bg-white border border-slate-300 rounded-xl p-4 sm:p-5 xl:max-h-full xl:overflow-y-auto space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px] uppercase tracking-wider">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>{cleanVietnameseDiacritics(currentQ.passage_title) || 'Ngữ liệu đọc hiểu'}</span>
                    </div>
                    <span className="text-[10.5px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      Bài đọc chuyên đề
                    </span>
                  </div>
                  <div className="leading-relaxed text-slate-800 font-sans text-[13.5px] sm:text-sm select-text">
                    <MathText text={cleanVietnameseDiacritics(currentQ.passage_content)} />
                  </div>
                </div>

                {/* Right Column: Question Statement Box & Answer Options Zone */}
                <div className="xl:col-span-6 space-y-4">
                  {/* Question Stem Block */}
                  <div className="rounded-xl bg-linear-to-r from-blue-50 to-indigo-50/70 border border-blue-200 border-l-4 border-l-blue-600 p-4 shadow-xs">
                    <div className="text-[14.5px] sm:text-[15.5px] font-semibold text-slate-900 leading-relaxed font-sans">
                      <span className="text-blue-700 font-extrabold mr-1.5">Câu {currentIndex + 1}:</span>
                      <MathText text={questionTextWithoutTables} />
                    </div>
                  </div>

                  {/* Collapsible Markdown Table Dropdown */}
                  <SimulatedTableDropdown tables={questionTables} questionKey={currentQ.id} />

                  {/* Answer Options Block */}
                  <div className="space-y-2.5">
                    <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
                      Chọn 1 phương án đúng
                    </div>
                    {currentQ.options.map((optText, optIdx) => {
                      const optChar = currentQ.optionIds?.[optIdx] || ['A', 'B', 'C', 'D'][optIdx];
                      const isSelected = answers[currentQ.id] === optChar;

                      return (
                        <button
                          key={optChar}
                          aria-pressed={isSelected}
                          type="button"
                          onClick={() => handleSelectOption(currentQ.id, optChar)}
                          className={`w-full px-3.5 py-2.5 sm:py-3 rounded-xl text-left transition-all border flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-100/80 border-blue-600 text-blue-950 font-semibold ring-1 ring-blue-500/25 shadow-sm'
                              : 'bg-white border-slate-300 text-slate-800 shadow-xs hover:bg-blue-50/60 hover:border-blue-400 hover:shadow-sm'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors mt-0.5 ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {optChar}
                          </div>
                          <div className="flex-1 text-[13.5px] sm:text-sm leading-relaxed pt-0.5 font-sans">
                            <MathText text={optText} />
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                              <Check className="w-3 h-3 stroke-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* Single Question Layout — Full-width separated Question Stem Block + Answer Options Block */
              <div className="w-full space-y-5">
                {/* Question Stem Block */}
                <div className="rounded-xl bg-linear-to-r from-blue-50 to-indigo-50/70 border border-blue-200 border-l-4 border-l-blue-600 p-4 sm:p-5 shadow-xs">
                  <div className="text-[14.5px] sm:text-[15.5px] font-semibold text-slate-900 leading-relaxed font-sans">
                    <span className="text-blue-700 font-extrabold mr-1.5">Câu {currentIndex + 1}:</span>
                    <MathText text={questionTextWithoutTables} />
                  </div>
                </div>

                {/* Collapsible Markdown Table Dropdown */}
                <SimulatedTableDropdown tables={questionTables} questionKey={currentQ.id} />

                {/* Answer Options Block */}
                <div className="space-y-2.5">
                  <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
                    Chọn 1 phương án đúng
                  </div>
                  {currentQ.options.map((optText, optIdx) => {
                    const optChar = currentQ.optionIds?.[optIdx] || ['A', 'B', 'C', 'D'][optIdx];
                    const isSelected = answers[currentQ.id] === optChar;

                    return (
                      <button
                        key={optChar}
                        aria-pressed={isSelected}
                        type="button"
                        onClick={() => handleSelectOption(currentQ.id, optChar)}
                        className={`w-full px-4 py-3 rounded-xl text-left transition-all border flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-100/80 border-blue-600 text-blue-950 font-semibold ring-1 ring-blue-500/25 shadow-sm'
                            : 'bg-white border-slate-300 text-slate-800 shadow-xs hover:bg-blue-50/60 hover:border-blue-400 hover:shadow-sm'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors mt-0.5 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {optChar}
                        </div>
                        <div className="flex-1 text-[13.5px] sm:text-sm leading-relaxed pt-0.5 font-sans">
                          <MathText text={optText} />
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                            <Check className="w-3 h-3 stroke-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Zone 3: Fixed Bottom Step Navigator */}
          <div className="shrink-0 px-5 py-3 border-t border-slate-200 bg-slate-100/95 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-300 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Câu trước</span>
              </button>

              <div className="text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-1">
                <span>Thời gian câu này:</span>
                <span className="font-mono text-blue-600 font-bold tabular-nums">
                  {timeSpentPerQ[currentQ.id] || 0}s
                </span>
              </div>
            </div>

            <div className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-500 font-mono tabular-nums shadow-2xs">
              <span className="text-blue-600 font-extrabold">{currentIndex + 1}</span> / {questions.length}
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span>Câu kế tiếp</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePromptSubmitExam}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
              >
                <span>Hoàn tất & Nộp bài</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Question Palette with distinct header, progress bar, and legend */}
        <div className="w-full lg:w-72 bg-slate-50/60 border border-slate-300 rounded-2xl shadow-lg shadow-slate-900/10 flex flex-col shrink-0 text-slate-900 lg:h-full overflow-hidden">
          <div className="shrink-0 px-4 py-3 border-b border-slate-200 bg-linear-to-r from-blue-50/90 to-indigo-50/60 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Danh sách {questions.length || 30} câu</span>
              </div>
              <div className="text-[11px] text-slate-600 font-bold tabular-nums">
                {answeredCount}/{questions.length} đã chọn
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200/90 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-slate-50/40">
            <div className="grid grid-cols-6 gap-1.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isFlag = !!flagged[q.id];

                let btnBg = 'bg-white text-slate-700 border-slate-300/90 hover:border-blue-400 hover:bg-blue-50/60 shadow-2xs';
                if (isCurrent) {
                  btnBg = 'bg-blue-600 text-white border-blue-600 font-extrabold ring-2 ring-blue-500/30 shadow-xs z-10';
                } else if (isFlag) {
                  btnBg = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
                } else if (isAnswered) {
                  btnBg = 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-2xs';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 rounded-lg text-xs font-bold transition-colors border relative flex items-center justify-center cursor-pointer tabular-nums ${btnBg}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlag && isAnswered && !isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-300 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Distinct Status Legend Footer */}
          <div className="shrink-0 px-4 py-3 border-t border-slate-200 bg-slate-100/95 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 shrink-0" />
              <span className="text-blue-700 font-semibold">Đang làm</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 shrink-0" />
              <span className="text-emerald-700 font-semibold">Đã chọn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-400 shrink-0" />
              <span className="text-amber-700 font-semibold">Phân vân</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-50 border border-slate-300 shrink-0" />
              <span>Chưa làm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamSubmitConfirmation({
  answers,
  questions,
  onCancel,
  onSubmit,
  busy = false,
  title = 'Xác nhận nộp bài'
}) {
  const total = questions.length;
  const answered = Object.keys(answers).length;
  const unanswered = Math.max(0, total - answered);

  return (
    <Dialog
      open
      onClose={busy ? undefined : onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: 460,
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.14)',
          bgcolor: '#ffffff',
          p: 0
        }
      }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.35)',
            backdropFilter: 'blur(3px)'
          }
        }
      }}
    >
      <Box sx={{ px: 4, pt: 4, pb: 3 }}>
        <Typography
          sx={{
            fontSize: '1.15rem',
            fontWeight: 600,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            lineHeight: 1.35
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 1.5,
            fontSize: '0.92rem',
            color: '#475569',
            lineHeight: 1.65
          }}
        >
          Bạn đã trả lời{' '}
          <Box component="span" sx={{ fontWeight: 600, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
            {answered}/{total}
          </Box>{' '}
          câu hỏi.
          {unanswered > 0 && (
            <>
              {' '}Hiện còn{' '}
              <Box component="span" sx={{ fontWeight: 600, color: '#b45309', fontVariantNumeric: 'tabular-nums' }}>
                {unanswered} câu
              </Box>{' '}
              chưa chọn đáp án.
            </>
          )}
        </Typography>

        <Typography
          sx={{
            mt: 1,
            fontSize: '0.84rem',
            color: '#94a3b8',
            lineHeight: 1.5
          }}
        >
          Sau khi nộp, bài làm sẽ được khóa và hệ thống sẽ chấm điểm ngay lập tức.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      <Stack direction="row" spacing={1.5} sx={{ px: 4, py: 2.5, justifyContent: 'flex-end', bgcolor: '#fafafa' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={busy}
          sx={{
            height: 40,
            px: 2.5,
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: 500,
            borderColor: '#cbd5e1',
            bgcolor: '#ffffff',
            color: '#334155',
            '&:hover': {
              bgcolor: '#f1f5f9',
              borderColor: '#94a3b8'
            }
          }}
        >
          Quay lại
        </Button>

        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={busy}
          sx={{
            height: 40,
            px: 3,
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: 600,
            bgcolor: '#059669',
            color: '#ffffff',
            '&:hover': {
              bgcolor: '#047857'
            }
          }}
        >
          {busy ? 'Đang nộp bài...' : 'Nộp bài'}
        </Button>
      </Stack>
    </Dialog>
  );
}
