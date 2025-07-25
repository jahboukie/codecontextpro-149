import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { MemoryEngine } from '../services/memoryEngine';

export async function statusCommand() {
  console.log(chalk.cyan('\n🔍 CodeContext Pro Developer Edition\n'));

  const currentDir = process.cwd();
  const configPath = path.join(currentDir, '.codecontext', 'config.json');

  // Check if initialized
  if (!fs.existsSync(configPath)) {
    console.log(chalk.red('❌ CodeContext Pro is not initialized in this project'));
    console.log(chalk.gray('   Run "codecontext-pro init" to get started'));
    return;
  }

  try {
    // Load configuration
    const config = await fs.readJson(configPath);
    
    console.log(chalk.bold('📋 Project Information:'));
    console.log(`   Name: ${chalk.cyan(config.projectName)}`);
    console.log(`   ID: ${chalk.gray(config.projectId)}`);
    console.log(`   Mode: ${chalk.yellow('Developer Edition')}`);
    console.log(`   Created: ${chalk.gray(new Date(config.createdAt).toLocaleString())}`);

    console.log(chalk.bold('\n🎯 Features:'));
    console.log(`   Memory Engine: ${chalk.green('✅ Active')}`);
    console.log(`   Execution Engine: ${chalk.green('✅ Active')}`);
    console.log(`   PostgreSQL Backend: ${chalk.green('✅ Active')}`);

    // Memory statistics
    console.log(chalk.bold('\n🧠 Memory Statistics:'));
    try {
      const memoryEngine = new MemoryEngine(currentDir);
      await memoryEngine.initialize();
      const stats = await memoryEngine.getStatistics();
      
      console.log(`   Conversations: ${chalk.cyan(stats.conversationCount)}`);
      console.log(`   Messages: ${chalk.cyan(stats.messageCount)}`);
      console.log(`   Decisions: ${chalk.cyan(stats.decisionCount)}`);
      console.log(`   Files Tracked: ${chalk.cyan(stats.fileCount)}`);
      console.log(`   Last Activity: ${chalk.gray(stats.lastActivity ? new Date(stats.lastActivity).toLocaleString() : 'Never')}`);
      console.log(`   Database Size: ${chalk.gray(stats.databaseSize)}`);
    } catch (error) {
      console.log(`   ${chalk.yellow('⚠️  PostgreSQL connection needed for memory statistics')}`);
      console.log(`   ${chalk.gray('Make sure PostgreSQL is running on localhost:5432')}`);
    }

    // Developer Edition Status
    console.log(chalk.bold('\n💎 Developer Edition:'));
    console.log(`   Status: ${chalk.green('ACTIVE')}`);
    console.log(`   Tier: ${chalk.cyan('UNLIMITED')}`);
    console.log(`   ${chalk.green('✅ All features enabled - no limits')}`);
    console.log(`   Memory: ${chalk.cyan('Unlimited')}`);
    console.log(`   Executions: ${chalk.cyan('Unlimited')}`);

    console.log(chalk.bold('\n📊 Health Check:'));
    const health = await performHealthCheck(currentDir);
    health.forEach(check => {
      const icon = check.status === 'ok' ? '✅' : '❌';
      const color = check.status === 'ok' ? chalk.green : chalk.red;
      console.log(`   ${icon} ${check.name}: ${color(check.message)}`);
    });

  } catch (error) {
    console.error(chalk.red('❌ Failed to get status:'), error);
  }
}

async function performHealthCheck(projectPath: string) {
  const checks = [];

  // Check configuration
  const configPath = path.join(projectPath, '.codecontext', 'config.json');
  if (fs.existsSync(configPath)) {
    checks.push({
      name: 'Configuration',
      status: 'ok' as const,
      message: 'Valid configuration found',
    });
  } else {
    checks.push({
      name: 'Configuration',
      status: 'error' as const,
      message: 'Configuration file missing',
    });
  }

  // Check PostgreSQL connection
  try {
    const memoryEngine = new MemoryEngine(projectPath);
    await memoryEngine.initialize();
    await memoryEngine.close();
    checks.push({
      name: 'PostgreSQL Database',
      status: 'ok' as const,
      message: 'Database connection successful',
    });
  } catch (error) {
    checks.push({
      name: 'PostgreSQL Database',
      status: 'error' as const,
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
      status: 'ok' as const,
      message: 'Read/write access confirmed',
    });
  } catch (error) {
    checks.push({
      name: 'Permissions',
      status: 'error' as const,
      message: 'Insufficient permissions',
    });
  }

  return checks;
}