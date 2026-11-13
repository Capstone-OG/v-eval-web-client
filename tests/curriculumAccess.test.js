import { test } from 'node:test';
import assert from 'node:assert/strict';
import { 
  isTuitionPaid, 
  setTuitionPaid, 
  buildPersonalizedStages, 
  TUITION_STORAGE_PREFIX 
} from '../src/components/curriculum/curriculumAccess.js';

const makeStorage = () => {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
};

test('isTuitionPaid returns false by default and true when tuition is recorded', () => {
  const storage = makeStorage();
  assert.equal(isTuitionPaid('student-1', storage), false);
  assert.equal(isTuitionPaid(null, storage), false);

  setTuitionPaid('student-1', true, storage);
  assert.equal(isTuitionPaid('student-1', storage), true);
  assert.equal(storage.getItem(`${TUITION_STORAGE_PREFIX}student-1`), 'true');

  // Other student remains unpaid
  assert.equal(isTuitionPaid('student-2', storage), false);

  // Deactivate tuition
  setTuitionPaid('student-1', false, storage);
  assert.equal(isTuitionPaid('student-1', storage), false);
  assert.equal(storage.getItem(`${TUITION_STORAGE_PREFIX}student-1`), null);
});

test('buildPersonalizedStages clusters chapters into 3 adaptive stages with priority tags', () => {
  const mockChapters = [
    {
      chapterId: 'c1',
      name: 'Toán học & Giải tích',
      lessons: [
        {
          lessonId: 'l1',
          name: 'Ứng dụng Đạo hàm',
          patterns: [
            { patternId: 'p1', name: 'Cực trị hàm số chứa tham số m', weight: 9 },
            { patternId: 'p2', name: 'Đơn điệu trên từng khoảng xác định', weight: 5 },
            { patternId: 'p3', name: 'Tiệm cận đồ thị hàm số', weight: 3 }
          ]
        }
      ]
    },
    {
      chapterId: 'c2',
      name: 'Vật lí & Sóng cơ',
      lessons: [
        {
          lessonId: 'l2',
          name: 'Giao thoa sóng',
          patterns: [
            { patternId: 'p4', name: 'Xác định số điểm cực đại cực tiểu', weight: 8 },
            { patternId: 'p5', name: 'Độ lệch pha hai nguồn kết hợp', weight: 4 }
          ]
        }
      ]
    }
  ];

  const mockDiagnostic = {
    totalScore: 480,
    estimatedScore: 480,
    theta: -0.25,
    domainScores: {
      dom_math: { score: 45, percentage: 45 },
      dom_nat_sci: { score: 40, percentage: 40 },
      dom_lang: { score: 75, percentage: 75 }
    }
  };

  const stages = buildPersonalizedStages(mockChapters, mockDiagnostic);
  assert.equal(stages.length, 3);
  assert.equal(stages[0].id, 'stage-1');
  assert.equal(stages[1].id, 'stage-2');
  assert.equal(stages[2].id, 'stage-3');

  // Stage 1 must contain high-priority remediation entries
  assert.ok(stages[0].entries.length > 0);
  assert.ok(stages[0].entries.some(e => e.pattern.weight >= 8));
  assert.equal(stages[0].entries[0].priorityTag, 'Bù điểm bứt phá');
  assert.equal(stages[0].entries[0].urgency, 'high');
});

test('buildPersonalizedStages handles empty input gracefully', () => {
  assert.deepEqual(buildPersonalizedStages([], null), []);
  assert.deepEqual(buildPersonalizedStages(null, null), []);
});

