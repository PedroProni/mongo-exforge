import { ENCRYPTION_SECRET_PATTERN, MIN_JWT_SECRET_LENGTH, REQUIRED_ENV_KEYS } from '@domain/constants/env.constant';

export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const missing = REQUIRED_ENV_KEYS.filter(key => typeof config[key] !== 'string' || config[key].trim() === '');
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);

  if ((config.JWT_SECRET as string).length < MIN_JWT_SECRET_LENGTH) throw new Error(`JWT_SECRET must have at least ${MIN_JWT_SECRET_LENGTH} characters`);
  if (!ENCRYPTION_SECRET_PATTERN.test(config.ENCRYPTION_SECRET as string)) throw new Error('ENCRYPTION_SECRET must be 64 hexadecimal characters (32 bytes)');

  return config;
}
