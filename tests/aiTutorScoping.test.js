import test from 'node:test';
import assert from 'node:assert/strict';
import { scopeInteractions } from '../src/utils/aiTutorScoping.js';

const mockInteractions = [
  {
    id: 'int-1',
    student_id: 'std-class-1-a',
    student_name: 'Nguyễn Văn A',
    class_id: 'cls-1',
    class_name: 'Lớp 12A1',
    student_reported: true
  },
  {
    id: 'int-2',
    student_id: 'std-class-1-b',
    student_name: 'Trần Thị B',
    class_id: 'cls-1',
    class_name: 'Lớp 12A1',
    student_reported: false
  },
  {
    id: 'int-3',
    student_id: 'std-class-2-c',
    student_name: 'Lê Văn C',
    class_id: 'cls-2',
    class_name: 'Lớp 12A2',
    student_reported: true
  },
  {
    id: 'int-4',
    student_id: 'std-class-3-d',
    student_name: 'Phạm Thị D',
    class_id: 'cls-3',
    class_name: 'Lớp 12A3',
    student_reported: true
  }
];

test('director role sees all interactions when selectedClassId is all', () => {
  const result = scopeInteractions({
    interactions: mockInteractions,
    isTeacher: false,
    selectedClassId: 'all'
  });
  assert.equal(result.length, 4);
});

test('director role filters strictly by selectedClassId when specified', () => {
  const result = scopeInteractions({
    interactions: mockInteractions,
    isTeacher: false,
    selectedClassId: 'cls-2'
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'int-3');
});

test('teacher role scopes strictly to their assigned class and does not leak others', () => {
  const result = scopeInteractions({
    interactions: mockInteractions,
    isTeacher: true,
    selectedClassId: 'cls-1',
    selectedClassName: 'Lớp 12A1',
    teacherClasses: [{ id: 'cls-1', name: 'Lớp 12A1' }]
  });

  // Only reported interaction int-1 is returned; int-2 is unreported so it is hidden
  assert.equal(result.length, 1);
  assert.deepEqual(result.map(i => i.id), ['int-1']);
});

test('teacher role never sees unreported normal student chats while director sees all', () => {
  const classInteractions = [
    { id: 'rep-1', class_id: 'cls-1', student_reported: true },
    { id: 'norm-1', class_id: 'cls-1', student_reported: false },
    { id: 'norm-2', class_id: 'cls-1', student_reported: false }
  ];
  const teacherResult = scopeInteractions({
    interactions: classInteractions,
    isTeacher: true,
    selectedClassId: 'cls-1',
    teacherClasses: [{ id: 'cls-1', name: 'Lớp 12A1' }]
  });
  assert.equal(teacherResult.length, 1);
  assert.equal(teacherResult[0].id, 'rep-1');

  // Academic Director retains full audit visibility across all chats
  const directorResult = scopeInteractions({
    interactions: classInteractions,
    isTeacher: false,
    selectedClassId: 'cls-1'
  });
  assert.equal(directorResult.length, 3);
});

test('teacher role matches interactions by class student roster', () => {
  const interactionsWithGenericClass = [
    {
      id: 'int-gen-1',
      student_id: 'std-class-1-a',
      class_id: 'unknown_class',
      class_name: 'Lớp phụ trách',
      student_reported: true
    },
    {
      id: 'int-gen-2',
      student_id: 'std-other-student',
      class_id: 'unknown_class',
      class_name: 'Lớp phụ trách',
      student_reported: true
    }
  ];

  const result = scopeInteractions({
    interactions: interactionsWithGenericClass,
    isTeacher: true,
    selectedClassId: 'cls-1',
    selectedClassName: 'Lớp 12A1',
    classStudentIds: new Set(['std-class-1-a', 'std-class-1-b']),
    teacherClasses: [{ id: 'cls-1', name: 'Lớp 12A1' }]
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'int-gen-1');
});

test('teacher with no assigned classes gets an empty list', () => {
  const result = scopeInteractions({
    interactions: mockInteractions,
    isTeacher: true,
    selectedClassId: '',
    teacherClasses: []
  });
  assert.equal(result.length, 0);
});

