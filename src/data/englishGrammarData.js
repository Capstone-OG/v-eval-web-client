// Comprehensive English Grammar Reference for V-ACT & High School Exams

export const ENGLISH_GRAMMAR_CATEGORIES = [
  { id: 'tenses', label: '12 Thì Tiếng Anh' },
  { id: 'articles', label: 'Mạo từ (a/an/the)' },
  { id: 'conditionals', label: 'Điều kiện & Câu ước' },
  { id: 'passive_reported', label: 'Bị động & Tường thuật' },
  { id: 'clauses', label: 'Mệnh đề & Đảo ngữ' },
  { id: 'modals_verbs', label: 'Modal, V-ing/To-V & Giả định' },
  { id: 'structures', label: 'So sánh, Câu hỏi đuôi & Câu chẻ' },
  { id: 'vocab_wordform', label: 'Cấu tạo từ, S-V & Giới từ' }
];

export const ENGLISH_GRAMMAR_TOPICS = [
  // ==================== 12 TENSES ====================
  {
    id: 'present_simple',
    category: 'tenses',
    title: '1. Hiện tại đơn (Present Simple)',
    formulas: [
      '(+) S + V(s/es)  |  S + am/is/are + N/Adj',
      '(-) S + do/does + not + V_inf',
      '(?) Do/Does + S + V_inf?'
    ],
    usage: 'Thói quen lặp đi lặp lại, sự thật hiển nhiên, lịch trình cố định (tàu, xe, máy bay, thời khóa biểu).',
    signals: 'always, usually, often, sometimes, rarely, never, every day/week, once/twice a week',
    examples: ['Water boils at 100°C.', 'The train leaves at 7:30 tomorrow morning.']
  },
  {
    id: 'present_continuous',
    category: 'tenses',
    title: '2. Hiện tại tiếp diễn (Present Continuous)',
    formulas: [
      '(+) S + am/is/are + V-ing',
      '(-) S + am/is/are + not + V-ing',
      '(?) Am/Is/Are + S + V-ing?'
    ],
    usage: 'Hành động đang xảy ra lúc nói; kế hoạch chắc chắn ở tương lai gần; phàn nàn với "always". Lưu ý KHÔNG chia tiếp diễn với động từ trạng thái (know, believe, love, hate, seem, own...).',
    signals: 'now, right now, at the moment, at present, Look!, Listen!, Keep silent!',
    examples: ['She is studying for the V-ACT exam right now.', 'He is always leaving his keys on the table!']
  },
  {
    id: 'present_perfect',
    category: 'tenses',
    title: '3. Hiện tại hoàn thành (Present Perfect)',
    formulas: [
      '(+) S + have/has + V3/ed',
      '(-) S + have/has + not + V3/ed',
      '(?) Have/Has + S + V3/ed?'
    ],
    usage: 'Bắt đầu trong quá khứ kéo dài tới hiện tại; trải nghiệm; hành động vừa xảy ra để lại kết quả hiện tại.',
    signals: 'just, already, yet, ever, never, since + mốc, for + khoảng, so far, recently, up to now, This is the first time...',
    examples: ['I have lived in Ho Chi Minh City since 2018.', 'This is the first time I have tried this method.']
  },
  {
    id: 'present_perfect_continuous',
    category: 'tenses',
    title: '4. Hiện tại hoàn thành tiếp diễn (Present Perfect Continuous)',
    formulas: [
      '(+) S + have/has + been + V-ing',
      '(-) S + have/has + not + been + V-ing',
      '(?) Have/Has + S + been + V-ing?'
    ],
    usage: 'Nhấn mạnh tính liên tục, kéo dài của hành động từ quá khứ đến hiện tại (và có thể tiếp tục).',
    signals: 'all day, all morning, for + khoảng thời gian, since + mốc thời gian, how long',
    examples: ['They have been practicing math for three hours.']
  },
  {
    id: 'past_simple',
    category: 'tenses',
    title: '5. Quá khứ đơn (Past Simple)',
    formulas: [
      '(+) S + V2/ed  |  S + was/were + N/Adj',
      '(-) S + did + not + V_inf',
      '(?) Did + S + V_inf?'
    ],
    usage: 'Hành động đã chấm dứt hoàn toàn tại thời điểm xác định trong quá khứ; chuỗi hành động liên tiếp trong quá khứ.',
    signals: 'yesterday, ago, last night/week/year, in + năm quá khứ (in 2020), when I was young',
    examples: ['We visited Da Lat last summer.']
  },
  {
    id: 'past_continuous',
    category: 'tenses',
    title: '6. Quá khứ tiếp diễn (Past Continuous)',
    formulas: [
      '(+) S + was/were + V-ing',
      '(-) S + was/were + not + V-ing',
      '(?) Was/Were + S + V-ing?'
    ],
    usage: 'Đang xảy ra tại 1 thời điểm cụ thể trong quá khứ; đang diễn ra thì có hành động khác (QKĐ) xen vào; 2 hành động song song (while).',
    signals: 'at + giờ + quá khứ (at 8pm yesterday), while, when, at that time',
    examples: ['I was reading when the phone rang.', 'While she was cooking, he was cleaning.']
  },
  {
    id: 'past_perfect',
    category: 'tenses',
    title: '7. Quá khứ hoàn thành (Past Perfect)',
    formulas: [
      '(+) S + had + V3/ed',
      '(-) S + had + not + V3/ed',
      '(?) Had + S + V3/ed?'
    ],
    usage: 'Hành động xảy ra VÀ hoàn tất TRƯỚC một hành động hoặc mốc thời gian khác trong quá khứ.',
    signals: 'before, after, by the time, by + mốc quá khứ, until then, no sooner... than, hardly... when',
    examples: ['By the time we arrived, the movie had already started.']
  },
  {
    id: 'past_perfect_continuous',
    category: 'tenses',
    title: '8. Quá khứ hoàn thành tiếp diễn (Past Perfect Continuous)',
    formulas: [
      '(+) S + had + been + V-ing',
      '(-) S + had + not + been + V-ing',
      '(?) Had + S + been + V-ing?'
    ],
    usage: 'Nhấn mạnh quá trình liên tục của hành động diễn ra trước một mốc/hành động khác trong quá khứ.',
    signals: 'for + khoảng thời gian + before/until + QKĐ, by the time',
    examples: ['She had been waiting for two hours before the bus finally came.']
  },
  {
    id: 'future_simple',
    category: 'tenses',
    title: '9. Tương lai đơn (Future Simple)',
    formulas: [
      '(+) S + will + V_inf',
      '(-) S + will not (won\'t) + V_inf',
      '(?) Will + S + V_inf?'
    ],
    usage: 'Quyết định tức thì lúc nói; dự đoán không căn cứ; lời hứa, đề nghị.',
    signals: 'tomorrow, next week/year, soon, think, believe, hope, probably, perhaps',
    examples: ['Don\'t worry, I will help you with this exercise.']
  },
  {
    id: 'near_future',
    category: 'tenses',
    title: '10. Tương lai gần (Be going to)',
    formulas: [
      '(+) S + am/is/are + going to + V_inf',
      '(-) S + am/is/are + not + going to + V_inf',
      '(?) Am/Is/Are + S + going to + V_inf?'
    ],
    usage: 'Dự định đã lên kế hoạch trước; dự đoán có căn cứ rõ ràng ở hiện tại.',
    signals: 'Look at those dark clouds!, plan, intend',
    examples: ['Look at those dark clouds! It is going to rain.']
  },
  {
    id: 'future_continuous',
    category: 'tenses',
    title: '11. Tương lai tiếp diễn (Future Continuous)',
    formulas: [
      '(+) S + will + be + V-ing',
      '(-) S + won\'t + be + V-ing',
      '(?) Will + S + be + V-ing?'
    ],
    usage: 'Hành động sẽ đang diễn ra tại 1 thời điểm xác định trong tương lai.',
    signals: 'at this time tomorrow, at + giờ + ngày mai',
    examples: ['At 9 a.m. tomorrow, we will be taking the mock exam.']
  },
  {
    id: 'future_perfect',
    category: 'tenses',
    title: '12. Tương lai hoàn thành (Future Perfect)',
    formulas: [
      '(+) S + will + have + V3/ed',
      '(-) S + won\'t + have + V3/ed',
      '(?) Will + S + have + V3/ed?'
    ],
    usage: 'Hành động sẽ hoàn thành TRƯỚC 1 mốc hoặc 1 hành động khác trong tương lai.',
    signals: 'by + mốc tương lai (by 2027), by the time + HTĐ, by the end of...',
    examples: ['By next June, I will have completed all 12 grades.']
  },

  // ==================== ARTICLES ====================
  {
    id: 'articles_a_an',
    category: 'articles',
    title: 'Mạo từ không xác định: A / An',
    formulas: [
      'a + danh từ đếm được số ít bắt đầu bằng ÂM phụ âm',
      'an + danh từ đếm được số ít bắt đầu bằng ÂM nguyên âm (u, e, o, a, i)'
    ],
    usage: 'Nhắc lần đầu, chỉ nghề nghiệp, mang nghĩa "một". LUÔN xét theo PHIÊN ÂM!',
    signals: 'Bẫy thi: an hour, an honest man, an MBA, an SOS  |  a university (/juː/), a uniform, a European, a one-way street',
    examples: ['She is an honest student at a university in Ho Chi Minh City.']
  },
  {
    id: 'articles_the',
    category: 'articles',
    title: 'Mạo từ xác định: The',
    formulas: [
      'the + N (số ít / số nhiều / không đếm được đã xác định)'
    ],
    usage: 'Vật duy nhất (the sun), đã nhắc lại, so sánh nhất (the best), số thứ tự (the first), nhạc cụ (play the piano), sông/biển/dãy núi/quốc gia có States/Kingdom/Republic, The + Adj chỉ nhóm người (the rich, the elderly).',
    signals: 'the most, the only, the same, the United States, the Mekong River, the Alps',
    examples: ['The sun rises in the east.', 'She plays the piano very well.']
  },
  {
    id: 'articles_zero',
    category: 'articles',
    title: 'Không dùng mạo từ (Zero Article — Ø)',
    formulas: [
      'Ø + danh từ số nhiều / không đếm được nói chung'
    ],
    usage: 'KHÔNG dùng "the" trước: môn học (Math), thể thao (football), bữa ăn (breakfast), ngôn ngữ (English), phương tiện sau "by" (by bus), quốc gia đơn lẻ (Vietnam), ngày/tháng/lễ.',
    signals: 'go to school/hospital/prison (đúng mục đích) → Ø; go to the school (đến thăm) → the.',
    examples: ['He goes to school by bike every morning.']
  },

  // ==================== CONDITIONALS & WISH ====================
  {
    id: 'cond_all',
    category: 'conditionals',
    title: 'Câu điều kiện Loại 0, 1, 2, 3 & Hỗn hợp',
    formulas: [
      'Loại 0: If + HTĐ, HTĐ (quy luật tự nhiên)',
      'Loại 1: If + HTĐ, will/can/may + V_inf  |  Đảo ngữ: Should + S + V_inf, ...',
      'Loại 2: If + V2/ed (were), would/could + V_inf  |  Đảo ngữ: Were + S + (to V), ...',
      'Loại 3: If + had + V3, would/could + have + V3  |  Đảo ngữ: Had + S + V3, ...',
      'Hỗn hợp (3-2): If + had + V3, would + V_inf (now / today)'
    ],
    usage: 'Loại 1: có thể xảy ra; Loại 2: trái hiện tại; Loại 3: trái quá khứ; Hỗn hợp: nguyên nhân quá khứ → kết quả hiện tại.',
    signals: 'Unless = If... not; Provided that / As long as; Without / But for + N/V-ing',
    examples: ['Were I you, I would review the mistake notebook daily.', 'Had he studied harder, he would be at university now.']
  },
  {
    id: 'wish_if_only',
    category: 'conditionals',
    title: 'Câu ước (Wish / If only) & As if / As though',
    formulas: [
      'Ước cho hiện tại: S + wish(es) + S2 + V2/ed (were)',
      'Ước cho quá khứ: S + wish(es) + S2 + had + V3/ed',
      'Ước cho tương lai: S + wish(es) + S2 + would/could + V_inf',
      'Would rather (mong người khác làm): S1 + would rather + S2 + V2/ed (hiện tại) / had V3 (quá khứ)'
    ],
    usage: 'Diễn tả điều ước trái với thực tế. Lưu ý "It\'s high time + S + V2/ed" (đã đến lúc ai đó phải làm gì).',
    signals: 'If only = I wish (nhấn mạnh tiếc nuối); It\'s time + S + V2/ed',
    examples: ['I wish I knew the answer now.', 'If only I had revised that chapter yesterday!']
  },

  // ==================== PASSIVE & REPORTED ====================
  {
    id: 'passive_voice',
    category: 'passive_reported',
    title: 'Câu bị động (Passive Voice) & Nhờ vả',
    formulas: [
      'Chung: S + be (chia theo thì) + V3/ed + (by O)',
      'Tiếp diễn: am/is/are/was/were + being + V3/ed  |  Hoàn thành: have/has/had + been + V3/ed',
      'Modal: can/must/should/will + be + V3/ed',
      'Nhờ vả: have + sth + V3/ed  |  get + sth + V3/ed  |  have + sb + V_inf  |  get + sb + to V',
      'Bị động tường thuật: It is said that... ↔ S + is said + to V / to have V3'
    ],
    usage: 'Nơi chốn đứng TRƯỚC "by O", thời gian đứng SAU "by O".',
    signals: 'need + V-ing = need + to be + V3 (mang nghĩa bị động)',
    examples: ['The roof needs repairing (= to be repaired).', 'She is believed to have won the scholarship.']
  },
  {
    id: 'reported_speech',
    category: 'passive_reported',
    title: 'Câu tường thuật (Reported Speech)',
    formulas: [
      'Kể: S + said (that) / told + O + (that) + S + V(lùi thì)',
      'Hỏi Yes/No: S + asked + O + if/whether + S + V(lùi thì)',
      'Hỏi Wh-: S + asked + O + Wh- + S + V(lùi thì) (KHÔNG đảo trợ động từ)',
      'Mệnh lệnh / Khuyên: told / asked / advised / warned + O + (not) + to V'
    ],
    usage: 'Lùi 1 thì khi ĐT tường thuật ở quá khứ; đổi trạng từ (now→then, today→that day, tomorrow→the next day, yesterday→the day before).',
    signals: 'KHÔNG lùi thì với sự thật hiển nhiên, ĐK loại 2/3, hoặc ĐT tường thuật ở hiện tại.',
    examples: ['She asked me where I had bought that book.']
  },

  // ==================== CLAUSES & INVERSION ====================
  {
    id: 'relative_clauses',
    category: 'clauses',
    title: 'Mệnh đề quan hệ (Relative Clauses) & Rút gọn',
    formulas: [
      'who (người S/O) | whom (người O) | which (vật) | whose + N (sở hữu)',
      'that: thay who/whom/which trong MĐ xác định (KHÔNG dùng sau dấu phẩy / giới từ)',
      'Rút gọn: Chủ động → V-ing  |  Bị động → V3/ed  |  Số thứ tự / So sánh nhất → to V'
    ],
    usage: '"which" sau dấu phẩy có thể thay cho cả mệnh đề phía trước. "where" = in/at/on which; "when" = on/in which; "why" = for which.',
    signals: 'Bắt buộc dùng "that" sau: hỗn hợp người+vật, so sánh nhất, the only/first/last, all/nothing/everything.',
    examples: ['The girl standing near the door is my classmate.', 'He was the first student to solve the puzzle.']
  },
  {
    id: 'inversion',
    category: 'clauses',
    title: 'Cấu trúc Đảo ngữ (Inversion)',
    formulas: [
      'Never / Seldom / Rarely / Little / Hardly + trợ ĐT + S + V',
      'Not only + trợ ĐT + S + V + but S also + V',
      'No sooner + had + S + V3 + than + S + V2  (Vừa mới... thì...)',
      'Hardly / Scarcely + had + S + V3 + when + S + V2',
      'Only after / Only when / Only by + ... + trợ ĐT + S + V',
      'Not until + (thời gian/MĐ) + trợ ĐT + S + V',
      'So + Adj + be + S + that...  |  Such + be + N + that...'
    ],
    usage: 'Dạng cực kỳ hay xuất hiện trong Viết lại câu & Tìm lỗi sai ĐGNL.',
    signals: 'Nhớ đảo trợ động từ ở MỆNH ĐỀ CHÍNH (đặc biệt với Only when / Not until)!',
    examples: ['Not until he arrived home did he realize he had lost his wallet.']
  },

  // ==================== MODALS, GERUND/TO-V & SUBJUNCTIVE ====================
  {
    id: 'modal_verbs',
    category: 'modals_verbs',
    title: 'Động từ khuyết thiếu (Modal Verbs & Modal Perfect)',
    formulas: [
      'must have + V3: chắc hẳn đã xảy ra trong quá khứ (suy luận logic cao)',
      'can\'t / couldn\'t have + V3: chắc chắn đã không thể xảy ra',
      'may / might / could have + V3: có lẽ đã xảy ra',
      'should have + V3: đáng lẽ nên làm (nhưng đã không làm)',
      'shouldn\'t have + V3: đáng lẽ không nên làm (nhưng đã lỡ làm)',
      'needn\'t have + V3: đáng lẽ không cần làm (nhưng đã làm rồi)'
    ],
    usage: 'Phân biệt suy luận quá khứ và trách móc/tiếc nuối — câu hỏi kinh điển trong đề ĐGNL.',
    signals: 'mustn\'t (cấm đoán) ≠ don\'t have to / needn\'t (không cần thiết)',
    examples: ['The streets are wet. It must have rained heavily last night.', 'You should have checked your answers before submitting.']
  },
  {
    id: 'gerund_infinitive',
    category: 'modals_verbs',
    title: 'Danh động từ (V-ing), To-V & V nguyên mẫu',
    formulas: [
      '+ V-ing: enjoy, avoid, mind, suggest, finish, practice, deny, admit, keep, look forward to, be used to, can\'t help, worth, spend time',
      '+ To-V: decide, hope, plan, refuse, promise, offer, manage, afford, agree, expect, want, fail',
      '+ V_inf: make/let + O + V_inf; had better / would rather + V_inf',
      'Đổi nghĩa: remember / forget / regret / stop / try + V-ing (đã làm / dừng hẳn / thử) ≠ To-V (phải làm / dừng để làm / cố gắng)'
    ],
    usage: 'Lưu ý: "used to + V_inf" (đã từng) ≠ "be/get used to + V-ing" (quen với việc).',
    signals: 'Sau TẤT CẢ giới từ (in, on, at, of, about, without, despite...) luôn là V-ing / N!',
    examples: ['I look forward to hearing from you.', 'He stopped smoking (= bỏ thuốc) ≠ He stopped to smoke (= dừng lại để hút).']
  },
  {
    id: 'subjunctive',
    category: 'modals_verbs',
    title: 'Câu giả định (Subjunctive Mood)',
    formulas: [
      'S1 + suggest / recommend / insist / demand / require / advise + that + S2 + (should) + V_inf',
      'It is essential / important / necessary / vital / urgent + that + S + (should) + V_inf'
    ],
    usage: 'Động từ ở mệnh đề "that" LUÔN ở dạng nguyên mẫu không "to" (hoặc "be + V3" nếu bị động), bất kể chủ ngữ số ít hay thì quá khứ!',
    signals: 'suggest + V-ing (chung) ≠ suggest + that + S + V_inf',
    examples: ['The doctor recommended that he take the medicine twice a day.', 'It is vital that every student be on time.']
  },

  // ==================== STRUCTURES: COMPARISON, TAG, CLEFT ====================
  {
    id: 'comparison',
    category: 'structures',
    title: 'Các dạng So sánh (Comparison)',
    formulas: [
      'Bằng: as + Adj/Adv + as  |  Bội số: twice / three times + as + Adj + as',
      'Hơn: Adj-er / more + Adj + than  |  Nhất: the + Adj-est / the most + Adj',
      'So sánh kép (Càng... càng...): The + so sánh hơn + S + V, the + so sánh hơn + S + V',
      'Càng ngày càng: Adj-er and Adj-er  |  more and more + Adj'
    ],
    usage: 'Nhấn mạnh so sánh hơn dùng: much, far, a lot, slightly (KHÔNG dùng "very").',
    signals: 'Bất quy tắc: good→better→best; bad→worse→worst; far→farther/further; little→less→least',
    examples: ['The more you practice, the more confident you become.']
  },
  {
    id: 'tag_cleft',
    category: 'structures',
    title: 'Câu hỏi đuôi (Tag Questions) & Câu chẻ (Cleft Sentences)',
    formulas: [
      'Tag Question: Mệnh đề (+) → đuôi (-)  |  Mệnh đề (-) → đuôi (+)',
      'Ngoại lệ Tag: I am → aren\'t I?; Let\'s → shall we?; Mệnh lệnh → will you?; Nobody/Nothing → đuôi (+) với they/it',
      'Câu chẻ (Nhấn mạnh): It + is/was + [Thành phần nhấn mạnh] + that/who + ...'
    ],
    usage: 'Lưu ý các từ mang nghĩa phủ định sẵn (never, seldom, rarely, hardly, little, few) → đuôi ở dạng KHẲNG ĐỊNH!',
    signals: 'Everyone/Someone/Nobody → đại từ ở đuôi là "they"; Everything/Nothing → "it".',
    examples: ['She rarely goes out at night, does she?', 'It was my brother who helped me fix the laptop.']
  },

  // ==================== WORD FORM, S-V AGREEMENT, PREPOSITIONS ====================
  {
    id: 'sva_conjunctions',
    category: 'vocab_wordform',
    title: 'Hòa hợp Chủ - Vị & Liên từ / Giới từ',
    formulas: [
      'A number of + N(số nhiều) + V(số nhiều)  ≠  The number of + N(số nhiều) + V(số ít)',
      'Either A or B / Neither A nor B / Not only A but also B → V chia theo B',
      'A + as well as / together with / along with + B → V chia theo A',
      'Although / Though / Even though + S + V  ≠  Despite / In spite of + N / V-ing',
      'Because / Since / As + S + V  ≠  Because of / Due to / Owing to + N / V-ing'
    ],
    usage: 'Các danh từ môn học/bệnh lý tận cùng -s (Physics, Mathematics, News, Measles) và khoảng tiền/thời gian/khoảng cách luôn đi với V số ít.',
    signals: 'In (tháng/năm/mùa/buổi) · On (ngày/thứ/ngày lễ có Day) · At (giờ/dịp lễ/địa điểm cụ thể)',
    examples: ['Neither the teacher nor the students were late.', 'Five million dong is a large sum of money.']
  },
  {
    id: 'word_formation',
    category: 'vocab_wordform',
    title: 'Cấu tạo từ (Word Formation) & Cụm động từ hay thi',
    formulas: [
      'Danh từ (N): -tion, -sion, -ment, -ness, -ity, -ance/-ence, -ship, -ist, -er/-or',
      'Tính từ (Adj): -ful, -less, -ous, -ive, -al, -able/-ible, -ic, -ing (chỉ vật) / -ed (cảm xúc người)',
      'Động từ (V): -ize/-ise, -ate, -ify, -en  |  Trạng từ (Adv): Adj + -ly',
      'Trật tự vị trí: Mạo từ/Tính từ sở hữu + (Adv) + (Adj) + N'
    ],
    usage: 'Phrasal Verbs hay gặp ĐGNL: put off (hoãn), call off (hủy), take after (giống), look up to (kính trọng), look down on (coi thường), run out of (cạn kiệt), come across (tình cờ gặp), turn down (từ chối), give up (từ bỏ), carry out (tiến hành).',
    signals: 'OSASCOMP (Trật tự tính từ): Opinion - Size - Age - Shape - Color - Origin - Material - Purpose',
    examples: ['They had to call off the match due to the storm.', 'She bought a lovely small old round red French wooden jewelry box.']
  }
];
