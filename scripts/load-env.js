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

  static decrypt(encryptedContent, password) {
    const parts = encryptedContent.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted content format');
    }

    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];

    const key = this.deriveKey(password, salt);

    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static loadEncryptedEnv(encryptedFilePath, password) {
    const encryptedContent = fs.readFileSync(encryptedFilePath, 'utf8');
    const decrypted = this.decrypt(encryptedContent, password);

    const envVars = {};
    const lines = decrypted.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    }

    return envVars;
  }
}

async function loadEncryptedEnv() {
  const encryptedPath = path.join(process.cwd(), '.env.encrypted');
  const envPath = path.join(process.cwd(), '.env');

  const encryptionPassword = process.env.VITE_ENV_ENCRYPTION_PASSWORD;

  if (!encryptionPassword) {
    console.log(
      '⚠️  VITE_ENV_ENCRYPTION_PASSWORD not set, looking for plain .env file...'
    );

    if (fs.existsSync(envPath)) {
      console.log('✓ Using plain .env file');
      return;
    } else {
      console.error(
        '❌ No .env file found and VITE_ENV_ENCRYPTION_PASSWORD not set'
      );
      process.exit(1);
    }
  }

  if (!fs.existsSync(encryptedPath)) {
    console.error('❌ .env.encrypted file not found');
    console.error('Run "npm run env:encrypt" to create an encrypted .env file');
    process.exit(1);
  }

  try {
    // Decrypt to temporary .env file for Vite to read
    const envVars = EnvEncryption.loadEncryptedEnv(
      encryptedPath,
      encryptionPassword
    );

    // Write to .env for Vite
    const envContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(envPath, envContent, 'utf8');

    console.log('✓ Environment variables loaded from encrypted .env file');
    console.log(`  Variables loaded: ${Object.keys(envVars).length}`);
  } catch (error) {
    console.error('❌ Failed to decrypt .env file');
    console.error('   Check your VITE_ENV_ENCRYPTION_PASSWORD');
    process.exit(1);
  }
}

loadEncryptedEnv().catch((error) => {
  console.error('❌ Error loading encrypted environment:', error.message);
  process.exit(1);
});
