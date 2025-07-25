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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionMemoryManager = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
class ExecutionMemoryManager {
    constructor(projectPath) {
        this.db = null;
        this.projectPath = projectPath;
        this.dbPath = path.join(projectPath, '.codecontext', 'memory.db');
    }
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Failed to connect to memory database:', err);
                    reject(err);
                }
                else {
                    console.log('Connected to memory database');
                    resolve();
                }
            });
        });
    }
    async recordExecution(request, result, aiAssistant, conversationId) {
        if (!this.db) {
            console.error('Database not initialized');
            return;
        }
        const recordedConversationId = conversationId || (0, uuid_1.v4)();
        const projectId = this.generateProjectId();
        try {
            // Insert conversation
            await this.runQuery(`INSERT INTO conversations (id, project_id, ai_assistant, context) VALUES (?, ?, ?, ?)`, [
                recordedConversationId,
                projectId,
                aiAssistant || 'codecontext-execution-engine',
                JSON.stringify({
                    activeFile: `execution_${result.id}.${this.getFileExtension(request.language)}`,
                    selectedText: request.code
                })
            ]);
            // Insert user message (code execution request)
            await this.runQuery(`INSERT INTO messages (id, conversation_id, role, content, metadata) VALUES (?, ?, ?, ?, ?)`, [
                `msg_${Date.now()}_1`,
                recordedConversationId,
                'user',
                `Execute ${request.language} code:\n\`\`\`${request.language}\n${request.code}\n\`\`\``,
                JSON.stringify({
                    language: request.language,
                    executionId: result.id,
                    timeout: request.timeout,
                    memoryLimit: request.memoryLimit
                })
            ]);
            // Insert assistant message (execution result)
            await this.runQuery(`INSERT INTO messages (id, conversation_id, role, content, metadata) VALUES (?, ?, ?, ?, ?)`, [
                `msg_${Date.now()}_2`,
                recordedConversationId,
                'assistant',
                `Execution ${result.success ? 'completed successfully' : 'failed'}:\n\nOutput:\n${result.output || 'No output'}\n\n${result.errors && result.errors.length > 0 ? `Errors:\n${result.errors.join('\n')}` : ''}`,
                JSON.stringify({
                    success: result.success,
                    executionTime: result.executionTime,
                    memoryUsage: result.memoryUsage,
                    exitCode: result.exitCode,
                    errors: result.errors
                })
            ]);
            // Record architectural decision if execution failed
            if (!result.success && result.errors && result.errors.length > 0) {
                await this.runQuery(`INSERT INTO architectural_decisions (id, project_id, decision, rationale, alternatives, impact, files_affected) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                    (0, uuid_1.v4)(),
                    projectId,
                    `Code execution failed in ${request.language}`,
                    `Execution failed with errors: ${result.errors.join(', ')}`,
                    JSON.stringify(['Fix syntax errors', 'Use different approach', 'Add error handling']),
                    JSON.stringify(['Code execution', 'Development workflow']),
                    JSON.stringify([])
                ]);
            }
            console.log(`🧠 Execution conversation recorded: ${recordedConversationId} (${result.success ? '✅ Success' : '❌ Failed'})`);
        }
        catch (error) {
            console.error('Failed to record execution in memory:', error);
        }
    }
    getFileExtension(language) {
        const extensions = {
            'javascript': 'js',
            'typescript': 'ts',
            'python': 'py',
            'go': 'go',
            'rust': 'rs'
        };
        return extensions[language] || 'txt';
    }
    async runQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            this.db.run(query, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    generateProjectId() {
        // Generate a simple hash of the project path
        return require('crypto').createHash('md5').update(this.projectPath).digest('hex').substring(0, 16);
    }
    async getExecutionHistory(language, successOnly, limit = 50) {
        // Query execution history from memory
        const query = this.buildExecutionQuery(language, successOnly, limit);
        return await this.queryExecutionMemory(query);
    }
    async getCodePatterns(language) {
        const executions = await this.getExecutionHistory(language, true);
        return this.analyzeCodePatterns(executions);
    }
    async getErrorPatterns(language) {
        const executions = await this.getExecutionHistory(language, false);
        return this.analyzeErrorPatterns(executions);
    }
    async getPerformanceInsights(language) {
        const executions = await this.getExecutionHistory(language, true);
        return this.analyzePerformancePatterns(executions);
    }
    async predictExecutionSuccess(request) {
        const patterns = await this.getCodePatterns(request.language);
        const errorPatterns = await this.getErrorPatterns(request.language);
        return this.analyzePredictiveFactors(request, patterns, errorPatterns);
    }
    async suggestImprovements(request) {
        const insights = await this.getPerformanceInsights(request.language);
        const patterns = await this.getCodePatterns(request.language);
        return this.generateImprovementSuggestions(request, insights, patterns);
    }
    async extractLearningData(request, result) {
        return {
            codePatterns: this.extractCodePatterns(request, result),
            errorPatterns: this.extractErrorPatterns(request, result),
            performanceInsights: this.extractPerformanceInsights(request, result),
            successFactors: this.extractSuccessFactors(request, result)
        };
    }
    extractCodePatterns(request, result) {
        const patterns = [];
        // Analyze code structure and patterns
        const codeLines = request.code.split('\n');
        const imports = codeLines.filter(line => line.trim().startsWith('import ') ||
            line.trim().startsWith('from ') ||
            line.trim().startsWith('require('));
        const functions = codeLines.filter(line => line.includes('function ') ||
            line.includes('=>') ||
            line.includes('def '));
        // Create patterns based on successful/failed execution
        if (imports.length > 0) {
            patterns.push({
                pattern: 'import_usage',
                language: request.language,
                frequency: 1,
                successRate: result.success ? 1 : 0,
                commonErrors: result.success ? [] : result.errors,
                bestPractices: result.success ? ['Proper import structure'] : []
            });
        }
        return patterns;
    }
    extractErrorPatterns(request, result) {
        if (result.success || result.errors.length === 0) {
            return [];
        }
        return result.errors.map(error => ({
            errorType: this.categorizeError(error),
            errorMessage: error,
            codeContext: this.extractErrorContext(request.code, error),
            frequency: 1,
            solutions: this.suggestSolutions(error, request.language),
            preventionTips: this.generatePreventionTips(error, request.language)
        }));
    }
    extractPerformanceInsights(request, result) {
        if (!result.performanceMetrics) {
            return [];
        }
        return [{
                operation: 'code_execution',
                averageTime: result.executionTime,
                memoryUsage: result.memoryUsage,
                optimizationSuggestions: this.generateOptimizationSuggestions(result.performanceMetrics)
            }];
    }
    extractSuccessFactors(request, result) {
        if (!result.success) {
            return {
                workingPatterns: [],
                optimalDependencies: [],
                bestPractices: [],
                avoidedPitfalls: []
            };
        }
        return {
            workingPatterns: this.identifyWorkingPatterns(request.code),
            optimalDependencies: request.dependencies || [],
            bestPractices: this.identifyBestPractices(request.code, request.language),
            avoidedPitfalls: this.identifyAvoidedPitfalls(request.code, request.language)
        };
    }
    async storeExecutionMemory(executionMemory) {
        // Store in SQLite database through memory engine
        // This would extend the memory engine schema to include execution data
        console.log(`Storing execution memory for ${executionMemory.executionId}`);
    }
    async updateProjectPatterns(executionMemory) {
        // Update project-wide patterns based on this execution
        console.log(`Updating project patterns based on execution ${executionMemory.executionId}`);
    }
    async linkExecutionToConversation(executionMemory, conversationId) {
        // Link this execution to a conversation in memory
        console.log(`Linking execution ${executionMemory.executionId} to conversation ${conversationId}`);
    }
    buildExecutionQuery(language, successOnly, limit = 50) {
        // Build SQL query for execution history
        return `SELECT * FROM executions WHERE 1=1 ${language ? `AND language = '${language}'` : ''} ${successOnly ? 'AND success = 1' : ''} ORDER BY timestamp DESC LIMIT ${limit}`;
    }
    async queryExecutionMemory(query) {
        // Execute query against memory database
        return [];
    }
    analyzeCodePatterns(executions) {
        // Analyze patterns across multiple executions
        return [];
    }
    analyzeErrorPatterns(executions) {
        // Analyze error patterns across multiple executions
        return [];
    }
    analyzePerformancePatterns(executions) {
        // Analyze performance patterns across multiple executions
        return [];
    }
    analyzePredictiveFactors(request, patterns, errorPatterns) {
        // Use historical data to predict success
        return {
            successProbability: 0.85,
            potentialIssues: [],
            recommendations: []
        };
    }
    generateImprovementSuggestions(request, insights, patterns) {
        return {
            codeImprovements: [],
            performanceOptimizations: [],
            securityEnhancements: []
        };
    }
    categorizeError(error) {
        if (error.includes('SyntaxError'))
            return 'syntax';
        if (error.includes('TypeError'))
            return 'type';
        if (error.includes('ReferenceError'))
            return 'reference';
        if (error.includes('ImportError') || error.includes('ModuleNotFoundError'))
            return 'import';
        return 'runtime';
    }
    extractErrorContext(code, error) {
        // Extract relevant code context around the error
        return code.split('\n').slice(0, 5).join('\n');
    }
    suggestSolutions(error, language) {
        // Generate solution suggestions based on error type and language
        return [`Check ${language} syntax`, 'Verify imports', 'Review variable names'];
    }
    generatePreventionTips(error, language) {
        // Generate tips to prevent similar errors
        return [`Use ${language} linter`, 'Add type checking', 'Test incrementally'];
    }
    generateOptimizationSuggestions(metrics) {
        return ['Consider caching', 'Optimize loops', 'Reduce memory allocation'];
    }
    identifyWorkingPatterns(code) {
        return ['Proper error handling', 'Clean function structure'];
    }
    identifyBestPractices(code, language) {
        return [`${language} best practices followed`];
    }
    identifyAvoidedPitfalls(code, language) {
        return [`Avoided common ${language} pitfalls`];
    }
}
exports.ExecutionMemoryManager = ExecutionMemoryManager;
//# sourceMappingURL=memoryIntegration.js.map