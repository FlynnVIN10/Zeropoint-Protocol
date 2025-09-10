declare module 'pg' {
  export class Pool {
    constructor(config?: any);
    query: (...args: any[]) => Promise<any>;
    end: () => Promise<void>;
  }
}


