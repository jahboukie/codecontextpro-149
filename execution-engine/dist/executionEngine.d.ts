export interface ExecutionRequest {
    id: string;
    language: SupportedLanguage;
    code: string;
    tests?: string[];
    dependencies?: string[];
    timeout?: number;
    memoryLimit?: string;
    projectContext?: ProjectContext;
}
export interface ExecutionResult {
    id: string;
    success: boolean;
    output: string;
    errors: string[];
    exitCode: number;
    executionTime: number;
    memoryUsage: number;
    testResults?: TestResult[];
    performanceMetrics?: PerformanceMetrics;
    securityReport?: SecurityReport;
    improvements?: {
        codeImprovements: string[];
        performanceOptimizations: string[];
        securityEnhancements: string[];
    };
}
export interface TestResult {
    name: string;
    passed: boolean;
    output: string;
    error?: string;
    duration: number;
}
export interface PerformanceMetrics {
    cpuUsage: number;
    memoryPeak: number;
    ioOperations: number;
    networkCalls: number;
    executionProfile: ExecutionProfile[];
}
export interface ExecutionProfile {
    function: string;
    calls: number;
    totalTime: number;
    averageTime: number;
}
export interface SecurityReport {
    fileSystemAccess: string[];
    networkAccess: string[];
    processSpawned: string[];
    suspiciousOperations: string[];
    riskLevel: 'low' | 'medium' | 'high';
}
export interface ProjectContext {
    projectId: string;
    workingDirectory: string;
    installedPackages: string[];
    environmentVariables: Record<string, string>;
}
export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'go' | 'rust';
export declare class ExecutionEngine {
    private docker;
    private sandboxDir;
    private containers;
    constructor(sandboxDir?: string);
    executeCode(request: ExecutionRequest): Promise<ExecutionResult>;
    private createExecutionEnvironment;
    private writeCodeToFile;
    private createContainer;
    private getExecutionCommand;
    private runInSandbox;
    private runTests;
    private collectPerformanceMetrics;
    private generateSecurityReport;
    private cleanupEnvironment;
    private ensureSandboxDirectory;
    private getDependenciesObject;
    private parseMemoryLimit;
    private getEnvironmentVariables;
}
//# sourceMappingURL=executionEngine.d.ts.map