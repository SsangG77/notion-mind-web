import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// AES-256-GCM. TOKEN_ENCRYPTION_KEY = 64자 hex (openssl rand -hex 32)
function key(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("TOKEN_ENCRYPTION_KEY missing or not 64 hex chars");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, enc].map((b) => b.toString("base64url")).join(".");
}

export function decrypt(token: string): string {
  const [iv, tag, enc] = token.split(".").map((s) => Buffer.from(s, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
