import { spawn } from 'child_process';
import path from 'path';

export async function runPythonScript(
  scriptName: string, 
  args: string[] = []
): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'ml', 'scripts', scriptName);
    // Change 'python3' to 'python' for Windows
    const python = spawn('python', [scriptPath, ...args]);
    
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(error || 'Python script failed'));
      } else {
        try {
          resolve(JSON.parse(output));
        } catch (e) {
          resolve(output);
        }
      }
    });
  });
}