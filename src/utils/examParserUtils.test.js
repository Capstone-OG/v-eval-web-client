import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeExamMathAndLatex,
  parseTwoTierMarkdownTable,
  splitExamContentBlocks,
  extractInlineChartsFromText,
  resolveExamMediaUrl,
  normalizeExamData,
  buildImportExamPayload,
  buildOrderedExamView,
  formatTimerSeconds
} from './examParserUtils.js';

test('sanitizeExamMathAndLatex recovers ASCII escapes, Delta, STEM units and bare math symbols', () => {
  const raw = 'Ta có \x0crac{1}{2} \x09imes ar{ ext{A}} và tốc độ R = -\\Delta[Acetone]/\\Delta t đạt 2,33.10-3 mol.l-1.phút-1 với P_{hp} và $P_n$ tăng k^2 lần.';
  const cleaned = sanitizeExamMathAndLatex(raw);

  assert.match(cleaned, /\\frac\{1\}\{2\}/);
  assert.match(cleaned, /\\times/);
  assert.match(cleaned, /\\Delta/);
  assert.match(cleaned, /\$R = -\\frac\{\\Delta\[\\text\{Acetone\}\]\}\{\\Delta t\}\$/);
  assert.match(cleaned, /\$2,33 \\cdot 10\^\{-3\}\\text\{ mol\}\\cdot\\text\{l\}\^\{-1\}\\cdot\\text\{phút\}\^\{-1\}\$/);
  assert.match(cleaned, /\$P_\{hp\}\$/);
  assert.match(cleaned, /\$k\^2\$/);
  // Existing $P_n$ should not be double-wrapped as $$P_n$$
  assert.ok(!cleaned.includes('$$P_n$$'));
});

test('parseTwoTierMarkdownTable detects 2-tier grouped headers with colspan and rowspan', () => {
  const rows = [
    '| Loài cây | Số giờ chiếu sáng vào ban đêm (giờ): 0,5 | 1 | 2 |',
    '| --- | --- | --- | --- |',
    '| Cây A | Có hoa | Có hoa | Không |'
  ];
  const parsed = parseTwoTierMarkdownTable(rows);

  assert.equal(parsed.hasTwoTierGroups, true);
  assert.equal(parsed.groups.length, 2);
  assert.deepEqual(parsed.groups[0], { type: 'single', title: 'Loài cây' });
  assert.deepEqual(parsed.groups[1], {
    type: 'group',
    mainTitle: 'Số giờ chiếu sáng vào ban đêm (giờ)',
    subCols: ['0,5', '1', '2'],
    colspan: 3
  });
  assert.deepEqual(parsed.bodyRows, [['Cây A', 'Có hoa', 'Có hoa', 'Không']]);
});

test('splitExamContentBlocks separates text and tables cleanly', () => {
  const md = 'Đoạn mở đầu\n| Cột A | Cột B |\n| --- | --- |\n| 1 | 2 |\nĐoạn kết';
  const blocks = splitExamContentBlocks(md);

  assert.equal(blocks.length, 3);
  assert.equal(blocks[0].type, 'text');
  assert.equal(blocks[1].type, 'table');
  assert.equal(blocks[2].type, 'text');
});

test('extractInlineChartsFromText parses Vietnamese Bar and Pie charts with comma decimals', () => {
  const text = [
    '[Hình vẽ]: Biểu đồ cột tỷ trọng ngành: Nông nghiệp (12,5%), Công nghiệp (45,5%), Dịch vụ (42%)',
    'Biểu đồ hình tròn cơ cấu dân số: Thành thị (37,5%), Nông thôn (62,5%)'
  ].join('\n');

  const charts = extractInlineChartsFromText(text);
  assert.equal(charts.length, 2);
  assert.equal(charts[0].type, 'bar');
  assert.deepEqual(charts[0].items, [
    { label: 'Nông nghiệp', value: 12.5 },
    { label: 'Công nghiệp', value: 45.5 },
    { label: 'Dịch vụ', value: 42 }
  ]);
  assert.equal(charts[1].type, 'pie');
  assert.deepEqual(charts[1].items, [
    { label: 'Thành thị', value: 37.5 },
    { label: 'Nông thôn', value: 62.5 }
  ]);
});

test('resolveExamMediaUrl resolves Gateway relative paths while keeping data/http URLs intact', () => {
  assert.equal(
    resolveExamMediaUrl('/extracted_images/ex1/q75.png', 'http://localhost:5212'),
    'http://localhost:5212/extracted_images/ex1/q75.png'
  );
  assert.equal(
    resolveExamMediaUrl('fig1.png', 'http://localhost:5212/'),
    'http://localhost:5212/uploads/images/fig1.png'
  );
  assert.equal(resolveExamMediaUrl('data:image/png;base64,abc', 'http://localhost:5212'), 'data:image/png;base64,abc');
  assert.equal(resolveExamMediaUrl('https://cdn.example.com/a.png', 'http://localhost:5212'), 'https://cdn.example.com/a.png');
});

test('normalizeExamData, buildOrderedExamView and buildImportExamPayload preserve full structure and images', () => {
  const rawFromAi = {
    file_name: 'De_DGNL_2026.pdf',
    passages: [
      {
        start_question: 2,
        end_question: 3,
        content: 'Đọc đoạn văn sau...',
        image_url: '/extracted_images/e1/p1.png',
        questions: [
          {
            question_number: 2,
            page_number: 1,
            content: '![Hình minh họa](/extracted_images/e1/q2.png)\n\nNội dung câu 2',
            options: { A: 'a2', B: 'b2', C: 'c2', D: 'd2' },
            correct_option: 'Phương án B',
            suggested_skill_name: 'Đọc hiểu'
          },
          {
            question_number: 3,
            page_number: 2,
            content: 'Nội dung câu 3',
            options: { A: 'a3', B: 'b3', C: 'c3', D: 'd3' },
            correct_option: 'C'
          }
        ]
      }
    ],
    single_questions: [
      {
        question_number: 1,
        page_number: 1,
        content: 'Nội dung câu 1',
        options: { A: '1', B: '2', C: '3', D: '4' },
        correct_option: 'D',
        image_url: '/extracted_images/e1/q1.png'
      }
    ]
  };

  const normalized = normalizeExamData(rawFromAi, { source: 'ai' });
  assert.equal(normalized.title, 'De_DGNL_2026');
  assert.equal(normalized.passages[0].questions[0].imageUrl, '/extracted_images/e1/q2.png');
  assert.equal(normalized.passages[0].questions[0].content, 'Nội dung câu 2');
  assert.equal(normalized.passages[0].questions[0].correctOption, 'B');

  const ordered = buildOrderedExamView(normalized);
  assert.equal(ordered.items.length, 2);
  assert.equal(ordered.items[0].type, 'question');
  assert.equal(ordered.items[0].data.questionNumber, 1);
  assert.equal(ordered.items[1].type, 'passage');
  assert.equal(ordered.stats.totalQuestions, 3);
  assert.equal(ordered.stats.totalPassages, 1);
  assert.equal(ordered.stats.totalSingles, 1);

  const payload = buildImportExamPayload(normalized);
  assert.equal(payload.title, 'De_DGNL_2026');
  assert.equal(payload.passages[0].imageUrl, '/extracted_images/e1/p1.png');
  assert.equal(payload.passages[0].questions[0].correctOption, 'B');
  assert.equal(payload.passages[0].questions[0].imageUrl, '/extracted_images/e1/q2.png');
  assert.equal(payload.singleQuestions[0].correctOption, 'D');
  assert.equal(payload.singleQuestions[0].imageUrl, '/extracted_images/e1/q1.png');
});

test('formatTimerSeconds formats mm:ss accurately', () => {
  assert.equal(formatTimerSeconds(0), '00:00');
  assert.equal(formatTimerSeconds(65), '01:05');
  assert.equal(formatTimerSeconds(185), '03:05');
});

test('splitExamContentBlocks parses HTML rowspan/colspan tables and preserves [VARIATION_TABLE] blocks', () => {
  const richExamText = [
    'Cho bảng biến thiên sau:',
    '[VARIATION_TABLE]',
    'x: -\\infty | 0 | 2 | +\\infty',
    "y': + | 0 | - | 0 | +",
    '[/VARIATION_TABLE]',
    'Và bảng dữ liệu 2 tầng:',
    '<table><tr><th rowspan="2">Chỉ tiêu</th><th colspan="2">Năm</th></tr><tr><th>2024</th><th>2025</th></tr><tr><td>Doanh thu</td><td>120</td><td>150</td></tr></table>'
  ].join('\n');

  const blocks = splitExamContentBlocks(richExamText);
  const textBlock = blocks.find((b) => b.type === 'text');
  const htmlTableBlock = blocks.find((b) => b.type === 'html-table');

  assert.ok(textBlock, 'Expected text block containing [VARIATION_TABLE]');
  assert.ok(textBlock.content.includes('[VARIATION_TABLE]'));
  assert.ok(textBlock.content.includes("y': + | 0 | - | 0 | +"));
  assert.ok(htmlTableBlock, 'Expected structured html-table block');
  assert.equal(htmlTableBlock.table.rows.length, 3);
  assert.equal(htmlTableBlock.table.rows[0].cells[0].rowSpan, 2);
  assert.equal(htmlTableBlock.table.rows[0].cells[1].colSpan, 2);
  assert.equal(htmlTableBlock.table.rows[2].cells[2].content, '150');
});
