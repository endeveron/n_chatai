import CryptoJS from 'crypto-js';

const PASSPHRASE = process.env.ENCRYPTION_PASSPHRASE || 'default_passphrase';
const KEY_SIZE = 256 / 32; // AES-256 => 32 bytes
const ITERATIONS = 1000; // PBKDF2 iterations

// Encrypt a string securely using AES with IV and PBKDF2
export function encryptString(plainText: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8); // 16-byte salt
  const iv = CryptoJS.lib.WordArray.random(128 / 8); // 16-byte IV

  const key = CryptoJS.PBKDF2(PASSPHRASE, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });

  const encrypted = CryptoJS.AES.encrypt(plainText, key, { iv });

  // Combine salt + iv + ciphertext for transport
  const result = salt.toString() + iv.toString() + encrypted.toString();
  return result;
}

// Decrypt a string securely using AES with IV and PBKDF2
export function decryptString(cipherText: string): string {
  const saltHex = cipherText.slice(0, 32); // first 16 bytes (salt)
  const ivHex = cipherText.slice(32, 64); // next 16 bytes (iv)
  const encryptedHex = cipherText.slice(64); // rest is ciphertext

  const salt = CryptoJS.enc.Hex.parse(saltHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);
  const encrypted = encryptedHex;

  const key = CryptoJS.PBKDF2(PASSPHRASE, salt, {
    keySize: KEY_SIZE,
    iterations: ITERATIONS,
  });

  const decrypted = CryptoJS.AES.decrypt(encrypted, key, { iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

// Helpers for objects
export function encryptObject(obj: Record<string, unknown>): string {
  return encryptString(JSON.stringify(obj));
}

export function decryptObject(cipherText: string): Record<string, unknown> {
  const decrypted = decryptString(cipherText);
  return JSON.parse(decrypted);
}

export function generateId() {
  // 4 bytes timestamp
  const timestamp = Math.floor(Date.now() / 1000).toString(16);

  // 8 bytes (16 hex characters) of random data
  const randomPart = CryptoJS.lib.WordArray.random(8).toString(
    CryptoJS.enc.Hex
  );

  // Final 24-character ObjectId
  return (timestamp + randomPart).substring(0, 24);
}
