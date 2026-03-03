import { pipeline, Pipeline } from '@xenova/transformers';
import { EmbeddingResult } from '../types';

export class EmbeddingService {
  private model: Pipeline | null = null;
  private modelName: string;

  constructor(modelName: string = 'Xenova/all-MiniLM-L6-v2') {
    this.modelName = modelName;
  }

  async initialize() {
    if (!this.model) {
      console.log('Loading embedding model...');
      this.model = (await pipeline('feature-extraction', this.modelName)) as unknown as Pipeline;
      console.log('Embedding model loaded');
    }
  }

  async embed(text: string): Promise<number[]> {
    await this.initialize();
    
    const output = await this.model!(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  }

  async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
    await this.initialize();
    
    const results: EmbeddingResult[] = [];
    for (const text of texts) {
      const embedding = await this.embed(text);
      results.push({ text, embedding });
    }
    return results;
  }
}
