# AI Agentic System - Multi-LLM with RAG & Tool Calling

A production-ready TypeScript/Node.js AI agentic system with multi-LLM support, RAG capabilities, tool calling framework, and graph-based workflows.

## 🎯 Features

- **Multi-LLM Support**: Seamlessly switch between OpenAI and Anthropic (Claude)
- **RAG Pipeline**: PostgreSQL + pgvector for semantic search
- **Local Embeddings**: HuggingFace Transformers (no API calls)
- **Tool Calling Framework**: Extensible tool system with secure invocation
- **Session Management**: Persistent conversation history
- **Multi-Agent Workflows**: LangGraph-inspired workflow orchestration
- **RESTful API**: Express-based endpoints for chat and RAG
- **Token Efficient**: Context management and message trimming

## 📦 Tools Included

1. **Calculator** - Basic arithmetic operations
2. **File Reader** - Secure file system access
3. **Wikipedia Search** - Knowledge retrieval
4. **Web Scraper** - Extract content from URLs
5. **Calendar Lookup** - Mock calendar events

## 🏗️ Project Structure

```
aijsdemo/
├── src/
│   ├── agents/          # Agent implementations
│   ├── api/             # Express API server
│   ├── llm/             # LLM provider abstractions
│   ├── memory/          # Session and memory management
│   ├── rag/             # RAG pipeline components
│   ├── tools/           # Tool implementations
│   ├── types/           # TypeScript type definitions
│   ├── workflows/       # Multi-agent workflows
│   └── index.ts         # Application entry point
├── config/              # Configuration files
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ with pgvector extension
- OpenAI API key OR Anthropic API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL with pgvector

**Install PostgreSQL:**
- Windows: Download from https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

**Install pgvector extension:**

```bash
# Clone pgvector
git clone https://github.com/pgvector/pgvector.git
cd pgvector

# Build and install
make
make install  # May require sudo
```

**Create database:**

```sql
CREATE DATABASE ai_agent_db;
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Choose your LLM provider
OPENAI_API_KEY=sk-...
# OR
ANTHROPIC_API_KEY=sk-ant-...

DEFAULT_LLM_PROVIDER=openai  # or anthropic

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_agent_db
DB_USER=postgres
DB_PASSWORD=your_password

# Server
PORT=3000
```

### 4. Build and Run

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-03-15T10:00:00.000Z"
}
```

### 2. Create Session
```http
POST /sessions
Content-Type: application/json

{
  "metadata": {
    "user": "john_doe"
  }
}
```

**Response:**
```json
{
  "sessionId": "uuid-here"
}
```

### 3. Chat (with Tool Calling)
```http
POST /chat
Content-Type: application/json

{
  "message": "What is 25 * 4?",
  "sessionId": "uuid-here",
  "useRAG": false
}
```

**Response:**
```json
{
  "response": "25 * 4 = 100",
  "sessionId": "uuid-here"
}
```

### 4. RAG Query with Sources
```http
POST /rag/query
Content-Type: application/json

{
  "question": "What is machine learning?",
  "topK": 3
}
```

**Response:**
```json
{
  "answer": "Machine learning is...",
  "sources": [
    {
      "content": "Document content...",
      "similarity": 0.89,
      "metadata": {}
    }
  ]
}
```

### 5. Add Documents to Vector Store
```http
POST /rag/documents
Content-Type: application/json

{
  "documents": [
    {
      "content": "Machine learning is a subset of AI...",
      "metadata": {
        "source": "textbook",
        "chapter": 1
      }
    }
  ]
}
```

**Response:**
```json
{
  "ids": [1, 2, 3],
  "count": 3
}
```

### 6. Get Session History
```http
GET /sessions/:sessionId
```

**Response:**
```json
{
  "id": "uuid-here",
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-03-15T10:00:00.000Z"
    }
  ],
  "metadata": {},
  "createdAt": "2024-03-15T10:00:00.000Z",
  "updatedAt": "2024-03-15T10:05:00.000Z"
}
```

### 7. Delete Session
```http
DELETE /sessions/:sessionId
```

**Response:**
```json
{
  "message": "Session deleted"
}
```

## 🧪 Postman Collection

### Import into Postman

1. Create new collection: "AI Agentic API"
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:3000`

### Example Requests

**1. Health Check**
- Method: GET
- URL: `{{baseUrl}}/health`

**2. Create Session**
- Method: POST
- URL: `{{baseUrl}}/sessions`
- Body (JSON):
```json
{
  "metadata": {
    "user": "test_user"
  }
}
```

**3. Chat with Calculator Tool**
- Method: POST
- URL: `{{baseUrl}}/chat`
- Body (JSON):
```json
{
  "message": "Calculate 156 divided by 12",
  "sessionId": "{{sessionId}}"
}
```

**4. Chat with Wikipedia Tool**
- Method: POST
- URL: `{{baseUrl}}/chat`
- Body (JSON):
```json
{
  "message": "Search Wikipedia for Albert Einstein",
  "sessionId": "{{sessionId}}"
}
```

**5. Add Knowledge to RAG**
- Method: POST
- URL: `{{baseUrl}}/rag/documents`
- Body (JSON):
```json
{
  "documents": [
    {
      "content": "TypeScript is a strongly typed programming language that builds on JavaScript.",
      "metadata": {"topic": "programming"}
    },
    {
      "content": "Node.js is a JavaScript runtime built on Chrome's V8 engine.",
      "metadata": {"topic": "runtime"}
    }
  ]
}
```

**6. Query RAG**
- Method: POST
- URL: `{{baseUrl}}/rag/query`
- Body (JSON):
```json
{
  "question": "What is TypeScript?",
  "topK": 3
}
```

## 🔧 Configuration

### Switch LLM Provider

Edit `.env`:
```env
DEFAULT_LLM_PROVIDER=anthropic  # or openai
```

### Adjust Embedding Model

Edit `.env`:
```env
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384
```

Available models:
- `Xenova/all-MiniLM-L6-v2` (384 dim) - Fast, lightweight
- `Xenova/all-mpnet-base-v2` (768 dim) - Better quality

### Configure File Reader Base Path

Edit `.env`:
```env
FS_BASE_PATH=/path/to/allowed/directory
```

## 🧠 Architecture

### LLM Abstraction Layer
```
LLMProvider (abstract)
├── OpenAIProvider
└── AnthropicProvider
```

### RAG Pipeline
```
User Query → Embedding → Vector Search → Context Retrieval → LLM Generation
```

### Tool Execution Flow
```
User Message → LLM → Tool Call Detection → Tool Execution → Result → LLM → Response
```

### Multi-Agent Workflow
```
Entry Node → Agent 1 → Agent 2 → ... → Final Output
```

## 🛡️ Security Features

- Path traversal protection in file reader
- Secure tool parameter validation
- Environment variable isolation
- SQL injection prevention (parameterized queries)
- CORS configuration

## 📊 Token Management

- Automatic message history trimming (default: 50 messages)
- Context window optimization
- Token usage tracking in responses

## 🔌 Extending the System

### Add a New Tool

Create `src/tools/myTool.ts`:

```typescript
import { Tool } from '../types';

export const myTool: Tool = {
  name: 'my_tool',
  description: 'Description of what the tool does',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' }
    },
    required: ['param1']
  },
  execute: async (params) => {
    // Implementation
    return { result: 'success' };
  }
};
```

Register in `src/tools/registry.ts`:
```typescript
import { myTool } from './myTool';
// In registerDefaultTools():
this.register(myTool);
```

### Add a New LLM Provider

1. Create `src/llm/newProvider.ts` extending `LLMProvider`
2. Implement `chat()` and `streamChat()` methods
3. Add to `LLMFactory` in `src/llm/factory.ts`

## 🐛 Troubleshooting

**pgvector extension not found:**
```bash
# Ensure pgvector is installed
psql -d ai_agent_db -c "CREATE EXTENSION vector;"
```

**Port already in use:**
```bash
# Change PORT in .env
PORT=3001
```

**Embedding model download slow:**
- Models are cached in `~/.cache/huggingface/`
- First run downloads model (~90MB for MiniLM)

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

---

**Built with ❤️ using TypeScript, Node.js, PostgreSQL, and AI**
