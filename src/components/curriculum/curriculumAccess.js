/**
 * Curriculum Access & Roadmap Constraint Utility
 * Quản lý trạng thái học phí và phân chia lộ trình (Lớp học chung & Lộ trình cá nhân riêng)
 */

export const TUITION_STORAGE_PREFIX = 'veval_tuition_paid_';

/**
 * Kiểm tra xem học sinh đã đóng học phí / kích hoạt khóa học chưa
 * @param {string} studentId
 * @param {Storage} [storage=localStorage]
 * @returns {boolean}
 */
export function isTuitionPaid(studentId, storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  if (!studentId || !storage) return false;
  return storage.getItem(`${TUITION_STORAGE_PREFIX}${studentId}`) === 'true';
}

/**
 * Cập nhật trạng thái đóng học phí của học sinh
 * @param {string} studentId
 * @param {boolean} [paid=true]
 * @param {Storage} [storage=localStorage]
 */
export function setTuitionPaid(studentId, paid = true, storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  if (!studentId || !storage) return;
  if (paid) {
    storage.setItem(`${TUITION_STORAGE_PREFIX}${studentId}`, 'true');
  } else {
    storage.removeItem(`${TUITION_STORAGE_PREFIX}${studentId}`);
  }
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('veval:tuition-paid', { detail: { studentId, paid } }));
  }
}

/**
 * Xây dựng các chặng Lộ Trình Cá Nhân Riêng từ kết quả khảo sát năng lực (Diagnostic Result)
 * Phân chia theo 3 chặng thích ứng:
 * - Chặng 1: Bù Lỗ Hổng Kiến Thức & Trọng Tâm Bứt Phá (ZPD Priority - Ưu tiên cao nhất)
 * - Chặng 2: Nâng Cao Năng Lực Vận Dụng & Tư Duy Logic (Consolidation)
 * - Chặng 3: Thực Chiến Bấm Giờ & Chinh Phục Điểm Cao 900+ (Mastery & Speed)
 * 
 * @param {Array} chapters
 * @param {Object|null} diagnosticResult
 * @returns {Array} Danh sách các chặng học cá nhân hóa
 */
export function buildPersonalizedStages(chapters = [], diagnosticResult = null) {
  const allEntries = (chapters || []).flatMap((chapter) =>
    (chapter.lessons || []).flatMap((lesson) =>
      (lesson.patterns || []).map((pattern) => ({
        chapter,
        lesson,
        pattern
      }))
    )
  );

  if (!allEntries.length) return [];

  // Xác định các miền năng lực cần ưu tiên bù điểm từ bài thi
  const weakDomainCodes = new Set();
  const domainBreakdown = diagnosticResult?.domainScores || diagnosticResult?.domainBreakdown || {};
  
  Object.entries(domainBreakdown).forEach(([domainKey, scoreData]) => {
    const pct = typeof scoreData === 'number' ? scoreData : (scoreData?.percentage ?? scoreData?.score ?? 100);
    if (pct < 65) {
      weakDomainCodes.add(domainKey.toLowerCase());
    }
  });

  // Phân bổ dạng bài vào 3 chặng học thích ứng
  const stage1Entries = [];
  const stage2Entries = [];
  const stage3Entries = [];

  allEntries.forEach((entry, idx) => {
    const pattern = entry.pattern;
    const name = (pattern.name || '').toLowerCase();
    const isWeakByDomain = weakDomainCodes.size > 0 && Array.from(weakDomainCodes).some(code =>
      (entry.chapter?.name || '').toLowerCase().includes(code) || name.includes(code)
    );

    // Dạng bài ưu tiên bù điểm (trọng số cao, mức độ vận dụng cơ bản hoặc thuộc miền điểm yếu)
    const weight = Number(pattern.weight) || 5;
    if (isWeakByDomain || weight >= 8 || idx % 3 === 0) {
      stage1Entries.push({
        ...entry,
        priorityTag: 'Bù điểm bứt phá',
        potentialGain: '+25 - +35đ',
        estimatedHours: '1.5h - 2h',
        urgency: 'high'
      });
    } else if (weight >= 5 || idx % 3 === 1) {
      stage2Entries.push({
        ...entry,
        priorityTag: 'Vận dụng tư duy',
        potentialGain: '+15 - +20đ',
        estimatedHours: '1h - 1.5h',
        urgency: 'medium'
      });
    } else {
      stage3Entries.push({
        ...entry,
        priorityTag: 'Thực chiến 900+',
        potentialGain: '+10 - +15đ',
        estimatedHours: '1h',
        urgency: 'normal'
      });
    }
  });

  return [
    {
      id: 'stage-1',
      title: 'Chặng 1: Bù Lỗ Hổng Kiến Thức & Trọng Tâm Bứt Phá',
      subtitle: 'Ưu tiên khắc phục các dạng bài có sai số lớn nhất từ bài thi khảo sát năng lực',
      badge: 'Ưu tiên cấp thiết',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      potentialPoints: '+75 - +110 Điểm',
      estimatedTime: '8 - 12 Giờ',
      entries: stage1Entries
    },
    {
      id: 'stage-2',
      title: 'Chặng 2: Nâng Cao Năng Lực Vận Dụng & Logic ĐGNL',
      subtitle: 'Mở rộng kỹ năng giải quyết vấn đề và các dạng câu hỏi liên môn chuẩn V-ACT',
      badge: 'Củng cố nền tảng',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      potentialPoints: '+50 - +70 Điểm',
      estimatedTime: '10 - 14 Giờ',
      entries: stage2Entries
    },
    {
      id: 'stage-3',
      title: 'Chặng 3: Thực Chiến Bấm Giờ & Chinh Phục Điểm 900+',
      subtitle: 'Tối ưu tốc độ làm bài, rèn phản xạ nhận diện bẫy và bứt phá về đích',
      badge: 'Tối ưu tốc độ',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      potentialPoints: '+35 - +50 Điểm',
      estimatedTime: '6 - 8 Giờ',
      entries: stage3Entries
    }
  ];
}

