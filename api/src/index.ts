import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { initializeDatabase } from "./repositories/db";

import { authRoutes } from "./routes/auth";
import { thingRouter } from "./routes/things";
import { imageRouter } from "./routes/image";
import { userRouter } from "./routes/user";

import { serveStatic } from "@hono/node-server/serve-static";
serveStatic;

// DB migrations
initializeDatabase().catch((err) => {
  console.error("Database initialization failed:", err);
  process.exit(1);
});

const app = new Hono();

app.use("/image/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
  return c.text("hello something user:) !");
});

// Authentication routes
app.route("/auth", authRoutes);
app.route("/things", thingRouter);
app.route("/image-upload", imageRouter);
app.route("/user", userRouter);

const port = process.env.API_PORT as unknown as number;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
