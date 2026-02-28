import React, { useState, useRef } from 'react';
import { useSubmitJavaCode } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

const DEFAULT_CODE = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = sc.nextLine();
        System.out.println("Hello, " + name + "!");
    }
}`;

// Judge0 CE language IDs for Java
const JAVA_LANGUAGE_ID = 62; // Java (OpenJDK 13.0.1)

// Detect if code uses Scanner / reads from stdin
function usesScanner(code: string): boolean {
  return (
    code.includes('Scanner') ||
    code.includes('System.in') ||
    code.includes('BufferedReader') ||
    code.includes('InputStreamReader')
  );
}

// Multiple fallback execution strategies
async function executeWithJudge0(
  code: string,
  stdin: string
): Promise<{ stdout: string; stderr: string; compileOutput: string; statusDesc: string }> {
  const endpoints = [
    'https://judge0-ce.p.rapidapi.com',
    'https://ce.judge0.com',
  ];

  let lastError: Error | null = null;

  for (const baseUrl of endpoints) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const body = JSON.stringify({
        language_id: JAVA_LANGUAGE_ID,
        source_code: code,
        stdin: stdin,
      });

      const submitRes = await fetch(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers,
        body,
      });

      if (!submitRes.ok) {
        throw new Error(`${submitRes.status} ${submitRes.statusText}`);
      }

      const result = await submitRes.json();

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        compileOutput: result.compile_output || '',
        statusDesc: result.status?.description || 'Unknown',
      };
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All execution endpoints failed');
}

async function executeWithPiston(
  code: string,
  stdin: string
): Promise<{ stdout: string; stderr: string; compileOutput: string }> {
  const response = await fetch('https://emkc.org/api/v2/piston/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: 'java',
      version: '*',
      files: [{ name: 'Main.java', content: code }],
      stdin: stdin,
    }),
  });

  if (!response.ok) {
    throw new Error(`Piston: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return {
    stdout: result?.run?.stdout || '',
    stderr: result?.run?.stderr || '',
    compileOutput: result?.compile?.stderr || '',
  };
}

export default function EditorPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState<string>('');
  const [outputType, setOutputType] = useState<'idle' | 'success' | 'error' | 'compile-error'>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [showStdin, setShowStdin] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const { identity } = useInternetIdentity();
  const submitMutation = useSubmitJavaCode();

  const lineCount = code.split('\n').length;
  const scannerDetected = usesScanner(code);

  const syncScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 4;
          textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setOutputType('idle');

    // Submit to backend for history (fire and forget)
    if (identity) {
      submitMutation.mutate(code);
    }

    try {
      let stdout = '';
      let stderr = '';
      let compileOutput = '';

      // Try Judge0 CE first (more reliable), fall back to Piston
      try {
        const judge0Result = await executeWithJudge0(code, stdin);
        stdout = judge0Result.stdout;
        stderr = judge0Result.stderr;
        compileOutput = judge0Result.compileOutput;

        // Judge0 status-based error detection
        const statusDesc = judge0Result.statusDesc;
        if (statusDesc === 'Compilation Error') {
          setOutput(compileOutput || stderr || 'Compilation failed with no output.');
          setOutputType('compile-error');
          return;
        }
        if (
          statusDesc === 'Runtime Error (NZEC)' ||
          statusDesc === 'Runtime Error (SIGSEGV)' ||
          statusDesc?.startsWith('Runtime Error')
        ) {
          setOutput(stderr || stdout || 'Runtime error occurred.');
          setOutputType('error');
          return;
        }
        if (statusDesc === 'Time Limit Exceeded') {
          setOutput('Time Limit Exceeded: Your code took too long to execute.');
          setOutputType('error');
          return;
        }
      } catch {
        // Fall back to Piston
        const pistonResult = await executeWithPiston(code, stdin);
        stdout = pistonResult.stdout;
        stderr = pistonResult.stderr;
        compileOutput = pistonResult.compileOutput;
      }

      // Parse output
      if (compileOutput) {
        setOutput(compileOutput);
        setOutputType('compile-error');
      } else if (stderr) {
        setOutput(stderr);
        setOutputType('error');
      } else if (stdout) {
        setOutput(stdout);
        setOutputType('success');
      } else {
        setOutput('(No output)');
        setOutputType('success');
      }
    } catch (err: any) {
      setOutput(
        `Execution failed: ${err.message}\n\nNote: Java code execution uses an external API. Please check your internet connection and try again.`
      );
      setOutputType('error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-editor-bg text-editor-fg font-mono">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-editor-border bg-editor-surface">
        <div className="flex items-center gap-2 text-sm text-editor-muted">
          <span className="text-editor-accent">_</span>
          <span>Java Editor</span>
          <span className="text-editor-muted">›</span>
          <span className="text-editor-fg font-semibold">Main.java</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCode(DEFAULT_CODE)}
            className="p-1.5 rounded text-editor-muted hover:text-editor-fg hover:bg-editor-border transition-colors"
            title="Reset code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className="p-1.5 rounded text-editor-muted hover:text-editor-fg hover:bg-editor-border transition-colors"
            title="Copy code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={runCode}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-1.5 bg-editor-accent text-white rounded font-sans text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* File info bar */}
      <div className="flex items-center justify-between px-4 py-1 text-xs text-editor-muted border-b border-editor-border bg-editor-surface">
        <div className="flex items-center gap-2">
          <span>Main.java</span>
          <span className="mx-1">•</span>
          <span>{lineCount} lines</span>
          <span className="mx-1">•</span>
          <span>Java</span>
        </div>
        {/* Scanner toggle */}
        <button
          onClick={() => setShowStdin((v) => !v)}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-sans transition-colors ${
            scannerDetected
              ? 'bg-editor-accent/20 text-editor-accent border border-editor-accent/40 hover:bg-editor-accent/30'
              : 'text-editor-muted hover:text-editor-fg hover:bg-editor-border'
          }`}
          title="Toggle stdin input panel"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {scannerDetected ? 'Scanner detected — stdin' : 'stdin input'}
          {showStdin ? ' ▲' : ' ▼'}
        </button>
      </div>

      {/* Main editor + stdin layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Area */}
        <div className="flex overflow-hidden" style={{ flex: showStdin ? '1 1 0' : '1 1 auto' }}>
          {/* Line Numbers */}
          <div
            ref={lineNumbersRef}
            className="select-none text-right pr-4 pl-3 py-4 text-editor-muted text-sm leading-6 bg-editor-surface border-r border-editor-border overflow-hidden"
            style={{ minWidth: '3rem' }}
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i + 1} className="leading-6">{i + 1}</div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-editor-bg text-editor-fg text-sm leading-6 p-4 resize-none outline-none font-mono caret-editor-accent"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>

        {/* Stdin Input Panel */}
        {showStdin && (
          <div
            className={`border-t flex flex-col ${
              scannerDetected
                ? 'border-editor-accent/50 bg-editor-accent/5'
                : 'border-editor-border bg-editor-surface'
            }`}
            style={{ minHeight: '90px', maxHeight: '140px' }}
          >
            <div className={`flex items-center gap-2 px-4 py-1.5 border-b text-xs ${
              scannerDetected
                ? 'border-editor-accent/30 text-editor-accent'
                : 'border-editor-border text-editor-muted'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-sans font-medium">
                Standard Input (stdin)
                {scannerDetected && (
                  <span className="ml-2 px-1.5 py-0.5 rounded bg-editor-accent/20 text-editor-accent text-xs">
                    Scanner detected
                  </span>
                )}
              </span>
              <span className="ml-auto font-sans text-editor-muted">
                Enter each value on a new line
              </span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder={
                scannerDetected
                  ? 'Type your input here (one value per line)...'
                  : 'Optional: provide stdin input for your program...'
              }
              className={`flex-1 bg-transparent text-editor-fg text-sm p-3 resize-none outline-none font-mono placeholder:text-editor-muted/50 ${
                scannerDetected ? 'placeholder:text-editor-accent/40' : ''
              }`}
              spellCheck={false}
            />
          </div>
        )}
      </div>

      {/* Output Panel */}
      <div className="border-t border-editor-border bg-editor-surface" style={{ minHeight: '120px', maxHeight: '220px' }}>
        <div className="flex items-center gap-2 px-4 py-2 border-b border-editor-border text-xs text-editor-muted">
          <span>›_</span>
          <span>Output</span>
          {outputType === 'success' && (
            <span className="text-editor-green flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Success
            </span>
          )}
          {outputType === 'compile-error' && (
            <span className="text-yellow-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Compile Error
            </span>
          )}
          {outputType === 'error' && (
            <span className="text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Runtime Error
            </span>
          )}
          {isRunning && (
            <span className="text-editor-accent flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Compiling &amp; Running Java...
            </span>
          )}
        </div>
        <div className="p-4 text-sm font-mono overflow-auto" style={{ maxHeight: '170px' }}>
          {output ? (
            <pre
              className={
                outputType === 'success'
                  ? 'text-editor-green whitespace-pre-wrap'
                  : outputType === 'compile-error'
                  ? 'text-yellow-400 whitespace-pre-wrap'
                  : 'text-red-400 whitespace-pre-wrap'
              }
            >
              {output}
            </pre>
          ) : (
            <span className="text-editor-muted italic">
              {isRunning ? 'Compiling and executing Java code via Judge0 CE...' : 'Run your code to see output here'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
