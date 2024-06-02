import { Hono } from 'hono';
import { StatusCodes } from 'http-status-codes';
import { jwt } from 'hono/jwt';
import { cwd } from 'process';
import { randomUUID } from 'crypto';
import path from 'path';
import { writeFile } from 'fs/promises';
import { updateCheckpoint } from '../repositories/checkpoint.js';
import sharp from 'sharp';

export const imageRouter = new Hono();

// JWT secret key
export const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

imageRouter.post('/', jwt({ secret: jwtSecret }), async (c) => {
  const user_uuid = c.get('jwtPayload').uuid;

  const body: any = await c.req.parseBody();
  const file = await body['image'];
  const thing_uuid = body['thing_uuid'];
  if (!thing_uuid) {
    return c.json({ error: 'thing_uuid is required' }, StatusCodes.BAD_REQUEST);
  }

  if (!file) {
    return c.json({ error: 'image is required' }, StatusCodes.BAD_REQUEST);
  }

  const fileData = await file.arrayBuffer();
  const fileExt = '.jpg';
  const fileName = `${randomUUID()}${fileExt}`;

  // On production, we have a mounted volume
  if (process.env.API_VOLUME_PATH) {
    const filePath = path.join(process.env.API_VOLUME_PATH, 'images', fileName);
    await sharp(Buffer.from(fileData))
      .jpeg({ quality: 50, mozjpeg: true })
      .flop() // Because the image is mirrored
      .toFile(filePath);
    console.log(`Image saved to ${filePath}`);
  } else {
    const filePath = path.join(cwd(), '/images', fileName);
    await sharp(Buffer.from(fileData))
      .jpeg({ quality: 50, mozjpeg: true })
      .flop() // Because the image is mirrored
      .toFile(filePath);
    console.log(`Image saved to ${filePath}`);
  }

  try {
    await updateCheckpoint(user_uuid, thing_uuid, fileName);
  } catch (error: any) {
    console.error(error);
    return c.json({ error: error.message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
  return c.json({ photoUuid: fileName }, StatusCodes.OK);
});
