import { SignedTokenHelper } from '@common/helpers/functions/signed-token.helper';

const SECRET = 'a'.repeat(32);
const PAYLOAD = { key: 'exports/u/j.csv', filename: 'a.csv', exp: 2_000 };

describe('SignedTokenHelper', () => {
  it('round-trips a valid token', () => {
    expect(SignedTokenHelper.verify(SignedTokenHelper.sign(PAYLOAD, SECRET), SECRET, 1_000)).toEqual(PAYLOAD);
  });

  it('rejects an expired token', () => {
    expect(SignedTokenHelper.verify(SignedTokenHelper.sign(PAYLOAD, SECRET), SECRET, 2_001)).toBeNull();
  });

  it('rejects a token signed with another secret', () => {
    expect(SignedTokenHelper.verify(SignedTokenHelper.sign(PAYLOAD, 'b'.repeat(32)), SECRET, 1_000)).toBeNull();
  });

  it('rejects a tampered payload', () => {
    const [, signature] = SignedTokenHelper.sign(PAYLOAD, SECRET).split('.');
    const forged = Buffer.from(JSON.stringify({ ...PAYLOAD, key: '../../etc/passwd' })).toString('base64url');
    expect(SignedTokenHelper.verify(`${forged}.${signature}`, SECRET, 1_000)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    expect(SignedTokenHelper.verify('', SECRET)).toBeNull();
    expect(SignedTokenHelper.verify('abc', SECRET)).toBeNull();
    expect(SignedTokenHelper.verify('a.b.c', SECRET)).toBeNull();
  });
});
