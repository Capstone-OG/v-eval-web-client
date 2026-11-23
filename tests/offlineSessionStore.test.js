import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasMatchingRoster,
  buildMicroGroupsFromStudents,
  generateDefaultSessionPlan,
  getOfflineSessionPlan,
  saveOfflineSessionPlan
} from '../src/utils/offlineSessionStore.js';

// Setup mock localStorage in Node test environment
const mockStorage = new Map();
global.localStorage = {
  getItem: (key) => mockStorage.get(key) || null,
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

test('offlineSessionStore - detects mismatching roster and resynchronizes real students', () => {
  mockStorage.clear();

  // Kế hoạch cũ với mã học sinh không thuộc lớp học hiện tại
  const outdatedPlan = {
    sessionId: 'session-01',
    part2: {
      microGroups: [
        {
          tableName: 'Bàn 1',
          students: [
            { id: 'old-stu-01', name: 'Học sinh cũ A' },
            { id: 'old-stu-02', name: 'Học sinh cũ B' }
          ]
        }
      ]
    }
  };

  const realStudents = [
    { id: '4227ea8e', name: 'Trần Thái Thịnh', currentScore: '0%' },
    { id: '380baebe', name: 'Trần Ngọc Mai', currentScore: '0%' },
    { id: 'bc933364', name: 'Mai Thành Nhân', currentScore: '0%' },
    { id: 'dab0a1c1', name: 'Lê Hoàng Long', currentScore: '0%' },
    { id: '22a1d24a', name: 'Nguyễn Hoàng An', currentScore: '0%' },
    { id: '55555555', name: 'Phạm Tấn Lộc', currentScore: '0%' }
  ];

  assert.equal(hasMatchingRoster(outdatedPlan, realStudents), false);

  // Lưu kế hoạch cũ vào bộ nhớ đệm
  mockStorage.set('veval_offline_session_plan_session-01', JSON.stringify(outdatedPlan));

  // getOfflineSessionPlan nhận diện danh sách không khớp, tự động dọn dẹp và đồng bộ lại học sinh thật
  const refreshedPlan = getOfflineSessionPlan('session-01', { sessionId: 'session-01', classId: 'cls-1' }, realStudents);

  assert.ok(refreshedPlan);
  assert.equal(refreshedPlan.part2.microGroups.length, 2);
  assert.equal(refreshedPlan.part2.microGroups[0].tableName, 'Bàn 1');
  assert.equal(refreshedPlan.part2.microGroups[1].tableName, 'Bàn 2');

  // Đảm bảo 100% học sinh trong các bàn học là danh sách học sinh thật từ CSDL
  const table1Names = refreshedPlan.part2.microGroups[0].students.map(s => s.name);
  const table2Names = refreshedPlan.part2.microGroups[1].students.map(s => s.name);

  assert.deepEqual(table1Names, ['Trần Thái Thịnh', 'Trần Ngọc Mai', 'Mai Thành Nhân']);
  assert.deepEqual(table2Names, ['Lê Hoàng Long', 'Nguyễn Hoàng An', 'Phạm Tấn Lộc']);

  assert.equal(hasMatchingRoster(refreshedPlan, realStudents), true);
});

test('offlineSessionStore - buildMicroGroupsFromStudents correctly partitions real class students', () => {
  const realStudents = [
    { id: 's1', name: 'Trần Thái Thịnh', currentScore: '0%' },
    { id: 's2', name: 'Trần Ngọc Mai', currentScore: '0%' },
    { id: 's3', name: 'Mai Thành Nhân', currentScore: '0%' },
    { id: 's4', name: 'Lê Hoàng Long', currentScore: '0%' },
    { id: 's5', name: 'Nguyễn Hoàng An', currentScore: '0%' },
    { id: 's6', name: 'Phạm Tấn Lộc', currentScore: '0%' }
  ];

  const groups = buildMicroGroupsFromStudents(realStudents);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].studentCount, 3);
  assert.equal(groups[1].studentCount, 3);
  assert.equal(groups[0].students[0].name, 'Trần Thái Thịnh');
  assert.equal(groups[1].students[2].name, 'Phạm Tấn Lộc');
});
