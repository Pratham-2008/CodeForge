// Pyodide WebAssembly Python Execution Service
let pyodideInstance: any = null;
let pyodideLoadingPromise: Promise<any> | null = null;

export interface PythonExecutionOptions {
  code: string;
  stdin?: string;
  onStdout?: (text: string) => void;
  onStderr?: (text: string) => void;
  signal?: AbortSignal;
}

export interface PythonExecutionResult {
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  error?: string;
}

export async function loadPyodideRuntime(onStatusUpdate?: (msg: string) => void): Promise<any> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = new Promise(async (resolve, reject) => {
    try {
      if (onStatusUpdate) onStatusUpdate('Loading Pyodide WebAssembly runtime (first run may take a few seconds)...');

      // Check if pyodide script is already in document
      if (!(window as any).loadPyodide) {
        await new Promise<void>((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.async = true;
          script.onload = () => res();
          script.onerror = () => rej(new Error('Failed to load Pyodide script from CDN'));
          document.head.appendChild(script);
        });
      }

      if (onStatusUpdate) onStatusUpdate('Initializing Python WebAssembly environment...');
      const pyodide = await (window as any).loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
      });

      pyodideInstance = pyodide;
      resolve(pyodide);
    } catch (err) {
      pyodideLoadingPromise = null;
      reject(err);
    }
  });

  return pyodideLoadingPromise;
}

export async function runPythonCode(
  options: PythonExecutionOptions,
  onStatusUpdate?: (msg: string) => void
): Promise<PythonExecutionResult> {
  const { code, stdin = '', signal } = options;

  if (signal?.aborted) {
    throw new Error('Execution interrupted by user.');
  }

  const startTime = performance.now();
  const pyodide = await loadPyodideRuntime(onStatusUpdate);

  if (signal?.aborted) {
    throw new Error('Execution interrupted by user.');
  }

  if (onStatusUpdate) onStatusUpdate('Executing Python script...');

  // Setup python runner harness with stdout, stderr, and stdin redirection
  const harness = `
import sys
import io

# Redirect stdout and stderr to capture streams
_codeforge_stdout = io.StringIO()
_codeforge_stderr = io.StringIO()
sys.stdout = _codeforge_stdout
sys.stderr = _codeforge_stderr

# Setup stdin stream
_codeforge_stdin_content = ${JSON.stringify(stdin)}
sys.stdin = io.StringIO(_codeforge_stdin_content)
`;

  try {
    // Run harness
    pyodide.runPython(harness);

    // Run user code
    pyodide.runPython(code);

    const stdout = pyodide.runPython('_codeforge_stdout.getvalue()');
    const stderr = pyodide.runPython('_codeforge_stderr.getvalue()');
    const elapsed = performance.now() - startTime;

    return {
      stdout: stdout || '',
      stderr: stderr || '',
      executionTimeMs: Math.round(elapsed)
    };
  } catch (err: any) {
    const elapsed = performance.now() - startTime;
    let stdout = '';
    try {
      stdout = pyodide.runPython('_codeforge_stdout.getvalue()');
    } catch (_) {}

    return {
      stdout,
      stderr: err.message || String(err),
      executionTimeMs: Math.round(elapsed),
      error: err.message || 'Python execution error'
    };
  } finally {
    // Reset standard streams
    try {
      pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
sys.stdin = sys.__stdin__
`);
    } catch (_) {}
  }
}
