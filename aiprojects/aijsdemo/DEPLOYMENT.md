# Deployment Guide

## 🚀 Production Deployment

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 14+ with pgvector
- 2GB+ RAM (for embedding model)
- SSL certificates (for HTTPS)

## Deployment Options

### Option 1: Traditional Server (VPS/EC2)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install pgvector
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

#### 2. Database Setup

```bash
# Create database user
sudo -u postgres createuser aiagent

# Create database
sudo -u postgres createdb ai_agent_db -O aiagent

# Set password
sudo -u postgres psql -c "ALTER USER aiagent PASSWORD 'secure_password';"

# Enable pgvector
sudo -u postgres psql -d ai_agent_db -c "CREATE EXTENSION vector;"
```

#### 3. Application Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd aijsdemo

# Install dependencies
npm ci --production

# Build TypeScript
npm run build

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Run database migrations
psql -U aiagent -d ai_agent_db -f config/database_setup.sql
```

#### 4. Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name ai-agent

# Setup auto-restart
pm2 startup
pm2 save

# Monitor
pm2 monit
```

#### 5. Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/ai-agent
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ai-agent /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: ai_agent_db
      POSTGRES_USER: aiagent
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/database_setup.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aiagent"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=ai_agent_db
      - DB_USER=aiagent
      - DB_PASSWORD=${DB_PASSWORD}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DEFAULT_LLM_PROVIDER=${DEFAULT_LLM_PROVIDER}
      - PORT=3000
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

#### Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Option 3: AWS Deployment

#### Architecture

```
Internet → ALB → ECS Fargate → RDS PostgreSQL
                                    ↓
                              pgvector extension
```

#### Steps

1. **Create RDS PostgreSQL Instance**
   - Engine: PostgreSQL 14+
   - Instance: db.t3.medium or larger
   - Enable pgvector (via parameter group)

2. **Build Docker Image**
   ```bash
   docker build -t ai-agent:latest .
   docker tag ai-agent:latest <ecr-repo-url>:latest
   docker push <ecr-repo-url>:latest
   ```

3. **Create ECS Task Definition**
   - Container: Your Docker image
   - Memory: 2GB minimum
   - Environment variables from Secrets Manager

4. **Setup Application Load Balancer**
   - Target: ECS service
   - Health check: `/health`

5. **Configure Auto Scaling**
   - Min: 2 tasks
   - Max: 10 tasks
   - Metric: CPU > 70%

### Option 4: Kubernetes (K8s)

#### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-agent
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ai-agent
  template:
    metadata:
      labels:
        app: ai-agent
    spec:
      containers:
      - name: ai-agent
        image: your-registry/ai-agent:latest
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          value: postgres-service
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-agent-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: ai-agent-service
spec:
  selector:
    app: ai-agent
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 🔒 Security Checklist

- [ ] Use HTTPS/TLS in production
- [ ] Store API keys in secrets manager
- [ ] Enable database SSL connections
- [ ] Implement rate limiting
- [ ] Add authentication/authorization
- [ ] Enable CORS with specific origins
- [ ] Use environment-specific configs
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities
- [ ] Implement request logging

## 📊 Monitoring & Logging

### Application Monitoring

```typescript
// Add to src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

### Database Monitoring

```sql
-- Monitor query performance
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Check vector index usage
SELECT * FROM pg_stat_user_indexes 
WHERE indexrelname = 'documents_embedding_idx';
```

### Logging

```bash
# PM2 logs
pm2 logs ai-agent

# Docker logs
docker-compose logs -f app

# System logs
journalctl -u ai-agent -f
```

## 🔧 Performance Tuning

### PostgreSQL Configuration

```ini
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
max_connections = 100
work_mem = 16MB
```

### Node.js Optimization

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js
```

### Embedding Model Caching

```typescript
// Pre-load model on startup
await embeddingService.initialize();
```

## 📈 Scaling Strategies

### Horizontal Scaling

1. **Stateless API servers** - Multiple instances behind load balancer
2. **Shared database** - Single PostgreSQL instance
3. **Session affinity** - Not required (sessions in DB)

### Vertical Scaling

1. **Increase server resources** - More CPU/RAM
2. **Upgrade database** - Larger RDS instance
3. **Optimize queries** - Add indexes

### Caching Layer

```typescript
// Add Redis for session caching
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        run: |
          scp -r dist/* user@server:/app/
          ssh user@server 'pm2 restart ai-agent'
```

## 🆘 Troubleshooting

**High memory usage:**
- Reduce `maxMessagesPerSession`
- Use smaller embedding model
- Implement message pagination

**Slow vector search:**
- Increase `lists` parameter in IVFFlat index
- Add more RAM to database
- Reduce `topK` in queries

**API timeouts:**
- Increase LLM timeout settings
- Implement request queuing
- Add caching layer

## 📞 Support

For production issues:
1. Check logs: `pm2 logs` or `docker logs`
2. Verify database connection: `psql -U aiagent -d ai_agent_db`
3. Test API: `curl http://localhost:3000/health`
4. Review environment variables

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database initialized and backed up
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and alerting setup
- [ ] Log aggregation configured
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated
