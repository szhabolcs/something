import { registerUser, loginUser } from '../repositories/auth.js';
import { OpenAPIHono } from '@hono/zod-openapi';
import { StatusCodes } from '../types/status-codes.js';
import { login, register, testProtected } from './auth.definition.js';

// User registration endpoint
export const authRouter = new OpenAPIHono()
  .openapi(register, async (c) => {
    const { username, password } = c.req.valid('json');
    await registerUser(username, password);
    const token = await loginUser(username, password);
    return c.text(token, StatusCodes.CREATED);
  })

  .openapi(login, async (c) => {
    const { username, password } = c.req.valid('json');
    const token = await loginUser(username, password);
    return c.text(token, StatusCodes.CREATED);
  })

  .openapi(testProtected, async (c) => {
    const username = c.get('jwtPayload').username;
    return c.text(`Hello, "${username}"! You are authorized.`, StatusCodes.OK);
  });
