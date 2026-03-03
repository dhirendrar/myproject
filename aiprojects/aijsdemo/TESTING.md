# Testing & Examples Guide

## 🧪 Testing the System

### Prerequisites
- Server running on `http://localhost:3000`
- PostgreSQL database initialized
- API keys configured in `.env`

## 📝 Test Scenarios

### Scenario 1: Basic Calculator Operations

**Test 1.1: Simple Addition**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is 25 + 75?"
  }'
```

**Expected Response:**
```json
{
  "response": "25 + 75 = 100",
  "sessionId": "uuid-here"
}
```

**Test 1.2: Complex Calculation**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Calculate (100 / 4) * 3, then subtract 25"
  }'
```

### Scenario 2: Wikipedia Knowledge Retrieval

**Test 2.1: Search Wikipedia**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Search Wikipedia for Quantum Computing and tell me what it is"
  }'
```

**Test 2.2: Multiple Searches**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Compare Python and JavaScript programming languages using Wikipedia"
  }'
```

### Scenario 3: Calendar Operations

**Test 3.1: Check Specific Date**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What events do I have on 2024-03-15?"
  }'
```

**Test 3.2: Upcoming Events**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my upcoming calendar events"
  }'
```

### Scenario 4: RAG Pipeline

**Test 4.1: Add Knowledge Base**
```bash
curl -X POST http://localhost:3000/rag/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "content": "Our company policy allows remote work 3 days per week. Employees must be in office on Tuesdays and Thursdays.",
        "metadata": {"category": "policy", "department": "HR"}
      },
      {
        "content": "The annual performance review process begins in January and concludes in March. All employees receive feedback from their direct manager.",
        "metadata": {"category": "policy", "department": "HR"}
      },
      {
        "content": "Health insurance benefits include medical, dental, and vision coverage. Enrollment period is in November.",
        "metadata": {"category": "benefits", "department": "HR"}
      },
      {
        "content": "Our tech stack includes TypeScript, Node.js, PostgreSQL, and React. We follow agile methodology with 2-week sprints.",
        "metadata": {"category": "engineering", "department": "Tech"}
      }
    ]
  }'
```

**Test 4.2: Query Knowledge Base**
```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the remote work policy?",
    "topK": 3
  }'
```

**Test 4.3: Query with Sources**
```bash
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "When is the performance review?",
    "topK": 2
  }'
```

### Scenario 5: Session Management

**Test 5.1: Create Session**
```bash
SESSION_ID=$(curl -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{"metadata": {"user": "test_user"}}' \
  | jq -r '.sessionId')

echo "Session ID: $SESSION_ID"
```

**Test 5.2: Multi-Turn Conversation**
```bash
# First message
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"My name is Alice\",
    \"sessionId\": \"$SESSION_ID\"
  }"

# Second message (should remember name)
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"What is my name?\",
    \"sessionId\": \"$SESSION_ID\"
  }"
```

**Test 5.3: Get Session History**
```bash
curl -X GET http://localhost:3000/sessions/$SESSION_ID
```

**Test 5.4: Delete Session**
```bash
curl -X DELETE http://localhost:3000/sessions/$SESSION_ID
```

### Scenario 6: Multi-Tool Workflow

**Test 6.1: Research and Calculate**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Search Wikipedia for the population of Tokyo, then calculate what 10% of that population would be"
  }'
```

**Test 6.2: Calendar and Calculation**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How many events do I have on 2024-03-15? Multiply that number by 30."
  }'
```

### Scenario 7: Web Scraping

**Test 7.1: Scrape Website**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Scrape the content from https://example.com and summarize it"
  }'
```

### Scenario 8: RAG-Enhanced Chat

**Test 8.1: Chat with RAG**
```bash
# First add documents (from Test 4.1)
# Then query using chat endpoint with RAG enabled
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What benefits does the company offer?",
    "useRAG": true
  }'
```

## 🎯 Advanced Test Cases

### Test Case A: Token Efficiency

**Objective:** Verify message trimming works

```bash
# Create session
SESSION_ID=$(curl -s -X POST http://localhost:3000/sessions \
  -H "Content-Type: application/json" \
  -d '{}' | jq -r '.sessionId')

# Send 60 messages (exceeds default limit of 50)
for i in {1..60}; do
  curl -s -X POST http://localhost:3000/chat \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Message $i\", \"sessionId\": \"$SESSION_ID\"}" \
    > /dev/null
done

# Check session - should only have last 50 messages
curl -X GET http://localhost:3000/sessions/$SESSION_ID | jq '.messages | length'
```

**Expected:** Returns 50 (or configured limit)

### Test Case B: Error Handling

**Test B.1: Invalid Tool Parameters**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Divide 100 by 0"
  }'
```

**Expected:** Graceful error message about division by zero

**Test B.2: Missing Required Fields**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:** 400 error with "Message is required"

**Test B.3: Invalid Session ID**
```bash
curl -X GET http://localhost:3000/sessions/invalid-uuid
```

**Expected:** 404 error with "Session not found"

### Test Case C: Concurrent Requests

**Objective:** Test system under load

```bash
# Install Apache Bench
# sudo apt install apache2-utils

# Create test payload
cat > payload.json << EOF
{
  "message": "What is 2 + 2?"
}
EOF

# Run 100 requests with 10 concurrent
ab -n 100 -c 10 -p payload.json -T application/json \
  http://localhost:3000/chat
```

### Test Case D: Vector Search Accuracy

**Objective:** Verify semantic search works correctly

```bash
# Add documents with clear semantic differences
curl -X POST http://localhost:3000/rag/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {"content": "Dogs are loyal pets that bark and wag their tails.", "metadata": {}},
      {"content": "Cats are independent pets that meow and purr.", "metadata": {}},
      {"content": "Python is a programming language used for data science.", "metadata": {}},
      {"content": "JavaScript is a programming language used for web development.", "metadata": {}}
    ]
  }'

# Query about dogs - should return dog document first
curl -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Tell me about canine companions",
    "topK": 2
  }' | jq '.sources[0].content'
```

**Expected:** First result should be about dogs

## 📊 Performance Benchmarks

### Benchmark 1: Response Time

```bash
# Measure average response time
for i in {1..10}; do
  time curl -s -X POST http://localhost:3000/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "What is 5 + 5?"}' > /dev/null
done
```

**Target:** < 2 seconds per request

### Benchmark 2: RAG Query Performance

```bash
# Add 1000 documents
# Then measure search time
time curl -s -X POST http://localhost:3000/rag/query \
  -H "Content-Type: application/json" \
  -d '{"question": "test query", "topK": 5}' > /dev/null
```

**Target:** < 500ms for vector search

### Benchmark 3: Embedding Generation

```bash
# Measure embedding time for various text lengths
echo "Short text" | time curl -s -X POST http://localhost:3000/rag/documents \
  -H "Content-Type: application/json" \
  -d @- > /dev/null
```

## 🐛 Debugging Tips

### Enable Verbose Logging

```typescript
// Add to src/index.ts
process.env.DEBUG = '*';
```

### Check Database Connections

```bash
# Count active connections
psql -U postgres -d ai_agent_db -c "SELECT count(*) FROM pg_stat_activity;"

# View current queries
psql -U postgres -d ai_agent_db -c "SELECT query FROM pg_stat_activity WHERE state = 'active';"
```

### Monitor Memory Usage

```bash
# Node.js memory
node --expose-gc dist/index.js

# System memory
watch -n 1 free -h
```

### Test Individual Components

```typescript
// Test embedding service
import { EmbeddingService } from './rag/embeddings';
const service = new EmbeddingService();
await service.initialize();
const embedding = await service.embed('test');
console.log(embedding.length); // Should be 384
```

## ✅ Validation Checklist

- [ ] Health endpoint returns 200
- [ ] Calculator tool works correctly
- [ ] Wikipedia search returns results
- [ ] Calendar lookup returns mock events
- [ ] RAG documents can be added
- [ ] RAG queries return relevant results
- [ ] Sessions persist across requests
- [ ] Multi-turn conversations maintain context
- [ ] Error handling works gracefully
- [ ] Token limits are enforced
- [ ] Vector search returns similar documents
- [ ] LLM provider switching works
- [ ] Tool calling executes correctly
- [ ] Response times are acceptable

## 🎓 Example Workflows

### Workflow 1: Customer Support Bot

```bash
# Add company knowledge
curl -X POST http://localhost:3000/rag/documents \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {"content": "Our support hours are Monday-Friday 9am-5pm EST.", "metadata": {}},
      {"content": "To reset your password, click Forgot Password on the login page.", "metadata": {}},
      {"content": "Shipping takes 3-5 business days for standard delivery.", "metadata": {}}
    ]
  }'

# Customer query
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How long does shipping take?",
    "useRAG": true
  }'
```

### Workflow 2: Research Assistant

```bash
# Research and summarize
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Research artificial intelligence on Wikipedia and give me a brief summary"
  }'
```

### Workflow 3: Data Analysis Helper

```bash
# Calculate and explain
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "If I have 1000 users and 15% convert, how many conversions is that? Then calculate the revenue if each conversion is worth $50."
  }'
```

## 📈 Monitoring Queries

```sql
-- Check document count
SELECT COUNT(*) FROM documents;

-- View recent sessions
SELECT id, created_at, jsonb_array_length(messages) as message_count 
FROM sessions 
ORDER BY created_at DESC 
LIMIT 10;

-- Check vector index size
SELECT pg_size_pretty(pg_relation_size('documents_embedding_idx'));

-- Most similar documents
SELECT content, embedding <=> '[0.1, 0.2, ...]'::vector as distance 
FROM documents 
ORDER BY distance 
LIMIT 5;
```

## 🎉 Success Criteria

Your system is working correctly if:

1. ✅ All API endpoints return expected responses
2. ✅ Tools execute without errors
3. ✅ RAG retrieves relevant documents
4. ✅ Sessions maintain conversation context
5. ✅ Response times are under 3 seconds
6. ✅ No memory leaks after extended use
7. ✅ Database queries are optimized
8. ✅ Error messages are helpful

## 📞 Getting Help

If tests fail:
1. Check server logs: `npm run dev` output
2. Verify database: `psql -U postgres -d ai_agent_db`
3. Test API keys: Check `.env` file
4. Review error messages in responses
5. Check PostgreSQL logs: `/var/log/postgresql/`

Happy testing! 🚀
