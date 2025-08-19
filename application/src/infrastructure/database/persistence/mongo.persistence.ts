import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongoClient } from 'mongodb';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { Mongo, MongoDocument } from '@infrastructure/database/schemas/mongo.schema';
import { InjectModel } from '@nestjs/mongoose';
import { RedisService } from '@infrastructure/services/redis.service';
import { IConnectionInfo } from '@shared/interfaces/example.interface';
import { MongoEntity } from '@domain/entities/mongo.entity';
import { DomainMongoMapper } from '@domain/mappers/mongo.mapper';

@Injectable()
export class MongoPersistence implements MongoRepository {
  constructor(
    @InjectModel(Mongo.name) private readonly mongoModel: Model<MongoDocument>,
    private readonly redisService: RedisService,
  ) {}

  // Main methods
  async create(user_id: string, uri: string, encrypted_uri: string): Promise<MongoEntity> {
    const temp_client = new MongoClient(uri);

    let mongo: { user_id: string; uri: string; collections: any[] } = {
      user_id: user_id,
      uri: encrypted_uri,
      collections: [],
    };

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

      await this.mongoModel.create(mongo);
      return DomainMongoMapper.toDomain(mongo);
    } catch (e: any) {
      throw new InternalServerErrorException(`Error fetching MongoDB info: ${e.message}`);
    } finally {
      await temp_client.close();
    }
  }

  async getInfo(uris: string[], user_id: string): Promise<IConnectionInfo> {
    const info: IConnectionInfo = {
      user_id: user_id,
      join_fields: [],
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

          info.collections.push({
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
    if (uris.length > 1) info.join_fields = info.collections.map(c => c.collection_fields.filter((f: any) => f !== '_id')).reduce((acc, fields) => acc.filter((f: any) => fields.includes(f)));

    await this.redisService.set(`mongo_info_${user_id}`, info, 24 * 60 * 60 * 1000);
    return info;
  }

  // Auxiliary methods
}
