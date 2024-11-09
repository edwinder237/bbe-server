import crypto from 'crypto';

const internalKey = "f874e7d63e371da9af39e4d3633e0e36ae5213e5c377a2482ef7314c066d8c1f"

// Generate a random encryption key (can be done once and stored)
export const ENCRYPTION_KEY: string = internalKey || crypto.randomBytes(32).toString('hex'); // Must be 256 bits (32 bytes)
export const IV_LENGTH: number = 16; // For AES, this is always 16

// Encrypt function
export function encrypt(text: string): string {
  //console.log('encrypting token')
  const iv: Buffer = crypto.randomBytes(IV_LENGTH); // Generate a random Initialization Vector (IV)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted: Buffer = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  // Return both the IV and the encrypted data (encoded in hex)
  //console.log('token successfuly encrypted')
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt function
export function decrypt(text: string): string {
  //console.log('decrypting token')
  let textParts: string[] = text.split(':');
  const iv: Buffer = Buffer.from(textParts.shift() as string, 'hex'); // Extract IV from the encrypted string
  const encryptedText: Buffer = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted: Buffer = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
 // console.log('token successfuly decrypted')
  return decrypted.toString();
}