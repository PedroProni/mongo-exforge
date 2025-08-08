import { DocumentBuilder } from '@nestjs/swagger';

export function addSwaggerTags(config: DocumentBuilder): DocumentBuilder {
  return config.addTag('Job', 'Operations related to jobs').addTag('Health', 'Health check operations');
}
