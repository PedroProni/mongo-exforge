import { createHmac, timingSafeEqual } from 'crypto';
import { SIGNATURE_CONTEXT } from '@domain/constants/local-storage.constant';
import { SignedDownload } from '@domain/types/signed-download.type';

export class SignedTokenHelper {
  static sign(payload: SignedDownload, secret: string): string {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${SignedTokenHelper.signature(body, secret)}`;
  }

  static verify(token: string, secret: string, now: number = Date.now()): SignedDownload | null {
    const [body, signature, extra] = token.split('.');
    if (!body || !signature || extra !== undefined) return null;
    const expected = Buffer.from(SignedTokenHelper.signature(body, secret));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    try {
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SignedDownload;
      if (typeof payload.key !== 'string' || typeof payload.filename !== 'string' || typeof payload.exp !== 'number' || payload.exp < now) return null;
      return payload;
    } catch {
      return null;
    }
  }

  private static signature(body: string, secret: string): string {
    return createHmac('sha256', `${SIGNATURE_CONTEXT}:${secret}`).update(body).digest('base64url');
  }
}
