import { DocumentBuilder } from '@nestjs/swagger';

export function addSwaggerTags(config: DocumentBuilder): DocumentBuilder {
  return config.addTag('Job', 'Operations related to jobs').addTag('Mongo', 'Operations related to MongoDB').addTag('User', 'Operations related to users').addTag('Health', 'Health check operations');
}
