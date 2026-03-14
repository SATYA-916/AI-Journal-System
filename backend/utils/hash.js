import crypto from 'crypto';

export function createTextHash(text) {
  return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
}
