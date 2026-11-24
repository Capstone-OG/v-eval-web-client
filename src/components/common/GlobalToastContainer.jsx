import React, { useEffect, useState, useRef } from 'react';
import { Alert, AlertTitle, Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';

const SEVERITY_MAP = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

function ToastItem({ toast, onDismiss }) {
  const { id, type, title, message, duration } = toast;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(duration);
  const timerRef = useRef(null);

  useEffect(() => {
    if (duration <= 0) return;

    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    const totalDuration = remainingTimeRef.current;

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newRemaining = Math.max(0, totalDuration - elapsed);
      const pct = (newRemaining / duration) * 100;
      setProgress(pct);

      if (newRemaining <= 0) {
        clearInterval(timerRef.current);
        onDismiss(id);
      }
    }, 30);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id, duration, isPaused, onDismiss]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const severity = SEVERITY_MAP[type] || 'info';
  const lines = String(message || '').split('\n').filter(Boolean);

  return (
    <Paper
      elevation={6}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        pointerEvents: 'auto',
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: `${severity}.light`,
        animation: 'slideInRight 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <Alert
        severity={severity}
        variant="standard"
        onClose={() => onDismiss(id)}
        sx={{
          alignItems: 'flex-start',
          py: 1.25,
          px: 1.75,
          borderRadius: 0,
          bgcolor: 'background.paper',
          '& .MuiAlert-message': { width: '100%', py: 0 },
        }}
      >
        {title && (
          <AlertTitle sx={{ fontWeight: 700, fontSize: '0.84rem', mb: 0.25 }}>
            {title}
          </AlertTitle>
        )}
        {lines.length > 1 ? (
          <Stack spacing={0.25}>
            {lines.map((line, idx) => (
              <Typography key={idx} variant="body2" sx={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
                {line}
              </Typography>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '0.78rem', lineHeight: 1.45 }}>
            {message}
          </Typography>
        )}
      </Alert>
      {duration > 0 && (
        <LinearProgress
          variant="determinate"
          value={progress}
          color={severity}
          sx={{ height: 3, bgcolor: 'rgba(148,163,184,0.18)' }}
        />
      )}
    </Paper>
  );
}

export default function GlobalToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: { xs: 14, sm: 20 },
        right: { xs: 14, sm: 20 },
        zIndex: 999999,
        width: 'min(360px, calc(100vw - 28px))',
        pointerEvents: 'none',
      }}
    >
      <Stack spacing={1.25}>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </Stack>
    </Box>
  );
}
