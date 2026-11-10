import { DocumentBuilder } from '@nestjs/swagger';

export function addSwaggerTags(config: DocumentBuilder): DocumentBuilder {
  return config.addTag('Job', 'Export jobs and downloads').addTag('Mongo', 'Source inspection').addTag('User', 'Accounts and authentication').addTag('Health', 'Health check operations');
}
