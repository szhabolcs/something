declare module 'hono' {
  // Variables that hono is able to '.get()'
  interface ContextVariableMap {
    jwtPayload: {
      username: string;
      uuid: string;
    };
  }
}
