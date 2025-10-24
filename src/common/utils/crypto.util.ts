import * as crypto from 'crypto';

const ALGO = 'aes-256-gcm';
// Expect a 32-byte key in base64 (env: SMTP_ENC_KEY)
function getKey(): Buffer {
  const b64 = process.env.SMTP_ENC_KEY || '';
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) {
    throw new Error('SMTP_ENC_KEY must be a 32-byte key (base64-encoded).');
  }
  return key;
}

export function encryptSecret(plain: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Store as base64: iv.cipher.tag
  return [
    iv.toString('base64'),
    enc.toString('base64'),
    tag.toString('base64'),
  ].join('.');
}

export function decryptSecret(packed: string): string {
  const [ivB64, encB64, tagB64] = packed.split('.');
  if (!ivB64 || !encB64 || !tagB64)
    throw new Error('Invalid encrypted payload');
  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const enc = Buffer.from(encB64, 'base64');
  const tag = Buffer.from(tagB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString('utf8');
}
