import 'dotenv/config';

import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';
import { Hono } from 'hono';

import { authRoutes } from './routes/auth.js';
import { thingRouter } from './routes/things.js';
import { imageRouter } from './routes/image.js';
import { userRouter } from './routes/user.js';

import { serveStatic } from './utils/serve-static.js';
import { access, mkdir } from 'fs/promises';

const app = new Hono();

app.use(logger());

if (process.env.API_VOLUME_PATH) {
  // Check if the image directory exists
  const imgageDir = `${process.env.API_VOLUME_PATH}/images`;
  try {
    await access(imgageDir);
    console.log('Image directory exists');
  } catch (error: any) {
    // Create the directory if it doesn't exist
    if (error.code === 'ENOENT') {
      await mkdir(imgageDir, { recursive: true });
      console.log('Image directory created successfully');
    } else {
      console.error('Error creating the image directory', error);
    }
  }
}

app.use(
  '/images/*',
  serveStatic({
    root: process.env.API_VOLUME_PATH ? process.env.API_VOLUME_PATH : './'
  })
);

app.get('/', (c) => {
  return c.text('hello something user:) !');
});

// Authentication routes
app.route('/auth', authRoutes);
app.route('/things', thingRouter);
app.route('/image-upload', imageRouter);
app.route('/user', userRouter);

const port = process.env.PORT as unknown as number;
console.log(`Server is running on port ${port}`);

serve({
  hostname: '0.0.0.0',
  fetch: app.fetch,
  port
});
