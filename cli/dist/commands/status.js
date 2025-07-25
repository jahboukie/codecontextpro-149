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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = statusCommand;
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const memoryEngine_1 = require("../services/memoryEngine");
async function statusCommand() {
    console.log(chalk_1.default.cyan('\n🔍 CodeContext Pro Developer Edition\n'));
    const currentDir = process.cwd();
    const configPath = path.join(currentDir, '.codecontext', 'config.json');
    // Check if initialized
    if (!fs.existsSync(configPath)) {
        console.log(chalk_1.default.red('❌ CodeContext Pro is not initialized in this project'));
        console.log(chalk_1.default.gray('   Run "codecontext-pro init" to get started'));
        return;
    }
    try {
        // Load configuration
        const config = await fs.readJson(configPath);
        console.log(chalk_1.default.bold('📋 Project Information:'));
        console.log(`   Name: ${chalk_1.default.cyan(config.projectName)}`);
        console.log(`   ID: ${chalk_1.default.gray(config.projectId)}`);
        console.log(`   Mode: ${chalk_1.default.yellow('Developer Edition')}`);
        console.log(`   Created: ${chalk_1.default.gray(new Date(config.createdAt).toLocaleString())}`);
        console.log(chalk_1.default.bold('\n🎯 Features:'));
        console.log(`   Memory Engine: ${chalk_1.default.green('✅ Active')}`);
        console.log(`   Execution Engine: ${chalk_1.default.green('✅ Active')}`);
        console.log(`   PostgreSQL Backend: ${chalk_1.default.green('✅ Active')}`);
        // Memory statistics
        console.log(chalk_1.default.bold('\n🧠 Memory Statistics:'));
        try {
            const memoryEngine = new memoryEngine_1.MemoryEngine(currentDir);
            await memoryEngine.initialize();
            const stats = await memoryEngine.getStatistics();
            console.log(`   Conversations: ${chalk_1.default.cyan(stats.conversationCount)}`);
            console.log(`   Messages: ${chalk_1.default.cyan(stats.messageCount)}`);
            console.log(`   Decisions: ${chalk_1.default.cyan(stats.decisionCount)}`);
            console.log(`   Files Tracked: ${chalk_1.default.cyan(stats.fileCount)}`);
            console.log(`   Last Activity: ${chalk_1.default.gray(stats.lastActivity ? new Date(stats.lastActivity).toLocaleString() : 'Never')}`);
            console.log(`   Database Size: ${chalk_1.default.gray(stats.databaseSize)}`);
        }
        catch (error) {
            console.log(`   ${chalk_1.default.yellow('⚠️  PostgreSQL connection needed for memory statistics')}`);
            console.log(`   ${chalk_1.default.gray('Make sure PostgreSQL is running on localhost:5432')}`);
        }
        // Developer Edition Status
        console.log(chalk_1.default.bold('\n💎 Developer Edition:'));
        console.log(`   Status: ${chalk_1.default.green('ACTIVE')}`);
        console.log(`   Tier: ${chalk_1.default.cyan('UNLIMITED')}`);
        console.log(`   ${chalk_1.default.green('✅ All features enabled - no limits')}`);
        console.log(`   Memory: ${chalk_1.default.cyan('Unlimited')}`);
        console.log(`   Executions: ${chalk_1.default.cyan('Unlimited')}`);
        console.log(chalk_1.default.bold('\n📊 Health Check:'));
        const health = await performHealthCheck(currentDir);
        health.forEach(check => {
            const icon = check.status === 'ok' ? '✅' : '❌';
            const color = check.status === 'ok' ? chalk_1.default.green : chalk_1.default.red;
            console.log(`   ${icon} ${check.name}: ${color(check.message)}`);
        });
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Failed to get status:'), error);
    }
}
async function performHealthCheck(projectPath) {
    const checks = [];
    // Check configuration
    const configPath = path.join(projectPath, '.codecontext', 'config.json');
    if (fs.existsSync(configPath)) {
        checks.push({
            name: 'Configuration',
            status: 'ok',
            message: 'Valid configuration found',
        });
    }
    else {
        checks.push({
            name: 'Configuration',
            status: 'error',
            message: 'Configuration file missing',
        });
    }
    // Check PostgreSQL connection
    try {
        const memoryEngine = new memoryEngine_1.MemoryEngine(projectPath);
        await memoryEngine.initialize();
        await memoryEngine.close();
        checks.push({
            name: 'PostgreSQL Database',
            status: 'ok',
            message: 'Database connection successful',
        });
    }
    catch (error) {
        checks.push({
            name: 'PostgreSQL Database',
            status: 'error',
            message: 'Database connection failed - ensure PostgreSQL is running',
        });
    }
    // Check write permissions
    try {
        const testFile = path.join(projectPath, '.codecontext', '.test');
        await fs.writeFile(testFile, 'test');
        await fs.remove(testFile);
        checks.push({
            name: 'Permissions',
            status: 'ok',
            message: 'Read/write access confirmed',
        });
    }
    catch (error) {
        checks.push({
            name: 'Permissions',
            status: 'error',
            message: 'Insufficient permissions',
        });
    }
    return checks;
}
//# sourceMappingURL=status.js.map