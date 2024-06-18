import 'dotenv/config';

import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';

import { authRouter } from './routes/auth.router.js';
import { thingRouter } from './routes/things.router.js';
import { imageRouter } from './routes/image.router.js';
import { userRouter } from './routes/user.router.js';

import { OpenAPIHono } from '@hono/zod-openapi';
import { registerBearerAuthScheme } from './utils/openapi.js';
import { scalarUIProtected } from './utils/scalar.js';
import { swaggerUIProtected } from './utils/swagger.js';
import { globalErrorHandler, zodErrorHandler } from './utils/errors.js';
import { NotificationService } from './services/notification.service.js';
import { InferResponseType as _InferResponseType, InferRequestType as _InferRequestType, hc } from 'hono/client';
import { StatusCode } from 'hono/utils/http-status';

const app = new OpenAPIHono({ defaultHook: zodErrorHandler })
  .onError(globalErrorHandler)
  .use(logger())
  .get('/', (c) => {
    return c.text('so you found the api, nice! :)');
  })
  .route('/auth', authRouter)
  .route('/things', thingRouter)
  .route('/images', imageRouter)
  .route('/user', userRouter);

registerBearerAuthScheme(app as OpenAPIHono);

const openapi31config = (app as OpenAPIHono).getOpenAPI31Document({});
app.get('/scalar', scalarUIProtected(openapi31config));
app.get('/swagger', swaggerUIProtected(openapi31config));

const port = Number(process.env.PORT!);
console.log(`Server is running on http://localhost:${port}`);

serve({
  hostname: '0.0.0.0',
  fetch: app.fetch,
  port
});

const notificationService = new NotificationService();
await notificationService.start();

export type AppType = typeof app;
const client = hc<AppType>('localhost');
export type Client = typeof client;
export type InferResponseType<T, S extends StatusCode> = _InferResponseType<T, S>;
export type InferRequestType<T> = _InferRequestType<T>;
