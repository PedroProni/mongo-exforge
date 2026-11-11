import { ENCRYPTION_SECRET_PATTERN, MIN_JWT_SECRET_LENGTH, REQUIRED_ENV_KEYS, S3_REQUIRED_ENV_KEYS } from '@domain/constants/env.constant';
import { StorageDriver } from '@domain/enums/storage-driver.enum';

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const driver = typeof config.STORAGE_DRIVER === 'string' && config.STORAGE_DRIVER.trim() !== '' ? config.STORAGE_DRIVER.trim() : StorageDriver.S3;
  if (!Object.values<string>(StorageDriver).includes(driver)) throw new Error(`STORAGE_DRIVER must be one of: ${Object.values(StorageDriver).join(', ')}`);

  const required = driver === StorageDriver.S3 ? [...REQUIRED_ENV_KEYS, ...S3_REQUIRED_ENV_KEYS] : REQUIRED_ENV_KEYS;
  const missing = required.filter(key => typeof config[key] !== 'string' || config[key].trim() === '');
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);

  if ((config.JWT_SECRET as string).length < MIN_JWT_SECRET_LENGTH) throw new Error(`JWT_SECRET must have at least ${MIN_JWT_SECRET_LENGTH} characters`);
  if (!ENCRYPTION_SECRET_PATTERN.test(config.ENCRYPTION_SECRET as string)) throw new Error('ENCRYPTION_SECRET must be 64 hexadecimal characters (32 bytes)');

  return config;
}
