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
