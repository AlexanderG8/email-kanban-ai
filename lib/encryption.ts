import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Get encryption key from environment variable
 * The key should be a 32-character string for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  if (key.length < 32) {
    throw new Error("ENCRYPTION_KEY must be at least 32 characters long");
  }

  // Use first 32 characters to create a consistent key
  return Buffer.from(key.slice(0, 32), "utf-8");
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns a base64 encoded string containing: salt + iv + authTag + encryptedData
 */
export function encrypt(text: string): string {
  if (!text) {
    throw new Error("Text to encrypt cannot be empty");
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Derive a unique key for this encryption using salt
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, "sha256");

  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Combine salt + iv + authTag + encrypted data
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, "hex"),
  ]);

  return combined.toString("base64");
}

/**
 * Decrypt a string that was encrypted with the encrypt function
 * Expects base64 encoded string containing: salt + iv + authTag + encryptedData
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error("Encrypted text cannot be empty");
  }

  const key = getEncryptionKey();

  // Decode base64
  const combined = Buffer.from(encryptedText, "base64");

  // Extract components
  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  // Derive the same key using the salt
  const derivedKey = crypto.pbkdf2Sync(key, salt, 100000, 32, "sha256");

  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Check if a string appears to be encrypted (basic validation)
 */
export function isEncrypted(text: string): boolean {
  try {
    const decoded = Buffer.from(text, "base64");
    // Minimum length: salt + iv + authTag + at least 1 byte of data
    return decoded.length > SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH;
  } catch {
    return false;
  }
}

/**
 * Safely encrypt, returning null if encryption fails
 */
export function safeEncrypt(text: string): string | null {
  try {
    return encrypt(text);
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
}

/**
 * Safely decrypt, returning null if decryption fails
 */
export function safeDecrypt(encryptedText: string): string | null {
  try {
    return decrypt(encryptedText);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
}

/**
 * Hash a string using SHA-256 (one-way, for comparison purposes)
 */
export function hash(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}
