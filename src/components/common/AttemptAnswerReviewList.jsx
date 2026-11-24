import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Bot, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import MathText from './MathText';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function normalizeOptionItem(opt, idx) {
  if (typeof opt === 'string') {
    const cleaned = opt.replace(/^[A-D]\s*[.):]\s*/i, '').trim();
    return { id: OPTION_LETTERS[idx] || String(idx + 1), content: cleaned || opt };
  }
  return {
    id: String(opt?.optionId || opt?.id || OPTION_LETTERS[idx] || idx + 1).toUpperCase(),
    content: opt?.content || opt?.text || '',
  };
}

/**
 * Shared MUI Answer Review Component with 7-question range chunking ("Câu 1–7", "Câu 8–14", ...)
 * Used in:
 * - StudentHistoryPage (PLAR Practice & Mock Exam history)
 * - StudentMockExamPage & MockAssessmentPage (post-exam answer review)
 */
export default function AttemptAnswerReviewList({
  questions = [],
  chunkSize = 7,
  onAskAiTutor,
  allowAiTutor = true,
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [chunkIndex, setChunkIndex] = useState(0);

  const normalizedQuestions = useMemo(
    () =>
      (Array.isArray(questions) ? questions : []).map((q, idx) => {
        const chosen = String(q.studentChoice || q.selectedOption || q.chosen || '').trim().toUpperCase();
        const correct = String(q.correctChoice || q.correctOption || q.correct || '').trim().toUpperCase();
        const isCorrect =
          typeof q.isCorrect === 'boolean'
            ? q.isCorrect
            : Boolean(chosen && correct && chosen === correct);
        const isUnanswered = !chosen;
        const options = Array.isArray(q.options) ? q.options.map(normalizeOptionItem) : [];
        return {
          key: q.id || q.questionId || idx,
          number: q.question_number || q.questionOrder || q.number || idx + 1,
          content: q.content || q.question || 'Chưa có nội dung câu hỏi.',
          skillName: q.skillName || q.skill_name || '',
          options,
          chosen,
          correct,
          isCorrect,
          isUnanswered,
          explanation: q.explanation || '',
        };
      }),
    [questions]
  );

  const counts = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    normalizedQuestions.forEach((q) => {
      if (q.isUnanswered) unanswered += 1;
      else if (q.isCorrect) correct += 1;
      else wrong += 1;
    });
    return { all: normalizedQuestions.length, correct, wrong, unanswered };
  }, [normalizedQuestions]);

  const filtered = useMemo(() => {
    if (statusFilter === 'CORRECT') return normalizedQuestions.filter((q) => q.isCorrect);
    if (statusFilter === 'WRONG') return normalizedQuestions.filter((q) => !q.isCorrect && !q.isUnanswered);
    if (statusFilter === 'UNANSWERED') return normalizedQuestions.filter((q) => q.isUnanswered);
    return normalizedQuestions;
  }, [normalizedQuestions, statusFilter]);

  const chunks = useMemo(() => {
    const result = [];
    for (let i = 0; i < filtered.length; i += chunkSize) {
      const slice = filtered.slice(i, i + chunkSize);
      const firstNum = slice[0]?.number ?? i + 1;
      const lastNum = slice[slice.length - 1]?.number ?? i + slice.length;
      result.push({
        index: result.length,
        label: firstNum === lastNum ? `Câu ${firstNum}` : `Câu ${firstNum}–${lastNum}`,
        items: slice,
      });
    }
    return result;
  }, [filtered, chunkSize]);

  const safeChunkIndex = Math.min(chunkIndex, Math.max(0, chunks.length - 1));
  const currentChunk = chunks[safeChunkIndex] || { items: [] };

  const handleFilterChange = (nextFilter) => {
    setStatusFilter(nextFilter);
    setChunkIndex(0);
  };

  if (normalizedQuestions.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có dữ liệu chi tiết từng câu hỏi cho bài làm này.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={2.25}>
      {/* Filter Bar */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
        {[
          { key: 'ALL', label: `Tất cả (${counts.all})`, color: 'primary' },
          { key: 'CORRECT', label: `Đúng (${counts.correct})`, color: 'success' },
          { key: 'WRONG', label: `Sai (${counts.wrong})`, color: 'error' },
          { key: 'UNANSWERED', label: `Bỏ trống (${counts.unanswered})`, color: 'default' },
        ].map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            color={statusFilter === f.key ? f.color : 'default'}
            variant={statusFilter === f.key ? 'filled' : 'outlined'}
            onClick={() => handleFilterChange(f.key)}
            sx={{ cursor: 'pointer', fontWeight: 700 }}
          />
        ))}
      </Stack>

      {/* 7-Question Range Chunk Switcher */}
      {chunks.length > 1 && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, bgcolor: 'background.default' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>
            Chọn cụm câu hỏi để xem nhanh (mỗi cụm {chunkSize} câu):
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {chunks.map((c) => (
              <Button
                key={c.index}
                size="small"
                variant={safeChunkIndex === c.index ? 'contained' : 'outlined'}
                color={safeChunkIndex === c.index ? 'primary' : 'inherit'}
                onClick={() => setChunkIndex(c.index)}
                sx={{ minWidth: 'auto', px: 1.5, py: 0.5, fontSize: '0.75rem', borderRadius: 2 }}
              >
                {c.label}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Question Cards for Current Chunk */}
      <Stack spacing={2}>
        {currentChunk.items.map((q) => (
          <Paper
            key={q.key}
            variant="outlined"
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              borderColor: q.isCorrect ? 'success.light' : q.isUnanswered ? 'divider' : 'error.light',
              bgcolor: q.isCorrect
                ? 'rgba(16,185,129,0.03)'
                : q.isUnanswered
                ? 'background.paper'
                : 'rgba(239,68,68,0.03)',
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Chip
                    size="small"
                    label={`Câu ${q.number}`}
                    color={q.isCorrect ? 'success' : q.isUnanswered ? 'default' : 'error'}
                    sx={{ fontWeight: 800 }}
                  />
                  {q.isCorrect ? (
                    <Chip icon={<CheckCircle2 size={14} />} size="small" label="Trả lời đúng" color="success" variant="outlined" />
                  ) : q.isUnanswered ? (
                    <Chip icon={<HelpCircle size={14} />} size="small" label="Chưa chọn đáp án" variant="outlined" />
                  ) : (
                    <Chip icon={<XCircle size={14} />} size="small" label="Trả lời sai" color="error" variant="outlined" />
                  )}
                  {q.skillName && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {q.skillName}
                    </Typography>
                  )}
                </Stack>

                {allowAiTutor && onAskAiTutor && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<Bot size={14} />}
                    onClick={() =>
                      onAskAiTutor({
                        question: q.content,
                        skill: q.skillName,
                        options: q.options.map((o) => `${o.id}. ${o.content}`),
                        selectedWrong: !q.isCorrect ? q.chosen : undefined,
                        correctOption: q.correct,
                      })
                    }
                  >
                    Hỏi Gia sư AI
                  </Button>
                )}
              </Stack>

              <Box sx={{ fontSize: '0.92rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.65 }}>
                <MathText text={q.content} />
              </Box>

              {q.options.length > 0 ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1 }}>
                  {q.options.map((opt) => {
                    const isRightOpt = q.correct && opt.id === q.correct;
                    const isChosenOpt = q.chosen && opt.id === q.chosen;
                    const isWrongChosen = isChosenOpt && !q.isCorrect;

                    return (
                      <Box
                        key={opt.id}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: isRightOpt
                            ? 'success.main'
                            : isWrongChosen
                            ? 'error.main'
                            : 'divider',
                          bgcolor: isRightOpt
                            ? 'rgba(16,185,129,0.1)'
                            : isWrongChosen
                            ? 'rgba(239,68,68,0.09)'
                            : 'background.paper',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={opt.id}
                          size="small"
                          color={isRightOpt ? 'success' : isWrongChosen ? 'error' : 'default'}
                          sx={{ height: 22, minWidth: 26, fontWeight: 800, fontSize: '0.72rem' }}
                        />
                        <Box sx={{ flex: 1, fontSize: '0.84rem', lineHeight: 1.5 }}>
                          <MathText text={opt.content} />
                          {isRightOpt && (
                            <Typography component="span" variant="caption" sx={{ ml: 1, fontWeight: 800, color: 'success.dark' }}>
                              (Đáp án đúng)
                            </Typography>
                          )}
                          {isWrongChosen && (
                            <Typography component="span" variant="caption" sx={{ ml: 1, fontWeight: 800, color: 'error.dark' }}>
                              (Bạn đã chọn)
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={q.isCorrect ? 'success' : 'error'}
                    label={`Bạn chọn: ${q.chosen || 'Bỏ trống'}`}
                  />
                  {q.correct && (
                    <Chip size="small" color="success" label={`Đáp án đúng: ${q.correct}`} />
                  )}
                </Stack>
              )}

              {q.explanation && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'rgba(79,70,229,0.05)',
                    border: '1px solid',
                    borderColor: 'rgba(79,70,229,0.18)',
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 0.5 }}>
                    Lời giải chi tiết:
                  </Typography>
                  <Box sx={{ fontSize: '0.82rem', color: 'text.secondary', lineHeight: 1.6 }}>
                    <MathText text={q.explanation} />
                  </Box>
                </Box>
              )}
            </Stack>
          </Paper>
        ))}
      </Stack>

      {/* Bottom Prev / Next Chunk Navigation */}
      {chunks.length > 1 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            size="small"
            variant="outlined"
            disabled={safeChunkIndex <= 0}
            onClick={() => setChunkIndex((i) => Math.max(0, i - 1))}
          >
            ← Cụm trước
          </Button>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            Đang xem {currentChunk.label} ({safeChunkIndex + 1}/{chunks.length})
          </Typography>
          <Button
            size="small"
            variant="outlined"
            disabled={safeChunkIndex >= chunks.length - 1}
            onClick={() => setChunkIndex((i) => Math.min(chunks.length - 1, i + 1))}
          >
            Cụm tiếp theo →
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
