import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { bearerAuth, jsonc, textc, useJWT } from '../utils/openapi.js';
import { StatusCodes } from '../types/status-codes.js';

export const AuthDTO = z.object({
  username: z.string().min(5),
  password: z.string().min(8)
});

export const AuthResponseModel = z
  .string()
  .openapi({ description: 'JWT Token' });

export const register = createRoute({
  method: 'post',
  path: '/register',
  description: 'Register a new user.',
  tags: ['Auth'],
  request: {
    body: jsonc(AuthDTO)
  },
  responses: {
    [StatusCodes.CREATED]: {
      ...textc(AuthResponseModel),
      description: 'Successfully registered.'
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const login = createRoute({
  method: 'post',
  path: '/login',
  description: 'Login user.',
  tags: ['Auth'],
  request: {
    body: jsonc(AuthDTO)
  },
  responses: {
    [StatusCodes.CREATED]: {
      ...textc(AuthResponseModel),
      description: 'Successful login.'
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});

export const testProtected = createRoute({
  method: 'get',
  path: '/protected',
  description: 'Test JWT token.',
  tags: ['Auth'],
  middleware: useJWT(),
  security: bearerAuth,
  responses: {
    [StatusCodes.CREATED]: {
      ...textc(z.string()),
      description: 'Successfully authorized.'
    },
    [StatusCodes.INTERNAL_SERVER_ERROR]: {
      description: 'Unexpected error occured.'
    }
  }
});
