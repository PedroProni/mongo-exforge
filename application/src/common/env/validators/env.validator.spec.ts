import { validateEnv } from '@common/env/validators/env.validator';

const BASE = { MONGODB_URI: 'mongodb://h/db', JWT_SECRET: 'j'.repeat(32), ENCRYPTION_SECRET: 'a'.repeat(64) };
const S3 = { S3_ENDPOINT: 'http://s3', S3_BUCKET: 'b', S3_ACCESS_KEY_ID: 'k', S3_SECRET_ACCESS_KEY: 's' };

describe('validateEnv', () => {
  it('requires the s3 variables by default', () => {
    expect(() => validateEnv(BASE)).toThrow('S3_ENDPOINT');
    expect(validateEnv({ ...BASE, ...S3 })).toBeDefined();
  });

  it('does not require s3 variables with the local driver', () => {
    expect(validateEnv({ ...BASE, STORAGE_DRIVER: 'local' })).toBeDefined();
  });

  it('rejects an unknown driver', () => {
    expect(() => validateEnv({ ...BASE, ...S3, STORAGE_DRIVER: 'ftp' })).toThrow('STORAGE_DRIVER');
  });
});
