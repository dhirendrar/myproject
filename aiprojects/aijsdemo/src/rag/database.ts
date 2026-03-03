import { Pool } from 'pg';

export class Database {
  private pool: Pool;

  constructor() {
    const password = process.env.DB_PASSWORD || 'mysecret';
    console.log(`[ENV] DB_PASSWORD value: [${password}]`);
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'ai_agent_db',
      user: process.env.DB_USER || 'postgres',
      password,
      connectionTimeoutMillis: 10000,
    };
    console.log(`[DB Config] Connecting to ${config.user}@${config.host}:${config.port}/${config.database}`);
    this.pool = new Pool(config);
  }

  private async retryWithBackoff(fn: () => Promise<any>, maxRetries: number = 5): Promise<any> {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.log(`Attempt ${i + 1} failed, retrying in ${1000 * (i + 1)}ms...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw lastError;
  }

  async initialize() {
    const client = await this.retryWithBackoff(() => this.pool.connect());
    try {
      // Enable pgvector extension
      await client.query('CREATE EXTENSION IF NOT EXISTS vector');

      // Create documents table with vector support
      await client.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          embedding vector(${process.env.EMBEDDING_DIMENSION || 384}),
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Create index for vector similarity search
      await client.query(`
        CREATE INDEX IF NOT EXISTS documents_embedding_idx 
        ON documents USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100)
      `);

      // Create sessions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(255) PRIMARY KEY,
          messages JSONB DEFAULT '[]',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `);

      console.log('Database initialized successfully');
    } finally {
      client.release();
    }
  }

  getPool(): Pool {
    return this.pool;
  }

  async close() {
    await this.pool.end();
  }
}
