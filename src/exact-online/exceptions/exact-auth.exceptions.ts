import { HttpException, HttpStatus } from '@nestjs/common';

export class ExactAuthenticationException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.UNAUTHORIZED) {
    super(message, status);
  }
}

export class ExactRefreshTokenExpiredException extends ExactAuthenticationException {
  constructor(message: string = 'Exact Online refresh token has expired') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ExactInvalidClientException extends ExactAuthenticationException {
  constructor(message: string = 'Exact Online client credentials are invalid') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ExactConnectionRequiredException extends ExactAuthenticationException {
  constructor(message: string = 'Exact Online connection required - please reconnect') {
    super(message, HttpStatus.PRECONDITION_REQUIRED);
  }
} 