// USING THIS FROM https://github.com/honojs/node-server/blob/main/src/serve-static.ts
// UNTIL ISSUE IS FIXED FOR ABS PATHS: https://github.com/honojs/node-server/pull/78

import type { ReadStream } from 'fs';
import { createReadStream, existsSync, lstatSync } from 'fs';
import type { Context, Handler } from 'hono';
import { getMimeType } from 'hono/utils/mime';
import { StatusCodes, reasonPhrase } from '../types/status-codes.js';

export type ServeStaticOptions = {
  /**
   * Root path, relative to current working directory. (absolute paths are not supported)
   */
  root?: string;
  path?: string;
  index?: string; // default is 'index.html'
  rewriteRequestPath?: (path: string) => string;
  onNotFound?: (path: string, c: Context) => void | Promise<void>;
};

const createStreamBody = (stream: ReadStream) => {
  const body = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => {
        controller.enqueue(chunk);
      });
      stream.on('end', () => {
        controller.close();
      });
    },

    cancel() {
      stream.destroy();
    }
  });
  return body;
};

export const serveStatic = (path: string): Handler => {
  return async (c, next) => {
    console.log(`Serving static file: ${path}`);

    // Do nothing if Response is already set
    if (c.finalized) {
      return next();
    }

    if (!existsSync(path)) {
      // await options.onNotFound?.(path, c);
      console.error(`File not found: ${path}`);
      return c.text(reasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR), StatusCodes.INTERNAL_SERVER_ERROR);
    }

    const mimeType = getMimeType(path);
    if (mimeType) {
      c.header('Content-Type', mimeType);
    }

    const stat = lstatSync(path);
    const size = stat.size;

    if (c.req.method == 'HEAD' || c.req.method == 'OPTIONS') {
      c.header('Content-Length', size.toString());
      c.status(200);
      return c.body(null);
    }

    const range = c.req.header('range') || '';

    if (!range) {
      c.header('Content-Length', size.toString());
      return c.body(createStreamBody(createReadStream(path)), 200);
    }

    c.header('Accept-Ranges', 'bytes');
    c.header('Date', stat.birthtime.toUTCString());

    const parts = range.replace(/bytes=/, '').split('-', 2);
    const start = parts[0] ? parseInt(parts[0], 10) : 0;
    let end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    if (size < end - start + 1) {
      end = size - 1;
    }

    const chunksize = end - start + 1;
    const stream = createReadStream(path, { start, end });

    c.header('Content-Length', chunksize.toString());
    c.header('Content-Range', `bytes ${start}-${end}/${stat.size}`);

    return c.body(createStreamBody(stream), 206);
  };
};
