import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { User, Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "opensource-dev-secret-key-32chars-minimum-required-value-for-security"
);

export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "opensource_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export type SafeUser = Omit<User, "passwordHash" | "resetToken" | "resetTokenExpiry" | "emailVerifyToken">;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
  });

  if (!user || user.status === "SUSPENDED") return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, resetToken, resetTokenExpiry, emailVerifyToken, ...safeUser } = user;
  return safeUser;
}

export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: authentication required");
  }
  return user;
}

export async function requireAdmin(): Promise<SafeUser> {
  const user = await requireAuth();
  if (user.role !== Role.ADMIN) {
    throw new Error("Forbidden: administrator privileges required");
  }
  return user;
}
