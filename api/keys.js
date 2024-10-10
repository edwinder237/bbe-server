const crypto = require('crypto');

// Generate a random encryption key (can be done once and stored)
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); // Must be 256 bits (32 bytes)
export const IV_LENGTH = 16; // For AES, this is always 16

// Encrypt function
export function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random Initialization Vector (IV)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return both the IV and the encrypted data (encoded in hex or base64)
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt function
export function decrypt(text) {
  let textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex'); // Extract IV from the encrypted string
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}
