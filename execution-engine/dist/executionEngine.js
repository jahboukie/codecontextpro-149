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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionEngine = void 0;
const dockerode_1 = __importDefault(require("dockerode"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
class ExecutionEngine {
    constructor(sandboxDir = './sandbox') {
        this.containers = new Map();
        this.docker = new dockerode_1.default();
        this.sandboxDir = path.resolve(sandboxDir);
        this.ensureSandboxDirectory();
    }
    async executeCode(request) {
        const startTime = Date.now();
        const executionId = request.id || (0, uuid_1.v4)();
        console.log(`🚀 Executing ${request.language} code (ID: ${executionId})`);
        try {
            // Create isolated execution environment
            const environment = await this.createExecutionEnvironment(request);
            // Execute code in sandbox
            const result = await this.runInSandbox(environment, request);
            // Run tests if provided
            if (request.tests && request.tests.length > 0) {
                result.testResults = await this.runTests(environment, request);
            }
            // Collect performance metrics
            result.performanceMetrics = await this.collectPerformanceMetrics(environment);
            // Generate security report
            result.securityReport = await this.generateSecurityReport(environment);
            // Cleanup
            await this.cleanupEnvironment(environment);
            result.executionTime = Date.now() - startTime;
            console.log(`✅ Execution completed in ${result.executionTime}ms`);
            return result;
        }
        catch (error) {
            console.error(`❌ Execution failed:`, error);
            return {
                id: executionId,
                success: false,
                output: '',
                errors: [error instanceof Error ? error.message : String(error)],
                exitCode: 1,
                executionTime: Date.now() - startTime,
                memoryUsage: 0
            };
        }
    }
    async createExecutionEnvironment(request) {
        const envId = (0, uuid_1.v4)();
        const envDir = path.join(this.sandboxDir, envId);
        await fs.ensureDir(envDir);
        // Write code to file
        const codeFile = await this.writeCodeToFile(envDir, request);
        // Create Docker container
        const container = await this.createContainer(request.language, envDir, request);
        return {
            id: envId,
            directory: envDir,
            codeFile,
            container,
            language: request.language
        };
    }
    async writeCodeToFile(envDir, request) {
        const extensions = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            go: 'go',
            rust: 'rs'
        };
        const extension = extensions[request.language];
        const fileName = `main.${extension}`;
        const filePath = path.join(envDir, fileName);
        await fs.writeFile(filePath, request.code);
        // Write package.json for Node.js projects
        if (request.language === 'javascript' || request.language === 'typescript') {
            const packageJson = {
                name: 'codecontext-execution',
                version: '1.0.0',
                main: fileName,
                dependencies: this.getDependenciesObject(request.dependencies || [])
            };
            await fs.writeJson(path.join(envDir, 'package.json'), packageJson);
        }
        // Write requirements.txt for Python
        if (request.language === 'python' && request.dependencies) {
            await fs.writeFile(path.join(envDir, 'requirements.txt'), request.dependencies.join('\n'));
        }
        return fileName;
    }
    async createContainer(language, envDir, request) {
        const images = {
            javascript: 'node:18-alpine',
            typescript: 'node:18-alpine',
            python: 'python:3.11-alpine',
            go: 'golang:1.20-alpine',
            rust: 'rust:1.70-alpine'
        };
        const image = images[language];
        console.log(`🐳 Creating container with image: ${image}`);
        console.log(`📁 Binding directory: ${envDir} -> /workspace`);
        const container = await this.docker.createContainer({
            Image: image,
            WorkingDir: '/workspace',
            Cmd: this.getExecutionCommand(language, request),
            HostConfig: {
                Binds: [`${envDir.replace(/\\/g, '/')}:/workspace`],
                Memory: this.parseMemoryLimit(request.memoryLimit || '128m'),
                CpuShares: 512,
                NetworkMode: 'none',
                ReadonlyRootfs: false,
                Tmpfs: {
                    '/tmp': 'rw,noexec,nosuid,size=100m'
                }
            },
            Env: this.getEnvironmentVariables(request)
        });
        return container;
    }
    getExecutionCommand(language, request) {
        switch (language) {
            case 'javascript':
                return ['node', 'main.js'];
            case 'typescript':
                return ['sh', '-c', 'npm install -g typescript && npm install && npx tsc main.ts && node main.js'];
            case 'python':
                return ['sh', '-c', 'pip install -r requirements.txt 2>/dev/null || true && python main.py'];
            case 'go':
                return ['sh', '-c', 'go mod init main 2>/dev/null || true && go run main.go'];
            case 'rust':
                return ['sh', '-c', 'cargo init --name main . 2>/dev/null || true && cargo run'];
            default:
                throw new Error(`Unsupported language: ${language}`);
        }
    }
    async runInSandbox(environment, request) {
        const container = environment.container;
        // Set timeout
        const timeout = request.timeout || 30000; // 30 seconds default
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Execution timeout')), timeout);
        });
        try {
            console.log('🐳 Attaching to container before starting...');
            const stream = await container.attach({
                stream: true,
                stdout: true,
                stderr: true
            });
            console.log('🚀 Starting container...');
            await container.start();
            console.log('✅ Container started successfully');
            let output = '';
            let errors = '';
            // Collect output from stream
            const outputPromise = new Promise((resolve) => {
                stream.on('data', (chunk) => {
                    const data = chunk.toString();
                    if (chunk[0] === 1) { // stdout
                        output += data.slice(8); // Remove Docker stream header
                    }
                    else if (chunk[0] === 2) { // stderr
                        errors += data.slice(8);
                    }
                });
                stream.on('end', () => {
                    console.log('📤 Stream ended, output collected');
                    resolve();
                });
            });
            // Wait for container to finish
            let waitResult;
            try {
                waitResult = await Promise.race([
                    container.wait(),
                    timeoutPromise
                ]);
            }
            catch (error) {
                console.log('🔍 Container wait error:', error.statusCode, error.reason);
                if (error.statusCode === 304 && error.reason === 'container already stopped') {
                    // Container finished successfully but already stopped
                    console.log('✅ Container completed successfully');
                    waitResult = { StatusCode: 0 };
                }
                else {
                    console.log('❌ Unexpected container error:', error);
                    throw error;
                }
            }
            // Wait for output to be fully collected
            await outputPromise;
            // Try to get stats, but don't fail if container is already stopped
            let memoryUsage = 0;
            try {
                const stats = await container.stats({ stream: false });
                memoryUsage = stats.memory_stats?.usage || 0;
            }
            catch (error) {
                console.log('📊 Could not get container stats (container already stopped)');
            }
            return {
                id: environment.id,
                success: waitResult.StatusCode === 0,
                output: output.trim(),
                errors: errors ? [errors.trim()] : [],
                exitCode: waitResult.StatusCode,
                executionTime: 0,
                memoryUsage
            };
        }
        finally {
            try {
                await container.stop();
            }
            catch (error) {
                if (error.statusCode === 304 && error.reason === 'container already stopped') {
                    console.log('🧹 Container already stopped, skipping stop command');
                }
                else {
                    console.warn('⚠️  Error stopping container:', error);
                }
            }
        }
    }
    async runTests(environment, request) {
        // Implementation for running tests
        // This would create test files and run them
        return [];
    }
    async collectPerformanceMetrics(environment) {
        // Implementation for collecting performance data
        return {
            cpuUsage: 0,
            memoryPeak: 0,
            ioOperations: 0,
            networkCalls: 0,
            executionProfile: []
        };
    }
    async generateSecurityReport(environment) {
        // Implementation for security analysis
        return {
            fileSystemAccess: [],
            networkAccess: [],
            processSpawned: [],
            suspiciousOperations: [],
            riskLevel: 'low'
        };
    }
    async cleanupEnvironment(environment) {
        try {
            await environment.container.remove();
            await fs.remove(environment.directory);
        }
        catch (error) {
            console.warn('Cleanup warning:', error);
        }
    }
    ensureSandboxDirectory() {
        fs.ensureDirSync(this.sandboxDir);
    }
    getDependenciesObject(dependencies) {
        const deps = {};
        dependencies.forEach(dep => {
            const [name, version] = dep.split('@');
            deps[name] = version || 'latest';
        });
        return deps;
    }
    parseMemoryLimit(limit) {
        const match = limit.match(/^(\d+)([kmg]?)$/i);
        if (!match)
            return 128 * 1024 * 1024; // 128MB default
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        switch (unit) {
            case 'k': return value * 1024;
            case 'm': return value * 1024 * 1024;
            case 'g': return value * 1024 * 1024 * 1024;
            default: return value;
        }
    }
    getEnvironmentVariables(request) {
        const env = ['NODE_ENV=sandbox', 'PYTHONPATH=/workspace'];
        if (request.projectContext?.environmentVariables) {
            Object.entries(request.projectContext.environmentVariables).forEach(([key, value]) => {
                env.push(`${key}=${value}`);
            });
        }
        return env;
    }
}
exports.ExecutionEngine = ExecutionEngine;
//# sourceMappingURL=executionEngine.js.map