import { Injectable } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MongoEntity } from '@domain/entities/mongo.entity';
import { MongoRepository } from '@domain/repositories/mongo.repository';
// import { MongoConnection } from '@infrastructure/integrations/mongo-integration';

@Injectable()
export class MongoPersistence implements MongoRepository {
  constructor() // private readonly mongoConnection: MongoConnection,
  {}

  // Main methods
  async getInfo(uris: string[]): Promise<MongoEntity | void> {
    // let mongo = {
    //   uris: uris,
    //   collections: []
    // }

    for (const uri of uris) {
      const temp_client = new MongoClient(uri);
      console.log(temp_client);
    }
  }

  // Auxiliary methods
}
