import { SupportedLanguage, FileItem } from '../types';

export function getLanguageFromFilename(filename: string): SupportedLanguage {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'c':
    case 'h':
      return 'c';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'hpp':
      return 'cpp';
    case 'php':
      return 'php';
    case 'sql':
      return 'sql';
    case 'go':
      return 'go';
    case 'rs':
    case 'rust':
      return 'rust';
    case 'json':
      return 'json';
    case 'md':
    case 'markdown':
      return 'markdown';
    default:
      return 'javascript';
  }
}

export function getDefaultExtension(lang: SupportedLanguage): string {
  switch (lang) {
    case 'html': return '.html';
    case 'css': return '.css';
    case 'javascript': return '.js';
    case 'typescript': return '.ts';
    case 'python': return '.py';
    case 'c': return '.c';
    case 'cpp': return '.cpp';
    case 'java': return '.java';
    case 'php': return '.php';
    case 'sql': return '.sql';
    case 'go': return '.go';
    case 'rust': return '.rs';
    case 'json': return '.json';
    case 'markdown': return '.md';
    default: return '.txt';
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export interface TreeNode {
  item: FileItem;
  children: TreeNode[];
}

export function buildFileTree(files: FileItem[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Create tree nodes
  files.forEach(file => {
    map.set(file.id, { item: file, children: [] });
  });

  // Assemble hierarchy
  files.forEach(file => {
    const node = map.get(file.id)!;
    if (file.parentId && map.has(file.parentId)) {
      map.get(file.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort: folders first, then alphabetically
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.item.isFolder && !b.item.isFolder) return -1;
      if (!a.item.isFolder && b.item.isFolder) return 1;
      return a.item.name.localeCompare(b.item.name);
    });
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(roots);
  return roots;
}

export function buildExecutionHtml(files: FileItem[]): string {
  // Find index.html or first html file
  const htmlFile = files.find(f => !f.isFolder && f.name.toLowerCase() === 'index.html') 
                || files.find(f => !f.isFolder && f.language === 'html');
  
  // Find all CSS files
  const cssFiles = files.filter(f => !f.isFolder && f.language === 'css');
  
  // Find all JS and TS files
  const jsFiles = files.filter(f => !f.isFolder && (f.language === 'javascript' || f.language === 'typescript'));

  const cssContent = cssFiles.map(f => `/* ${f.name} */\n${f.content}`).join('\n\n');
  const jsContent = jsFiles.map(f => `/* ${f.name} */\n${f.content}`).join('\n\n');

  let baseHtml = htmlFile ? htmlFile.content : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>CodeForge Preview</title>
</head>
<body>
  <div style="font-family: sans-serif; padding: 24px; text-align: center; color: #64748b;">
    <h2>No HTML file found</h2>
    <p>Create an <code>index.html</code> file to see preview content.</p>
  </div>
</body>
</html>`;

  // Script to intercept console logs, warnings, errors and runtime uncaught exceptions
  const consoleInterceptor = `
<script>
  (function() {
    function serializeArg(arg) {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'function') return arg.toString();
      if (typeof arg === 'object') {
        try {
          return JSON.parse(JSON.stringify(arg));
        } catch(e) {
          return String(arg);
        }
      }
      return arg;
    }

    function sendToParent(type, rawArgs) {
      try {
        var args = Array.prototype.slice.call(rawArgs).map(serializeArg);
        window.parent.postMessage({
          source: 'codeforge-preview',
          type: type,
          args: args,
          timestamp: Date.now()
        }, '*');
      } catch (err) {
        // Fallback
      }
    }

    var originalLog = console.log;
    var originalInfo = console.info;
    var originalWarn = console.warn;
    var originalError = console.error;

    console.log = function() {
      sendToParent('log', arguments);
      originalLog.apply(console, arguments);
    };
    console.info = function() {
      sendToParent('info', arguments);
      originalInfo.apply(console, arguments);
    };
    console.warn = function() {
      sendToParent('warn', arguments);
      originalWarn.apply(console, arguments);
    };
    console.error = function() {
      sendToParent('error', arguments);
      originalError.apply(console, arguments);
    };

    window.onerror = function(message, source, lineno, colno, error) {
      sendToParent('error', ['Runtime Error: ' + message + (lineno ? ' (Line ' + lineno + ')' : '')]);
      return false;
    };

    window.addEventListener('unhandledrejection', function(event) {
      sendToParent('error', ['Unhandled Promise Rejection: ' + (event.reason ? event.reason.message || event.reason : 'Unknown')]);
    });
  })();
</script>
`;

  // Inject CSS
  const styleTag = cssContent ? `<style id="codeforge-injected-styles">\n${cssContent}\n</style>` : '';
  
  // Inject JS
  const scriptTag = jsContent ? `<script id="codeforge-injected-scripts">\ntry {\n${jsContent}\n} catch (e) {\n  console.error(e.message);\n}\n</script>` : '';

  // Clean existing local link rel="stylesheet" referencing user CSS files to avoid 404s
  baseHtml = baseHtml.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>/gi, (match) => {
    // If it's an external CDN link, keep it! If it's local style.css, remove it since we inject it inline
    if (match.includes('http://') || match.includes('https://') || match.includes('//')) {
      return match;
    }
    return '<!-- ' + match + ' (injected inline by CodeForge) -->';
  });

  // Clean existing local script tags referencing user js files to avoid duplicate executions / 404s
  baseHtml = baseHtml.replace(/<script[^>]+src=["'](?!http|https|\/\/)[^"']+["'][^>]*>[\s\S]*?<\/script>/gi, (match) => {
    return '<!-- ' + match + ' (injected inline by CodeForge) -->';
  });

  // Inject into base HTML
  if (baseHtml.includes('</head>')) {
    baseHtml = baseHtml.replace('</head>', `${consoleInterceptor}\n${styleTag}\n</head>`);
  } else if (baseHtml.includes('<html>')) {
    baseHtml = baseHtml.replace('<html>', `<html><head>${consoleInterceptor}\n${styleTag}</head>`);
  } else {
    baseHtml = `<head>${consoleInterceptor}\n${styleTag}</head>${baseHtml}`;
  }

  if (baseHtml.includes('</body>')) {
    baseHtml = baseHtml.replace('</body>', `${scriptTag}\n</body>`);
  } else {
    baseHtml = `${baseHtml}\n${scriptTag}`;
  }

  return baseHtml;
}
