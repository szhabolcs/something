declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';

      DB_CONNECTION_STRING: string;
      DB_MAX_CONNECTIONS: string;

      JWT_SECRET: string;

      API_HOST: string;
      API_VOLUME_PATH: string;
      PORT: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
