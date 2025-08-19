import { Logger } from '@nestjs/common';
import { Db, MongoClient } from 'mongodb';

export class MongoConnection {
  private readonly logger = new Logger(MongoConnection.name);
  private client!: MongoClient;
  private db!: Db;

  constructor(private databaseName: string) {}

  async connect(connection_string: string): Promise<any> {
    try {
      this.client = new MongoClient(connection_string);
      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      this.logger.log('Connected to MongoDB');
      return this.db;
    } catch (error) {
      this.logger.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      this.logger.log('Disconnected from MongoDB');
    } catch (error) {
      this.logger.error('Error disconnecting from MongoDB:', error);
    }
  }

  getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }
}
