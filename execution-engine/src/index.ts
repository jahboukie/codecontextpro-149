import express from 'express';
import { ExecutionEngine, ExecutionRequest, ExecutionResult } from './executionEngine';
import { ExecutionMemoryManager } from './memoryIntegration';
import chalk from 'chalk';
import * as path from 'path';

const app = express();
app.use(express.json());

// Initialize execution engine and memory integration
const executionEngine = new ExecutionEngine();
let memoryManager: ExecutionMemoryManager;

// Initialize memory manager with project context
async function initializeMemoryManager(projectPath: string) {
  memoryManager = new ExecutionMemoryManager(projectPath);
  await memoryManager.initialize();
  console.log(chalk.green('🧠 Memory integration initialized'));
}

// Main execution endpoint
app.post('/execute', async (req, res) => {
  try {
    const request: ExecutionRequest = req.body;
    
    console.log(chalk.cyan(`🚀 Executing ${request.language} code...`));
    
    // Initialize memory manager with project context if not already initialized
    if (!memoryManager && request.projectContext?.workingDirectory) {
      try {
        console.log(chalk.yellow(`🧠 Initializing memory for project: ${request.projectContext.workingDirectory}`));
        await initializeMemoryManager(request.projectContext.workingDirectory);
      } catch (error) {
        console.log(chalk.red('⚠️  Memory initialization failed:', error));
      }
    }
    
    // Predict success probability using memory
    if (memoryManager) {
      const prediction = await memoryManager.predictExecutionSuccess(request);
      console.log(chalk.yellow(`📊 Success probability: ${(prediction.successProbability * 100).toFixed(1)}%`));
      
      if (prediction.potentialIssues.length > 0) {
        console.log(chalk.yellow('⚠️  Potential issues:'), prediction.potentialIssues);
      }
    }
    
    // Execute the code
    const result = await executionEngine.executeCode(request);
    
    // Record execution in memory for learning
    if (memoryManager) {
      await memoryManager.recordExecution(
        request,
        result,
        req.headers['ai-assistant'] as string || 'unknown',
        req.headers['conversation-id'] as string
      );
      
      // Get improvement suggestions if execution failed
      if (!result.success) {
        const improvements = await memoryManager.suggestImprovements(request);
        result.improvements = improvements;
      }
    }
    
    // Log result
    if (result.success) {
      console.log(chalk.green('✅ Execution successful'));
    } else {
      console.log(chalk.red('❌ Execution failed:'), result.errors);
    }
    
    res.json(result);
    
  } catch (error) {
    console.error(chalk.red('💥 Execution engine error:'), error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      output: '',
      errors: [error instanceof Error ? error.message : String(error)],
      executionTime: 0,
      memoryUsage: 0
    });
  }
});

// Get execution history
app.get('/history', async (req, res) => {
  try {
    if (!memoryManager) {
      return res.status(400).json({ error: 'Memory manager not initialized' });
    }
    
    const { language, successOnly, limit } = req.query;
    const history = await memoryManager.getExecutionHistory(
      language as string,
      successOnly === 'true',
      parseInt(limit as string) || 50
    );
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get code patterns
app.get('/patterns/:language', async (req, res) => {
  try {
    if (!memoryManager) {
      return res.status(400).json({ error: 'Memory manager not initialized' });
    }
    
    const patterns = await memoryManager.getCodePatterns(req.params.language);
    res.json(patterns);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get error patterns
app.get('/errors/:language', async (req, res) => {
  try {
    if (!memoryManager) {
      return res.status(400).json({ error: 'Memory manager not initialized' });
    }
    
    const errorPatterns = await memoryManager.getErrorPatterns(req.params.language);
    res.json(errorPatterns);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get performance insights
app.get('/performance/:language', async (req, res) => {
  try {
    if (!memoryManager) {
      return res.status(400).json({ error: 'Memory manager not initialized' });
    }
    
    const insights = await memoryManager.getPerformanceInsights(req.params.language);
    res.json(insights);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    memoryInitialized: !!memoryManager,
    features: {
      execution: true,
      memory: !!memoryManager,
      prediction: !!memoryManager,
      learning: !!memoryManager
    }
  });
});

// Initialize and start server
async function startServer() {
  const port = process.env.PORT || 3001;
  
  console.log(chalk.cyan('\n🚀 CodeContext Pro Execution Engine\n'));
  console.log(chalk.gray('Phase 2: AI Assistant Code Verification System'));
  
  // Initialize memory manager if project path is provided
  const projectPath = process.env.PROJECT_PATH || process.cwd();
  if (projectPath) {
    try {
      await initializeMemoryManager(projectPath);
    } catch (error) {
      console.warn(chalk.yellow('⚠️  Memory integration not available:'), error);
    }
  }
  
  app.listen(port, () => {
    console.log(chalk.green(`\n✅ Execution Engine running on port ${port}`));
    console.log(chalk.gray(`   Memory Integration: ${memoryManager ? '🧠 Active' : '❌ Disabled'}`));
    console.log(chalk.gray(`   Docker Integration: 🐳 Ready`));
    console.log(chalk.gray(`   Multi-Language Support: 🌐 JS/TS/Python/Go/Rust`));
    console.log(chalk.gray('\n🎯 Ready to verify AI assistant code suggestions!\n'));
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Shutting down Execution Engine...'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n👋 Shutting down Execution Engine...'));
  process.exit(0);
});

// Start the server
if (require.main === module) {
  startServer().catch(error => {
    console.error(chalk.red('💥 Failed to start Execution Engine:'), error);
    process.exit(1);
  });
}

export { app, ExecutionEngine, ExecutionMemoryManager };
