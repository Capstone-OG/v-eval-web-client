import React from 'react';
import { Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { ArrowUpRight, Award, CheckCircle2, Clock, FileText } from 'lucide-react';

function getAbilityBand(theta, accuracy) {
  if (Number.isFinite(theta)) {
    if (theta >= 0.8) return { label: 'Rất tốt', detail: 'Đủ nền tảng chinh phục mục tiêu 900+', color: 'success' };
    if (theta >= 0.2) return { label: 'Khá vững', detail: 'Sẵn sàng tăng tốc luyện chuyên sâu', color: 'primary' };
    if (theta >= -0.4) return { label: 'Trung bình khá', detail: 'Cần củng cố các mảng kiến thức trọng tâm', color: 'info' };
    return { label: 'Cần củng cố nền tảng', detail: 'Ưu tiên xây chắc kiến thức cơ bản trước', color: 'warning' };
  }
  if (accuracy >= 80) return { label: 'Rất tốt', detail: 'Nền tảng kiến thức rất vững', color: 'success' };
  if (accuracy >= 60) return { label: 'Khá vững', detail: 'Đang tiến bộ tốt, tiếp tục rèn luyện', color: 'primary' };
  return { label: 'Cần củng cố nền tảng', detail: 'Tập trung ôn tập các dạng bài ưu tiên', color: 'warning' };
}

export default function DiagnosticResultSummary({ result, compact = false }) {
  const correct = result.pacing?.totalCorrect ?? 0;
  const total = result.pacing?.totalQuestions ?? 0;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const seconds = result.pacing?.totalTimeSpent ?? 0;
  const theta = Number(result.theta_0);
  const band = getAbilityBand(theta, accuracy);

  if (compact) {
    const metrics = [
      {
        label: 'Kết quả bài làm',
        icon: CheckCircle2,
        accent: '#10b981',
        value: (
          <>
            {correct}
            <Typography component="span" sx={{ ml: 0.75, fontSize: '0.95rem', fontWeight: 500, color: 'text.secondary' }}>
              / {total} câu
            </Typography>
          </>
        ),
        detail: `${accuracy}% câu trả lời đúng`,
        progress: accuracy,
      },
      {
        label: 'Đánh giá mức năng lực',
        icon: Award,
        accent: '#4f46e5',
        value: band.label,
        detail: band.detail,
        chipColor: band.color,
      },
      {
        label: 'Thời gian làm bài',
        icon: Clock,
        accent: '#7c3aed',
        value: (
          <>
            {Math.floor(seconds / 60)}
            <Typography component="span" sx={{ mx: 0.5, fontSize: '0.95rem', fontWeight: 500, color: 'text.secondary' }}>
              phút
            </Typography>
            {String(seconds % 60).padStart(2, '0')}
            <Typography component="span" sx={{ ml: 0.5, fontSize: '0.95rem', fontWeight: 500, color: 'text.secondary' }}>
              giây
            </Typography>
          </>
        ),
        detail: `Trung bình ${total > 0 ? Math.round(seconds / total) : 0} giây / câu`,
      },
    ];

    return (
      <Box
        component="section"
        aria-label="Tóm tắt kết quả"
        sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}
      >
        {metrics.map(({ label, icon: Icon, accent, value, detail, progress }) => (
          <Paper
            key={label}
            variant="outlined"
            sx={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              p: 2.25,
              borderTop: `4px solid ${accent}`,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {label}
              </Typography>
              <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: `${accent}18`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} />
              </Box>
            </Stack>
            <Typography variant="h5" sx={{ mt: 1, fontWeight: 800, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </Typography>
            <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'text.secondary' }}>
              {detail}
            </Typography>
            {progress !== undefined && (
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(progress, 100))}
                color="success"
                sx={{ mt: 1.25, height: 5, borderRadius: 3, bgcolor: 'rgba(16,185,129,0.14)' }}
              />
            )}
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 4, borderColor: 'divider' }}>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #1e3a8a 100%)',
          px: { xs: 3, sm: 4 },
          py: { xs: 3, sm: 4 },
          color: '#fff',
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Box sx={{ maxWidth: 640 }}>
            <Chip
              icon={<FileText size={14} color="#93c5fd" />}
              label="Báo cáo kết quả đầu vào"
              size="small"
              sx={{ bgcolor: 'rgba(59,130,246,0.18)', color: '#bfdbfe', fontWeight: 700, mb: 1.5 }}
            />
            <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: -0.4 }}>
              Kết quả khảo sát năng lực đầu vào
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#cbd5e1' }}>
              Tổng hợp chi tiết bài làm, thế mạnh nổi bật và các dạng bài cần ưu tiên trong lộ trình học của bạn.
            </Typography>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              width: 52,
              height: 52,
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.16)',
              bgcolor: 'rgba(255,255,255,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#93c5fd',
              flexShrink: 0,
            }}
          >
            <ArrowUpRight size={26} />
          </Box>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          divideY: { xs: 1, sm: 0 },
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 3.5 }, borderRight: { sm: '1px solid' }, borderBottom: { xs: '1px solid', sm: 'none' }, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircle2 size={16} color="#059669" />
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              KẾT QUẢ BÀI LÀM
            </Typography>
          </Stack>
          <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, color: 'text.primary' }}>
            {correct}
            <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 500, color: 'text.secondary' }}>
              {' '}/ {total} câu
            </Typography>
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(accuracy, 100))}
              color="success"
              sx={{ flex: 1, height: 7, borderRadius: 4 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.dark' }}>
              {accuracy}%
            </Typography>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 3, sm: 3.5 }, borderRight: { sm: '1px solid' }, borderBottom: { xs: '1px solid', sm: 'none' }, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Award size={16} color="#4f46e5" />
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              ĐÁNH GIÁ NĂNG LỰC
            </Typography>
          </Stack>
          <Box sx={{ mt: 1.5 }}>
            <Chip label={band.label} color={band.color} sx={{ fontWeight: 800, fontSize: '0.95rem', px: 1, py: 2 }} />
          </Box>
          <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: 'text.secondary' }}>
            {band.detail}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 3, sm: 3.5 } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Clock size={16} color="#7c3aed" />
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              THỜI GIAN HOÀN THÀNH
            </Typography>
          </Stack>
          <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 900, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
            {Math.floor(seconds / 60)}
            <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 500, color: 'text.secondary' }}>
              {' '}phút{' '}
            </Typography>
            {String(seconds % 60).padStart(2, '0')}
            <Typography component="span" sx={{ fontSize: '1.05rem', fontWeight: 500, color: 'text.secondary' }}>
              {' '}giây
            </Typography>
          </Typography>
          <Typography variant="caption" sx={{ mt: 1.5, display: 'block', color: 'text.secondary' }}>
            Trung bình {total > 0 ? Math.round(seconds / total) : 0} giây mỗi câu.
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
