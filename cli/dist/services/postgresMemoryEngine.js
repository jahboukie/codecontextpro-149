"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLMemoryEngine = void 0;
const pg_1 = require("pg");
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
// Neon PostgreSQL configuration
const DB_CONFIG = {
    connectionString: 'postgresql://neondb_owner:npg_IDjRgbGe87mP@ep-jolly-sun-ae0n4gej-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
        rejectUnauthorized: false
    }
};
class PostgreSQLMemoryEngine {
    constructor(projectPath) {
        this.pool = null;
        this.projectPath = projectPath;
        this.projectId = this.generateProjectId();
    }
    async initialize() {
        try {
            this.pool = new pg_1.Pool(DB_CONFIG);
            // Test connection
            const client = await this.pool.connect();
            client.release();
            console.log('✅ Connected to PostgreSQL database');
            // Create tables if they don't exist
            await this.createTables();
            // Initialize project
            await this.initializeProject();
        }
        catch (error) {
            console.error('❌ Failed to connect to Neon PostgreSQL:', error);
            console.log('💡 Check your Neon database connection string');
            console.log('💡 Verify your Neon project is active and accessible');
            throw error;
        }
    }
    async createTables() {
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
    async initializeProject() {
        const projectName = path.basename(this.projectPath);
        // Check if project exists
        const existingProject = await this.query('SELECT id FROM projects WHERE id = $1', [this.projectId]);
        if (existingProject.rows.length === 0) {
            // Create new project
            await this.query('INSERT INTO projects (id, name, root_path) VALUES ($1, $2, $3)', [this.projectId, projectName, this.projectPath]);
            console.log(`✅ Project initialized: ${projectName} (${this.projectId})`);
        }
        else {
            // Update last active
            await this.query('UPDATE projects SET last_active = CURRENT_TIMESTAMP WHERE id = $1', [this.projectId]);
        }
    }
    async recordConversation(aiAssistant, messages, context) {
        const conversationId = (0, uuid_1.v4)();
        // Insert conversation
        await this.query('INSERT INTO conversations (id, project_id, ai_assistant, context) VALUES ($1, $2, $3, $4)', [conversationId, this.projectId, aiAssistant, JSON.stringify(context || {})]);
        // Insert messages
        for (const message of messages) {
            await this.query('INSERT INTO messages (id, conversation_id, role, content, metadata) VALUES ($1, $2, $3, $4, $5)', [message.id || (0, uuid_1.v4)(), conversationId, message.role, message.content, JSON.stringify(message.metadata || {})]);
        }
        // Update project activity
        await this.updateProjectActivity();
        return conversationId;
    }
    async recordArchitecturalDecision(decision) {
        const decisionId = (0, uuid_1.v4)();
        await this.query(`INSERT INTO architectural_decisions (id, project_id, decision, rationale, alternatives, impact, files_affected) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
            decisionId,
            this.projectId,
            decision.decision,
            decision.rationale,
            JSON.stringify(decision.alternatives),
            JSON.stringify(decision.impact),
            JSON.stringify(decision.filesAffected),
        ]);
    }
    async getConversations(limit = 50) {
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
        return result.rows.map((row) => ({
            id: row.id,
            timestamp: row.created_at,
            aiAssistant: row.ai_assistant,
            context: row.context,
            messages: row.messages || [],
            outcomes: [] // TODO: Implement outcomes
        }));
    }
    async getArchitecturalDecisions(limit = 50) {
        const result = await this.query(`
      SELECT * FROM architectural_decisions
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [this.projectId, limit]);
        return result.rows.map((row) => ({
            id: row.id,
            timestamp: row.created_at,
            decision: row.decision,
            rationale: row.rationale,
            alternatives: row.alternatives,
            impact: row.impact,
            filesAffected: row.files_affected
        }));
    }
    async getProjectStats() {
        const stats = await this.query(`
      SELECT 
        (SELECT COUNT(*) FROM conversations WHERE project_id = $1) as conversation_count,
        (SELECT COUNT(*) FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE c.project_id = $1) as message_count,
        (SELECT COUNT(*) FROM architectural_decisions WHERE project_id = $1) as decision_count,
        (SELECT COUNT(*) FROM file_changes WHERE project_id = $1) as file_change_count
    `, [this.projectId]);
        return stats.rows[0];
    }
    async updateProjectActivity() {
        await this.query('UPDATE projects SET last_active = CURRENT_TIMESTAMP WHERE id = $1', [this.projectId]);
    }
    async query(text, params = []) {
        if (!this.pool) {
            throw new Error('Database not initialized');
        }
        return await this.pool.query(text, params);
    }
    generateProjectId() {
        return require('crypto').createHash('md5').update(this.projectPath).digest('hex').substring(0, 16);
    }
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}
exports.PostgreSQLMemoryEngine = PostgreSQLMemoryEngine;
//# sourceMappingURL=postgresMemoryEngine.js.map