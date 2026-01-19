import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, type User, type NewUser } from '../db/schema.js';

export async function getUserById(id: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id));
  return rows[0] || null;
}

export async function getUserByAuthId(authId: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.authId, authId));
  return rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.email, email));
  return rows[0] || null;
}

export async function createUser(data: {
  authId: string;
  email: string;
  displayName: string;
}): Promise<User> {
  const newUser: NewUser = {
    authId: data.authId,
    email: data.email,
    displayName: data.displayName,
  };

  const rows = await db.insert(users).values(newUser).returning();
  return rows[0];
}

export async function updateUser(
  id: string,
  data: Partial<Pick<User, 'email' | 'displayName'>>
): Promise<User | null> {
  const rows = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return rows[0] || null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });
  return result.length > 0;
}

export async function getOrCreateUserByAuth(data: {
  authId: string;
  email: string;
  displayName?: string;
}): Promise<User> {
  const existing = await getUserByAuthId(data.authId);
  if (existing) {
    return existing;
  }

  return createUser({
    authId: data.authId,
    email: data.email,
    displayName: data.displayName || data.email.split('@')[0],
  });
}
