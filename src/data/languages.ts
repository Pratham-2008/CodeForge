import { SupportedLanguage } from '../types';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  extension: string;
  monacoLang: string;
  category: 'web' | 'wasm' | 'backend' | 'markup';
  executionType: 'browser-preview' | 'pyodide' | 'sql-wasm' | 'judge0' | 'preview' | 'lint';
  judge0Id?: number;
  badgeText: string;
  starterCode: string;
}

export const LANGUAGES: LanguageConfig[] = [
  {
    id: 'html',
    name: 'HTML',
    extension: '.html',
    monacoLang: 'html',
    category: 'web',
    executionType: 'browser-preview',
    badgeText: 'Browser Live Preview',
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodeForge HTML Demo</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
    }
    .card {
      background: #1e293b;
      padding: 2.5rem;
      border-radius: 1rem;
      border: 1px solid #334155;
      text-align: center;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    h1 {
      color: #38bdf8;
      margin-bottom: 0.5rem;
    }
    p {
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, World from HTML!</h1>
    <p>Rendered instantaneously in the CodeForge live preview sandbox.</p>
  </div>
</body>
</html>`
  },
  {
    id: 'css',
    name: 'CSS',
    extension: '.css',
    monacoLang: 'css',
    category: 'web',
    executionType: 'browser-preview',
    badgeText: 'Live Styling',
    starterCode: `/* Modern CSS Reset & Card Styling */
:root {
  --primary-color: #38bdf8;
  --bg-dark: #0f172a;
  --card-bg: #1e293b;
}

body {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  background: var(--bg-dark);
  color: #f8fafc;
}

.gradient-button {
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  color: #0f172a;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.gradient-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(56, 189, 248, 0.4);
}`
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    extension: '.js',
    monacoLang: 'javascript',
    category: 'web',
    executionType: 'browser-preview',
    badgeText: 'Browser & Console',
    starterCode: `// CodeForge JavaScript Demo
function greetDeveloper(name = 'Developer') {
  const timestamp = new Date().toLocaleTimeString();
  const message = \`Hello, \${name}! Welcome to CodeForge at \${timestamp}\`;
  
  console.log('🚀 ' + message);
  return message;
}

// Execute demo
greetDeveloper('CodeForge Creator');

const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(n => n * n);
console.log('📊 Computed Squares:', squares);
`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    extension: '.ts',
    monacoLang: 'typescript',
    category: 'web',
    executionType: 'browser-preview',
    badgeText: 'Type Checked',
    starterCode: `// CodeForge TypeScript Demo
interface Developer {
  name: string;
  role: string;
  languages: string[];
  level: number;
}

const developer: Developer = {
  name: 'Ada Lovelace',
  role: 'Software Architect',
  languages: ['TypeScript', 'Python', 'C++'],
  level: 10
};

function formatProfile(dev: Developer): string {
  return \`[\${dev.role}] \${dev.name} (Specializes in \${dev.languages.join(', ')})\`;
}

console.log('✨ Developer Profile:');
console.log(formatProfile(developer));
`
  },
  {
    id: 'python',
    name: 'Python',
    extension: '.py',
    monacoLang: 'python',
    category: 'wasm',
    executionType: 'pyodide',
    badgeText: 'Pyodide WebAssembly',
    starterCode: `# CodeForge Python 3 Runtime (Powered by Pyodide WebAssembly)
import math
import sys

def sieve_of_eratosthenes(limit: int):
    """Computes prime numbers up to limit."""
    primes = [True] * (limit + 1)
    primes[0] = primes[1] = False
    for p in range(2, int(math.isqrt(limit)) + 1):
        if primes[p]:
            for i in range(p * p, limit + 1, p):
                primes[i] = False
    return [p for p in range(2, limit + 1) if primes[p]]

print("=" * 50)
print(f"🐍 Python {sys.version.split()[0]} WebAssembly Runtime")
print("=" * 50)

print("\\n[1] Hello, World from Python!")
prime_numbers = sieve_of_eratosthenes(50)
print(f"Primes up to 50: {prime_numbers}")

# Standard input support demonstration:
# user_name = input("Enter your name: ") if not sys.stdin.isatty() else "Coder"
print("\\n✨ Python script executed successfully in your browser!")
`
  },
  {
    id: 'c',
    name: 'C',
    extension: '.c',
    monacoLang: 'c',
    category: 'backend',
    executionType: 'judge0',
    judge0Id: 50, // C (GCC 9.2.0)
    badgeText: 'Judge0 Sandboxed',
    starterCode: `#include <stdio.h>

int main(void) {
    printf("========================================\\n");
    printf("  Hello, World from C! (GCC 9.2)\\n");
    printf("========================================\\n\\n");

    int numbers[] = {10, 20, 30, 40, 50};
    int count = sizeof(numbers) / sizeof(numbers[0]);
    int sum = 0;

    for (int i = 0; i < count; i++) {
        sum += numbers[i];
    }

    printf("Array items: ");
    for (int i = 0; i < count; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\nSum = %d, Average = %.2f\\n", sum, (float)sum / count);

    return 0;
}
`
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: '.cpp',
    monacoLang: 'cpp',
    category: 'backend',
    executionType: 'judge0',
    judge0Id: 54, // C++ (GCC 9.2.0)
    badgeText: 'Judge0 Sandboxed',
    starterCode: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "  Hello, World from C++! (GCC 9.2)" << std::endl;
    std::cout << "========================================" << std::endl << std::endl;

    std::vector<int> numbers = {5, 2, 9, 1, 7, 6};
    std::sort(numbers.begin(), numbers.end());

    std::cout << "Sorted elements: ";
    for (int num : numbers) {
        std::cout << num << " ";
    }
    std::cout << std::endl;

    int total = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "Sum: " << total << std::endl;

    return 0;
}
`
  },
  {
    id: 'java',
    name: 'Java',
    extension: '.java',
    monacoLang: 'java',
    category: 'backend',
    executionType: 'judge0',
    judge0Id: 62, // Java (OpenJDK 13.0.1)
    badgeText: 'Judge0 Sandboxed',
    starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("  Hello, World from Java! (OpenJDK 13)");
        System.out.println("========================================\\n");

        String[] frameworks = {"Spring Boot", "React", "Docker", "Kubernetes"};
        
        System.out.println("Modern Technology Stack:");
        for (int i = 0; i < frameworks.length; i++) {
            System.out.println("  [" + (i + 1) + "] " + frameworks[i]);
        }

        long memory = Runtime.getRuntime().totalMemory() / (1024 * 1024);
        System.out.println("\\nJVM Total Allocated Memory: " + memory + " MB");
    }
}
`
  },
  {
    id: 'php',
    name: 'PHP',
    extension: '.php',
    monacoLang: 'php',
    category: 'backend',
    executionType: 'judge0',
    judge0Id: 68, // PHP (7.4.1)
    badgeText: 'Judge0 Sandboxed',
    starterCode: `<?php
echo "========================================\\n";
echo "  Hello, World from PHP! (PHP 7.4)\\n";
echo "========================================\\n\\n";

$languages = [
    "JavaScript" => "Client & Server",
    "Python"     => "AI & Data Science",
    "PHP"        => "Web Backends & APIs",
    "Go"         => "Cloud Microservices"
];

echo "Web Ecosystem Overview:\\n";
foreach ($languages as $lang => $desc) {
    echo "  - $lang: $desc\\n";
}

echo "\\nExecution Timestamp: " . date("Y-m-d H:i:s") . "\\n";
`
  },
  {
    id: 'sql',
    name: 'SQL',
    extension: '.sql',
    monacoLang: 'sql',
    category: 'wasm',
    executionType: 'sql-wasm',
    badgeText: 'SQLite WebAssembly',
    starterCode: `-- CodeForge In-Browser SQLite WebAssembly Database
CREATE TABLE developers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    favorite_lang TEXT NOT NULL,
    years_experience INTEGER NOT NULL
);

INSERT INTO developers (name, favorite_lang, years_experience) VALUES
    ('Ada Lovelace', 'Assembly', 10),
    ('Alan Turing', 'C', 15),
    ('Grace Hopper', 'COBOL', 20),
    ('Guido van Rossum', 'Python', 30),
    ('Brendan Eich', 'JavaScript', 25);

-- Query the table:
SELECT * FROM developers WHERE years_experience >= 15 ORDER BY years_experience DESC;
`
  },
  {
    id: 'json',
    name: 'JSON',
    extension: '.json',
    monacoLang: 'json',
    category: 'markup',
    executionType: 'lint',
    badgeText: 'Syntax Validated',
    starterCode: `{
  "projectName": "CodeForge Studio",
  "version": "2.1.0",
  "editorConfig": {
    "engine": "Monaco Editor",
    "languagesSupported": 14,
    "theme": "dark",
    "features": [
      "live-preview",
      "pyodide-python",
      "sqlite-wasm",
      "judge0-backend",
      "offline-persistence"
    ]
  },
  "status": "ready"
}`
  },
  {
    id: 'markdown',
    name: 'Markdown',
    extension: '.md',
    monacoLang: 'markdown',
    category: 'markup',
    executionType: 'preview',
    badgeText: 'Live Formatted',
    starterCode: `# 🚀 CodeForge Documentation Note

Welcome to the **CodeForge Online Code Editor**!

---

## ⚡ Supported Capabilities

- **14 Programming Languages**: Write HTML, CSS, JavaScript, TypeScript, Python, C, C++, Java, PHP, SQL, Go, Rust, JSON, and Markdown.
- **WebAssembly Runtimes**: Pure in-browser Python (Pyodide) and SQLite (sql.js).
- **Judge0 Backend**: Sandboxed native compilation for C, C++, Java, and PHP.

| Language | Runtime Type | Real Execution |
| :--- | :--- | :---: |
| **HTML/CSS/JS** | Sandboxed IFrame | ✅ Live |
| **Python** | Pyodide WASM | ✅ Live |
| **SQL** | SQLite WASM | ✅ Live |
| **C / C++ / Java / PHP** | Judge0 Sandboxed API | ✅ Live |

> *"Code. Create. Run. Repeat."*
`
  },
  {
    id: 'go',
    name: 'Go',
    extension: '.go',
    monacoLang: 'go',
    category: 'backend',
    executionType: 'judge0',
    judge0Id: 60, // Go (1.13.5)
    badgeText: 'Judge0 Sandboxed',
    starterCode: `package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Println("========================================")
    fmt.Println("  Hello, World from Go! (Go 1.13)")
    fmt.Println("========================================")
    fmt.Println()

    numbers := []int{2, 4, 6, 8, 10}
    sum := 0
    for _, num := range numbers {
        sum += num
    }

    fmt.Printf("Slice elements: %v\\n", numbers)
    fmt.Printf("Total Sum = %d\\n", sum)
    fmt.Printf("Current UTC Time: %s\\n", time.Now().UTC().Format(time.RFC1123))
}
`
  },
  {
    id: 'rust',
    name: 'Rust',
    extension: '.rs',
    monacoLang: 'rust',
    category: 'backend',
    executionType: 'judge0',
    judge0Id: 73, // Rust (1.40.0)
    badgeText: 'Judge0 Sandboxed',
    starterCode: `fn main() {
    println!("========================================");
    println!("  Hello, World from Rust! (Rustc 1.40)");
    println!("========================================\\n");

    let items = vec!["Memory Safety", "Zero-Cost Abstractions", "Fearless Concurrency"];

    println!("Core Guarantees of Rust:");
    for (i, item) in items.iter().enumerate() {
        println!("  [{}] {}", i + 1, item);
    }

    let sum: i32 = (1..=10).sum();
    println!("\\nSum of 1 through 10 = {}", sum);
}
`
  }
];

export const LANGUAGE_MAP = new Map<SupportedLanguage, LanguageConfig>(
  LANGUAGES.map(lang => [lang.id, lang])
);

export function getLanguageConfig(lang: SupportedLanguage): LanguageConfig {
  return LANGUAGE_MAP.get(lang) || LANGUAGES[0];
}
