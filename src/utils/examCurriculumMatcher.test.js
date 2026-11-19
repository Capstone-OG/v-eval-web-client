import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  flattenCurriculumTree,
  matchQuestionToCurriculumNode,
  autoMapExamQuestions,
  applyAiNodeMappingsToExam,
  buildExamBlueprintStats
} from './examCurriculumMatcher.js';
import { normalizeExamData, buildImportExamPayload } from './examParserUtils.js';

const MOCK_CURRICULUM_DOMAINS = [
  {
    domainId: 'd-math',
    domainCode: 'MATH',
    title: 'Toán học & Tư duy định lượng',
    chapters: [
      {
        chapterId: 'c-math-12-1',
        name: 'Chương 1: Ứng dụng đạo hàm để khảo sát hàm số (Toán học - Lớp 12)',
        lessons: [
          {
            lessonId: 'l-math-12-1-1',
            name: 'Bài 1: Tính đơn điệu và cực trị của hàm số',
            patterns: [
              {
                patternId: '11111111-1111-1111-1111-111111111111',
                name: 'Dạng 1: Tìm cực trị của hàm số đa thức'
              }
            ]
          }
        ]
      }
    ]
  },
  {
    domainId: 'd-sci',
    domainCode: 'SCI',
    title: 'Tư duy Khoa học / Khoa học tự nhiên',
    chapters: [
      {
        chapterId: 'c-chem-12-1',
        name: 'Chương 1: Ester - Lipid (Hóa học - Lớp 12)',
        lessons: [
          {
            lessonId: 'l-chem-12-1-1',
            name: 'Bài 1: Ester - Lipid',
            patterns: [
              {
                patternId: '22222222-2222-2222-2222-222222222222',
                name: 'Dạng 2: Phản ứng xà phòng hóa chất béo'
              }
            ]
          }
        ]
      },
      {
        chapterId: 'c-phys-11-1',
        name: 'Chương 1: Dao động (Vật lí - Lớp 11)',
        lessons: [
          {
            lessonId: 'l-phys-11-1-2',
            name: 'Bài 2: Con lắc lò xo và con lắc đơn',
            patterns: [
              {
                patternId: '33333333-3333-3333-3333-333333333333',
                name: 'Dạng 1: Chu kì dao động điều hòa con lắc lò xo'
              }
            ]
          }
        ]
      }
    ]
  }
];

test('flattenCurriculumTree builds 4-level node index with grade and sub-subject metadata', () => {
  const nodes = flattenCurriculumTree(MOCK_CURRICULUM_DOMAINS);
  assert.equal(nodes.length, 3);
  assert.equal(nodes[0].skillId, '11111111-1111-1111-1111-111111111111');
  assert.equal(nodes[0].grade, 12);
  assert.equal(nodes[0].subSubject, 'MATH');
  assert.equal(nodes[1].subSubject, 'CHEM');
  assert.equal(nodes[2].grade, 11);
  assert.equal(nodes[2].subSubject, 'PHYS');
});

test('matchQuestionToCurriculumNode identifies exact Chapter, Lesson & Pattern without cross-subject leaks', () => {
  const nodes = flattenCurriculumTree(MOCK_CURRICULUM_DOMAINS);

  const mathMatch = matchQuestionToCurriculumNode(
    {
      questionNumber: 1,
      content: 'Cho hàm số $y = x^3 - 3x + 2$. Tìm giá trị cực đại của hàm số.',
      suggestedSkillName: 'Cực trị hàm số đa thức'
    },
    '',
    'GENERAL',
    nodes
  );
  assert.equal(mathMatch.bestNode?.skillId, '11111111-1111-1111-1111-111111111111');
  assert.ok(mathMatch.confidence >= 0.65);

  const chemMatch = matchQuestionToCurriculumNode(
    {
      questionNumber: 94,
      content: 'Thủy phân hoàn toàn chất béo tristearin trong dung dịch NaOH (phản ứng xà phòng hóa).',
      suggestedSkillName: 'Phản ứng xà phòng hóa ester'
    },
    '',
    'GENERAL',
    nodes
  );
  assert.equal(chemMatch.bestNode?.skillId, '22222222-2222-2222-2222-222222222222');

  const physMatch = matchQuestionToCurriculumNode(
    {
      questionNumber: 75,
      content: 'Một con lắc lò xo dao động điều hòa với chu kì T = 0,5 s.',
      suggestedSkillName: 'Dao động con lắc lò xo'
    },
    '',
    'GENERAL',
    nodes
  );
  assert.equal(physMatch.bestNode?.skillId, '33333333-3333-3333-3333-333333333333');
});

test('autoMapExamQuestions, buildExamBlueprintStats & buildImportExamPayload connect end-to-end with real SkillId GUIDs', () => {
  const nodes = flattenCurriculumTree(MOCK_CURRICULUM_DOMAINS);
  const rawExam = normalizeExamData(
    {
      file_name: 'De_DGNL_Test.pdf',
      passages: [
        {
          start_question: 2,
          end_question: 2,
          content: 'Thí nghiệm phản ứng xà phòng hóa chất béo với NaOH đun nóng.',
          questions: [
            {
              question_number: 2,
              content: 'Tính khối lượng muối thu được sau phản ứng xà phòng hóa ester.',
              options: { A: '10g', B: '20g', C: '30g', D: '40g' },
              correct_option: 'B',
              suggested_skill_name: 'Xà phòng hóa chất béo'
            }
          ]
        }
      ],
      single_questions: [
        {
          question_number: 1,
          content: 'Tìm điểm cực trị của hàm số đa thức bậc ba $y = x^3 - 3x$.',
          options: { A: '1', B: '-1', C: '0', D: '2' },
          correct_option: 'A',
          suggested_skill_name: 'Cực trị hàm số'
        }
      ]
    },
    { source: 'ai' }
  );

  const mapped = autoMapExamQuestions(rawExam, nodes);
  assert.equal(mapped.singleQuestions[0].curriculumNode?.skillId, '11111111-1111-1111-1111-111111111111');
  assert.equal(mapped.passages[0].questions[0].curriculumNode?.skillId, '22222222-2222-2222-2222-222222222222');

  const blueprint = buildExamBlueprintStats(mapped);
  assert.equal(blueprint.totalQuestions, 2);
  assert.equal(blueprint.mappedCount, 2);
  assert.equal(blueprint.coveragePercent, 100);
  assert.equal(blueprint.byDomain.length, 2);
  assert.equal(blueprint.byChapter.length, 2);

  const payload = buildImportExamPayload(mapped);
  assert.equal(payload.singleQuestions[0].skillId, '11111111-1111-1111-1111-111111111111');
  assert.equal(payload.passages[0].questions[0].skillId, '22222222-2222-2222-2222-222222222222');
  assert.match(payload.singleQuestions[0].chapterName, /Ứng dụng đạo hàm/);
});

test('applyAiNodeMappingsToExam applies AI Engine classification results with Bloom level and confidence', () => {
  const nodes = flattenCurriculumTree(MOCK_CURRICULUM_DOMAINS);
  const exam = normalizeExamData(
    {
      title: 'Đề vật lí',
      single_questions: [
        {
          question_number: 5,
          content: 'Con lắc lò xo dao động điều hòa',
          options: { A: '1', B: '2', C: '3', D: '4' },
          correct_option: 'C'
        }
      ]
    },
    { source: 'ai' }
  );

  const updated = applyAiNodeMappingsToExam(
    exam,
    [
      {
        question_number: 5,
        skill_id: '33333333-3333-3333-3333-333333333333',
        confidence: 0.94,
        bloom_level: 3,
        reason: 'Tính chu kì con lắc lò xo'
      }
    ],
    nodes
  );

  assert.equal(updated.singleQuestions[0].curriculumNode?.skillId, '33333333-3333-3333-3333-333333333333');
  assert.equal(updated.singleQuestions[0].curriculumNode?.matchSource, 'ai');
  assert.equal(updated.singleQuestions[0].curriculumNode?.confidence, 0.94);
  assert.equal(updated.singleQuestions[0].difficultyLevel, 3);
});

