# System Architecture

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                  (HTTP/REST API Clients)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     API Layer (Express)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  /chat   │  │   /rag   │  │/sessions │  │ /health  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Agent Orchestration                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Agent (Tool Calling)                     │  │
│  │  • Message Processing                                 │  │
│  │  • Tool Selection & Execution                         │  │
│  │  • Response Generation                                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────┬──────────────────┬──────────────────┬────────────────┘
      │                  │                  │
      ▼                  ▼                  ▼
┌──────────┐      ┌──────────┐      ┌──────────────┐
│   LLM    │      │  Tools   │      │   Memory     │
│ Provider │      │ Registry │      │  Manager     │
└──────────┘      └──────────┘      └──────────────┘
      │                  │                  │
      ▼                  ▼                  ▼
┌──────────┐      ┌──────────┐      ┌──────────────┐
│ OpenAI/  │      │Calculator│      │  PostgreSQL  │
│Anthropic │      │Wikipedia │      │  (Sessions)  │
└──────────┘      │FileReader│      └──────────────┘
                  │Calendar  │
                  │WebScraper│
                  └──────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   RAG Pipeline  │
              │  ┌───────────┐  │
              │  │ Embedding │  │
              │  │  Service  │  │
              │  └───────────┘  │
              │  ┌───────────┐  │
              │  │  Vector   │  │
              │  │   Store   │  │
              │  └───────────┘  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │   PostgreSQL    │
              │   + pgvector    │
              └─────────────────┘
```

## 🔧 Component Details

### 1. API Layer (`src/api/server.ts`)

**Responsibilities:**
- HTTP request handling
- Request validation
- Response formatting
- Error handling
- CORS management

**Endpoints:**
- `GET /health` - Health check
- `POST /sessions` - Create conversation session
- `POST /chat` - Main chat interface
- `POST /rag/query` - RAG-powered queries
- `POST /rag/documents` - Add documents to knowledge base
- `GET /sessions/:id` - Retrieve session history
- `DELETE /sessions/:id` - Delete session

### 2. Agent Layer (`src/agents/agent.ts`)

**Responsibilities:**
- Orchestrate LLM interactions
- Manage tool calling workflow
- Handle multi-turn conversations
- Context management

**Flow:**
```
User Input → System Prompt + History → LLM
                                        ↓
                                   Tool Calls?
                                   ↙        ↘
                              Yes            No
                               ↓              ↓
                        Execute Tools    Return Response
                               ↓
                        Add Results to Context
                               ↓
                        Loop (max 10 iterations)
```

### 3. LLM Provider Layer (`src/llm/`)

**Architecture:**
```
LLMProvider (Abstract Base Class)
├── chat(messages, tools): Promise<LLMResponse>
├── streamChat(messages, tools): AsyncGenerator<string>
│
├── OpenAIProvider
│   └── Uses OpenAI SDK
│
└── AnthropicProvider
    └── Uses Anthropic SDK
```

**Factory Pattern:**
```typescript
LLMFactory.createProvider(config) → LLMProvider instance
```

**Benefits:**
- Easy to add new providers
- Consistent interface
- Runtime provider switching
- No code changes needed to switch LLMs

### 4. Tool System (`src/tools/`)

**Tool Interface:**
```typescript
interface Tool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (params: any) => Promise<any>;
}
```

**Tool Registry:**
- Centralized tool management
- Dynamic tool registration
- Secure parameter validation
- Error handling

**Available Tools:**
1. **Calculator** - Arithmetic operations
2. **File Reader** - Sandboxed file access
3. **Wikipedia Search** - Knowledge retrieval
4. **Web Scraper** - URL content extraction
5. **Calendar** - Mock event lookup

**Adding New Tools:**
```typescript
const myTool: Tool = {
  name: 'my_tool',
  description: '...',
  parameters: { /* JSON Schema */ },
  execute: async (params) => { /* implementation */ }
};

toolRegistry.register(myTool);
```

### 5. RAG Pipeline (`src/rag/`)

**Components:**

**a) Embedding Service (`embeddings.ts`)**
- Uses HuggingFace Transformers
- Local inference (no API calls)
- Model: `Xenova/all-MiniLM-L6-v2` (384 dimensions)
- Caching for performance

**b) Vector Store (`vectorStore.ts`)**
- PostgreSQL + pgvector
- Cosine similarity search
- CRUD operations on documents
- Metadata support

**c) RAG Pipeline (`pipeline.ts`)**
```
Query → Embed → Vector Search → Top-K Docs → Context
                                                  ↓
                                            LLM Generate
                                                  ↓
                                              Response
```

**Search Algorithm:**
```sql
SELECT content, metadata, 
       1 - (embedding <=> query_embedding) as similarity
FROM documents
ORDER BY embedding <=> query_embedding
LIMIT k
```

### 6. Memory Management (`src/memory/manager.ts`)

**Features:**
- Session-based conversation history
- Automatic message trimming (default: 50 messages)
- Metadata support
- PostgreSQL persistence

**Session Lifecycle:**
```
Create Session → Add Messages → Retrieve History → Delete Session
     ↓               ↓               ↓
  UUID Gen      JSON Storage    Query by ID
```

**Token Efficiency:**
- Old messages automatically pruned
- Configurable history window
- Prevents context overflow

### 7. Workflow System (`src/workflows/workflow.ts`)

**Graph-Based Execution:**
```typescript
Workflow
├── addNode(name, function)
├── addEdge(from, to)
├── setEntryPoint(name)
└── execute(initialState)
```

**Example: Research Workflow**
```
Entry → Research Agent → Summary Agent → Output
         (Wikipedia)      (Summarize)
```

**State Management:**
```typescript
interface WorkflowState {
  messages: Message[];
  context: Record<string, any>;
  nextStep?: string;
}
```

## 🔐 Security Features

### 1. Path Traversal Protection
```typescript
// File reader validates paths
if (!fullPath.startsWith(ALLOWED_BASE_PATH)) {
  throw new Error('Access denied');
}
```

### 2. SQL Injection Prevention
```typescript
// Parameterized queries
pool.query('SELECT * FROM sessions WHERE id = $1', [sessionId]);
```

### 3. Tool Parameter Validation
- JSON Schema validation
- Type checking
- Required field enforcement

### 4. Environment Isolation
- API keys in environment variables
- No hardcoded credentials
- Separate dev/prod configs

## 📊 Data Flow Examples

### Example 1: Simple Chat
```
User: "What is 25 * 4?"
  ↓
API: POST /chat
  ↓
Agent: Process message
  ↓
LLM: Detect calculator tool needed
  ↓
Tool: calculator.execute({operation: 'multiply', a: 25, b: 4})
  ↓
Result: {result: 100}
  ↓
LLM: Generate natural language response
  ↓
Response: "25 * 4 = 100"
```

### Example 2: RAG Query
```
User: "What is TypeScript?"
  ↓
API: POST /rag/query
  ↓
Embedding: Convert query to vector
  ↓
Vector Store: Search similar documents
  ↓
Results: Top 3 documents with similarity scores
  ↓
LLM: Generate answer using retrieved context
  ↓
Response: Answer + Sources
```

### Example 3: Multi-Agent Workflow
```
User: "Research AI and summarize"
  ↓
Workflow: Start at entry node
  ↓
Research Agent: Use Wikipedia tool
  ↓
State: Store research results
  ↓
Summary Agent: Summarize findings
  ↓
State: Store summary
  ↓
Response: Final summary
```

## 🎯 Design Patterns Used

1. **Factory Pattern** - LLM provider creation
2. **Strategy Pattern** - Interchangeable LLM providers
3. **Registry Pattern** - Tool management
4. **Observer Pattern** - Streaming responses
5. **State Pattern** - Workflow state management
6. **Singleton Pattern** - Database connection pool

## 🚀 Performance Optimizations

1. **Connection Pooling** - PostgreSQL connection reuse
2. **Embedding Caching** - Model loaded once
3. **Vector Indexing** - IVFFlat index for fast search
4. **Message Trimming** - Prevent context overflow
5. **Batch Operations** - Multiple document inserts

## 📈 Scalability Considerations

**Current Architecture:**
- Single server instance
- Shared database connection pool
- In-memory model caching

**Future Enhancements:**
- Load balancing (multiple API servers)
- Redis for session caching
- Separate embedding service
- Message queue for async processing
- Horizontal scaling with Kubernetes

## 🔄 Extension Points

1. **New LLM Provider**: Extend `LLMProvider` class
2. **New Tool**: Implement `Tool` interface
3. **New Workflow**: Compose nodes with `Workflow` class
4. **Custom Embedding**: Replace `EmbeddingService`
5. **Alternative Storage**: Implement vector store interface

## 📚 Technology Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Web Framework**: Express 4.18+
- **Database**: PostgreSQL 14+ with pgvector
- **LLM SDKs**: OpenAI 4.20+, Anthropic 0.9+
- **Embeddings**: @xenova/transformers 2.10+
- **HTTP Client**: Axios 1.6+
- **Web Scraping**: Cheerio 1.0+

## 🎓 Best Practices Implemented

1. **Type Safety** - Full TypeScript coverage
2. **Error Handling** - Try-catch with meaningful messages
3. **Logging** - Console logging for debugging
4. **Environment Config** - .env for secrets
5. **Code Organization** - Modular structure
6. **API Design** - RESTful conventions
7. **Documentation** - Inline comments and README
8. **Security** - Input validation and sanitization
