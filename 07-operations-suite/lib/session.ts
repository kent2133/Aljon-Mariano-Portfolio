import { createHmac, timingSafeEqual } from "node:crypto";
import { getSystemMeta, isSystemId, type SystemId } from "./systems";

export type DemoSession = {
  system: SystemId;
  role: string;
  name: string;
  email: string;
  issuedAt: number;
};

const fallbackSecret = "operations-suite-public-demo-session";

function secret() {
  return process.env.AUTH_SECRET || fallbackSecret;
}

function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function signSession(session: DemoSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function verifySession(token?: string | null): DemoSession | null {
  if (!token) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  const expected = signature(payload);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as DemoSession;
    const now = Date.now();
    if (!isSystemId(session.system) || typeof session.role !== "string" || typeof session.name !== "string" || typeof session.email !== "string" || !Number.isFinite(session.issuedAt)) return null;
    if (!getSystemMeta(session.system)?.roles.some((role) => role.id === session.role)) return null;
    if (session.issuedAt > now + 1000 * 60 || now - session.issuedAt > 1000 * 60 * 60 * 12) return null;
    return session;
  } catch {
    return null;
  }
}
