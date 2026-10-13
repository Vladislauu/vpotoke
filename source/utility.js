// source/utility.js
import { pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';

const pbkdf2Promisified = promisify(pbkdf2);

const ITERATIONS = 100000;
const KEYLEN = 32;
const DIGEST = 'sha256';

export async function hashPassword(password) {
  const saltBuf = randomBytes(16);
  const hashBuf = await pbkdf2Promisified(password, saltBuf, ITERATIONS, KEYLEN, DIGEST);
  
  return {
    hash: hashBuf.toString('hex'),
    salt: saltBuf.toString('hex')
  };
}

export async function verifyPassword(password, hashHex, saltHex) {
  const saltBuf = Buffer.from(saltHex.trim(), 'hex');
  const hashBuf = await pbkdf2Promisified(password, saltBuf, ITERATIONS, KEYLEN, DIGEST);

  return hashBuf.toString('hex').trim() === (hashHex.trim());
}