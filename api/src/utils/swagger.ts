import { createMiddleware } from 'hono/factory';
import { StatusCodes } from '../types/status-codes.js';
import * as openapi3_ts_oas31 from 'openapi3-ts/oas31';
import { swaggerUI } from '@hono/swagger-ui';
import { completeOpenAPIConfig } from './openapi.js';

export function swaggerUIProtected(openapi31config: openapi3_ts_oas31.OpenAPIObject) {
  return createMiddleware(async (c, next) => {
    const { pwd } = c.req.query();

    if (pwd !== process.env.DOCS_PWD) {
      return c.text('404 Not Found', StatusCodes.NOT_FOUND);
    }

    const options: any = {
      spec: completeOpenAPIConfig(openapi31config),
      persistAuthorization: true
    };
    return swaggerUI(options)(c, next);
  });
}
