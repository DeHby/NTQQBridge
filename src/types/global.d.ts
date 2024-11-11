declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG: string;
      TEST: string;
    }
    interface Process {}
  }
}

export {};
