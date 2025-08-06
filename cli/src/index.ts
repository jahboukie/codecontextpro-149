#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { statusCommand } from './commands/status';
import { memoryCommand } from './commands/memory';
import { createExecuteCommand } from './commands/execute';

const program = new Command();

program
  .name('codecontext-pro')
  .description('🧠 AI Coding Assistant Amplifier - Giving AI assistants the tools they deserve')
  .version('0.1.0');

// ASCII Art Banner
const banner = `
${chalk.cyan('╔══════════════════════════════════════════════════════════════╗')}
${chalk.cyan('║')}                    ${chalk.bold.yellow('🧠 CodeContext Pro')}                    ${chalk.cyan('║')}
${chalk.cyan('║')}              ${chalk.gray('AI Coding Assistant Amplifier')}               ${chalk.cyan('║')}
${chalk.cyan('║')}                 ${chalk.green('Phase 2: Memory + Execution')}              ${chalk.cyan('║')}
${chalk.cyan('╚══════════════════════════════════════════════════════════════╝')}
`;

program.addHelpText('beforeAll', banner);

// Local Developer Mode - No authentication required

// Project Commands
program
  .command('init')
  .description('Initialize CodeContext Pro in current project')
  .option('--memory-only', 'Initialize with memory engine only (Phase 1)')
  .option('--execution', 'Initialize with memory + execution engine (Phase 2)')
  .option('--force', 'Force initialization even if already exists')
  .action(initCommand);

program
  .command('status')
  .description('Show current project memory status')
  .action(statusCommand);

program
  .command('memory')
  .description('Memory management commands')
  .option('--show', 'Show project memory summary')
  .option('--clear', 'Clear project memory (use with caution)')
  .option('--export <file>', 'Export memory to file')
  .action(memoryCommand);

program.addCommand(createExecuteCommand());


// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error);
  process.exit(1);
});


// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
