import dotenv from 'dotenv';
import { Database } from './rag/database';
import { EmbeddingService } from './rag/embeddings';
import { VectorStore } from './rag/vectorStore';
import { RAGPipeline } from './rag/pipeline';
import { LLMFactory } from './llm/factory';
import { ToolRegistry } from './tools/registry';
import { Agent } from './agents/agent';
import { MemoryManager } from './memory/manager';
import { ChatAPI } from './api/server';
import { LLMConfig } from './types';

dotenv.config();

async function main() {
  console.log('🚀 Starting AI Agentic System...');

  // Initialize database
  const database = new Database();
  await database.initialize();
  const pool = database.getPool();

  // Initialize embeddings
  const embeddingService = new EmbeddingService(
    process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2'
  );
  await embeddingService.initialize();

  // Initialize vector store
  const vectorStore = new VectorStore(pool, embeddingService);

  // Initialize LLM provider
  const llmConfig: LLMConfig = {
    provider: (process.env.DEFAULT_LLM_PROVIDER as 'openai' | 'anthropic') || 'openai',
    model: process.env.DEFAULT_LLM_PROVIDER === 'anthropic' 
      ? 'claude-3-sonnet-20240229' 
      : 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000
  };
  const llmProvider = LLMFactory.createProvider(llmConfig);

  // Initialize RAG pipeline
  const ragPipeline = new RAGPipeline(vectorStore, llmProvider);

  // Initialize tool registry
  const toolRegistry = new ToolRegistry();

  // Initialize agent
  const agent = new Agent(
    {
      name: 'MainAgent',
      systemPrompt: 'You are a helpful AI assistant with access to various tools. Use them when needed to answer user questions accurately.',
      tools: toolRegistry.getAll(),
      llmConfig
    },
    llmProvider,
    toolRegistry
  );

  // Initialize memory manager
  const memoryManager = new MemoryManager(pool, 50);

  // Initialize and start API server
  const chatAPI = new ChatAPI(agent, memoryManager, ragPipeline, vectorStore);
  const port = parseInt(process.env.PORT || '3000');
  chatAPI.start(port);

  console.log('✅ System initialized successfully');
  console.log(`📡 API server running on http://localhost:${port}`);
  console.log(`🤖 LLM Provider: ${llmConfig.provider}`);
  console.log(`🧠 Embedding Model: ${process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2'}`);

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await database.close();
    process.exit(0);
  });
}

main().catch(console.error);
