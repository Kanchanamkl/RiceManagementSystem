import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

interface PythonScriptResult {
  success: boolean;
  data?: any;
  error?: string;
}

// Detect the correct Python command for the OS
function getPythonCommand(): string {
  const platform = os.platform();
  
  // On Windows, try 'python' first, then 'py', then 'python3'
  if (platform === 'win32') {
    return 'python';
  }
  
  // On Linux/Mac, use 'python3'
  return 'python3';
}

export async function runPythonScript(
  scriptName: string,
  args: string[] = []
): Promise<PythonScriptResult> {
  return new Promise((resolve) => {
    const scriptPath = path.join(process.cwd(), 'ml', 'scripts', scriptName);
    const pythonCmd = getPythonCommand();
    
    console.log(`Executing: ${pythonCmd} ${scriptPath} ${args.join(' ')}`);
    
    const python = spawn(pythonCmd, [scriptPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script error:', stderr);
        try {
          const errorData = JSON.parse(stderr);
          resolve({
            success: false,
            error: errorData.error || 'Python script failed'
          });
        } catch {
          resolve({
            success: false,
            error: stderr || 'Unknown error occurred'
          });
        }
        return;
      }
      
      try {
        // Parse the JSON output from Python
        const parsedResult = JSON.parse(stdout.trim());
        
        // Return the parsed result directly
        resolve({
          success: true,
          data: parsedResult
        });
      } catch (error) {
        console.error('Failed to parse Python output:', stdout);
        resolve({
          success: false,
          error: 'Failed to parse Python script output'
        });
      }
    });
    
    python.on('error', (error: any) => {
      console.error('Failed to start Python process:', error);
      
      let errorMessage = 'Failed to execute Python script.';
      
      if (error.code === 'ENOENT') {
        errorMessage += ' Python is not installed or not in PATH. Please install Python 3 and add it to your system PATH.';
        
        if (os.platform() === 'win32') {
          errorMessage += ' On Windows, you can install from https://www.python.org/downloads/ and make sure to check "Add Python to PATH" during installation.';
        }
      }
      
      resolve({
        success: false,
        error: errorMessage
      });
    });
  });
}