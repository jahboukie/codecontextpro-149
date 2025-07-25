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
    cursorPosition?: {
        line: number;
        column: number;
    };
    openFiles?: string[];
}
export interface ConversationOutcome {
    type: 'success' | 'failure' | 'incomplete';
    description: string;
    filesModified: string[];
}
export declare class PostgreSQLMemoryEngine {
    private pool;
    private projectPath;
    private projectId;
    constructor(projectPath: string);
    initialize(): Promise<void>;
    private createTables;
    private initializeProject;
    recordConversation(aiAssistant: string, messages: Message[], context?: ConversationContext): Promise<string>;
    recordArchitecturalDecision(decision: Omit<ArchitecturalDecision, 'id' | 'timestamp'>): Promise<void>;
    getConversations(limit?: number): Promise<Conversation[]>;
    getArchitecturalDecisions(limit?: number): Promise<ArchitecturalDecision[]>;
    getProjectStats(): Promise<any>;
    private updateProjectActivity;
    private query;
    private generateProjectId;
    close(): Promise<void>;
}
//# sourceMappingURL=postgresMemoryEngine.d.ts.map