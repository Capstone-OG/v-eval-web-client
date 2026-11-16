import test from 'node:test';
import assert from 'node:assert/strict';
import { teacherPortalRequests } from '../src/services/teacherPortalRequests.js';

test('logged-out teacher does not request any student or exam data', () => {
  assert.deepEqual(teacherPortalRequests(null), {});
  assert.deepEqual(teacherPortalRequests({ classId: 'class-a' }), {});
});

test('missing assignment never falls back to a sample class or global alerts', () => {
  assert.deepEqual(teacherPortalRequests({ userId: 'teacher-a' }), { exams: '/api/content/exams' });
});

test('teacher alerts always include the supplied class and current identity', () => {
  const requests = teacherPortalRequests({ userId: 'teacher-a', classId: 'class-a' });
  const url = new URL(requests.alerts, 'http://localhost');
  assert.equal(url.searchParams.get('classId'), 'class-a');
  assert.equal(url.searchParams.get('mentorId'), 'teacher-a');
  const switched = teacherPortalRequests({ id: 'teacher-b', classId: 'class-b' });
  assert.equal(new URL(switched.alerts, 'http://localhost').searchParams.get('mentorId'), 'teacher-b');
  assert.equal(switched.heatmap, '/api/practice/classes/class-b/heatmap');
});
