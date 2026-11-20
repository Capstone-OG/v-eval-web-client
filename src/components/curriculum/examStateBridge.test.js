import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getExamWorkspaceState,
  subscribeExamWorkspaceState,
  updateExamWorkspaceState,
  resetExamWorkspaceState
} from './examStateBridge.js';
import {
  sanitizeExamMathAndLatex,
  splitExamContentBlocks,
  normalizeExamData
} from '../../utils/examParserUtils.js';
import {
  inferQuestionSubject,
  autoMapExamQuestions
} from '../../utils/examCurriculumMatcher.js';

test('examStateBridge synchronizes active exam, studio selection, and Bloom drafts across pages', () => {
  resetExamWorkspaceState();

  let notifications = 0;
  const unsub = subscribeExamWorkspaceState(() => {
    notifications += 1;
  });

  const sampleExam = {
    examId: 'exam-1',
    title: 'Đề ĐGNL Toán 2026',
    subjectCode: 'MATH',
    passages: [],
    singleQuestions: [{ localId: 'q_10', questionNumber: 10, content: 'Tính đạo hàm' }]
  };

  updateExamWorkspaceState({
    currentExam: sampleExam,
    selectedQuestionLocalId: 'q_10',
    hasUnsavedChanges: true,
    aiBloomDrafts: [{ draftId: 'd_1', status: 'pending', difficultyLevel: 4 }]
  });

  const snap = getExamWorkspaceState();
  assert.equal(notifications, 1);
  assert.equal(snap.currentExam.title, 'Đề ĐGNL Toán 2026');
  assert.equal(snap.selectedQuestionLocalId, 'q_10');
  assert.equal(snap.hasUnsavedChanges, true);
  assert.equal(snap.aiBloomDrafts.length, 1);

  // Functional updater keeps unrelated keys intact
  updateExamWorkspaceState((prev) => ({
    bankSubView: prev.bankSubView === 'paper' ? 'organize' : 'paper'
  }));
  assert.equal(getExamWorkspaceState().bankSubView, 'organize');
  assert.equal(getExamWorkspaceState().selectedQuestionLocalId, 'q_10');
  assert.equal(notifications, 2);

  unsub();
  resetExamWorkspaceState();
  assert.equal(getExamWorkspaceState().currentExam, null);
  assert.equal(notifications, 2);
});

test('sanitizeExamMathAndLatex & splitExamContentBlocks fix all 8 OCR/LaTeX/Matrix regressions', () => {
  // 1. Vietnamese words with hyphens & units ("gì hết - Vâng", "phẩm chất - Tôi", "có sẵn gồm 5 kg bột")
  const litQuote = sanitizeExamMathAndLatex(
    'đừng trên dưới gì hế $t - V$ âng, nếu gọi như thế là phẩm chấ $t - T$ ôi yêu cầu. Số nguyên liệu có sẵ $n$ gồm 5 kg bột.'
  );
  assert.ok(litQuote.includes('gì hết - Vâng'), `Expected "gì hết - Vâng" in: ${litQuote}`);
  assert.ok(litQuote.includes('phẩm chất - Tôi'), `Expected "phẩm chất - Tôi" in: ${litQuote}`);
  assert.ok(litQuote.includes('có sẵn gồm'), `Expected "có sẵn gồm" in: ${litQuote}`);

  // 2. Underlined English error-identification tags (Câu 36-39) — chữ ABCD trên đề bị loại bỏ, chỉ giữ gạch chân
  const engStem = sanitizeExamMathAndLatex(
    'Mathematics, <u>which</u > (A) many students believe <u>is</$u > (B)$ too difficult, actually <u>require</u > (C).'
  );
  assert.ok(engStem.includes('<u>which</u>'), engStem);
  assert.ok(engStem.includes('<u>is</u>'), engStem);
  assert.ok(engStem.includes('<u>require</u>'), engStem);
  assert.ok(!engStem.includes('(A)'), `Expected (A) stripped in: ${engStem}`);
  assert.ok(!engStem.includes('(B)'), `Expected (B) stripped in: ${engStem}`);
  assert.ok(!engStem.includes('(C)'), `Expected (C) stripped in: ${engStem}`);

  // 3. Piecewise \begin{cases} with broken \ne -> \n e 2 (Câu 69)
  const casesStem = sanitizeExamMathAndLatex(
    'Cho hàm số f(x) = \\begin{cases} \\frac{x^2-4}{x-2} , & x\ne 2 \\\\ m + 1, & x = 2 \\end{cases} với m là tham số thực.'
  );
  assert.ok(casesStem.includes('\\ne 2'), `Expected \\ne 2 in: ${casesStem}`);
  assert.ok(casesStem.includes('$f(x) = \\begin{cases}'), `Expected wrapped cases block in: ${casesStem}`);

  // 4. Degree Celsius \circC (Câu 111)
  const bioStem = sanitizeExamMathAndLatex('Khi tiến hành thí nghiệm ở 4\\circC , giá trị hấp thụ A460 thay đổi.');
  assert.ok(bioStem.includes('$4^\\circ\\text{C}$'), `Expected $4^\\circ\\text{C}$ in: ${bioStem}`);

  // 5. Space-separated 6x6 adjacency matrix (Câu 65)
  const matrixText = [
    'Có 6 thị trấn A, B, C, D, E và F được kết nối với nhau theo bảng sau.',
    'A B C D E F',
    'A 0 1 0 8 4 1',
    'B 1 0 2 0 0 0',
    'C 0 2 0 3 0 0',
    'D 8 0 3 0 5 0',
    'E 4 0 0 5 0 1',
    'F 1 0 0 0 1 0',
    'Tổng số tuyến đường là:'
  ].join('\n');
  const blocks = splitExamContentBlocks(matrixText);
  const tableBlock = blocks.find((b) => b.type === 'table');
  assert.ok(tableBlock, 'Expected 6x6 adjacency matrix to be parsed into a structured table block');
  assert.equal(tableBlock.table.bodyRows.length, 6);

  // 6. MathType PUA / ≡ /  log & radical recovery (Câu 22, 62, 64)
  const logCorrupted = 'Cho a ≡ log 5 , b ≡ log 3 . Biết log 15 ≡ với m, n là các số nguyên. Giá trị\n2 5 24\nn ≡ ab\nS 2 2 là:\n≡ m ≡ n';
  const logFixed = sanitizeExamMathAndLatex(logCorrupted);
  assert.ok(logFixed.includes('\\log_2 5') && logFixed.includes('S = m^2 + n^2'), logFixed);
});

test('inferQuestionSubject & autoMapExamQuestions prevent cross-subject leakage and heal wrong nodes', () => {
  const q36 = {
    questionNumber: 36,
    content: 'Mathematics, <u>which</u> (A) many students believe <u>is</u> (B) too difficult, actually <u>require</u> (C) logical thinking <u>rather than</u> (D) memorization.',
    options: { A: 'which', B: 'is', C: 'require', D: 'rather than' }
  };
  const q38 = {
    questionNumber: 38,
    content: "Ms. Brown is <u>worried</u> (A) about her <u>students'</u> (B) ability to pass the <u>coming</u> (C) graduation <u>exams</u> (D)."
  };
  const q22 = {
    questionNumber: 22,
    content: 'Cho $a = \\log_2 5$, $b = \\log_5 3$. Biết $\\log_{24} 15 = \\frac{ma + n}{ab + 2}$ với $m, n$ là các số nguyên.'
  };
  const q65 = {
    questionNumber: 65,
    content: 'Có 6 thị trấn A, B, C, D, E và F được kết nối với nhau bởi một số tuyến đường.'
  };

  assert.equal(inferQuestionSubject(q36), 'ENGL');
  assert.equal(inferQuestionSubject(q38), 'ENGL');
  assert.equal(inferQuestionSubject(q22), 'MATH');
  assert.equal(inferQuestionSubject(q65), 'MATH');

  const sampleFlatNodes = [
    {
      skillId: '11111111-1111-1111-1111-000000000001',
      domainName: 'Khoa học tự nhiên',
      chapterName: 'Chương 1: Dao động (Vật lí - Lớp 11)',
      lessonName: 'Bài 1: Mô tả dao động',
      patternName: 'Dao động điều hòa',
      subSubject: 'PHYS',
      patternFold: 'dao dong dieu hoa',
      lessonFold: 'bai 1 mo ta dao dong',
      chapterFold: 'chuong 1 dao dong vat li lop 11',
      searchText: 'dao dong vat li',
      tokens: new Set(['dao', 'dong', 'vat', 'li'])
    },
    {
      skillId: '11111111-1111-1111-1111-000000000002',
      domainName: 'Ngôn ngữ',
      chapterName: 'Chương 5: Mệnh đề quan hệ & Cấu trúc câu (Tiếng Anh - Lớp 12)',
      lessonName: 'Bài 1: Relative Clauses',
      patternName: 'Mệnh đề quan hệ & Sự hòa hợp chủ vị',
      subSubject: 'ENGL',
      patternFold: 'menh de quan he su hoa hop chu vi',
      lessonFold: 'bai 1 relative clauses',
      chapterFold: 'chuong 5 menh de quan he cau truc cau tieng anh lop 12',
      searchText: 'tieng anh menh de quan he relative clauses',
      tokens: new Set(['tieng', 'anh', 'menh', 'de', 'quan', 'he', 'relative'])
    }
  ];

  // Even if q36 previously had a wrong PHYS node cached, autoMapExamQuestions heals it to ENGL
  const examWithWrongNode = normalizeExamData({
    title: 'Đề ĐGNL',
    singleQuestions: [
      {
        ...q36,
        curriculumNode: {
          skillId: '11111111-1111-1111-1111-000000000001',
          domainName: 'Khoa học tự nhiên',
          chapterName: 'Chương 1: Dao động (Vật lí - Lớp 11)',
          lessonName: 'Bài 1: Mô tả dao động',
          matchSource: 'auto'
        }
      }
    ]
  });

  const healed = autoMapExamQuestions(examWithWrongNode, sampleFlatNodes, { force: false });
  assert.equal(healed.singleQuestions[0].curriculumNode.skillId, '11111111-1111-1111-1111-000000000002');
});



test('sanitizeExamMathAndLatex repairs escaped </u> tags, degree units and NFD Vietnamese text (round 2 screenshots)', () => {
  const underline = sanitizeExamMathAndLatex(
    "Mary works for <u>an<\\/u > (A) magazine in <u>men's$<\\/u > (C)$ clothes."
  );
  assert.equal(underline, "Mary works for <u>an</u> magazine in <u>men's</u> clothes.");

  assert.equal(
    sanitizeExamMathAndLatex('đến $$100^{\\circC}$$, nước'),
    'đến $$100^\\circ\\text{C}$$, nước'
  );
  assert.equal(
    sanitizeExamMathAndLatex('đến 100^{\\circ C} và 0^{\\circ}C xong'),
    'đến $100^\\circ\\text{C}$ và $0^\\circ\\text{C}$ xong'
  );

  const nfd = 'Bài Thi Mẫu - Trang 15 - Bài Thi'.normalize('NFD');
  assert.equal(sanitizeExamMathAndLatex(nfd), 'Bài Thi Mẫu - Trang 15 - Bài Thi'.normalize('NFC'));
  assert.equal(sanitizeExamMathAndLatex('Mẫu - Trang 15 - B ài Thi'), 'Mẫu - Trang 15 - Bài Thi');
});

test('normalizeExamData filters out cross-subject nodes on pure English questions (Câu 26-29)', () => {
  const rawExam = {
    examId: 'test-exam-cross',
    title: 'Đề ĐGNL Tổng Hợp',
    subjectCode: 'GENERAL',
    singleQuestions: [
      {
        questionNumber: 26,
        content: 'There were too many participants in the event, so each of them <u>were</u > (C) asked just one question.',
        curriculumNode: {
          skillId: 'phys-1',
          domainName: 'Tư duy Khoa học / Khoa học tự nhiên',
          chapterName: 'Chương 1: Dao động (Vật lí - Lớp 11)',
          lessonName: 'Bài 1: Mô tả dao động'
        }
      },
      {
        questionNumber: 28,
        content: "Timmy's pet dog is so lovely. It always wags <u>it's</u > (B) tail to greet him whenever he comes home.",
        curriculumNode: {
          skillId: 'chem-1',
          domainName: 'Tư duy Khoa học / Khoa học tự nhiên',
          chapterName: 'Chương 6: Tốc độ phản ứng hoá học (Hóa học - Lớp 10)'
        }
      },
      {
        questionNumber: 29,
        content: 'France, <u>where</u > (B) is a very beautiful country, has many tourist attractions.',
        curriculumNode: {
          skillId: 'math-1',
          domainName: 'Toán học & Tư duy định lượng',
          chapterName: 'Chương 1: Mệnh đề và tập hợp (Toán - Lớp 10)'
        }
      }
    ]
  };

  const normalized = normalizeExamData(rawExam);
  assert.equal(normalized.singleQuestions[0].curriculumNode, null);
  assert.equal(normalized.singleQuestions[1].curriculumNode, null);
  assert.equal(normalized.singleQuestions[2].curriculumNode, null);
});

test('normalizeExamData automatically heals corrupted History passage 118-120 and extracts trapped child questions', () => {
  const corruptedExam = {
    title: 'Đề ĐGNL V-ACT',
    passages: [
      {
        startQuestion: 118,
        endQuestion: 120,
        content: `o
Từ năm 1897, sau khi đàn áp cuộc khởi nghĩa cuối cùng trong phong trào Cần Vương là khởi
nghĩa Hương Khê và tiến hành giảng hòa với Hoàng Hoa Thám ở Yên Thế...
g thành nơi cung
sức người, sức của rẻ mạt cho Pháp.
u
V tư bản chủ
• sự song
i tiếp luồng
đ
đầu thế kỉ XX.
Lịch sử 11, trang 155
118. xã quan
thập niên đầu thế kỉ XX
Công g
A. nhân, dân
nông
B. Trí thức, Tiểu tư sản thành thị
C. Trí thức Nho học
D. Tư sản dân tộc`,
        questions: []
      }
    ]
  };

  const healed = normalizeExamData(corruptedExam);
  const p = healed.passages[0];

  assert.equal(p.questions.length, 3, 'Passage must have 3 child questions extracted');
  assert.equal(p.questions[0].questionNumber, 118);
  assert.equal(p.questions[1].questionNumber, 119);
  assert.equal(p.questions[2].questionNumber, 120);

  // Passage content must be clean without stray single letters
  assert.ok(!p.content.startsWith('o\n'), 'Stray "o" line must be cleaned');
  assert.ok(!p.content.includes('g thành nơi cung'), 'Stray "g" line must be cleaned');
  assert.ok(p.content.includes('Cần Vương là khởi nghĩa Hương Khê'));
  assert.ok(p.content.includes('Lịch sử 11, trang 155'));

  // Question 118 must have proper stem and options
  assert.ok(p.questions[0].content.includes('Lực lượng xã hội nào đã có đóng góp quan trọng'));
  assert.equal(p.questions[0].options.C, 'Trí thức Nho học');
});
