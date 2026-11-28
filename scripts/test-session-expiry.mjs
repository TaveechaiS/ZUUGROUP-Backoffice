import assert from 'node:assert/strict';
import { isSessionExpired, sessionStartedAt } from '../src/lib/auth/session-expiry.ts';

const token = (payload) =>
  ['e30', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join('.');
const now = Date.UTC(2026, 9, 19, 12);
const at = (hoursAgo) => now / 1000 - hoursAgo * 3600;

assert.equal(sessionStartedAt(token({ amr: [{ method: 'password', timestamp: 100 }] })), 100);
assert.equal(
  isSessionExpired(token({ amr: [{ method: 'password', timestamp: at(23) }] }), now),
  false,
);
assert.equal(
  isSessionExpired(token({ amr: [{ method: 'password', timestamp: at(24) }] }), now),
  true,
);
assert.equal(
  isSessionExpired(token({ amr: [{ method: 'password', timestamp: at(30) }] }), now),
  true,
);
assert.equal(isSessionExpired(token({ name: 'ผู้ใช้' }), now), true);
assert.equal(
  isSessionExpired(
    token({
      amr: [
        { method: 'password', timestamp: at(30) },
        { method: 'otp', timestamp: at(1) },
      ],
    }),
    now,
  ),
  true,
);
assert.equal(isSessionExpired('broken', now), true);
assert.equal(isSessionExpired(undefined, now), true);
console.log(
  'PASS: session expires 24 hours after password sign-in, missing or broken token expires',
);
