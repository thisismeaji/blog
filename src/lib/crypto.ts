import { pbkdf2Sync, randomBytes } from "crypto"

/**
 * Hashes a plaintext password using PBKDF2 with SHA-512.
 * Returns the hash in the format: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return `${salt}:${hash}`
}

/**
 * Verifies a plaintext password against a stored salted hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":")
  if (parts.length !== 2) return false
  const [salt, originalHash] = parts
  const hashToVerify = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
  return hashToVerify === originalHash
}
