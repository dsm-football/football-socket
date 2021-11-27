export class ErrorResponse extends Error {
  public status: number;
  public message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export class UnauthorizedError extends ErrorResponse {
  constructor() {
    super(401, 'Unauthorized Token');
  }
}

export class ExpiredTokenError extends ErrorResponse {
  constructor() {
    super(401, 'Expired Token');
  }
}

export class ForbiddenError extends ErrorResponse {
  constructor() {
    super(403, 'Forbidden Request');
  }
}

export class NotFoundError extends ErrorResponse {
  constructor() {
    super(404, `Not Found Error`);
  }
}

export class BadRequestError extends ErrorResponse {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class InternalServerError extends ErrorResponse {
  constructor() {
    super(500, 'Interal Server Error');
  }
}
