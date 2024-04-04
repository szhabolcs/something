import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { registerUser, loginUser } from "../repositories/auth";
import { StatusCodes } from "http-status-codes";

export const authRoutes = new Hono();

// JWT secret key
const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

// User registration endpoint
authRoutes.post("/register", async (c) => {
  const { username, password } = await c.req.json();

  try {
    await registerUser(username, password);
    return c.json(
      { message: "User registered successfully" },
      StatusCodes.CREATED
    );
  } catch (error: any) {
    if (error.message === "User already exists") {
      return c.json({ error: error.message }, StatusCodes.CONFLICT);
    }
    return c.json({ error: error.message }, StatusCodes.BAD_REQUEST);
  }
});

// User login endpoint
authRoutes.post("/login", async (c) => {
  const { username, password } = await c.req.json();

  try {
    const response = await loginUser(username, password);
    return c.json(response);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.UNAUTHORIZED);
  }
});

// Protected route
authRoutes.get("/protected", jwt({ secret: jwtSecret }), (c) => {
  const username = c.get("jwtPayload").username;
  return c.text(`Hello, ${username}! You are authorized.`);
});
