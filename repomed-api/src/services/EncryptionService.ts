import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const KEY_LENGTH = 32;
const AUTH_TAG_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-super-secret-key-that-is-32-bytes-long'; // Must be 32 bytes

class EncryptionService {
  private getKey(salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
  }

  encrypt(data: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = this.getKey(salt);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, authTag, encrypted]).toString('hex');
  }

  decrypt(encrypted: string): string {
    const data = Buffer.from(encrypted, 'hex');
    const salt = data.slice(0, SALT_LENGTH);
    const iv = data.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = data.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encryptedData = data.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

    const key = this.getKey(salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

    return decrypted.toString('utf8');
  }
}

export const encryptionService = new EncryptionService();
