import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SWAGGER_API_CURRENT_VERSION, SWAGGER_API_DESCRIPTION, SWAGGER_API_NAME, SWAGGER_API_ROOT, SWAGGER_BEARER_NAME } from '@infrastructure/documentation/config/swagger-constants.config';
import { addSwaggerTags } from '@infrastructure/documentation/config/swagger-tags.config';

export function setupSwagger(app: INestApplication): void {
  const builder = new DocumentBuilder().setTitle(SWAGGER_API_NAME).setDescription(SWAGGER_API_DESCRIPTION).setVersion(SWAGGER_API_CURRENT_VERSION).addBearerAuth(undefined, SWAGGER_BEARER_NAME);
  const document = SwaggerModule.createDocument(app, addSwaggerTags(builder).build());
  SwaggerModule.setup(SWAGGER_API_ROOT, app, document);
}
