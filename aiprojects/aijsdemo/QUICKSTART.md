# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup PostgreSQL

**Option A: Using Docker (Easiest)**
```bash
docker run --name ai-postgres -e POSTGRES_PASSWORD=mysecret -e POSTGRES_DB=ai_agent_db -p 5432:5432 -d pgvector/pgvector:pg16
```

**Option B: Local PostgreSQL**
1. Install PostgreSQL 14+
2. Install pgvector extension
3. Create database: `CREATE DATABASE ai_agent_db;`

### Step 3: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` - Add your API key:
```env
OPENAI_API_KEY=sk-your-key-here
DEFAULT_LLM_PROVIDER=openai
DB_PASSWORD=mysecret
```

### Step 4: Run the Application
```bash
npm run dev
```

Server starts at `http://localhost:3000`

## 🧪 Test It Out

### Using cURL

**1. Create a session:**
```bash
curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"metadata": {"user": "test"}}'
```

Save the `sessionId` from response.

**2. Chat with calculator:**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is 25 * 4?",
    "sessionId": "YOUR_SESSION_ID"
  }'
```

**3. Add knowledge to RAG:**
```bash
curl -X POST http://localhost:3000/rag/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "The capital of France is Paris.",
        "metadata": {"topic": "geography"}
      }
    ]
  }'
```

**4. Query RAG:**
```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the capital of France?",
    "topK": 3
  }'
```

### Using Postman

1. Import `postman_collection.json`
2. Run "Create Session" request
3. Try other requests (sessionId auto-saved)

## 🎯 Example Use Cases

### Use Case 1: Math Assistant
```json
POST /chat
{
  "message": "Calculate (156 / 12) + 50",
  "sessionId": "..."
}
```

### Use Case 2: Knowledge Retrieval
```json
POST /chat
{
  "message": "Search Wikipedia for Quantum Computing",
  "sessionId": "..."
}
```

### Use Case 3: RAG-Powered Q&A
```json
// First, add documents
POST /rag/documents
{
  "documents": [
    {"content": "Company policy: Remote work allowed 3 days/week", "metadata": {}}
  ]
}

// Then query
POST /rag/query
{
  "question": "What is the remote work policy?",
  "topK": 3
}
```

## 🔄 Switch LLM Providers

**To use Anthropic Claude:**
```env
ANTHROPIC_API_KEY=sk-ant-your-key
DEFAULT_LLM_PROVIDER=anthropic
```

Restart the server. No code changes needed!

## 📊 Monitor Token Usage

Check the console output - token usage is logged for each request:
```
Tokens used: 150 prompt + 45 completion = 195 total
```

## 🛠️ Troubleshooting

**"Connection refused" error:**
- Check PostgreSQL is running: `psql -U postgres -d ai_agent_db`

**"API key not found" error:**
- Verify `.env` file exists and has correct API key

**Slow first request:**
- Embedding model downloads on first use (~90MB)
- Subsequent requests are fast

## 📚 Next Steps

- Read full [README.md](README.md) for architecture details
- Explore [src/tools/](src/tools/) to add custom tools
- Check [src/workflows/](src/workflows/) for multi-agent examples
- Review [src/llm/](src/llm/) to add new LLM providers

## 💡 Pro Tips

1. **Session Management**: Always use sessions for multi-turn conversations
2. **RAG Performance**: Add more documents for better retrieval quality
3. **Tool Calling**: LLM automatically decides when to use tools
4. **Context Window**: System auto-trims old messages (configurable)
5. **Security**: File reader is sandboxed to `FS_BASE_PATH`

Happy coding! 🎉
