import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a plain text password against a stored hash or legacy plain-text password
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash) return false;

  // Check if hash is bcrypt format ($2a$, $2b$, $2y$)
  const isBcrypt = storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$');

  if (isBcrypt) {
    try {
      return await bcrypt.compare(password, storedHash);
    } catch {
      return false;
    }
  }

  // Fallback for legacy plain-text rows
  return password === storedHash;
}

/**
 * Check if the stored hash is legacy and should be upgraded to bcrypt
 */
export function needsRehash(storedHash: string): boolean {
  if (!storedHash) return true;
  return !(storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$'));
}
