import "dotenv/config";

import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { authRoutes } from "./routes/auth.js";
import { thingRouter } from "./routes/things.js";
import { imageRouter } from "./routes/image.js";
import { userRouter } from "./routes/user.js";

import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

if (process.env.API_IMAGE_DIR) {
  app.use(`${process.env.API_IMAGE_DIR}/*`, serveStatic());
} else {
  app.use("/image/*", serveStatic({ root: "./" }));
}

app.get("/", (c) => {
  return c.text("hello something user:) !");
});

// Authentication routes
app.route("/auth", authRoutes);
app.route("/things", thingRouter);
app.route("/image-upload", imageRouter);
app.route("/user", userRouter);

const port = process.env.PORT as unknown as number;
console.log(`Server is running on port ${port}`);

serve({
  hostname: "0.0.0.0",
  fetch: app.fetch,
  port,
});
