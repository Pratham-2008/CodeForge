import { Project } from '../types';
import { generateId } from '../utils/fileHelpers';

export const STARTER_PROJECTS: Project[] = [
  {
    id: 'starter-web-glass',
    name: 'Modern Glassmorphic App',
    description: 'Interactive counter, reactive card animations, and dynamic gradient effects with HTML5, CSS3, and JavaScript.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    tags: ['HTML', 'CSS', 'JavaScript', 'Glassmorphism'],
    activeFileId: 'file-html-1',
    openFileIds: ['file-html-1', 'file-css-1', 'file-js-1'],
    files: [
      {
        id: 'file-html-1',
        name: 'index.html',
        path: '/index.html',
        language: 'html',
        isFolder: false,
        parentId: null,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CodeForge Live Demo</title>
  <link rel="stylesheet" href="style.css" />
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>
  <div class="blob blob-1"></div>
  <div class="blob blob-2"></div>
  <div class="blob blob-3"></div>

  <div class="app-container">
    <header class="header">
      <div class="badge">
        <span class="pulse"></span> Live In Browser
      </div>
      <h1 class="title">Code<span class="gradient-text">Forge</span> Studio</h1>
      <p class="subtitle">Edit files in the left editor and watch the preview update in real-time!</p>
    </header>

    <div class="card-grid">
      <!-- Counter Card -->
      <div class="glass-card">
        <div class="card-header">
          <i data-lucide="zap" class="card-icon"></i>
          <h3>Interactive Counter</h3>
        </div>
        <p class="card-desc">Stateful DOM updates with interactive audio haptics & ripple effects.</p>
        <div class="counter-display" id="counterValue">0</div>
        <div class="btn-group">
          <button class="btn btn-secondary" id="decrementBtn">-1</button>
          <button class="btn btn-warning" id="resetBtn">Reset</button>
          <button class="btn btn-primary" id="incrementBtn">+1</button>
        </div>
      </div>

      <!-- Quick Action Card -->
      <div class="glass-card">
        <div class="card-header">
          <i data-lucide="terminal" class="card-icon"></i>
          <h3>Console Bridge</h3>
        </div>
        <p class="card-desc">Click below to trigger console logs and inspect them in the Console tab.</p>
        <div class="console-actions">
          <button class="btn btn-outline" id="logInfoBtn">Log Info</button>
          <button class="btn btn-outline" id="logWarnBtn">Log Warning</button>
          <button class="btn btn-outline" id="logErrorBtn">Log Error</button>
        </div>
        <div class="status-box" id="statusMessage">Console bridge active and listening...</div>
      </div>

      <!-- Interactive Theme Card -->
      <div class="glass-card full-width">
        <div class="card-header">
          <i data-lucide="palette" class="card-icon"></i>
          <h3>Dynamic Gradient Generator</h3>
        </div>
        <p class="card-desc">Pick an accent color theme to morph the ambient lighting dynamically:</p>
        <div class="theme-pills">
          <button class="pill-btn active" data-color="cyan">Cyber Cyan</button>
          <button class="pill-btn" data-color="purple">Cosmic Violet</button>
          <button class="pill-btn" data-color="emerald">Aurora Green</button>
          <button class="pill-btn" data-color="sunset">Solar Sunset</button>
        </div>
      </div>
    </div>
  </div>

  <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: 'file-css-1',
        name: 'style.css',
        path: '/style.css',
        language: 'css',
        isFolder: false,
        parentId: null,
        content: `/* CodeForge Premium Glassmorphic Stylesheet */
:root {
  --primary: #38bdf8;
  --secondary: #818cf8;
  --accent: #c084fc;
  --bg-gradient: radial-gradient(circle at 50% 10%, #1e1e38 0%, #0d0f17 100%);
  --card-bg: rgba(255, 255, 255, 0.05);
  --card-border: rgba(255, 255, 255, 0.12);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg-gradient);
  color: var(--text-main);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
}

/* Ambient Blobs */
.blob {
  position: fixed;
  border-radius: 50%;
  filter: blur(90px);
  z-index: 0;
  opacity: 0.45;
  transition: all 0.8s ease;
  pointer-events: none;
}
.blob-1 {
  width: 380px;
  height: 380px;
  background: var(--primary);
  top: -60px;
  left: -80px;
}
.blob-2 {
  width: 320px;
  height: 320px;
  background: var(--secondary);
  bottom: -50px;
  right: -50px;
}
.blob-3 {
  width: 250px;
  height: 250px;
  background: var(--accent);
  top: 40%;
  right: 25%;
}

.app-container {
  position: relative;
  z-index: 1;
  max-width: 860px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 32px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 9999px;
  margin-bottom: 12px;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary), var(--secondary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  color: var(--text-muted);
  font-size: 15px;
}

/* Glass Cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.glass-card {
  background: var(--card-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.25);
}

.glass-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 600;
}

.card-icon {
  width: 22px;
  height: 22px;
  color: var(--primary);
}

.card-desc {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 20px;
}

/* Counter */
.counter-display {
  font-size: 4rem;
  font-weight: 800;
  text-align: center;
  margin: 16px 0 24px 0;
  color: #ffffff;
  text-shadow: 0 0 30px rgba(56, 189, 248, 0.5);
}

.btn-group, .console-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 18px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #38bdf8;
  color: #0f172a;
}
.btn-primary:hover {
  background: #7dd3fc;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
}

.btn-secondary {
  background: #334155;
  color: #f8fafc;
}
.btn-secondary:hover {
  background: #475569;
}

.btn-warning {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.btn-warning:hover {
  background: rgba(239, 68, 68, 0.3);
}

.btn-outline {
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}
.btn-outline:hover {
  background: rgba(255, 255, 255, 0.12);
}

.status-box {
  margin-top: 16px;
  background: rgba(0, 0, 0, 0.3);
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-family: monospace;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Theme Pills */
.theme-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pill-btn {
  padding: 8px 16px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.pill-btn.active {
  background: #38bdf8;
  color: #0b1120;
  font-weight: 600;
  border-color: #38bdf8;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.35);
}
`
      },
      {
        id: 'file-js-1',
        name: 'script.js',
        path: '/script.js',
        language: 'javascript',
        isFolder: false,
        parentId: null,
        content: `// CodeForge Interactive Script
console.log('🚀 CodeForge: Application loaded successfully!');

// Lucide icon replacement
if (window.lucide) {
  lucide.createIcons();
}

// 1. Counter Functionality
let count = 0;
const counterDisplay = document.getElementById('counterValue');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const resetBtn = document.getElementById('resetBtn');

function updateCounter(newVal) {
  count = newVal;
  counterDisplay.textContent = count;
  counterDisplay.style.transform = 'scale(1.15)';
  setTimeout(() => {
    counterDisplay.style.transform = 'scale(1)';
  }, 120);
  console.log(\`Counter updated to: \${count}\`);
}

incrementBtn.addEventListener('click', () => updateCounter(count + 1));
decrementBtn.addEventListener('click', () => updateCounter(count - 1));
resetBtn.addEventListener('click', () => updateCounter(0));

// 2. Console Bridge Buttons
const statusMsg = document.getElementById('statusMessage');
const logInfoBtn = document.getElementById('logInfoBtn');
const logWarnBtn = document.getElementById('logWarnBtn');
const logErrorBtn = document.getElementById('logErrorBtn');

logInfoBtn.addEventListener('click', () => {
  const time = new Date().toLocaleTimeString();
  console.info(\`ℹ️ Info logged from UI at \${time}: System running smoothly\`);
  statusMsg.textContent = \`[Info logged at \${time}]\`;
});

logWarnBtn.addEventListener('click', () => {
  const time = new Date().toLocaleTimeString();
  console.warn(\`⚠️ Warning: Resource usage threshold simulated at \${time}\`);
  statusMsg.textContent = \`[Warning sent at \${time}]\`;
});

logErrorBtn.addEventListener('click', () => {
  const time = new Date().toLocaleTimeString();
  console.error(\`❌ Error: Simulated test exception caught at \${time}\`);
  statusMsg.textContent = \`[Error emitted at \${time}]\`;
});

// 3. Dynamic Ambient Color Themes
const themePills = document.querySelectorAll('.pill-btn');
const root = document.documentElement;

const themes = {
  cyan: { primary: '#38bdf8', secondary: '#818cf8', accent: '#c084fc' },
  purple: { primary: '#c084fc', secondary: '#f472b6', accent: '#fb7185' },
  emerald: { primary: '#34d399', secondary: '#38bdf8', accent: '#a7f3d0' },
  sunset: { primary: '#fb923c', secondary: '#f43f5e', accent: '#e879f9' }
};

themePills.forEach(pill => {
  pill.addEventListener('click', () => {
    themePills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    
    const themeKey = pill.getAttribute('data-color');
    const selected = themes[themeKey];
    if (selected) {
      root.style.setProperty('--primary', selected.primary);
      root.style.setProperty('--secondary', selected.secondary);
      root.style.setProperty('--accent', selected.accent);
      console.log(\`🎨 Ambient theme switched to \${themeKey}\`, selected);
    }
  });
});
`
      }
    ]
  },
  {
    id: 'starter-canvas-galaxy',
    name: 'Canvas Particle Constellation',
    description: 'High-performance interactive 2D HTML5 canvas simulation with dynamic node physics, particle gravity, and mouse collision detection.',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 7200000,
    tags: ['HTML5 Canvas', 'Physics', 'JavaScript', 'Animation'],
    activeFileId: 'file-galaxy-html',
    openFileIds: ['file-galaxy-html', 'file-galaxy-css', 'file-galaxy-js'],
    files: [
      {
        id: 'file-galaxy-html',
        name: 'index.html',
        path: '/index.html',
        language: 'html',
        isFolder: false,
        parentId: null,
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Canvas Particle Constellation</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="hud">
    <h1>Cosmic Particle Matrix</h1>
    <p>Move your cursor across the screen to warp gravitational nodes.</p>
    <div class="controls">
      <button id="addParticlesBtn">+ 50 Particles</button>
      <button id="clearParticlesBtn">Reset Particles</button>
      <span id="particleCount">Particles: 120</span>
    </div>
  </div>
  <canvas id="galaxyCanvas"></canvas>
  <script src="script.js"></script>
</body>
</html>`
      },
      {
        id: 'file-galaxy-css',
        name: 'style.css',
        path: '/style.css',
        language: 'css',
        isFolder: false,
        parentId: null,
        content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #05070f;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

.hud {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 10;
  background: rgba(14, 20, 36, 0.7);
  backdrop-filter: blur(12px);
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  pointer-events: auto;
}

.hud h1 {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #38bdf8, #818cf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}

.hud p {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 12px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

button {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

#particleCount {
  font-size: 0.8rem;
  font-family: monospace;
  color: #38bdf8;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}
`
      },
      {
        id: 'file-galaxy-js',
        name: 'script.js',
        path: '/script.js',
        language: 'javascript',
        isFolder: false,
        parentId: null,
        content: `const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');
const countLabel = document.getElementById('particleCount');
const addBtn = document.getElementById('addParticlesBtn');
const resetBtn = document.getElementById('clearParticlesBtn');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const mouse = { x: null, y: null, radius: 150 };

window.addEventListener('mousemove', (e) => {
  mouse.x = e.x;
  mouse.y = e.y;
});

window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1.5;
    this.vy = (Math.random() - 0.5) * 1.5;
    this.radius = Math.random() * 2 + 1.5;
    this.baseColor = Math.random() > 0.5 ? '#38bdf8' : '#818cf8';
  }

  update() {
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // Mouse gravity repulsion
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        const force = (mouse.radius - distance) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force * 4;
        this.y -= Math.sin(angle) * force * 4;
      }
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.baseColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.baseColor;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

let particles = [];
function init(n = 120) {
  particles = [];
  for (let i = 0; i < n; i++) {
    particles.push(new Particle());
  }
  countLabel.textContent = \`Particles: \${particles.length}\`;
}

function connect() {
  for (let a = 0; a < particles.length; a++) {
    for (let b = a + 1; b < particles.length; b++) {
      const dx = particles[a].x - particles[b].x;
      const dy = particles[a].y - particles[b].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 110) {
        const opacity = 1 - dist / 110;
        ctx.strokeStyle = \`rgba(56, 189, 248, \${opacity * 0.45})\`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[a].x, particles[a].y);
        ctx.lineTo(particles[b].x, particles[b].y);
        ctx.stroke();
      }
    }
  }
}

function animate() {
  ctx.fillStyle = 'rgba(5, 7, 15, 0.25)';
  ctx.fillRect(0, 0, width, height);

  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  connect();
  requestAnimationFrame(animate);
}

init();
animate();

addBtn.addEventListener('click', () => {
  for (let i = 0; i < 50; i++) particles.push(new Particle());
  countLabel.textContent = \`Particles: \${particles.length}\`;
  console.log('Added 50 particles. Total:', particles.length);
});

resetBtn.addEventListener('click', () => {
  init(100);
  console.log('Particles reset to 100.');
});
`
      }
    ]
  },
  {
    id: 'starter-python-algo',
    name: 'Python Algorithmic Playground',
    description: 'Algorithms, benchmark timers, data structures, and formatted output in pure Python.',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 14400000,
    tags: ['Python', 'Algorithms', 'Data Structures'],
    activeFileId: 'file-py-main',
    openFileIds: ['file-py-main', 'file-py-algo'],
    files: [
      {
        id: 'file-py-main',
        name: 'main.py',
        path: '/main.py',
        language: 'python',
        isFolder: false,
        parentId: null,
        content: `import time
import math

def banner():
    print("=" * 50)
    print("   ⚡ CODEFORGE PYTHON ALGORITHM RUNNER ⚡   ")
    print("=" * 50)

def sieve_of_eratosthenes(limit):
    """Finds all prime numbers up to limit."""
    primes = [True] * (limit + 1)
    primes[0] = primes[1] = False
    
    for p in range(2, int(math.isqrt(limit)) + 1):
        if primes[p]:
            for i in range(p * p, limit + 1, p):
                primes[i] = False
                
    return [p for p in range(2, limit + 1) if primes[p]]

def fibonacci(n):
    """Generates first n Fibonacci numbers."""
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

if __name__ == "__main__":
    banner()
    
    print("\\n[1] Calculating Primes up to 100:")
    prime_list = sieve_of_eratosthenes(100)
    print(f"Total primes found: {len(prime_list)}")
    print(f"Primes: {prime_list}")
    
    print("\\n[2] Fibonacci Sequence (First 15 numbers):")
    fib = fibonacci(15)
    print(f"Sequence: {fib}")
    
    print("\\n[3] Performance Benchmark:")
    start = time.perf_counter()
    large_primes = sieve_of_eratosthenes(10000)
    elapsed_ms = (time.perf_counter() - start) * 1000
    print(f"Found {len(large_primes)} primes under 10,000 in {elapsed_ms:.2f} ms")
    
    print("\\n✨ CodeForge Python execution simulation complete!")
`
      },
      {
        id: 'file-py-algo',
        name: 'algorithms.py',
        path: '/algorithms.py',
        language: 'python',
        isFolder: false,
        parentId: null,
        content: `# Additional utility sorting algorithms
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

test_data = [64, 34, 25, 12, 22, 11, 90]
print("Sorted:", quick_sort(test_data))
`
      }
    ]
  },
  {
    id: 'starter-markdown',
    name: 'Markdown Documentation & Notes',
    description: 'Formatted markdown with syntax-highlighted code blocks, tables, task lists, and formatting guides.',
    createdAt: Date.now() - 86400000 * 7,
    updatedAt: Date.now() - 1800000,
    tags: ['Markdown', 'Documentation', 'Notes'],
    activeFileId: 'file-md-readme',
    openFileIds: ['file-md-readme'],
    files: [
      {
        id: 'file-md-readme',
        name: 'README.md',
        path: '/README.md',
        language: 'markdown',
        isFolder: false,
        parentId: null,
        content: `# 🚀 Welcome to CodeForge

CodeForge is a modern, high-performance browser IDE built for developers who want **instant feedback**, **zero setup**, and **full control** over their code.

---

## ⚡ Core Capabilities

- **Monaco Editor Powered**: Built on the exact same engine powering Microsoft Visual Studio Code.
- **14 Programming Languages**: Full syntax highlighting and editor support for HTML, CSS, JavaScript, TypeScript, Python, C, C++, Java, PHP, SQL, Go, Rust, JSON, and Markdown.
- **Instant Live Preview**: Live DOM & CSS rendering with an isolated sandboxed iframe.
- **Pyodide Python 3.12 WebAssembly**: Real in-browser Python execution with math, data structures, and stdin streams.
- **SQLite WebAssembly**: Interactive in-browser relational database query execution and formatted ASCII tables.
- **Judge0 Sandboxed Compiler**: Secure backend integration for C, C++, Java, PHP, Go, and Rust.
- **Integrated Console Bridge**: Captures \`console.log\`, warnings, runtime errors, and compiler outputs in real-time.
- **Full File Management**: Create, rename, delete files and folders with ease.
- **Offline Persistence**: Projects are saved safely in your browser via local storage.
- **Export & Import**: Download your entire project as a \`.zip\` archive or individual files.

---

## 💻 Code Demonstration

Here is an example JavaScript function:

\`\`\`javascript
async function fetchDeveloperData(username) {
  const response = await fetch(\`https://api.github.com/users/\${username}\`);
  const profile = await response.json();
  console.log('Fetched profile:', profile.login);
  return profile;
}
\`\`\`

---

## ⌨️ Useful Keyboard Shortcuts

- \`Ctrl\` + \`S\` : Save active file
- \`Ctrl\` + \`Enter\` : Run code & refresh preview
- \`Ctrl\` + \`B\` : Toggle sidebar file explorer
- \`Ctrl\` + \`F\` : Find & replace in editor
- \`F11\` : Toggle full screen mode

> *"The best code is the code that is written, tested, and iterated in real time."*
`
      }
    ]
  },
  {
    id: 'starter-sql-analytics',
    name: 'SQL Relational Database',
    description: 'In-browser SQLite WebAssembly database with table creation, data seeding, and query result tables.',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
    tags: ['SQL', 'SQLite', 'Database', 'WASM'],
    activeFileId: 'file-sql-queries',
    openFileIds: ['file-sql-queries'],
    files: [
      {
        id: 'file-sql-queries',
        name: 'queries.sql',
        path: '/queries.sql',
        language: 'sql',
        isFolder: false,
        parentId: null,
        content: `-- CodeForge In-Browser SQLite WebAssembly Database
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    salary INTEGER NOT NULL
);

INSERT INTO employees (name, department, salary) VALUES
    ('Alice Smith', 'Engineering', 125000),
    ('Bob Jones', 'Product', 110000),
    ('Carol Davis', 'Design', 95000),
    ('Dan Miller', 'Engineering', 135000),
    ('Eve Wilson', 'Marketing', 88000);

-- Department statistics:
SELECT 
    department, 
    COUNT(*) as total_staff, 
    AVG(salary) as average_salary,
    MAX(salary) as highest_salary
FROM employees 
GROUP BY department 
ORDER BY average_salary DESC;
`
      }
    ]
  },
  {
    id: 'starter-cpp-algorithms',
    name: 'C & C++ Systems Sandbox',
    description: 'Modern C++20 and C algorithmic programs with vector sorting, numerical algorithms, and stdin support.',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 7200000,
    tags: ['C++', 'C', 'Algorithms', 'Judge0'],
    activeFileId: 'file-cpp-main',
    openFileIds: ['file-cpp-main', 'file-c-demo'],
    files: [
      {
        id: 'file-cpp-main',
        name: 'main.cpp',
        path: '/main.cpp',
        language: 'cpp',
        isFolder: false,
        parentId: null,
        content: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "  CodeForge C++ Algorithmic Sandbox" << std::endl;
    std::cout << "========================================" << std::endl << std::endl;

    std::vector<int> scores = {92, 85, 99, 74, 88, 91, 100};
    std::sort(scores.begin(), scores.end(), std::greater<int>());

    std::cout << "Sorted Scores (Descending): ";
    for (int score : scores) {
        std::cout << score << " ";
    }
    std::cout << std::endl;

    double avg = std::accumulate(scores.begin(), scores.end(), 0.0) / scores.size();
    std::cout << "Average Score: " << avg << std::endl;

    return 0;
}
`
      },
      {
        id: 'file-c-demo',
        name: 'demo.c',
        path: '/demo.c',
        language: 'c',
        isFolder: false,
        parentId: null,
        content: `#include <stdio.h>

int main(void) {
    printf("Hello from C in CodeForge!\\n");
    return 0;
}
`
      }
    ]
  }
];
