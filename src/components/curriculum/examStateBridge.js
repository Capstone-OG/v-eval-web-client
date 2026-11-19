import { normalizeExamData, buildOrderedExamView } from '../../utils/examParserUtils.js';
import {
  flattenCurriculumTree,
  autoMapExamQuestions,
  buildExamBlueprintStats
} from '../../utils/examCurriculumMatcher.js';

const STORAGE_KEY = 'veval_active_exam_workspace_v1';

const DEFAULT_PERSISTED_FIELDS = {
  currentExam: null,
  selectedQuestionLocalId: null,
  isLocked: false,
  hasUnsavedChanges: false,
  aiBloomDrafts: [],
  bloomTargetSkillNode: null,
  bankSubView: 'paper', // 'paper' | 'organize'
  ingestPart: 'pdf' // 'pdf' | 'bloom'
};

function createInitialState() {
  let restored = {};
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          restored = {
            currentExam: parsed.currentExam ?? null,
            selectedQuestionLocalId: parsed.selectedQuestionLocalId ?? null,
            isLocked: Boolean(parsed.isLocked),
            hasUnsavedChanges: Boolean(parsed.hasUnsavedChanges),
            aiBloomDrafts: Array.isArray(parsed.aiBloomDrafts) ? parsed.aiBloomDrafts : [],
            bloomTargetSkillNode: parsed.bloomTargetSkillNode ?? null,
            bankSubView: parsed.bankSubView === 'organize' ? 'organize' : 'paper',
            ingestPart: parsed.ingestPart === 'bloom' ? 'bloom' : 'pdf'
          };
        }
      }
    } catch {
      // Ignore corrupt sessionStorage entries
    }
  }

  return {
    ...DEFAULT_PERSISTED_FIELDS,
    ...restored,
    dbExams: [],
    dbLoaded: false,
    dbLoading: false,
    dbError: null,
    curriculumDomains: [],
    curriculumLoaded: false,
    processingJob: null,
    lastJobNotification: null
  };
}

let workspaceState = createInitialState();
const listeners = new Set();

// Module-level timers so PDF OCR polling survives switching across the 3 Exam pages
let activePollInterval = null;
let activeTimerInterval = null;
let jobEventCounter = 0;

function stripLargeBase64ForStorage(exam) {
  if (!exam || typeof exam !== 'object') return exam;
  const cleanUrl = (url) => (typeof url === 'string' && url.startsWith('data:image/') && url.length > 40000 ? null : url);
  const cleanImages = (imgs) =>
    Array.isArray(imgs)
      ? imgs.filter((img) => !(typeof img === 'string' && img.startsWith('data:image/') && img.length > 40000))
      : [];

  return {
    ...exam,
    passages: (exam.passages || []).map((p) => ({
      ...p,
      imageUrl: cleanUrl(p.imageUrl),
      images: cleanImages(p.images),
      questions: (p.questions || []).map((q) => ({
        ...q,
        imageUrl: cleanUrl(q.imageUrl),
        images: cleanImages(q.images)
      }))
    })),
    singleQuestions: (exam.singleQuestions || []).map((q) => ({
      ...q,
      imageUrl: cleanUrl(q.imageUrl),
      images: cleanImages(q.images)
    }))
  };
}

function persistLightSnapshot(state) {
  if (typeof window === 'undefined' || !window.sessionStorage) return;

  const payload = {
    currentExam: state.currentExam,
    selectedQuestionLocalId: state.selectedQuestionLocalId,
    isLocked: state.isLocked,
    hasUnsavedChanges: state.hasUnsavedChanges,
    aiBloomDrafts: state.aiBloomDrafts,
    bloomTargetSkillNode: state.bloomTargetSkillNode,
    bankSubView: state.bankSubView,
    ingestPart: state.ingestPart
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    try {
      const compactPayload = {
        ...payload,
        currentExam: stripLargeBase64ForStorage(state.currentExam)
      };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(compactPayload));
    } catch {
      // In-memory store remains the canonical source during the SPA session
    }
  }
}

function notifyListeners() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Ignore individual subscriber errors
    }
  }
}

export function getExamWorkspaceState() {
  return workspaceState;
}

export function subscribeExamWorkspaceState(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function updateExamWorkspaceState(partialOrUpdater) {
  const prev = workspaceState;
  const patch = typeof partialOrUpdater === 'function' ? partialOrUpdater(prev) : partialOrUpdater;
  if (!patch || typeof patch !== 'object') return prev;

  const next = { ...prev, ...patch };
  workspaceState = next;

  const persistedKeysChanged =
    prev.currentExam !== next.currentExam ||
    prev.selectedQuestionLocalId !== next.selectedQuestionLocalId ||
    prev.isLocked !== next.isLocked ||
    prev.hasUnsavedChanges !== next.hasUnsavedChanges ||
    prev.aiBloomDrafts !== next.aiBloomDrafts ||
    prev.bloomTargetSkillNode !== next.bloomTargetSkillNode ||
    prev.bankSubView !== next.bankSubView ||
    prev.ingestPart !== next.ingestPart;

  if (persistedKeysChanged) {
    persistLightSnapshot(next);
  }

  notifyListeners();
  return next;
}

export function clearPdfPollingTimers() {
  if (activePollInterval) {
    clearInterval(activePollInterval);
    activePollInterval = null;
  }
  if (activeTimerInterval) {
    clearInterval(activeTimerInterval);
    activeTimerInterval = null;
  }
}

export function cancelPdfExtractionJob() {
  clearPdfPollingTimers();
  updateExamWorkspaceState({ processingJob: null });
}

/**
 * Starts PDF upload & Gemini Vision polling at module level so switching among
 * Exam Bank (Page 1), Parse & AI Bloom (Page 2), and Studio (Page 3) never interrupts the job.
 */
export async function startPdfExtractionJob(file, aiServiceClient) {
  if (!file) return { ok: false, error: 'Chưa chọn tệp PDF.' };
  if (!String(file.name || '').toLowerCase().endsWith('.pdf')) {
    return { ok: false, error: 'Chỉ chấp nhận tệp định dạng PDF (.pdf) để AI Vision trích xuất đề thi.' };
  }

  clearPdfPollingTimers();
  updateExamWorkspaceState({
    processingJob: {
      fileName: file.name,
      jobId: null,
      status: 'UPLOADING',
      step: 'Đang tải tệp PDF lên máy chủ AI Engine...',
      elapsedSeconds: 0
    }
  });

  try {
    const jobInit = await aiServiceClient.uploadPdfExam(file);
    const jobId = jobInit?.job_id || jobInit?.jobId;
    if (!jobId) {
      throw new Error('Máy chủ AI Engine không trả về mã tác vụ (job_id).');
    }

    updateExamWorkspaceState({
      processingJob: {
        fileName: file.name,
        jobId,
        status: 'PROCESSING',
        step: jobInit?.current_step || 'Đang phân tích đề thi bằng Gemini Vision AI (có thể mất 1–3 phút)...',
        elapsedSeconds: jobInit?.elapsed_seconds || 0
      }
    });

    activeTimerInterval = setInterval(() => {
      const curr = workspaceState.processingJob;
      if (!curr) {
        clearPdfPollingTimers();
        return;
      }
      updateExamWorkspaceState({
        processingJob: {
          ...curr,
          elapsedSeconds: (curr.elapsedSeconds || 0) + 1
        }
      });
    }, 1000);

    activePollInterval = setInterval(async () => {
      try {
        const job = await aiServiceClient.getExamJobStatus(jobId);
        if (!job) return;

        const status = job.status || job.Status;
        const step = job.current_step || job.currentStep || 'Đang bóc tách câu hỏi & công thức...';
        const elapsed = job.elapsed_seconds ?? job.elapsedSeconds;

        updateExamWorkspaceState((prev) =>
          prev.processingJob
            ? {
                processingJob: {
                  ...prev.processingJob,
                  status,
                  step,
                  elapsedSeconds:
                    typeof elapsed === 'number'
                      ? Math.max(elapsed, prev.processingJob.elapsedSeconds || 0)
                      : prev.processingJob.elapsedSeconds || 0
                }
              }
            : {}
        );

        if (status === 'COMPLETED') {
          clearPdfPollingTimers();
          const rawResult = job.result || job.parsedExam || job.Result;
          const normalized = normalizeExamData(rawResult, { source: 'ai', isPublished: false });
          const flatNodes = flattenCurriculumTree(workspaceState.curriculumDomains || []);
          const enriched =
            flatNodes.length > 0 ? autoMapExamQuestions(normalized, flatNodes, { force: false }) : normalized;
          const firstQ = buildOrderedExamView(enriched).allQuestions[0];
          const bp = buildExamBlueprintStats(enriched);

          const message =
            bp.mappedCount > 0
              ? `Đã bóc tách ${bp.totalQuestions} câu hỏi & tự động nhận diện Chương/Bài cho ${bp.mappedCount}/${bp.totalQuestions} câu!`
              : `Đã bóc tách thành công ${bp.totalQuestions} câu hỏi từ "${file.name}"!`;

          updateExamWorkspaceState({
            currentExam: enriched,
            selectedQuestionLocalId: firstQ?.localId || null,
            isLocked: false,
            hasUnsavedChanges: true,
            processingJob: null,
            lastJobNotification: {
              id: ++jobEventCounter,
              type: 'success',
              message
            }
          });
        } else if (status === 'FAILED') {
          clearPdfPollingTimers();
          const errMsg = job.error_message || job.errorMessage || 'Lỗi không xác định khi phân tích đề thi.';
          updateExamWorkspaceState({
            processingJob: null,
            lastJobNotification: {
              id: ++jobEventCounter,
              type: 'error',
              message: `Phân tích đề thi thất bại: ${errMsg}`
            }
          });
        }
      } catch (pollErr) {
        console.warn('Lỗi polling tiến trình AI Engine:', pollErr);
      }
    }, 2000);

    return { ok: true, jobId };
  } catch (err) {
    clearPdfPollingTimers();
    updateExamWorkspaceState({ processingJob: null });
    return {
      ok: false,
      error: err?.message || 'Không thể khởi tạo tác vụ phân tích đề thi PDF.'
    };
  }
}

export function resetExamWorkspaceState() {
  clearPdfPollingTimers();
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
  workspaceState = {
    ...DEFAULT_PERSISTED_FIELDS,
    dbExams: [],
    dbLoaded: false,
    dbLoading: false,
    dbError: null,
    curriculumDomains: [],
    curriculumLoaded: false,
    processingJob: null,
    lastJobNotification: null
  };
  notifyListeners();
}
