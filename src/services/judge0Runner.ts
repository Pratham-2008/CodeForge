import { SupportedLanguage, ExecutionResult } from '../types';
import { LANGUAGE_MAP } from '../data/languages';
import { getApiUrl } from '../config/api';

export interface Judge0ExecutionOptions {
  language: SupportedLanguage;
  code: string;
  stdin?: string;
  endpoint?: string;
  apiKey?: string;
  signal?: AbortSignal;
}

export async function runJudge0Code(
  options: Judge0ExecutionOptions,
  onStatusUpdate?: (msg: string) => void
): Promise<ExecutionResult> {
  const { language, code, stdin = '', endpoint, apiKey, signal } = options;
  const config = LANGUAGE_MAP.get(language);

  if (!config || !config.judge0Id) {
    throw new Error(`Language "${language}" is not supported by the backend compiler service.`);
  }

  if (signal?.aborted) {
    throw new Error('Execution interrupted by user.');
  }

  if (onStatusUpdate) {
    onStatusUpdate(`Sending ${config.name} source to sandboxed backend compiler...`);
  }

  try {
    const response = await fetch(getApiUrl('/api/execute'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language,
        language_id: config.judge0Id,
        source_code: code,
        stdin,
        endpoint,
        apiKey
      }),
      signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData?.details) {
        return {
          error: errorData.error || 'Execution request failed',
          stderr: errorData.details,
          isConfigured: errorData.isConfigured !== false
        };
      }
      throw new Error(`Backend compiler returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ExecutionResult = await response.json();
    return data;
  } catch (err: any) {
    if (err.name === 'AbortError' || signal?.aborted) {
      throw new Error('Execution interrupted by user.');
    }
    return {
      error: err.message || 'Failed to connect to backend execution service',
      isConfigured: false
    };
  }
}
