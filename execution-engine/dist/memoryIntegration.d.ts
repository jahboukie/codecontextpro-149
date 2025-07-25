import { ExecutionResult, ExecutionRequest } from './executionEngine';
export interface ExecutionMemory {
    executionId: string;
    projectId: string;
    timestamp: Date;
    request: ExecutionRequest;
    result: ExecutionResult;
    aiAssistant: string;
    conversationId?: string;
    learningData: ExecutionLearningData;
}
export interface ExecutionLearningData {
    codePatterns: CodePattern[];
    errorPatterns: ErrorPattern[];
    performanceInsights: PerformanceInsight[];
    successFactors: SuccessFactors;
}
export interface CodePattern {
    pattern: string;
    language: string;
    frequency: number;
    successRate: number;
    commonErrors: string[];
    bestPractices: string[];
}
export interface ErrorPattern {
    errorType: string;
    errorMessage: string;
    codeContext: string;
    frequency: number;
    solutions: string[];
    preventionTips: string[];
}
export interface PerformanceInsight {
    operation: string;
    averageTime: number;
    memoryUsage: number;
    optimizationSuggestions: string[];
}
export interface SuccessFactors {
    workingPatterns: string[];
    optimalDependencies: string[];
    bestPractices: string[];
    avoidedPitfalls: string[];
}
export declare class ExecutionMemoryManager {
    private db;
    private projectPath;
    private dbPath;
    constructor(projectPath: string);
    initialize(): Promise<void>;
    recordExecution(request: ExecutionRequest, result: ExecutionResult, aiAssistant: string, conversationId?: string): Promise<void>;
    private getFileExtension;
    private runQuery;
    private generateProjectId;
    getExecutionHistory(language?: string, successOnly?: boolean, limit?: number): Promise<ExecutionMemory[]>;
    getCodePatterns(language: string): Promise<CodePattern[]>;
    getErrorPatterns(language: string): Promise<ErrorPattern[]>;
    getPerformanceInsights(language: string): Promise<PerformanceInsight[]>;
    predictExecutionSuccess(request: ExecutionRequest): Promise<{
        successProbability: number;
        potentialIssues: string[];
        recommendations: string[];
    }>;
    suggestImprovements(request: ExecutionRequest): Promise<{
        codeImprovements: string[];
        performanceOptimizations: string[];
        securityEnhancements: string[];
    }>;
    private extractLearningData;
    private extractCodePatterns;
    private extractErrorPatterns;
    private extractPerformanceInsights;
    private extractSuccessFactors;
    private storeExecutionMemory;
    private updateProjectPatterns;
    private linkExecutionToConversation;
    private buildExecutionQuery;
    private queryExecutionMemory;
    private analyzeCodePatterns;
    private analyzeErrorPatterns;
    private analyzePerformancePatterns;
    private analyzePredictiveFactors;
    private generateImprovementSuggestions;
    private categorizeError;
    private extractErrorContext;
    private suggestSolutions;
    private generatePreventionTips;
    private generateOptimizationSuggestions;
    private identifyWorkingPatterns;
    private identifyBestPractices;
    private identifyAvoidedPitfalls;
}
//# sourceMappingURL=memoryIntegration.d.ts.map