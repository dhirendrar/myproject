export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface Session {
  id: string;
  messages: Message[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: any) => Promise<any>;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  toolCalls?: ToolCall[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface EmbeddingResult {
  embedding: number[];
  text: string;
}

export interface RAGDocument {
  id?: number;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface SearchResult {
  document: RAGDocument;
  similarity: number;
}

export interface WorkflowState {
  messages: Message[];
  context: Record<string, any>;
  nextStep?: string;
}

export interface AgentConfig {
  name: string;
  systemPrompt: string;
  tools: Tool[];
  llmConfig: LLMConfig;
}
