import express, { Request, Response } from 'express';
import { Agent } from '../agents/agent';
import { MemoryManager } from '../memory/manager';
import { RAGPipeline } from '../rag/pipeline';
import { VectorStore } from '../rag/vectorStore';
import { Message } from '../types';

export class ChatAPI {
  private app: express.Application;
  private agent: Agent;
  private memoryManager: MemoryManager;
  private ragPipeline: RAGPipeline;
  private vectorStore: VectorStore;

  constructor(
    agent: Agent,
    memoryManager: MemoryManager,
    ragPipeline: RAGPipeline,
    vectorStore: VectorStore
  ) {
    this.app = express();
    this.agent = agent;
    this.memoryManager = memoryManager;
    this.ragPipeline = ragPipeline;
    this.vectorStore = vectorStore;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', timestamp: new Date() });
    });

    // Create session
    this.app.post('/sessions', async (req: Request, res: Response) => {
      try {
        const sessionId = await this.memoryManager.createSession(req.body.metadata || {});
        res.json({ sessionId });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Chat endpoint
    this.app.post('/chat', async (req: Request, res: Response) => {
      try {
        const { message, sessionId, useRAG } = req.body;

        if (!message) {
          return res.status(400).json({ error: 'Message is required' });
        }

        let session = sessionId ? await this.memoryManager.getSession(sessionId) : null;
        let currentSessionId = sessionId;

        if (!session) {
          currentSessionId = await this.memoryManager.createSession();
        }

        await this.memoryManager.addMessage(currentSessionId, {
          role: 'user',
          content: message
        });

        const history = await this.memoryManager.getMessages(currentSessionId);
        
        let response: string;
        if (useRAG) {
          response = await this.ragPipeline.query(message);
        } else {
          response = await this.agent.run(message, history.slice(0, -1));
        }

        await this.memoryManager.addMessage(currentSessionId, {
          role: 'assistant',
          content: response
        });

        res.json({
          response,
          sessionId: currentSessionId
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // RAG query with sources
    this.app.post('/rag/query', async (req: Request, res: Response) => {
      try {
        const { question, topK } = req.body;
        const result = await this.ragPipeline.queryWithSources(question, topK || 3);
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Add documents to vector store
    this.app.post('/rag/documents', async (req: Request, res: Response) => {
      try {
        const { documents } = req.body;
        const ids = await this.vectorStore.addDocuments(documents);
        res.json({ ids, count: ids.length });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get session history
    this.app.get('/sessions/:sessionId', async (req: Request, res: Response) => {
      try {
        const session = await this.memoryManager.getSession(req.params.sessionId);
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }
        res.json(session);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Clear session
    this.app.delete('/sessions/:sessionId', async (req: Request, res: Response) => {
      try {
        await this.memoryManager.deleteSession(req.params.sessionId);
        res.json({ message: 'Session deleted' });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  start(port: number) {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }

  getApp() {
    return this.app;
  }
}
