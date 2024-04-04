import bcrypt from "bcrypt";
import { Jwt } from "hono/utils/jwt";
import { user } from "./schema"; // Update the import path based on your project structure
import { eq } from "drizzle-orm";
import { db } from "./db";
import { StatusCodes } from "http-status-codes";

const jwt_secret_key = process.env.JWT_SECRET || "your-secret-key";
async function getUserByUsername(username: string) {
  const users = await db
    .select()
    .from(user)
    .where(eq(user.username, username))
    .limit(1);
  return users[0] || null;
}

async function saveUser(username: string, hashedPassword: string) {
  await db.insert(user).values({
    username,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function registerUser(username: string, password: string) {
  const existingUser = await getUserByUsername(username);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await saveUser(username, hashedPassword);
}

export async function loginUser(username: string, password: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error("User not found");
  }

  const userPassword = user.password || "";
  if (!userPassword) {
    throw new Error("User password not found");
  }

  const isPasswordValid = await bcrypt.compare(password, userPassword);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  const token = await Jwt.sign(
    { username: user.username, uuid: user.uuid },
    jwt_secret_key
  );

  return { token: token, user: { username: user.username } };
}
