#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const init_1 = require("./commands/init");
const status_1 = require("./commands/status");
const memory_1 = require("./commands/memory");
const execute_1 = require("./commands/execute");
const license_1 = __importDefault(require("./commands/license"));
const licenseManager_1 = require("./services/licenseManager");
const program = new commander_1.Command();
program
    .name('codecontext-pro')
    .description('🧠 AI Coding Assistant Amplifier - Giving AI assistants the tools they deserve')
    .version('0.1.0');
// ASCII Art Banner
const banner = `
${chalk_1.default.cyan('╔══════════════════════════════════════════════════════════════╗')}
${chalk_1.default.cyan('║')}                    ${chalk_1.default.bold.yellow('🧠 CodeContext Pro')}                    ${chalk_1.default.cyan('║')}
${chalk_1.default.cyan('║')}              ${chalk_1.default.gray('AI Coding Assistant Amplifier')}               ${chalk_1.default.cyan('║')}
${chalk_1.default.cyan('║')}                 ${chalk_1.default.green('Phase 2: Memory + Execution')}              ${chalk_1.default.cyan('║')}
${chalk_1.default.cyan('╚══════════════════════════════════════════════════════════════╝')}
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
    .action(init_1.initCommand);
program
    .command('status')
    .description('Show current project memory status')
    .action(status_1.statusCommand);
program
    .command('memory')
    .description('Memory management commands')
    .option('--show', 'Show project memory summary')
    .option('--clear', 'Clear project memory (use with caution)')
    .option('--export <file>', 'Export memory to file')
    .action(memory_1.memoryCommand);
program.addCommand((0, execute_1.createExecuteCommand)());
program.addCommand((0, license_1.default)());
// License validation middleware
function validateLicense(command) {
    // Skip license validation for license-related commands
    if (command === 'license' || process.argv.includes('license')) {
        return true;
    }
    const validation = licenseManager_1.LicenseManager.validateLicense();
    if (!validation.valid) {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                🔐 License Required                          ║');
        console.log('╚══════════════════════════════════════════════════════════════╝');
        console.log();
        console.log('❌ ' + validation.reason);
        console.log();
        console.log('💡 To activate your license: codecontext-pro license activate');
        console.log('💡 For a 7-day trial: codecontext-pro license trial');
        console.log('💡 Visit https://codecontext.pro/pricing to purchase');
        process.exit(1);
    }
    const license = validation.license;
    const daysLeft = licenseManager_1.LicenseManager.getDaysUntilExpiry(license);
    if (daysLeft <= 7) {
        console.log(`⚠️  License expires in ${daysLeft} days. Renew at https://codecontext.pro`);
    }
    return true;
}
// Global error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk_1.default.red('❌ Unhandled Rejection at:'), promise, chalk_1.default.red('reason:'), reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error(chalk_1.default.red('❌ Uncaught Exception:'), error);
    process.exit(1);
});
// Validate license before parsing commands
const command = process.argv[2] || '';
validateLicense(command);
// Parse command line arguments
program.parse();
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=index.js.map