
export class PuterApiError extends Error {
  public statusCode?: number;
  public code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'PuterApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class PuterAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PuterAuthError';
  }
}
