import { ConnectionString } from 'mongodb-connection-string-url';
import { CONNECTION_PASSWORD_MASK } from '@domain/constants/connection.constant';

export class UriMaskHelper {
  static mask(uri: string): string {
    const parsed = new ConnectionString(uri);
    if (parsed.password) parsed.password = CONNECTION_PASSWORD_MASK;
    parsed.search = '';
    return parsed.toString();
  }
}
