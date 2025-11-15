import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

class EnvEncryption {
  static ALGORITHM = 'aes-256-gcm';
  static KEY_LENGTH = 32;
  static IV_LENGTH = 16;
  static SALT_LENGTH = 64;
  static PBKDF2_ITERATIONS = 100000;

  static deriveKey(password, salt) {
    return crypto.pbkdf2Sync(
      password,
      salt,
      this.PBKDF2_ITERATIONS,
      this.KEY_LENGTH,
      'sha512'
    );
  }

  static encrypt(content, password) {
    const salt = crypto.randomBytes(this.SALT_LENGTH);
    const key = this.deriveKey(password, salt);
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return `${salt.toString('hex')}:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  static encryptFile(filePath, password) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const encrypted = this.encrypt(content, password);

    const encryptedFilePath = `${filePath}.encrypted`;
    fs.writeFileSync(encryptedFilePath, encrypted, 'utf8');

    console.log(`✓ Encrypted file created: ${encryptedFilePath}`);
  }
}

async function encryptNow() {
  console.log('🔐 QPerform Frontend .env Encryption (Automated)\n');

  const envPath = path.join(process.cwd(), '.env');
  const encryptedPath = path.join(process.cwd(), '.env.encrypted');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found');
    process.exit(1);
  }

  // Get password from environment or use default
  const password = process.env.ENCRYPTION_PASSWORD || 'QPerform2024SecureFrontend!@#';

  if (password.length < 12) {
    console.error('❌ Error: Password must be at least 12 characters');
    process.exit(1);
  }

  try {
    EnvEncryption.encryptFile(envPath, password);

    console.log('\n✅ SUCCESS!');
    console.log(`✓ .env file encrypted successfully`);
    console.log(`✓ Encrypted file: ${encryptedPath}`);
    console.log(`✓ Password used: ${password}`);
    console.log('\n📋 Next steps:');
    console.log('1. Set VITE_ENV_ENCRYPTION_PASSWORD environment variable to this password');
    console.log('2. Securely delete the original .env file');
    console.log('3. Commit .env.encrypted to git');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

encryptNow();
