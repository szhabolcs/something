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

export function useAccessToken() {
  return jwt({ secret: process.env.ACCESS_TOKEN_SECRET });
}

export function useRefreshToken() {
  return jwt({ secret: process.env.REFRESH_TOKEN_SECRET });
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
