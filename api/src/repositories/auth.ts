import bcrypt from 'bcrypt';
import { Jwt } from 'hono/utils/jwt';
import { ScoreTable, UserTable } from '../db/schema.js'; // Update the import path based on your project structure
import { eq } from 'drizzle-orm';
import { db } from '../db/db.js';

async function getUserByUsername(username: string) {
  const users = await db
    .select()
    .from(UserTable)
    .where(eq(UserTable.username, username))
    .limit(1);
  return users[0] || null;
}

async function saveUser(username: string, hashedPassword: string) {
  return db
    .insert(UserTable)
    .values({
      username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .returning();
}

export async function registerUser(username: string, password: string) {
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [user] = await saveUser(username, hashedPassword);

  await db.insert(ScoreTable).values({
    value: 0,
    userUuid: user.uuid
  });
}

export async function loginUser(username: string, password: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = await Jwt.sign(
    { username: user.username, uuid: user.uuid },
    process.env.JWT_SECRET!
  );

  return token;
}
