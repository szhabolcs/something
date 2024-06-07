import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { StatusCode } from 'hono/utils/http-status';
import { StatusCodes } from '../types/status-codes.js';
import { jwt } from 'hono/jwt';
import * as openapi3_ts_oas31 from 'openapi3-ts/oas31';

export function jsonc<TSchema>(schema: TSchema) {
  return { content: { 'application/json': { schema } } };
}

export function textc<TSchema>(schema: TSchema) {
  return { content: { 'text/plain': { schema } } };
}

export function formc<TSchema>(schema: TSchema) {
  return { content: { 'multipart/form-data': { schema } } };
}

export const catchErrors: Parameters<OpenAPIHono['openapi']>['2'] = (
  result,
  c
) => {
  if (!result.success) {
    console.error(result.error);
    return c.json(
      {
        reason: result.error.message
      },
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

export function useJWT() {
  return jwt({ secret: process.env.JWT_SECRET! });
}

export const bearerAuth = [{ Bearer: [] }];

export function registerBearerAuthScheme(app: OpenAPIHono) {
  app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
  });
}

export function completeOpenAPIConfig(config: openapi3_ts_oas31.OpenAPIObject) {
  return {
    ...config,
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Something API'
    }
  };
}

export type ExtractNumbers<T> = T extends number ? T : never;
export type ExtractedStatusCodeNumbers = ExtractNumbers<StatusCode>;
export function route<
  TStatusCodes extends ExtractedStatusCodeNumbers[] | z.ZodType
>(
  method: Parameters<typeof createRoute>['0']['method'],
  path: Parameters<typeof createRoute>['0']['path'],
  goodResponse: z.ZodType | TStatusCodes,
  description: string = ''
) {
  if (goodResponse instanceof Array) {
    const responses = {} as {
      [key in TStatusCodes extends ExtractedStatusCodeNumbers[]
        ? TStatusCodes[number]
        : never]: {
        content: {
          'text/plain': { schema: z.ZodString };
        };
        description: '';
      };
    };
    for (const code of goodResponse as TStatusCodes extends ExtractedStatusCodeNumbers[]
      ? TStatusCodes
      : never) {
      responses[
        code as TStatusCodes extends ExtractedStatusCodeNumbers[]
          ? TStatusCodes[number]
          : never
      ] = {
        content: {
          'text/plain': { schema: z.string() }
        },
        description: ''
      };
    }

    return createRoute({
      method,
      path,
      responses
    });
  }

  return createRoute({
    method,
    path,
    responses: {
      200: {
        content: {
          'application/json': {
            schema: goodResponse as TStatusCodes extends z.ZodType
              ? TStatusCodes
              : never
          }
        },
        description
      }
    }
  });
}
