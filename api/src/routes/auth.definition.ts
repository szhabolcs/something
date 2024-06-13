import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import {
  bearerAuth,
  defaultResponses,
  jsonc,
  textc,
  useAccessToken,
  useRefreshToken
} from '../utils/openapi.js';
import { StatusCodes } from '../types/status-codes.js';

export const AuthDTO = z.object({
  username: z.string().min(5),
  password: z.string().min(8),
  pushToken: z.string().optional()
});
export type AuthDTO = z.infer<typeof AuthDTO>;

export const AuthResponseModel = z.object({
  accessToken: z.string(),
  refreshToken: z.string()
});

export const register = createRoute({
  method: 'post',
  path: '/register',
  description: 'Register a new user.',
  tags: ['Auth'],
  request: {
    body: jsonc(AuthDTO)
  },
  responses: {
    ...defaultResponses,
    [StatusCodes.CREATED]: {
      ...jsonc(AuthResponseModel),
      description: 'Successfully registered.'
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
    ...defaultResponses,
    [StatusCodes.CREATED]: {
      ...jsonc(AuthResponseModel),
      description: 'Successful login.'
    }
  }
});

export const refresh = createRoute({
  method: 'post',
  path: '/refresh',
  description: 'Refresh JWT token.',
  tags: ['Auth'],
  middleware: useRefreshToken(),
  security: bearerAuth,
  responses: {
    ...defaultResponses,
    [StatusCodes.CREATED]: {
      ...jsonc(AuthResponseModel),
      description: 'Successfully refreshed.'
    }
  }
});

export const logout = createRoute({
  method: 'post',
  path: '/logout',
  description: 'Logout user.',
  tags: ['Auth'],
  middleware: useRefreshToken(),
  security: bearerAuth,
  responses: {
    [StatusCodes.OK]: {
      ...textc(z.string()),
      description: 'Successfully logged out.'
    }
  }
});

export const testProtected = createRoute({
  method: 'get',
  path: '/protected',
  description: 'Test JWT token.',
  tags: ['Auth'],
  middleware: useAccessToken(),
  security: bearerAuth,
  responses: {
    ...defaultResponses,
    [StatusCodes.CREATED]: {
      ...textc(z.string()),
      description: 'Successfully authorized.'
    }
  }
});
