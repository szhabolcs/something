import 'dotenv/config';

import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';

import { authRouter } from './routes/auth.js';
import { thingRouter } from './routes/things.js';
import { imageRouter } from './routes/image.js';
import { userRouter } from './routes/user.js';

import { OpenAPIHono } from '@hono/zod-openapi';
import { registerBearerAuthScheme } from './utils/openapi.js';
import { scalarUIProtected } from './utils/scalar.js';
import { swaggerUIProtected } from './utils/swagger.js';
import { globalErrorHandler, zodErrorHandler } from './utils/errors.js';

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
