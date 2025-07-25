import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { apiClient } from '../services/apiClient';

export async function loginCommand(): Promise<void> {
  console.log(chalk.green('✅ CodeContext Pro Developer Edition'));
  console.log(chalk.gray('Local development mode - no authentication required\n'));
  console.log(chalk.blue('🚀 Ready to use CodeContext Pro commands!'));
  console.log(chalk.gray('Try: codecontext status'));
}

export async function logoutCommand(): Promise<void> {
  console.log(chalk.gray('Developer Edition - no logout needed'));
  console.log(chalk.green('✅ Always ready to use!'));
}
