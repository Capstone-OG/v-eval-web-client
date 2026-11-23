import test from 'node:test';
import assert from 'node:assert/strict';
import { validateContact, normalizePhone, isVietnamesePhone, normalizeFormPayload, getFormFieldError, prepareFormBody } from '../src/utils/formValidation.js';

test('profile requires real name and Vietnamese phone, including international format', () => {
  for (const phone of ['', '   ', '123', '0123456789', '09abcdefgh', '091234567890', '+840912345678']) {
    assert.ok(validateContact({ fullName: 'Nguyễn Văn A', phone }));
  }
  for (const phone of ['0912345678', ' +84 912 345 678 ', '0912.345.678']) {
    assert.equal(validateContact({ fullName: ' Nguyễn Văn A ', phone }), '');
    assert.ok(isVietnamesePhone(phone));
  }
  assert.ok(validateContact({ fullName: '  ', phone: '0912345678' }));
  assert.ok(validateContact({ fullName: 'A'.repeat(151), phone: '0912345678' }));
  assert.equal(normalizePhone(' 0912-345-678 '), '0912345678');
});

test('email can be optional but must be valid when provided', () => {
  const base = { fullName: 'Nguyễn Văn A', phone: '0912345678' };
  assert.equal(validateContact(base), '');
  assert.ok(validateContact(base, { requireEmail: true }));
  assert.ok(validateContact({ ...base, email: 'wrong@' }));
  assert.equal(validateContact({ ...base, email: ' user@example.com ' }, { requireEmail: true }), '');
});

test('payload trimming is recursive and immutable, preserving credentials and data types', () => {
  const input = { name: ' A ', optional: '  ', password: ' pass word ', newPassword: ' new ', token: ' token ', nested: [{ title: ' B ', value: 0, selected: false, blank: null }], answers: [' A ', ' B '] };
  const result = normalizeFormPayload(input);
  assert.deepEqual(result, { name: 'A', optional: '', password: ' pass word ', newPassword: ' new ', token: ' token ', nested: [{ title: 'B', value: 0, selected: false, blank: null }], answers: ['A', 'B'] });
  assert.equal(input.nested[0].title, ' B ');
});

test('form guard rejects whitespace required fields, invalid phones and numeric bounds', () => {
  const field = { type: 'text', required: true, value: '   ' };
  assert.ok(getFormFieldError(field));
  assert.equal(getFormFieldError({ ...field, required: false }), '');
  assert.equal(getFormFieldError({ ...field, disabled: true }), '');
  assert.ok(getFormFieldError({ type: 'tel', value: '123' }));
  assert.equal(getFormFieldError({ type: 'tel', value: '+84912345678' }), '');
  assert.ok(getFormFieldError({ type: 'number', value: '9999', validity: { rangeOverflow: true } }));
  assert.equal(getFormFieldError({ type: 'password', required: true, value: ' pass ' }), '');
  assert.ok(getFormFieldError({ type: 'password', required: true, value: '   ' }));
});

test('multipart normalization trims metadata and preserves file bytes and passwords', async () => {
  const body = new FormData();
  body.append('title', ' Exam ');
  body.append('password', ' secret ');
  body.append('file', new Blob([' file contents ']), 'exam.txt');
  const result = prepareFormBody(body);
  assert.equal(result.get('title'), 'Exam');
  assert.equal(result.get('password'), ' secret ');
  assert.equal(await result.get('file').text(), ' file contents ');
  assert.equal(body.get('title'), ' Exam ');
});
