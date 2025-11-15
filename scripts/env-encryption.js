import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  static decryptFile(encryptedFilePath, password, outputPath) {
    if (!fs.existsSync(encryptedFilePath)) {
      throw new Error(`Encrypted file not found: ${encryptedFilePath}`);
    }

    const encryptedContent = fs.readFileSync(encryptedFilePath, 'utf8');
    const decrypted = this.decrypt(encryptedContent, password);

    const output = outputPath || encryptedFilePath.replace('.encrypted', '');
    fs.writeFileSync(output, decrypted, 'utf8');

    console.log(`✓ Decrypted file created: ${output}`);
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function encryptEnv() {
  console.log('🔐 QPerform Frontend .env Encryption Tool\n');

  const envPath = path.join(process.cwd(), '.env');
  const encryptedPath = path.join(process.cwd(), '.env.encrypted');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found');
    process.exit(1);
  }

  if (fs.existsSync(encryptedPath)) {
    const overwrite = await question(
      '⚠️  .env.encrypted already exists. Overwrite? (yes/no): '
    );
    if (overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }
  }

  const password = await question(
    '🔑 Enter encryption password (min 12 characters): '
  );

  if (password.length < 12) {
    console.error('❌ Error: Password must be at least 12 characters');
    process.exit(1);
  }

  const confirmPassword = await question('🔑 Confirm password: ');

  if (password !== confirmPassword) {
    console.error('❌ Error: Passwords do not match');
    process.exit(1);
  }

  try {
    EnvEncryption.encryptFile(envPath, password);

    console.log('\n✅ SUCCESS!');
    console.log(`✓ .env file encrypted successfully`);
    console.log(`✓ Encrypted file: ${encryptedPath}`);
    console.log('\n⚠️  IMPORTANT: Store your encryption password securely!');
    console.log(
      '⚠️  You will need it to decrypt the file at build/runtime.'
    );
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function decryptEnv() {
  console.log('🔓 QPerform Frontend .env Decryption Tool\n');

  const encryptedPath = path.join(process.cwd(), '.env.encrypted');
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(encryptedPath)) {
    console.error('❌ Error: .env.encrypted file not found');
    process.exit(1);
  }

  if (fs.existsSync(envPath)) {
    const overwrite = await question(
      '⚠️  .env already exists. Overwrite? (yes/no): '
    );
    if (overwrite.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }
  }

  const password = await question('🔑 Enter decryption password: ');

  try {
    EnvEncryption.decryptFile(encryptedPath, password);

    console.log('\n✅ SUCCESS!');
    console.log(`✓ .env file decrypted successfully`);
    console.log(`✓ Decrypted file: ${envPath}`);
  } catch (error) {
    console.error('❌ Error: Invalid password or corrupted encrypted file');
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Determine which operation to run
const operation = process.argv[2];

if (operation === 'encrypt') {
  encryptEnv();
} else if (operation === 'decrypt') {
  decryptEnv();
} else {
  console.error('Usage: node env-encryption.js [encrypt|decrypt]');
  process.exit(1);
}
