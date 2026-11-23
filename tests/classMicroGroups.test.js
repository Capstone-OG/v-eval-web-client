import test from 'node:test';
import assert from 'node:assert/strict';

// Core logic helpers extracted for unit testing and regression prevention
const isRawGuid = (str) => {
  if (typeof str !== 'string') return false;
  const clean = str.trim().replace(/^\{|\}$/g, '');
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);
};

const resolveWeakSkills = (grp, skillNameMap) => {
  if (Array.isArray(grp.commonWeakSkillNames) && grp.commonWeakSkillNames.length > 0) {
    const valid = grp.commonWeakSkillNames.filter(n => n && !isRawGuid(n));
    if (valid.length > 0) return Array.from(new Set(valid));
  }

  const rawIds = Array.isArray(grp.commonWeakSkillIds) ? grp.commonWeakSkillIds : [];
  const resolved = [];

  for (const item of rawIds) {
    if (!item) continue;
    const str = String(item).trim();
    const lower = str.toLowerCase();
    if (skillNameMap.has(lower)) {
      resolved.push(skillNameMap.get(lower));
    } else if (!isRawGuid(str)) {
      resolved.push(str);
    }
  }

  if (resolved.length === 0 && grp.focusArea && !isRawGuid(grp.focusArea)) {
    resolved.push(grp.focusArea);
  }

  return Array.from(new Set(resolved));
};

const formatStudentName = (member, studentInfoMap, nameFrequencyMap) => {
  const sId = member.studentId || member.id;
  const lookup = sId ? studentInfoMap.get(String(sId).toLowerCase()) : null;
  const baseName = member.name || lookup?.name || '';

  if (!baseName) {
    return sId ? `Học sinh #${String(sId).slice(-4).toUpperCase()}` : 'Học sinh';
  }

  const freq = nameFrequencyMap.get(baseName.trim()) || 0;
  if (freq > 1 && sId) {
    return `${baseName} (#${String(sId).slice(-4).toUpperCase()})`;
  }

  return baseName;
};

test('ClassMicroGroups - isRawGuid accurately identifies UUIDs and prevents UI leakage', () => {
  assert.equal(isRawGuid('d7e25fad-b1b0-4dc1-befb-c5f5bc0fc234'), true);
  assert.equal(isRawGuid('1a00dbc9-8f13-4655-833d-763050b8e554'), true);
  assert.equal(isRawGuid('Reading Comprehension - Main Idea'), false);
  assert.equal(isRawGuid('Giải quyết vấn đề Hóa học'), false);
  assert.equal(isRawGuid(''), false);
  assert.equal(isRawGuid(null), false);
});

test('ClassMicroGroups - resolves raw UUIDs to real Vietnamese skill names without leaking GUIDs', () => {
  const skillNameMap = new Map([
    ['d7e25fad-b1b0-4dc1-befb-c5f5bc0fc234', 'Reading Comprehension - Main Idea'],
    ['9e6b8e71-bc0e-5c52-a0a6-a46712c9632b', 'Phân tích hình tượng tác phẩm văn học']
  ]);

  const groupWithUuids = {
    groupName: 'Nhóm 01',
    focusArea: 'Đọc hiểu tác phẩm',
    commonWeakSkillIds: [
      'd7e25fad-b1b0-4dc1-befb-c5f5bc0fc234',
      '9e6b8e71-bc0e-5c52-a0a6-a46712c9632b',
      'a0000000-0000-0000-0000-000000000000' // Unknown UUID must NOT leak to UI
    ]
  };

  const resolved = resolveWeakSkills(groupWithUuids, skillNameMap);
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0], 'Reading Comprehension - Main Idea');
  assert.equal(resolved[1], 'Phân tích hình tượng tác phẩm văn học');
  assert.equal(resolved.some(r => isRawGuid(r)), false);
});

test('ClassMicroGroups - disambiguates duplicate student names with short ID suffix', () => {
  const nameFreq = new Map([
    ['Phạm Tấn Lộc', 2],
    ['Trần Ngọc Mai', 1]
  ]);

  const studentInfo = new Map([
    ['f87c2283-71be-47e1-80bd-35a6c3e08a51', { name: 'Phạm Tấn Lộc' }],
    ['4e7cd36c-36ea-449a-9746-77f48c81b099', { name: 'Phạm Tấn Lộc' }],
    ['380baebe-a8a4-455f-aa3e-50f120cef408', { name: 'Trần Ngọc Mai' }]
  ]);

  const student1 = { studentId: 'f87c2283-71be-47e1-80bd-35a6c3e08a51' };
  const student2 = { studentId: '4e7cd36c-36ea-449a-9746-77f48c81b099' };
  const student3 = { studentId: '380baebe-a8a4-455f-aa3e-50f120cef408' };

  assert.equal(formatStudentName(student1, studentInfo, nameFreq), 'Phạm Tấn Lộc (#8A51)');
  assert.equal(formatStudentName(student2, studentInfo, nameFreq), 'Phạm Tấn Lộc (#B099)');
  assert.equal(formatStudentName(student3, studentInfo, nameFreq), 'Trần Ngọc Mai');
});

const partitionStudentsForFocusSkill = (focusSkill, skillId, rows = [], size = 4, targetStudentIds = null, scope = 'STRUGGLING_ONLY') => {
  if (!rows || rows.length === 0) return [];

  let targetRows = rows;
  if (scope === 'STRUGGLING_ONLY') {
    if (Array.isArray(targetStudentIds) && targetStudentIds.length > 0) {
      const targetIdSet = new Set(targetStudentIds.map(id => String(id).toLowerCase()));
      const matched = rows.filter(r => {
        const sId = r.studentId || r.StudentId || r.id;
        return sId && targetIdSet.has(String(sId).toLowerCase());
      });
      if (matched.length > 0) targetRows = matched;
    } else {
      const struggling = rows.filter(r => {
        if (!Array.isArray(r.skillCells)) return false;
        const cell = r.skillCells.find(c =>
          (skillId && String(c.skillId).toLowerCase() === String(skillId).toLowerCase()) ||
          (c.skillName && c.skillName.trim().toLowerCase() === focusSkill.trim().toLowerCase())
        );
        return cell && cell.plt != null ? Number(cell.plt) < 0.5 : false;
      });
      if (struggling.length > 0) targetRows = struggling;
    }
  }

  const studentList = targetRows.map((r) => {
    const sId = r.studentId || r.StudentId || r.id;
    const sName = r.studentName || r.StudentName || r.name;
    let skillPlt = null;
    if (Array.isArray(r.skillCells)) {
      const cell = r.skillCells.find((c) =>
        (skillId && String(c.skillId).toLowerCase() === String(skillId).toLowerCase()) ||
        (c.skillName && c.skillName.trim().toLowerCase() === focusSkill.trim().toLowerCase())
      );
      if (cell && cell.plt != null) skillPlt = Number(cell.plt);
    }
    if (skillPlt == null) skillPlt = r.overallMastery ?? 0.08;
    return { studentId: sId, id: sId, name: sName, mastery: skillPlt };
  });

  studentList.sort((a, b) => a.mastery - b.mastery);
  const n = studentList.length;
  if (n === 0) return [];

  const skillSlug = (focusSkill || skillId || 'GEN')
    .toLowerCase()
    .replace(/[đĐ]/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24);

  if (n <= 5) {
    return [{
      groupId: `GRP-${skillSlug}-01`,
      groupName: `Nhóm 01 - Bàn trọng tâm: ${focusSkill}`,
      focusArea: focusSkill,
      memberCount: n,
      members: studentList,
      assignedWorksheetTitle: `Phiếu bài tập vi mô: 5 câu ${focusSkill}`
    }];
  }

  const minM = Math.ceil(n / 5);
  const maxM = Math.floor(n / 3);
  const targetSize = Math.max(3, Math.min(5, size));
  const targetM = Math.round(n / targetSize);
  const m = Math.max(minM, Math.min(maxM, targetM));
  const baseSize = Math.floor(n / m);
  const remainder = n % m;
  const quotas = [];
  for (let i = 0; i < m; i++) quotas.push(i < remainder ? baseSize + 1 : baseSize);

  const nextGroups = [];
  let curIdx = 0;
  for (let i = 0; i < m; i++) {
    const q = quotas[i];
    const members = studentList.slice(curIdx, curIdx + q);
    curIdx += q;
    const groupNum = String(i + 1).padStart(2, '0');
    nextGroups.push({
      groupId: `GRP-${skillSlug}-${String(groupNum).padStart(2, '0')}`,
      groupName: `Nhóm ${groupNum} - Bàn trọng tâm: ${focusSkill}`,
      focusArea: focusSkill,
      memberCount: members.length,
      members,
      assignedWorksheetTitle: `Phiếu bài tập vi mô: 5 câu ${focusSkill}`
    });
  }
  return nextGroups;
};

test('ClassMicroGroups - partitionStudentsForFocusSkill filters strictly to target struggling students', () => {
  const rows = [
    { studentId: 's1', studentName: 'Nguyễn Hoàng An', overallMastery: 0.5 }, // Did not take Chem or passed
    { studentId: 's2', studentName: 'Trần Ngọc Mai', overallMastery: 0.5 },   // Did not take Chem or passed
    { studentId: 's3', studentName: 'Phạm Tấn Lộc', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.08 }] },
    { studentId: 's4', studentName: 'Mai Thành Nhân', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.08 }] },
    { studentId: 's5', studentName: 'Trần Thái Thịnh', overallMastery: 0.27 }, // Passed or missing
    { studentId: 's6', studentName: 'Lê Hoàng Long', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.08 }] },
    { studentId: 's7', studentName: 'Phạm Tấn Lộc 2', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.08 }] }
  ];

  const focusSkill = 'Giải quyết vấn đề Hóa học';
  const targetStudentIds = ['s3', 's4', 's6', 's7'];

  // Only the 4 struggling students are partitioned into 1 remedial table
  const groups = partitionStudentsForFocusSkill(focusSkill, 'sk-chem-01', rows, 4, targetStudentIds, 'STRUGGLING_ONLY');

  assert.equal(groups.length, 1);
  assert.equal(groups[0].memberCount, 4);
  assert.equal(groups[0].groupName, 'Nhóm 01 - Bàn trọng tâm: Giải quyết vấn đề Hóa học');
  assert.deepEqual(groups[0].members.map(m => m.studentId), ['s3', 's4', 's6', 's7']);

  // Verify non-struggling students (s1, s2, s5) are NOT pulled into the remedial table
  assert.equal(groups[0].members.some(m => ['s1', 's2', 's5'].includes(m.studentId)), false);
});

test('ClassMicroGroups - partitionStudentsForFocusSkill groups students by designated focus skill', () => {
  const rows = [
    { studentId: 's1', studentName: 'Nguyễn Hoàng An', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.1 }] },
    { studentId: 's2', studentName: 'Trần Ngọc Mai', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.15 }] },
    { studentId: 's3', studentName: 'Phạm Tấn Lộc', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.05 }] },
    { studentId: 's4', studentName: 'Mai Thành Nhân', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.2 }] },
    { studentId: 's5', studentName: 'Trần Thái Thịnh', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.0 }] },
    { studentId: 's6', studentName: 'Lê Hoàng Long', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.25 }] },
    { studentId: 's7', studentName: 'Phạm Tấn Lộc 2', skillCells: [{ skillName: 'Giải quyết vấn đề Hóa học', plt: 0.3 }] }
  ];

  const focusSkill = 'Giải quyết vấn đề Hóa học';
  const groups = partitionStudentsForFocusSkill(focusSkill, 'sk-chem-01', rows, 4);

  assert.equal(groups.length, 2);
  assert.equal(groups[0].memberCount, 4);
  assert.equal(groups[1].memberCount, 3);
  assert.equal(groups[0].focusArea, focusSkill);
  assert.equal(groups[1].focusArea, focusSkill);
  assert.equal(groups[0].groupName, 'Nhóm 01 - Bàn trọng tâm: Giải quyết vấn đề Hóa học');
  assert.equal(groups[0].assignedWorksheetTitle, 'Phiếu bài tập vi mô: 5 câu Giải quyết vấn đề Hóa học');

  // Verify all 7 students placed with 0 duplicate placements
  const allPlaced = groups.flatMap(g => g.members.map(m => m.studentId));
  assert.equal(allPlaced.length, 7);
  assert.equal(new Set(allPlaced).size, 7);

  // Verify group IDs are properly namespaced by skill slug
  assert.ok(groups[0].groupId.startsWith('GRP-giai-quyet-van-de-h'));
  assert.ok(groups[1].groupId.startsWith('GRP-giai-quyet-van-de-h'));
});

test('ClassMicroGroups - guarantees distinct group IDs between Chemistry and Biology to prevent schedule collisions', () => {
  const rows = [
    { studentId: 's1', studentName: 'Học sinh 1', overallMastery: 0.1 },
    { studentId: 's2', studentName: 'Học sinh 2', overallMastery: 0.1 },
    { studentId: 's3', studentName: 'Học sinh 3', overallMastery: 0.1 }
  ];

  const chemGroups = partitionStudentsForFocusSkill('Giải quyết vấn đề Hóa học', 'sk-chem', rows, 3);
  const bioGroups = partitionStudentsForFocusSkill('Dạng 1: Cơ chế sinh học trọng tâm', 'sk-bio', rows, 3);

  assert.equal(chemGroups.length, 1);
  assert.equal(bioGroups.length, 1);

  // Group IDs must NEVER collide across different focus skills
  assert.notEqual(chemGroups[0].groupId, bioGroups[0].groupId);
  assert.ok(chemGroups[0].groupId.includes('hoa'));
  assert.ok(bioGroups[0].groupId.includes('sinh'));
});
