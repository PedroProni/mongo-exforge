import { UriMaskHelper } from '@common/helpers/functions/uri-mask.helper';

describe('UriMaskHelper', () => {
  it('masks the password and drops the query string', () => {
    const masked = UriMaskHelper.mask('mongodb://demo:s3cr3t@db.example.com:27017/app?authSource=admin&tls=true');
    expect(masked).toContain('demo:***@');
    expect(masked).not.toContain('s3cr3t');
    expect(masked).not.toContain('authSource');
  });

  it('keeps a uri without credentials readable', () => {
    expect(UriMaskHelper.mask('mongodb://db.example.com:27017/app')).toContain('db.example.com:27017/app');
  });
});
