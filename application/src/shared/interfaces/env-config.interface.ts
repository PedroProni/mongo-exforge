interface IEnvConfig {
  getMongoUri(): string;
  getAuthToken(): string;
  getProdDomain(): string;
  getLocalDomain(): string;
}

export { IEnvConfig };
