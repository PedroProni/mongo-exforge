import { Injectable } from '@nestjs/common';
import { Db, Document, Filter, MongoClient } from 'mongodb';
import { UriGuardService } from '@infrastructure/network/uri-guard.service';
import { CURSOR_BATCH_SIZE, CURSOR_MAX_TIME_MS } from '@domain/constants/export.constant';
import { MONGO_CONNECT_TIMEOUT_MS, MONGO_SERVER_SELECTION_TIMEOUT_MS } from '@domain/constants/network-block.constant';
import { COLLECTION_NAME_PATTERN, FIELD_PATH_PATTERN, INSPECT_SAMPLE_SIZE, MAX_INSPECT_COLLECTIONS, SYSTEM_COLLECTION_PREFIX } from '@domain/constants/query-validation.constant';
import { CollectionEntity } from '@domain/entities/collection.entity';
import { MongoRepository } from '@domain/repositories/mongo.repository';
import { PREVIEW_COUNT_CAP, PREVIEW_COUNT_MAX_TIME_MS, PREVIEW_MAX_TIME_MS } from '@domain/constants/preview.constant';
import { PreviewOptions } from '@domain/types/preview-options.type';
import { PreviewResult } from '@domain/types/preview-result.type';
import { ExportRow } from '@domain/types/export-row.type';
import { JobSort } from '@domain/types/job-sort.type';
import { QueryProps } from '@domain/types/query-props.type';
import { SourceStreamOptions } from '@domain/types/source-stream-options.type';
import { ExportRejectedError } from '@application/errors/export-rejected.error';
import { OPERATOR_KEYS } from '@domain/constants/operator-keys.constant';

@Injectable()
export class MongoSourceAdapter implements MongoRepository {
  constructor(private readonly uriGuard: UriGuardService) {}

  assertAllowed(uri: string): Promise<void> {
    return this.uriGuard.assertAllowed(uri);
  }

  async inspect(uri: string): Promise<CollectionEntity[]> {
    const client = await this.connect(uri);
    try {
      const db = client.db();
      const listed = await db.listCollections({}, { nameOnly: true }).toArray();
      const names = listed
        .map(item => item.name)
        .filter(name => !name.startsWith(SYSTEM_COLLECTION_PREFIX))
        .slice(0, MAX_INSPECT_COLLECTIONS);
      const result: CollectionEntity[] = [];
      for (const name of names) {
        const samples = await db
          .collection(name)
          .aggregate([{ $sample: { size: INSPECT_SAMPLE_SIZE } }], { maxTimeMS: CURSOR_MAX_TIME_MS })
          .toArray();
        const fields = new Set<string>();
        samples.forEach(doc => Object.keys(doc).forEach(key => fields.add(key)));
        result.push(new CollectionEntity({ db_name: db.databaseName, collection_name: name, collection_fields: Array.from(fields) }));
      }
      return result;
    } finally {
      await client.close();
    }
  }

  async *stream(options: SourceStreamOptions): AsyncGenerator<ExportRow> {
    for (const group of options.groups) {
      const client = await this.connect(group.uri);
      try {
        const db = client.db();
        await this.assertCollection(db, group.collection);
        const cursor = db.collection(group.collection).find(this.buildFilter(group.filters), {
          projection: this.buildProjection(options.fields),
          sort: this.buildSort(options.sort),
          batchSize: CURSOR_BATCH_SIZE,
          maxTimeMS: CURSOR_MAX_TIME_MS,
        });
        try {
          for await (const doc of cursor) yield doc;
        } finally {
          await cursor.close();
        }
      } finally {
        await client.close();
      }
    }
  }

  async preview(options: PreviewOptions): Promise<PreviewResult> {
    const rows: ExportRow[] = [];
    let total = 0;
    let known = true;
    let capped = false;
    for (const group of options.groups) {
      const client = await this.connect(group.uri);
      try {
        const db = client.db();
        await this.assertCollection(db, group.collection);
        const filter = this.buildFilter(group.filters);
        const collection = db.collection(group.collection);
        const remaining = options.limit - rows.length;
        if (remaining > 0) {
          rows.push(...(await collection.find(filter, { projection: this.buildProjection(options.fields), sort: this.buildSort(options.sort), limit: remaining, maxTimeMS: PREVIEW_MAX_TIME_MS }).toArray()));
        }
        try {
          const count = await collection.countDocuments(filter, { limit: PREVIEW_COUNT_CAP, maxTimeMS: PREVIEW_COUNT_MAX_TIME_MS });
          total += count;
          if (count >= PREVIEW_COUNT_CAP) capped = true;
        } catch {
          known = false;
        }
      } finally {
        await client.close();
      }
    }
    return { rows, estimated_total: known ? total : null, estimate_capped: known && capped };
  }

  private async connect(uri: string): Promise<MongoClient> {
    await this.uriGuard.assertAllowed(uri);
    const client = new MongoClient(uri, {
      appName: 'mongo-exforge',
      maxPoolSize: 1,
      serverSelectionTimeoutMS: MONGO_SERVER_SELECTION_TIMEOUT_MS,
      connectTimeoutMS: MONGO_CONNECT_TIMEOUT_MS,
      lookup: this.uriGuard.createLookup(),
    });
    await client.connect();
    return client;
  }

  private async assertCollection(db: Db, name: string): Promise<void> {
    if (!COLLECTION_NAME_PATTERN.test(name) || name.startsWith(SYSTEM_COLLECTION_PREFIX)) throw new ExportRejectedError(`Collection '${name}' is not allowed`);
    const exists = await db.listCollections({ name }, { nameOnly: true }).hasNext();
    if (!exists) throw new ExportRejectedError(`Collection '${name}' was not found`);
  }

  private assertField(field: string): void {
    if (!FIELD_PATH_PATTERN.test(field)) throw new ExportRejectedError(`Field '${field}' is not allowed`);
  }

  private buildFilter(filters: QueryProps[]): Filter<Document> {
    if (filters.length === 0) return {};
    const clauses = filters.map(filter => {
      this.assertField(filter.field);
      return { [filter.field]: { [OPERATOR_KEYS[filter.operator]]: filter.value } };
    });
    return { $and: clauses };
  }

  private buildProjection(fields: string[]): Document | undefined {
    if (fields.length === 0) return undefined;
    fields.forEach(field => this.assertField(field));
    const projection: Document = Object.fromEntries(fields.map(field => [field, 1]));
    if (!fields.includes('_id')) projection._id = 0;
    return projection;
  }

  private buildSort(sort: JobSort): JobSort {
    const keys = Object.keys(sort);
    keys.forEach(key => this.assertField(key));
    return keys.length ? sort : { _id: 1 };
  }
}
