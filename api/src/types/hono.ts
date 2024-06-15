import { AccessTokenPayload, RefreshTokenPayload } from '../services/auth.service.js';

declare module 'hono' {
  // Variables that hono is able to '.get()'
  interface ContextVariableMap {
    jwtPayload: AccessTokenPayload | RefreshTokenPayload;
  }
}
