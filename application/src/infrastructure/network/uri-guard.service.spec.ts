import { promises as dns } from 'dns';
import { UriGuardService } from '@infrastructure/network/uri-guard.service';
import { EnvConfigService } from '@common/env/services/env-config.service';

function build(allow_private: boolean): UriGuardService {
  return new UriGuardService({ allowPrivateUris: () => allow_private } as unknown as EnvConfigService);
}

describe('UriGuardService', () => {
  describe('isBlockedAddress', () => {
    const guard = build(false);

    it.each([
      '127.0.0.1',
      '127.255.255.254',
      '10.1.2.3',
      '172.16.0.1',
      '172.31.255.255',
      '192.168.1.1',
      '169.254.169.254',
      '0.0.0.0',
      '100.64.0.1',
      '::1',
      '::',
      'fc00::1',
      'fd12:3456::1',
      'fe80::1',
      '::ffff:127.0.0.1',
      '::ffff:169.254.169.254',
      '224.0.0.1',
      'not-an-ip',
    ])('blocks %s', address => {
      expect(guard.isBlockedAddress(address)).toBe(true);
    });

    it.each(['8.8.8.8', '1.1.1.1', '172.15.0.1', '172.32.0.1', '2606:4700:4700::1111', '::ffff:8.8.8.8'])('allows %s', address => {
      expect(guard.isBlockedAddress(address)).toBe(false);
    });
  });

  describe('parse', () => {
    const guard = build(false);

    it.each(['http://example.com/db', 'file:///etc/passwd', 'redis://host:6379/0', '', 'mongodb://', 'mongodb://host:27017', 'mongodb://host:27017/'])('rejects %p', uri => {
      expect(() => guard.parse(uri)).toThrow();
    });

    it('accepts mongodb and mongodb+srv with a database', () => {
      expect(() => guard.parse('mongodb://host:27017/db')).not.toThrow();
      expect(() => guard.parse('mongodb+srv://user:pass@cluster.example.com/db')).not.toThrow();
    });

    it('rejects a uri longer than the limit', () => {
      expect(() => guard.parse(`mongodb://host/${'a'.repeat(3000)}`)).toThrow();
    });
  });

  describe('assertAllowed with private addresses off', () => {
    const guard = build(false);

    afterEach(() => jest.restoreAllMocks());

    it.each([
      'mongodb://127.0.0.1:27017/db',
      'mongodb://localhost:27017/db',
      'mongodb://10.0.0.5/db',
      'mongodb://[::1]:27017/db',
      'mongodb://169.254.169.254/db',
      'mongodb://user:pw@192.168.0.10:27017,8.8.8.8:27017/db',
    ])('refuses %s', async uri => {
      await expect(guard.assertAllowed(uri)).rejects.toThrow();
    });

    it('refuses a hostname that resolves to a private address', async () => {
      jest.spyOn(dns, 'lookup').mockResolvedValue([{ address: '10.0.0.7', family: 4 }] as never);
      await expect(guard.assertAllowed('mongodb://internal.example.com/db')).rejects.toThrow('not allowed');
    });

    it('refuses a hostname with one public and one private record', async () => {
      jest.spyOn(dns, 'lookup').mockResolvedValue([
        { address: '8.8.8.8', family: 4 },
        { address: '127.0.0.1', family: 4 },
      ] as never);
      await expect(guard.assertAllowed('mongodb://mixed.example.com/db')).rejects.toThrow('not allowed');
    });

    it('refuses an SRV record whose target resolves to a private address', async () => {
      jest.spyOn(dns, 'resolveSrv').mockResolvedValue([{ name: 'shard0.internal.example.com', port: 27017, priority: 0, weight: 0 }]);
      jest.spyOn(dns, 'lookup').mockResolvedValue([{ address: '10.1.1.1', family: 4 }] as never);
      await expect(guard.assertAllowed('mongodb+srv://cluster.example.com/db')).rejects.toThrow('not allowed');
    });

    it('allows an SRV record whose targets are public', async () => {
      jest.spyOn(dns, 'resolveSrv').mockResolvedValue([{ name: 'shard0.example.com', port: 27017, priority: 0, weight: 0 }]);
      jest.spyOn(dns, 'lookup').mockResolvedValue([{ address: '8.8.4.4', family: 4 }] as never);
      await expect(guard.assertAllowed('mongodb+srv://cluster.example.com/db')).resolves.toBeUndefined();
    });

    it('allows a public hostname', async () => {
      jest.spyOn(dns, 'lookup').mockResolvedValue([{ address: '8.8.8.8', family: 4 }] as never);
      await expect(guard.assertAllowed('mongodb://db.example.com:27017/db')).resolves.toBeUndefined();
    });

    it('fails closed when the name does not resolve', async () => {
      jest.spyOn(dns, 'lookup').mockRejectedValue(new Error('ENOTFOUND'));
      await expect(guard.assertAllowed('mongodb://missing.example.com/db')).rejects.toThrow('Could not resolve');
    });
  });

  describe('assertAllowed with private addresses on', () => {
    it('allows loopback but still validates the uri shape', async () => {
      const guard = build(true);
      await expect(guard.assertAllowed('mongodb://127.0.0.1:27017/db')).resolves.toBeUndefined();
      await expect(guard.assertAllowed('http://127.0.0.1/db')).rejects.toThrow();
    });
  });

  describe('createLookup', () => {
    it('rejects at connect time when the name resolves to a blocked address (rebinding)', done => {
      const lookup = build(false).createLookup();
      lookup('localhost', { family: 4 }, error => {
        expect(error?.message).toContain('blocked address');
        done();
      });
    });

    it('lets private addresses through when allowed', done => {
      const lookup = build(true).createLookup();
      lookup('localhost', { family: 4 }, (error, address) => {
        expect(error).toBeNull();
        expect(address).toBe('127.0.0.1');
        done();
      });
    });
  });
});
