import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";
import { jwt } from "hono/jwt";
import { cwd } from "process";
import { randomUUID } from "crypto";
import path from "path";
import { writeFileSync } from "fs";
import { updateCheckpoint } from "../repositories/checkpoint";
export const imageRouter = new Hono();

// JWT secret key
export const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

imageRouter.post("/", jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get("jwtPayload").uuid;

  const body: any = await c.req.parseBody();
  const file = await body["image"];
  const thing_uuid = body["thing_uuid"];
  if (!thing_uuid) {
    return c.json({ error: "thing_uuid is required" }, StatusCodes.BAD_REQUEST);
  }

  if (!file) {
    return c.json({ error: "image is required" }, StatusCodes.BAD_REQUEST);
  }

  const fileData = await file.arrayBuffer();
  const fileExt = ".jpg";
  const fileName = `${randomUUID()}${fileExt}`;
  const filePath = path.join(cwd(), "/image", fileName);
  await writeFileSync(filePath, Buffer.from(fileData));

  try {
    await updateCheckpoint(user_uuid, thing_uuid, fileName);
  } catch (error: any) {
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  return c.json({ photoUuid: fileName }, StatusCodes.OK);
});
