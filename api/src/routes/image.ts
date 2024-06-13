import { StatusCodes, reasonPhrase } from '../types/status-codes.js';
import { cwd } from 'process';
import { randomUUID } from 'crypto';
import path from 'path';
import { updateCheckpoint } from '../repositories/checkpoint.js';
import sharp from 'sharp';
import { OpenAPIHono } from '@hono/zod-openapi';
import { serveImage, uploadImage } from './image.definition.js';
import { serveStatic } from '../utils/serve-static.js';
import { zodErrorHandler } from '../utils/errors.js';

export const imageRouter = new OpenAPIHono({ defaultHook: zodErrorHandler })
  .openapi(uploadImage, async (c) => {
    const user_uuid = c.get('jwtPayload').uuid;

    const body = await c.req.parseBody();
    const file = (await body['image']) as File;
    const thing_uuid = body['thing_uuid'] as string;
    // if (!thing_uuid) {
    //   return c.json({ error: 'thing_uuid is required' }, StatusCodes.BAD_REQUEST);
    // }

    // if (!file) {
    //   return c.json({ error: 'image is required' }, StatusCodes.BAD_REQUEST);
    // }

    const fileData = await file.arrayBuffer();
    const fileExt = '.jpg';
    const fileName = `${randomUUID()}${fileExt}`;

    // On production, we have a mounted volume
    if (process.env.API_VOLUME_PATH) {
      const filePath = path.join(
        process.env.API_VOLUME_PATH,
        'images',
        fileName
      );
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

    await updateCheckpoint(user_uuid, thing_uuid, fileName);
    return c.text(reasonPhrase(StatusCodes.CREATED), StatusCodes.CREATED);
  })
  .openapi(serveImage, serveStatic() as any);
