import { createMiddleware } from 'hono/factory';
import { StatusCodes } from '../types/status-codes.js';
import * as openapi3_ts_oas31 from 'openapi3-ts/oas31';
import { ApiReferenceOptions, javascript } from '@scalar/hono-api-reference';
import { completeOpenAPIConfig } from './openapi.js';

export function scalarUIProtected(
  openapi31config: openapi3_ts_oas31.OpenAPIObject
) {
  return createMiddleware(async (c) => {
    const { pwd } = c.req.query();

    if (pwd !== process.env.DOCS_PWD) {
      return c.text('404 Not Found', StatusCodes.NOT_FOUND);
    }

    const options: ApiReferenceOptions = {
      pageTitle: 'Scalar API Reference',
      theme: 'purple',
      hideDownloadButton: true,
      spec: {
        content: completeOpenAPIConfig(openapi31config)
      }
    };
    return c.html(
      /* html */
      `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${options?.pageTitle ?? 'API Reference'}</title>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1" />
            <style>
              ${options.theme}
            </style>
          </head>
          <body>
            ${javascript(options)}
          </body>
        </html>
      `
    );
  });
}
