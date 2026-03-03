# 🎉 Getting Started - Your Complete Guide

Welcome to your AI Agentic System! This guide will help you get up and running quickly.

## 📚 Documentation Overview

Your project includes comprehensive documentation:

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **QUICKSTART.md** | Get running in 5 minutes | Start here! |
| **README.md** | Complete reference guide | For detailed info |
| **ARCHITECTURE.md** | System design & data flow | Understanding internals |
| **DEPLOYMENT.md** | Production deployment | Going to production |
| **TESTING.md** | Test scenarios & validation | Testing your system |
| **PROJECT_SUMMARY.md** | High-level overview | Quick reference |
| **FEATURES_CHECKLIST.md** | Requirements verification | Checking completeness |

## 🚀 Three Ways to Get Started

### Option 1: Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup PostgreSQL with Docker
docker run --name ai-postgres \
  -e POSTGRES_PASSWORD=mysecret \
  -e POSTGRES_DB=ai_agent_db \
  -p 5432:5432 -d pgvector/pgvector:pg16

# 3. Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 4. Run
npm run dev
```

**Read**: QUICKSTART.md for details

### Option 2: Windows Setup Script

```cmd
# Run the automated setup script
setup.bat
```

This will:
- Check Node.js installation
- Install dependencies
- Create .env file
- Build TypeScript
- Guide you through database setup

### Option 3: Manual Setup

Follow the detailed instructions in README.md

## 🎯 First Steps After Setup

### 1. Test the Health Endpoint

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-03-15T10:00:00.000Z"
}
```

### 2. Try the Calculator Tool

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 25 * 4?"}'
```

### 3. Import Postman Collection

1. Open Postman
2. Import `postman_collection.json`
3. Set `baseUrl` variable to `http://localhost:3000`
4. Run "Create Session" request
5. Try other requests

### 4. Add Knowledge to RAG

```bash
curl -X POST http://localhost:3000/rag/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "Your knowledge here",
        "metadata": {"source": "manual"}
      }
    ]
  }'
```

### 5. Query Your Knowledge Base

```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Your question here",
    "topK": 3
  }'
```

## 🛠️ Common Tasks

### Switch LLM Provider

Edit `.env`:
```env
DEFAULT_LLM_PROVIDER=anthropic  # or openai
ANTHROPIC_API_KEY=sk-ant-your-key
```

Restart server: `npm run dev`

### Add a New Tool

1. Create `src/tools/myTool.ts`:
```typescript
import { Tool } from '../types';

export const myTool: Tool = {
  name: 'my_tool',
  description: 'What it does',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Param description' }
    },
    required: ['param1']
  },
  execute: async (params) => {
    // Your logic here
    return { result: 'success' };
  }
};
```

2. Register in `src/tools/registry.ts`:
```typescript
import { myTool } from './myTool';
// In registerDefaultTools():
this.register(myTool);
```

3. Restart server

### Create a Custom Workflow

```typescript
import { Workflow } from './workflows/workflow';

const workflow = new Workflow();

workflow.addNode('step1', async (state) => {
  // Process state
  return state;
});

workflow.addNode('step2', async (state) => {
  // Process state
  return state;
});

workflow.addEdge('step1', 'step2');
workflow.setEntryPoint('step1');

const result = await workflow.execute(initialState);
```

### View Database Contents

```bash
# Connect to database
psql -U postgres -d ai_agent_db

# View documents
SELECT id, content, metadata FROM documents LIMIT 5;

# View sessions
SELECT id, created_at, jsonb_array_length(messages) as msg_count FROM sessions;

# Exit
\q
```

## 🎓 Learning Path

### Day 1: Basics
1. Read QUICKSTART.md
2. Setup and run the server
3. Test with Postman
4. Try all 5 tools

### Day 2: RAG System
1. Add documents to vector store
2. Query with RAG
3. Understand embeddings
4. Explore similarity search

### Day 3: Architecture
1. Read ARCHITECTURE.md
2. Understand data flow
3. Explore code structure
4. Review design patterns

### Day 4: Customization
1. Add a custom tool
2. Create a workflow
3. Modify agent behavior
4. Experiment with prompts

### Day 5: Production
1. Read DEPLOYMENT.md
2. Setup Docker deployment
3. Configure monitoring
4. Plan scaling strategy

## 🔍 Troubleshooting Guide

### Problem: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Or for local installation
psql -U postgres -d ai_agent_db

# Verify .env settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_agent_db
```

### Problem: "API key not found"

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Verify API key is set
cat .env | grep API_KEY

# Make sure no extra spaces
OPENAI_API_KEY=sk-your-key-here
```

### Problem: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build
```

### Problem: "Port already in use"

**Solution:**
```bash
# Change port in .env
PORT=3001

# Or kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -ti:3000 | xargs kill
```

### Problem: "Embedding model download slow"

**Solution:**
- First run downloads ~90MB model
- Subsequent runs use cached model
- Model cached in `~/.cache/huggingface/`
- Be patient on first run (2-5 minutes)

## 📊 System Requirements

### Minimum
- Node.js 18+
- PostgreSQL 14+
- 2GB RAM
- 5GB disk space

### Recommended
- Node.js 20+
- PostgreSQL 15+
- 4GB RAM
- 10GB disk space
- SSD storage

## 🎯 Quick Reference

### Environment Variables
```env
# Required
OPENAI_API_KEY=sk-...          # Or ANTHROPIC_API_KEY
DEFAULT_LLM_PROVIDER=openai    # or anthropic
DB_PASSWORD=your_password

# Optional
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ai_agent_db
DB_USER=postgres
EMBEDDING_MODEL=Xenova/all-MiniLM-L6-v2
EMBEDDING_DIMENSION=384
FS_BASE_PATH=/path/to/files
```

### NPM Scripts
```bash
npm run dev      # Development mode with ts-node
npm run build    # Compile TypeScript
npm start        # Run compiled code
npm run demo     # Run demo script
```

### API Endpoints
```
GET    /health              # Health check
POST   /sessions            # Create session
POST   /chat                # Chat with agent
POST   /rag/query           # RAG query
POST   /rag/documents       # Add documents
GET    /sessions/:id        # Get session
DELETE /sessions/:id        # Delete session
```

### Tools Available
1. **calculator** - Math operations
2. **file_reader** - Read files
3. **wikipedia_search** - Search Wikipedia
4. **web_scraper** - Scrape websites
5. **calendar_lookup** - Check calendar

## 🎉 Success Checklist

After setup, verify:
- [ ] Server starts without errors
- [ ] Health endpoint returns 200
- [ ] Can create a session
- [ ] Chat endpoint responds
- [ ] Calculator tool works
- [ ] Can add documents to RAG
- [ ] RAG queries return results
- [ ] Postman collection works

## 📞 Getting Help

1. **Check logs**: Look at console output from `npm run dev`
2. **Review docs**: All `.md` files have detailed info
3. **Test database**: `psql -U postgres -d ai_agent_db`
4. **Verify config**: Check `.env` file settings
5. **Read errors**: Error messages are descriptive

## 🚀 Next Steps

Once everything is working:

1. **Explore Examples**: Try all test scenarios in TESTING.md
2. **Customize**: Add your own tools and workflows
3. **Integrate**: Connect to your application
4. **Scale**: Follow DEPLOYMENT.md for production
5. **Monitor**: Setup logging and monitoring

## 💡 Pro Tips

1. **Use Sessions**: Always use sessions for conversations
2. **RAG Quality**: More documents = better results
3. **Token Management**: Monitor token usage in responses
4. **Error Handling**: Check error messages for debugging
5. **Performance**: First request is slower (model loading)
6. **Security**: Never commit .env file
7. **Testing**: Use Postman for quick testing
8. **Documentation**: Keep docs updated as you customize

## 🎓 Resources

- **OpenAI Docs**: https://platform.openai.com/docs
- **Anthropic Docs**: https://docs.anthropic.com
- **pgvector**: https://github.com/pgvector/pgvector
- **HuggingFace**: https://huggingface.co/docs/transformers
- **Express**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/

## 🎊 You're Ready!

You now have a complete, production-ready AI agentic system with:
- ✅ Multi-LLM support
- ✅ Tool calling framework
- ✅ RAG pipeline
- ✅ Session management
- ✅ Multi-agent workflows
- ✅ RESTful API
- ✅ Comprehensive documentation

**Happy building! 🚀**

---

**Questions?** Review the documentation or check the troubleshooting section above.

**Want to contribute?** The codebase is modular and easy to extend!

**Going to production?** Read DEPLOYMENT.md for best practices.
