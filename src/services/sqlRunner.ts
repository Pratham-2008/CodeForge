// In-Browser SQLite WebAssembly Runner using sql.js
let sqlPromise: Promise<any> | null = null;
let SQL: any = null;

export interface SqlExecutionOptions {
  query: string;
  signal?: AbortSignal;
}

export interface SqlExecutionResult {
  stdout: string;
  stderr: string;
  executionTimeMs: number;
  tables?: { columns: string[]; values: any[][] }[];
  error?: string;
}

export async function loadSqlRuntime(onStatusUpdate?: (msg: string) => void): Promise<any> {
  if (SQL) return SQL;
  if (sqlPromise) return sqlPromise;

  sqlPromise = new Promise(async (resolve, reject) => {
    try {
      if (onStatusUpdate) onStatusUpdate('Loading SQLite WebAssembly engine (sql.js)...');

      if (!(window as any).initSqlJs) {
        await new Promise<void>((res, rej) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.js';
          script.async = true;
          script.onload = () => res();
          script.onerror = () => rej(new Error('Failed to load sql-wasm.js from CDN'));
          document.head.appendChild(script);
        });
      }

      if (onStatusUpdate) onStatusUpdate('Initializing SQLite WebAssembly instance...');
      const initSqlJs = (window as any).initSqlJs;
      SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
      });

      resolve(SQL);
    } catch (err) {
      sqlPromise = null;
      reject(err);
    }
  });

  return sqlPromise;
}

function formatSqlTable(columns: string[], values: any[][]): string {
  if (columns.length === 0) return '(No columns returned)';

  const colWidths = columns.map((col, idx) => {
    const maxValLen = values.reduce((max, row) => Math.max(max, String(row[idx] ?? 'NULL').length), 0);
    return Math.max(col.length, maxValLen);
  });

  const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  const header = '| ' + columns.map((col, idx) => col.padEnd(colWidths[idx])).join(' | ') + ' |';

  const rows = values.map(row => {
    return '| ' + row.map((cell, idx) => String(cell ?? 'NULL').padEnd(colWidths[idx])).join(' | ') + ' |';
  });

  return [separator, header, separator, ...rows, separator].join('\n');
}

export async function runSqlQuery(
  options: SqlExecutionOptions,
  onStatusUpdate?: (msg: string) => void
): Promise<SqlExecutionResult> {
  const { query, signal } = options;

  if (signal?.aborted) {
    throw new Error('Execution interrupted by user.');
  }

  const startTime = performance.now();
  const sqlEngine = await loadSqlRuntime(onStatusUpdate);

  if (signal?.aborted) {
    throw new Error('Execution interrupted by user.');
  }

  if (onStatusUpdate) onStatusUpdate('Executing SQL queries in SQLite...');

  let db: any = null;
  try {
    db = new sqlEngine.Database();

    // Execute queries
    const res = db.exec(query);
    const elapsed = Math.round(performance.now() - startTime);

    if (!res || res.length === 0) {
      const rowsModified = db.getRowsModified();
      return {
        stdout: `Query OK. ${rowsModified} row(s) affected.\n(No result set returned)`,
        stderr: '',
        executionTimeMs: elapsed
      };
    }

    const outputBlocks: string[] = [];
    res.forEach((tableResult: any, idx: number) => {
      const { columns, values } = tableResult;
      const formatted = formatSqlTable(columns, values);
      outputBlocks.push(`-- Result Set #${idx + 1} (${values.length} row${values.length === 1 ? '' : 's'}):\n${formatted}`);
    });

    return {
      stdout: outputBlocks.join('\n\n'),
      stderr: '',
      executionTimeMs: elapsed,
      tables: res
    };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    return {
      stdout: '',
      stderr: `SQLite Error: ${err.message || String(err)}`,
      executionTimeMs: elapsed,
      error: err.message || 'SQL execution failed'
    };
  } finally {
    if (db) {
      try {
        db.close();
      } catch (_) {}
    }
  }
}
