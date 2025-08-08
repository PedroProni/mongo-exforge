interface IEnvConfig {
  getMongoUri(): string;
  getAuthToken(): string;
  getProdDomain(): string;
  getLocalDomain(): string;
  getSourceMongoUri(): string;
}

export { IEnvConfig };
