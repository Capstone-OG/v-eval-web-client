import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProvisioningPayload } from '../src/utils/provisioningFields.js';

const base = { fullName: ' Nguyen Van An ', email: ' USER@example.com ', phone: '0912 345 678', password: 'Password123@', campusId: ' campus-a ', specialty: ' Toán ' };
test('parent and system-wide roles discard stale teacher and campus fields', () => {
  for (const roleName of ['PARENT', 'ADMINISTRATOR', 'ACADEMIC_DIRECTOR']) {
    const payload = buildProvisioningPayload({ ...base, roleName });
    assert.equal(payload.campusId, null);
    assert.equal(payload.specialty, null);
    assert.equal(payload.fullName, 'Nguyen Van An');
    assert.equal(payload.email, 'user@example.com');
    assert.equal(payload.phone, '0912345678');
    assert.equal(payload.password, base.password);
  }
});
test('teacher requires campus and specialty; manager and student require campus only', () => {
  assert.throws(() => buildProvisioningPayload({ ...base, roleName: 'TEACHER', specialty: '  ' }));
  for (const roleName of ['TEACHER', 'ACADEMIC_MANAGER', 'STUDENT']) {
    assert.throws(() => buildProvisioningPayload({ ...base, roleName, campusId: '' }));
    const payload = buildProvisioningPayload({ ...base, roleName });
    assert.equal(payload.campusId, 'campus-a');
    assert.equal(payload.specialty, roleName === 'TEACHER' ? 'Toán' : null);
  }
  assert.throws(() => buildProvisioningPayload({ ...base, roleName: 'UNKNOWN' }));
});

test('provisioning rejects blank and weak passwords before submission', () => {
  for (const password of ['', '   ', 'Short1', 'lowercase1', 'UPPERCASE1', 'NoNumbersHere', ' Password123@', 'Password123@ ']) {
    assert.throws(() => buildProvisioningPayload({ ...base, roleName: 'PARENT', password }));
  }
  assert.equal(buildProvisioningPayload({ ...base, roleName: 'PARENT' }).password, base.password);
});
