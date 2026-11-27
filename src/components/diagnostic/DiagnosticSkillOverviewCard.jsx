import React, { useMemo } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { CheckCircle2, ChevronDown, Compass, Target } from 'lucide-react';

const GUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRawGuid(val) {
  return typeof val === 'string' && GUID_REGEX.test(val.trim());
}

const DOMAIN_FALLBACK_MAP = {
  DOM_LANG: 'Sử dụng Ngôn ngữ',
  DOM_MATH: 'Toán học & Tư duy định lượng',
  DOM_NAT_SCI: 'Khoa học Tự nhiên',
  DOM_SOC_SCI: 'Khoa học Xã hội',
  'b581ee4c-6b3e-4b70-9c74-713066e7b31a': 'Sử dụng Ngôn ngữ',
  '6f3765db-1c05-4ef2-80e6-214a9e6ab261': 'Toán học & Tư duy định lượng',
  '77777777-7777-7777-7777-000000000001': 'Khoa học Tự nhiên',
  '77777777-7777-7777-7777-000000000002': 'Khoa học Xã hội',
  '77777777-7777-7777-7777-000000000003': 'Khoa học Tự nhiên',
  '77777777-7777-7777-7777-000000000004': 'Khoa học Xã hội',
};

function resolveDomainLabel(sp) {
  const rawName = sp.domain_name || sp.domainName || '';
  if (rawName && !isRawGuid(rawName)) return rawName;
  const domainId = sp.domain_id || sp.domainId || rawName || '';
  return DOMAIN_FALLBACK_MAP[domainId] || 'Kiến thức nền tảng';
}

function getMasteryLevel(pct) {
  if (pct >= 75) return { label: 'Vững kiến thức', color: 'success' };
  if (pct >= 55) return { label: 'Khá ổn', color: 'primary' };
  return { label: 'Cần ôn tập ưu tiên', color: 'warning' };
}

function deduplicateSkills(list) {
  const map = new Map();
  for (const sp of list) {
    const rawName = (sp.skill_name || sp.skillName || '').trim();
    const key = rawName.toLowerCase();
    const val = Number(sp.p_l0 ?? sp.pL0 ?? 0.5);
    if (!map.has(key)) {
      map.set(key, { item: sp, sum: val, count: 1 });
    } else {
      const entry = map.get(key);
      entry.sum += val;
      entry.count += 1;
    }
  }
  return Array.from(map.values()).map(({ item, sum, count }) =>
    count === 1 ? item : { ...item, p_l0: sum / count, pL0: sum / count }
  );
}

function SkillCard({ sp }) {
  const pct = Math.round(Number(sp.p_l0 ?? sp.pL0 ?? 0.5) * 100);
  const level = getMasteryLevel(pct);
  const skillName = sp.skill_name || sp.skillName || 'Dạng bài trọng tâm';
  const domainName = resolveDomainLabel(sp);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        minWidth: 0,
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 3,
        borderColor: pct >= 75 ? 'success.light' : pct < 55 ? 'warning.light' : 'divider',
        bgcolor: pct >= 75 ? 'rgba(16,185,129,0.04)' : pct < 55 ? 'rgba(245,158,11,0.05)' : 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1.25,
          minWidth: 0,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            title={skillName}
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
            }}
          >
            {skillName}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mt: 0.35 }}
            noWrap
          >
            {domainName}
          </Typography>
        </Box>
        <Chip
          label={level.label}
          color={level.color}
          size="small"
          variant="outlined"
          sx={{ flexShrink: 0, fontSize: '0.7rem', height: 24 }}
        />
      </Box>

      <Box sx={{ mt: 1.75 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1,
            width: '100%',
            mb: 0.75,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Mức độ nắm vững
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: `${level.color}.dark`, flexShrink: 0 }}>
            {pct}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(5, pct))}
          color={level.color}
          sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(148,163,184,0.2)' }}
        />
      </Box>
    </Paper>
  );
}

/**
 * Shared MUI skill breakdown component used identically in both
 * Immediate Diagnostic Result and Diagnostic History Detail.
 * - Shows directly measured skills in the exam first (consistent with History)
 * - Hides any corrupted/raw-GUID inferred items and moves valid inferred items into a collapsible Accordion
 */
export default function DiagnosticSkillOverviewCard({ skillPriors = [] }) {
  const { measuredSkills, inferredSkills } = useMemo(() => {
    const measured = [];
    const inferred = [];
    for (const sp of Array.isArray(skillPriors) ? skillPriors : []) {
      const name = sp.skill_name || sp.skillName || '';
      if (!name || isRawGuid(name)) continue; // Never render raw GUIDs to students
      if ((sp.source || 'measured') === 'measured') {
        measured.push(sp);
      } else {
        inferred.push(sp);
      }
    }
    return {
      measuredSkills: deduplicateSkills(measured),
      inferredSkills: deduplicateSkills(inferred),
    };
  }, [skillPriors]);

  if (measuredSkills.length === 0 && inferredSkills.length === 0) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: 4,
        borderColor: 'divider',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          pb: 2,
          mb: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Target size={18} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Đánh giá chi tiết các dạng bài trong đề ({measuredSkills.length} dạng bài)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              Thống kê trực tiếp từ bài làm của bạn — đồng bộ giữa Kết quả thi và Lịch sử làm bài
            </Typography>
          </Box>
        </Stack>
        <Chip
          icon={<CheckCircle2 size={14} />}
          label="Đo trực tiếp từ bài thi"
          color="primary"
          variant="outlined"
          size="small"
          sx={{ flexShrink: 0 }}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 1.75,
        }}
      >
        {measuredSkills.map((sp, idx) => (
          <SkillCard key={sp.skill_id || sp.skillId || idx} sp={sp} />
        ))}
      </Box>

      {inferredSkills.length > 0 && (
        <Accordion
          disableGutters
          elevation={0}
          sx={{
            mt: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '12px !important',
            '&:before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ChevronDown size={18} />}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Compass size={16} color="#4f46e5" />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Các dạng bài liên quan hệ thống ước lượng thêm ({inferredSkills.length} dạng bài)
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
              Dựa trên kết quả các mảng kiến thức bạn vừa làm, hệ thống ước lượng sơ bộ cho những dạng bài cùng chuyên đề để sắp xếp lộ trình học phù hợp.
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  md: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 1.5,
                maxHeight: 360,
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              {inferredSkills.slice(0, 60).map((sp, idx) => (
                <SkillCard key={sp.skill_id || sp.skillId || idx} sp={sp} />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
}
