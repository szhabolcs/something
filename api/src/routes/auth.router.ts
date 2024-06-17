import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes, reasonPhrase } from '../types/status-codes.js';
import { login, logout, refresh, register, testProtected } from './auth.definition.js';
import { AccessTokenPayload, AuthService } from '../services/auth.service.js';
import { zodErrorHandler } from '../utils/errors.js';

const authService = new AuthService();

// User registration endpoint
export const authRouter = new OpenAPIHono({ defaultHook: zodErrorHandler })
  .openapi(register, async (c) => {
    const body = c.req.valid('json');
    const tokenPair = await authService.register(body);
    return c.json(tokenPair, StatusCodes.CREATED);
  })

  .openapi(login, async (c) => {
    const body = c.req.valid('json');
    const tokenPair = await authService.login(body);
    return c.json(tokenPair, StatusCodes.CREATED);
  })

  .openapi(refresh, async (c) => {
    const refreshTokenHeader = c.req.header('Authorization')!;
    const refreshToken = refreshTokenHeader.split(' ')[1];
    const tokenPair = await authService.refreshTokenPair(refreshToken);
    return c.json(tokenPair, StatusCodes.CREATED);
  })

  .openapi(logout, async (c) => {
    const refreshTokenHeader = c.req.header('Authorization')!;
    const refreshToken = refreshTokenHeader.split(' ')[1];

    try {
      await authService.logout(refreshToken);
    } catch (error) {
      console.error(error);
    }

    return c.text(reasonPhrase(StatusCodes.OK), StatusCodes.OK);
  })

  .openapi(testProtected, async (c) => {
    const username = (c.get('jwtPayload') as AccessTokenPayload).username;
    return c.text(`Hello, "${username}"! You are authorized.`, StatusCodes.OK);
  });
