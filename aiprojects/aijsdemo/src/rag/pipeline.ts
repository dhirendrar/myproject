import { VectorStore } from './vectorStore';
import { LLMProvider } from '../llm/base';
import { Message } from '../types';

export class RAGPipeline {
  private vectorStore: VectorStore;
  private llmProvider: LLMProvider;

  constructor(vectorStore: VectorStore, llmProvider: LLMProvider) {
    this.vectorStore = vectorStore;
    this.llmProvider = llmProvider;
  }

  async query(question: string, topK: number = 3): Promise<string> {
    // Retrieve relevant documents
    const results = await this.vectorStore.search(question, topK);
    
    if (results.length === 0) {
      return "No relevant information found in the knowledge base.";
    }

    // Build context from retrieved documents
    const context = results
      .map((r, i) => `[${i + 1}] ${r.document.content}`)
      .join('\n\n');

    // Generate response using LLM with context
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Answer the question based on the provided context. If the context does not contain relevant information, say so.'
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${question}`
      }
    ];

    const response = await this.llmProvider.chat(messages);
    return response.content;
  }

  async queryWithSources(question: string, topK: number = 3) {
    const results = await this.vectorStore.search(question, topK);
    const answer = await this.query(question, topK);

    return {
      answer,
      sources: results.map(r => ({
        content: r.document.content,
        similarity: r.similarity,
        metadata: r.document.metadata
      }))
    };
  }
}
