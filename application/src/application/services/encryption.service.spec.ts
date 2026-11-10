import { EncryptionService } from '@application/services/encryption.service';
import { EnvConfigService } from '@common/env/services/env-config.service';

const KEY = 'a'.repeat(64);

function build(secret = KEY): EncryptionService {
  return new EncryptionService({ getEncryptionSecret: () => secret } as unknown as EnvConfigService);
}

describe('EncryptionService', () => {
  it('round-trips a value', () => {
    const service = build();
    expect(service.decrypt(service.encrypt('mongodb://user:pass@host/db'))).toBe('mongodb://user:pass@host/db');
  });

  it('uses a fresh iv for each encryption', () => {
    const service = build();
    expect(service.encrypt('same')).not.toBe(service.encrypt('same'));
  });

  it('prefixes the payload with the version', () => {
    expect(build().encrypt('x').startsWith('v2:')).toBe(true);
  });

  it('rejects a tampered ciphertext', () => {
    const service = build();
    const [version, iv, tag, data] = service.encrypt('secret').split(':');
    const flipped = (data[0] === '0' ? '1' : '0') + data.slice(1);
    expect(() => service.decrypt([version, iv, tag, flipped].join(':'))).toThrow();
  });

  it('rejects a payload encrypted with another key', () => {
    expect(() => build('b'.repeat(64)).decrypt(build().encrypt('secret'))).toThrow();
  });

  it('rejects the legacy cbc format', () => {
    expect(() => build().decrypt('00112233445566778899aabbccddeeff:abcdef')).toThrow('Unsupported encrypted payload');
  });

  it('rejects a key that is not 32 bytes', () => {
    expect(() => build('abcd')).toThrow('32 bytes');
  });
});
