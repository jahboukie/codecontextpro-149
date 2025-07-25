import { Pool, Client } from 'pg';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Neon PostgreSQL configuration
const DB_CONFIG = {
  connectionString: 'postgresql://neondb_owner:npg_IDjRgbGe87mP@ep-jolly-sun-ae0n4gej-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
};

// Core interfaces for memory system
export interface ProjectMemory {
  id: string;
  name: string;
  rootPath: string;
  createdAt: Date;
  lastActive: Date;
  conversations: Conversation[];
  decisions: ArchitecturalDecision[];
  patterns: CodePattern[];
  preferences: UserPreferences;
  fileHistory: FileChangeHistory[];
}

export interface Conversation {
  id: string;
  timestamp: Date;
  aiAssistant: string;
  context: ConversationContext;
  messages: Message[];
  outcomes: ConversationOutcome[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface ArchitecturalDecision {
  id: string;
  timestamp: Date;
  decision: string;
  rationale: string;
  alternatives: string[];
  impact: string[];
  filesAffected: string[];
}

export interface FileChangeHistory {
  id: string;
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  timestamp: Date;
  conversationId?: string;
}

export interface CodePattern {
  id: string;
  pattern: string;
  frequency: number;
  context: string;
}

export interface UserPreferences {
  codingStyle?: string;
  preferredPatterns?: string[];
  aiAssistantPreferences?: Record<string, any>;
}

export interface ConversationContext {
  activeFile?: string;
  selectedText?: string;
  cursorPosition?: { line: number; column: number };
  openFiles?: string[];
}

export interface ConversationOutcome {
  type: 'success' | 'failure' | 'incomplete';
  description: string;
  filesModified: string[];
}

export class PostgreSQLMemoryEngine {
  private pool: Pool | null = null;
  private projectPath: string;
  private projectId: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.projectId = this.generateProjectId();
  }

  async initialize(): Promise<void> {
    try {
      this.pool = new Pool(DB_CONFIG);
      
      // Test connection
      const client = await this.pool.connect();
      client.release();
      
      console.log('✅ Connected to PostgreSQL database');
      
      // Create tables if they don't exist
      await this.createTables();
      
      // Initialize project
      await this.initializeProject();
      
    } catch (error) {
      console.error('❌ Failed to connect to Neon PostgreSQL:', error);
      console.log('💡 Check your Neon database connection string');
      console.log('💡 Verify your Neon project is active and accessible');
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createTablesSQL = `
      -- Projects table
      CREATE TABLE IF NOT EXISTS projects (
        id VARCHAR(32) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        root_path TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Conversations table
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,
        project_id VARCHAR(32) REFERENCES projects(id),
        ai_assistant VARCHAR(100) NOT NULL,
        context JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Messages table
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) REFERENCES conversations(id),
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Architectural decisions table
      CREATE TABLE IF NOT EXISTS architectural_decisions (
        id VARCHAR(36) PRIMARY KEY,
        project_id VARCHAR(32) REFERENCES projects(id),
        decision TEXT NOT NULL,
        rationale TEXT NOT NULL,
        alternatives JSONB DEFAULT '[]',
        impact JSONB DEFAULT '[]',
        files_affected JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- File changes table
      CREATE TABLE IF NOT EXISTS file_changes (
        id VARCHAR(36) PRIMARY KEY,
        project_id VARCHAR(32) REFERENCES projects(id),
        file_path TEXT NOT NULL,
        change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('created', 'modified', 'deleted')),
        conversation_id VARCHAR(36) REFERENCES conversations(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Code patterns table
      CREATE TABLE IF NOT EXISTS code_patterns (
        id VARCHAR(36) PRIMARY KEY,
        project_id VARCHAR(32) REFERENCES projects(id),
        pattern TEXT NOT NULL,
        frequency INTEGER DEFAULT 1,
        context TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_file_changes_project_id ON file_changes(project_id);
      CREATE INDEX IF NOT EXISTS idx_file_changes_conversation_id ON file_changes(conversation_id);
    `;

    await this.query(createTablesSQL);
    console.log('✅ Database tables created/verified');
  }

  private async initializeProject(): Promise<void> {
    const projectName = path.basename(this.projectPath);
    
    // Check if project exists
    const existingProject = await this.query(
      'SELECT id FROM projects WHERE id = $1',
      [this.projectId]
    );

    if (existingProject.rows.length === 0) {
      // Create new project
      await this.query(
        'INSERT INTO projects (id, name, root_path) VALUES ($1, $2, $3)',
        [this.projectId, projectName, this.projectPath]
      );
      console.log(`✅ Project initialized: ${projectName} (${this.projectId})`);
    } else {
      // Update last active
      await this.query(
        'UPDATE projects SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
        [this.projectId]
      );
    }
  }

  async recordConversation(
    aiAssistant: string,
    messages: Message[],
    context?: ConversationContext
  ): Promise<string> {
    const conversationId = uuidv4();

    // Insert conversation
    await this.query(
      'INSERT INTO conversations (id, project_id, ai_assistant, context) VALUES ($1, $2, $3, $4)',
      [conversationId, this.projectId, aiAssistant, JSON.stringify(context || {})]
    );

    // Insert messages
    for (const message of messages) {
      await this.query(
        'INSERT INTO messages (id, conversation_id, role, content, metadata) VALUES ($1, $2, $3, $4, $5)',
        [message.id || uuidv4(), conversationId, message.role, message.content, JSON.stringify(message.metadata || {})]
      );
    }

    // Update project activity
    await this.updateProjectActivity();

    return conversationId;
  }

  async recordArchitecturalDecision(decision: Omit<ArchitecturalDecision, 'id' | 'timestamp'>): Promise<void> {
    const decisionId = uuidv4();

    await this.query(
      `INSERT INTO architectural_decisions (id, project_id, decision, rationale, alternatives, impact, files_affected) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        decisionId,
        this.projectId,
        decision.decision,
        decision.rationale,
        JSON.stringify(decision.alternatives),
        JSON.stringify(decision.impact),
        JSON.stringify(decision.filesAffected),
      ]
    );
  }

  async getConversations(limit: number = 50): Promise<Conversation[]> {
    const result = await this.query(`
      SELECT c.*, 
        json_agg(
          json_build_object(
            'id', m.id,
            'role', m.role,
            'content', m.content,
            'timestamp', m.created_at,
            'metadata', m.metadata
          ) ORDER BY m.created_at
        ) as messages
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE c.project_id = $1
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $2
    `, [this.projectId, limit]);

    return result.rows.map((row: any) => ({
      id: row.id,
      timestamp: row.created_at,
      aiAssistant: row.ai_assistant,
      context: row.context,
      messages: row.messages || [],
      outcomes: [] // TODO: Implement outcomes
    }));
  }

  async getArchitecturalDecisions(limit: number = 50): Promise<ArchitecturalDecision[]> {
    const result = await this.query(`
      SELECT * FROM architectural_decisions
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [this.projectId, limit]);

    return result.rows.map((row: any) => ({
      id: row.id,
      timestamp: row.created_at,
      decision: row.decision,
      rationale: row.rationale,
      alternatives: row.alternatives,
      impact: row.impact,
      filesAffected: row.files_affected
    }));
  }

  async getProjectStats(): Promise<any> {
    const stats = await this.query(`
      SELECT 
        (SELECT COUNT(*) FROM conversations WHERE project_id = $1) as conversation_count,
        (SELECT COUNT(*) FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.project_id = $1) as message_count,
        (SELECT COUNT(*) FROM architectural_decisions WHERE project_id = $1) as decision_count,
        (SELECT COUNT(*) FROM file_changes WHERE project_id = $1) as file_change_count
    `, [this.projectId]);

    return stats.rows[0];
  }

  private async updateProjectActivity(): Promise<void> {
    await this.query(
      'UPDATE projects SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
      [this.projectId]
    );
  }

  private async query(text: string, params: any[] = []): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }
    return await this.pool.query(text, params);
  }

  private generateProjectId(): string {
    return require('crypto').createHash('md5').update(this.projectPath).digest('hex').substring(0, 16);
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}