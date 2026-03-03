-- AI Agentic System Database Setup
-- Run this script to manually setup the database

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table with vector support
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(384),  -- Change dimension based on your embedding model
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create sessions table for conversation history
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  messages JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on sessions for faster lookups
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at);

-- Sample data for testing (optional)
-- INSERT INTO documents (content, metadata) VALUES
-- ('TypeScript is a strongly typed programming language.', '{"topic": "programming"}'),
-- ('Node.js is a JavaScript runtime built on V8.', '{"topic": "runtime"}');

-- Verify setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as document_count FROM documents;
SELECT COUNT(*) as session_count FROM sessions;
