import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { bearerAuth, formc, textc, useJWT } from '../utils/openapi.js';
import { StatusCodes } from '../types/status-codes.js';

export const uploadImage = createRoute({
  method: 'post',
  path: '/upload',
  middleware: useJWT(),
  security: bearerAuth,
  description:
    'Send an image as a checkpoint for a thing. <br> (Scalar UI does not support formdata yet)',
  tags: ['Images'],
  request: {
    body: formc(
      z.object({
        image: z.string().openapi({ format: 'binary' }),
        thing_uuid: z.string()
      })
    )
  },
  responses: {
    [StatusCodes.CREATED]: {
      ...textc(z.string()),
      description: 'Successfully sent image.'
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const serveImage = createRoute({
  method: 'get',
  path: '/{filename}',
  // middleware: useJWT(),
  description: `Get image using its filename.`,
  tags: ['Images'],
  request: {
    params: z.object({ filename: z.string() })
  },
  responses: {
    [StatusCodes.OK]: {
      content: {
        'image/jpeg': {
          schema: z.string().openapi({ format: 'binary' })
        }
      },
      description: 'The image.'
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});
