import { DocumentBuilder } from '@nestjs/swagger';

export function addSwaggerTags(config: DocumentBuilder): DocumentBuilder {
  return config
    .addTag('Example', 'Here goes the description for the Example tag')
}
