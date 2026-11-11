import { Injectable } from '@nestjs/common';
import { BlockList, LookupFunction, isIP } from 'net';
import { promises as dns, LookupAddress, lookup as dnsLookup } from 'dns';
import { ConnectionString } from 'mongodb-connection-string-url';
import { EnvConfigService } from '@common/env/services/env-config.service';
import { MAX_URI_LENGTH } from '@domain/constants/query-validation.constant';
import { BLOCKED_IPV4_SUBNETS, BLOCKED_IPV6_SUBNETS, IPV4_MAPPED_PREFIX } from '@domain/constants/network-block.constant';

@Injectable()
export class UriGuardService {
  private readonly blocked = this.buildBlockList();

  constructor(private readonly envConfigService: EnvConfigService) {}

  private buildBlockList(): BlockList {
    const list = new BlockList();
    BLOCKED_IPV4_SUBNETS.forEach(([network, prefix]) => list.addSubnet(network, prefix, 'ipv4'));
    BLOCKED_IPV6_SUBNETS.forEach(([network, prefix]) => list.addSubnet(network, prefix, 'ipv6'));
    return list;
  }

  isBlockedAddress(address: string): boolean {
    const clean = address.replace(/^\[|\]$/g, '').split('%')[0];
    const version = isIP(clean);
    if (version === 0) return true;
    if (version === 6 && clean.toLowerCase().startsWith(IPV4_MAPPED_PREFIX)) return this.isBlockedAddress(clean.slice(IPV4_MAPPED_PREFIX.length));
    return this.blocked.check(clean, version === 4 ? 'ipv4' : 'ipv6');
  }

  parse(uri: string): ConnectionString {
    if (typeof uri !== 'string' || uri.length === 0 || uri.length > MAX_URI_LENGTH) throw new Error('Invalid MongoDB URI');
    let parsed: ConnectionString;
    try {
      parsed = new ConnectionString(uri);
    } catch {
      throw new Error('Only valid mongodb:// and mongodb+srv:// URIs are allowed');
    }
    if (!parsed.pathname || parsed.pathname === '/') throw new Error('The MongoDB URI must include a database name');
    return parsed;
  }

  async assertAllowed(uri: string): Promise<void> {
    const parsed = this.parse(uri);
    if (this.envConfigService.allowPrivateUris()) return;

    const hostnames = await this.resolveHostnames(parsed);
    for (const hostname of hostnames) await this.assertHostnameAllowed(hostname);
  }

  createLookup(): LookupFunction {
    return (hostname, options, callback) => {
      dnsLookup(hostname, { ...options, all: true }, (error, addresses) => {
        if (error) return callback(error, '', 0);
        const list = addresses;
        if (!this.envConfigService.allowPrivateUris() && !this.isAllowListed(hostname) && list.some(item => this.isBlockedAddress(item.address))) {
          return callback(Object.assign(new Error('The MongoDB host resolves to a blocked address'), { code: 'EBLOCKED' }), '', 0);
        }
        if (options.all) return callback(null, list, 0);
        return callback(null, list[0].address, list[0].family);
      });
    };
  }

  private async resolveHostnames(parsed: ConnectionString): Promise<string[]> {
    if (parsed.isSRV) {
      const srv_host = parsed.hosts[0];
      let records: { name: string }[];
      try {
        records = await dns.resolveSrv(`_mongodb._tcp.${srv_host}`);
      } catch {
        throw new Error('Could not resolve the MongoDB SRV record');
      }
      return records.map(record => record.name);
    }
    return parsed.hosts.map(host => this.stripPort(host));
  }

  private stripPort(host: string): string {
    if (host.startsWith('[')) return host.slice(1, host.indexOf(']'));
    return host.includes(':') && isIP(host) === 0 ? host.slice(0, host.lastIndexOf(':')) : host;
  }

  private isAllowListed(hostname: string): boolean {
    return this.envConfigService.getAllowedPrivateHosts().includes(hostname.replace(/^\[|\]$/g, '').toLowerCase());
  }

  private async assertHostnameAllowed(hostname: string): Promise<void> {
    if (this.isAllowListed(hostname)) return;
    if (isIP(hostname) !== 0) {
      if (this.isBlockedAddress(hostname)) throw new Error('The MongoDB host is not allowed');
      return;
    }
    let addresses: LookupAddress[];
    try {
      addresses = await dns.lookup(hostname, { all: true });
    } catch {
      throw new Error('Could not resolve the MongoDB host');
    }
    if (addresses.length === 0 || addresses.some(item => this.isBlockedAddress(item.address))) throw new Error('The MongoDB host is not allowed');
  }
}
