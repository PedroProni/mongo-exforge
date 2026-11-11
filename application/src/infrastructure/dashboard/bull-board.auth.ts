import { createHash, timingSafeEqual } from 'crypto';
import basicAuth from 'basic-auth';
import { NextFunction, Request, Response } from 'express';

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

export function basicAuthMiddleware(username: string, password: string) {
  const expected_user = digest(username);
  const expected_pass = digest(password);

  return (request: Request, response: Response, next: NextFunction): void => {
    const credentials = basicAuth(request);
    const valid = credentials !== undefined && timingSafeEqual(digest(credentials.name), expected_user) && timingSafeEqual(digest(credentials.pass), expected_pass);
    if (!valid) {
      response.set('WWW-Authenticate', 'Basic realm="Bull Dashboard"');
      response.status(401).send('Authentication required.');
      return;
    }
    next();
  };
}
