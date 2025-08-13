import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { MongoEntity } from '@domain/entities/mongo.entity';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { DomainMongoMapper } from '@domain/mappers/mongo.mapper';
import { RedisService } from '@infrastructure/services/redis.service';

@Injectable()
export class MongoPersistence implements MongoRepository {
  constructor(private readonly redisService: RedisService) {}

  // Main methods
  async getInfo(uris: string[]): Promise<MongoEntity> {
    let mongo: { uris: string[]; collections: any[] } = {
      uris: uris,
      collections: [],
    };

    for (const uri of uris) {
      const temp_client = new MongoClient(uri);

      try {
        await temp_client.connect();

        const db = temp_client.db();
        const collections = await db.listCollections().toArray();

        for (const c of collections) {
          const collection = db.collection(c.name);

          const sample_docs = await collection.aggregate([{ $sample: { size: 10 } }]).toArray();
          const fields = new Set<string>();

          sample_docs.forEach(doc => {
            Object.keys(doc).forEach(key => fields.add(key));
          });

          mongo.collections.push({
            db_name: db.databaseName,
            collection_name: c.name,
            collection_fields: Array.from(fields),
          });
        }
      } catch (e: any) {
        throw new InternalServerErrorException(`Error fetching MongoDB info: ${e.message}`);
      } finally {
        await temp_client.close();
      }
    }

    return DomainMongoMapper.toDomain(mongo);
  }

  // Auxiliary methods
}
