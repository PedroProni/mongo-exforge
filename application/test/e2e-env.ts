const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/exforge_e2e',
  REDIS_HOST: '127.0.0.1',
  REDIS_PORT: '6379',
  JWT_SECRET: 'e2e-jwt-secret-with-more-than-thirty-two-chars',
  ENCRYPTION_SECRET: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  S3_ENDPOINT: 'http://127.0.0.1:9000',
  S3_REGION: 'auto',
  S3_BUCKET: 'exforge-e2e',
  S3_ACCESS_KEY_ID: 'minioadmin',
  S3_SECRET_ACCESS_KEY: 'minioadmin',
  S3_FORCE_PATH_STYLE: 'true',
  S3_AUTO_CREATE_BUCKET: 'true',
  EXFORGE_ALLOW_PRIVATE_URIS: 'true',
  BASIC_AUTH_USERNAME: '',
  BASIC_AUTH_PASSWORD: '',
};

for (const [key, value] of Object.entries(defaults)) {
  if (process.env[key] === undefined) process.env[key] = value;
}
