interface IEnvConfig {
  getMongoUri(): string;
  getAuthToken(): string;
  getJwtSecret(): string;
  getEncryptionSecret(): string;
  getProdDomain(): string;
  getLocalDomain(): string;
  getSourceMongoUri(): string;
  getRedisHost(): string;
  getRedisPort(): number;
  getUsername(): string;
  getPassword(): string;
}

export { IEnvConfig };
