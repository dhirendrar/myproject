import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Session, Message } from '../types';

export class MemoryManager {
  private pool: Pool;
  private maxMessagesPerSession: number;

  constructor(pool: Pool, maxMessagesPerSession: number = 50) {
    this.pool = pool;
    this.maxMessagesPerSession = maxMessagesPerSession;
  }

  async createSession(metadata: Record<string, any> = {}): Promise<string> {
    const sessionId = uuidv4();
    await this.pool.query(
      'INSERT INTO sessions (id, messages, metadata) VALUES ($1, $2, $3)',
      [sessionId, JSON.stringify([]), JSON.stringify(metadata)]
    );
    return sessionId;
  }

  async getSession(sessionId: string): Promise<Session | null> {
    const result = await this.pool.query(
      'SELECT * FROM sessions WHERE id = $1',
      [sessionId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      messages: row.messages,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async addMessage(sessionId: string, message: Message): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) throw new Error('Session not found');

    const messages = [...session.messages, { ...message, timestamp: new Date() }];
    
    // Trim old messages if exceeding limit
    const trimmedMessages = messages.slice(-this.maxMessagesPerSession);

    await this.pool.query(
      'UPDATE sessions SET messages = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(trimmedMessages), sessionId]
    );
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }

  async clearSession(sessionId: string): Promise<void> {
    await this.pool.query(
      'UPDATE sessions SET messages = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify([]), sessionId]
    );
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
  }

  async getSummary(sessionId: string): Promise<string> {
    const messages = await this.getMessages(sessionId);
    const messageCount = messages.length;
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;

    return `Session ${sessionId}: ${messageCount} total messages (${userMessages} user, ${assistantMessages} assistant)`;
  }
}
