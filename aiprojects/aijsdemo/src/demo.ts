import dotenv from 'dotenv';
import { Database } from './rag/database';
import { EmbeddingService } from './rag/embeddings';
import { VectorStore } from './rag/vectorStore';
import { RAGPipeline } from './rag/pipeline';
import { LLMFactory } from './llm/factory';
import { ToolRegistry } from './tools/registry';
import { Agent } from './agents/agent';
import { ResearchWorkflow } from './workflows/workflow';
import { LLMConfig, AgentConfig } from './types';

dotenv.config();

async function demonstrateSystem() {
  console.log('🎯 AI Agentic System Demo\n');

  // Initialize components
  const database = new Database();
  await database.initialize();
  const pool = database.getPool();

  const embeddingService = new EmbeddingService();
  await embeddingService.initialize();

  const vectorStore = new VectorStore(pool, embeddingService);

  const llmConfig: LLMConfig = {
    provider: (process.env.DEFAULT_LLM_PROVIDER as 'openai' | 'anthropic') || 'openai',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7
  };
  const llmProvider = LLMFactory.createProvider(llmConfig);

  const toolRegistry = new ToolRegistry();

  // Demo 1: Tool Calling
  console.log('📌 Demo 1: Tool Calling with Calculator\n');
  const agentConfig: AgentConfig = {
    name: 'MathAgent',
    systemPrompt: 'You are a helpful math assistant. Use the calculator tool when needed.',
    tools: toolRegistry.getAll(),
    llmConfig
  };
  const agent = new Agent(agentConfig, llmProvider, toolRegistry);

  const mathResult = await agent.run('What is 156 divided by 12, then multiply by 5?');
  console.log('Agent:', mathResult);
  console.log();

  // Demo 2: RAG Pipeline
  console.log('📌 Demo 2: RAG Pipeline\n');
  
  // Add sample documents
  await vectorStore.addDocuments([
    {
      content: 'TypeScript is a strongly typed superset of JavaScript that compiles to plain JavaScript.',
      metadata: { source: 'docs', topic: 'typescript' }
    },
    {
      content: 'Node.js is an open-source, cross-platform JavaScript runtime environment.',
      metadata: { source: 'docs', topic: 'nodejs' }
    },
    {
      content: 'PostgreSQL is a powerful, open source object-relational database system.',
      metadata: { source: 'docs', topic: 'database' }
    }
  ]);

  const ragPipeline = new RAGPipeline(vectorStore, llmProvider);
  const ragResult = await ragPipeline.queryWithSources('What is TypeScript?', 2);
  
  console.log('Answer:', ragResult.answer);
  console.log('\nSources:');
  ragResult.sources.forEach((s, i) => {
    console.log(`  ${i + 1}. [Similarity: ${s.similarity.toFixed(2)}] ${s.content.slice(0, 80)}...`);
  });
  console.log();

  // Demo 3: Multi-Agent Workflow
  console.log('📌 Demo 3: Multi-Agent Workflow\n');
  
  const researchAgentConfig: AgentConfig = {
    name: 'ResearchAgent',
    systemPrompt: 'You are a research assistant. Gather information using available tools.',
    tools: [toolRegistry.get('wikipedia_search')!],
    llmConfig
  };
  const researchAgent = new Agent(researchAgentConfig, llmProvider, toolRegistry);

  const summaryAgentConfig: AgentConfig = {
    name: 'SummaryAgent',
    systemPrompt: 'You are a summarization expert. Create concise summaries.',
    tools: [],
    llmConfig
  };
  const summaryAgent = new Agent(summaryAgentConfig, llmProvider, toolRegistry);

  const workflow = new ResearchWorkflow(researchAgent, summaryAgent);
  const workflowResult = await workflow.run('Research artificial intelligence');
  
  console.log('Workflow Result:', workflowResult);
  console.log();

  // Cleanup
  await database.close();
  console.log('✅ Demo completed successfully!');
}

// Run demo if executed directly
if (require.main === module) {
  demonstrateSystem().catch(console.error);
}

export { demonstrateSystem };
