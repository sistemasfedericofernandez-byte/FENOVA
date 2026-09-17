import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

/**
 * Encripta campos sensibles (DNI de inquilino/garante) antes de guardarlos.
 * Requiere ENCRYPTION_KEY (32 bytes en base64) en las variables de entorno.
 * Solo se usa server-side (server actions / server components) — nunca en
 * un componente cliente.
 */
const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) throw new Error("Falta configurar la variable de entorno ENCRYPTION_KEY");
  const buffer = Buffer.from(key, "base64");
  if (buffer.length !== 32) {
    throw new Error("ENCRYPTION_KEY debe ser una clave de 32 bytes en base64");
  }
  return buffer;
}

export function encryptField(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decryptField(value: string): string {
  const raw = Buffer.from(value, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
