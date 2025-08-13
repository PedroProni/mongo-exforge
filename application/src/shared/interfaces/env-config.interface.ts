interface IEnvConfig {
  getMongoUri(): string;
  getAuthToken(): string;
  getProdDomain(): string;
  getLocalDomain(): string;
  getSourceMongoUri(): string;
  getRedisHost(): string;
  getRedisPort(): number;
}

export { IEnvConfig };
