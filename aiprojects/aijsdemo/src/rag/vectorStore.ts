import { Pool } from 'pg';
import { EmbeddingService } from './embeddings';
import { RAGDocument, SearchResult } from '../types';

export class VectorStore {
  private pool: Pool;
  private embeddingService: EmbeddingService;

  constructor(pool: Pool, embeddingService: EmbeddingService) {
    this.pool = pool;
    this.embeddingService = embeddingService;
  }

  async addDocument(document: RAGDocument): Promise<number> {
    const embedding = await this.embeddingService.embed(document.content);
    
    const result = await this.pool.query(
      'INSERT INTO documents (content, metadata, embedding) VALUES ($1, $2, $3) RETURNING id',
      [document.content, JSON.stringify(document.metadata), JSON.stringify(embedding)]
    );
    
    return result.rows[0].id;
  }

  async addDocuments(documents: RAGDocument[]): Promise<number[]> {
    const ids: number[] = [];
    for (const doc of documents) {
      const id = await this.addDocument(doc);
      ids.push(id);
    }
    return ids;
  }

  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingService.embed(query);
    
    const result = await this.pool.query(
      `SELECT id, content, metadata, 
              1 - (embedding <=> $1::vector) as similarity
       FROM documents
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      [JSON.stringify(queryEmbedding), limit]
    );

    return result.rows.map(row => ({
      document: {
        id: row.id,
        content: row.content,
        metadata: row.metadata
      },
      similarity: row.similarity
    }));
  }

  async deleteDocument(id: number): Promise<void> {
    await this.pool.query('DELETE FROM documents WHERE id = $1', [id]);
  }

  async clear(): Promise<void> {
    await this.pool.query('TRUNCATE documents');
  }
}
