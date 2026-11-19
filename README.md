# CodeForge – Online Code Editor & Live Development Studio

A modern, responsive, industrial-grade browser IDE inspired by VS Code, Replit, and CodePen. Write, edit, execute, and preview code directly in your browser with zero setup.

![CodeForge Studio](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80)

---

## ⚡ Key Capabilities

### 1. Monaco Code Editor
- Engine used by Microsoft Visual Studio Code.
- Syntax highlighting, auto-completion, line numbers, error highlighting, code folding, find & replace, multi-cursor, and automatic code formatting.
- Customizable themes (CodeForge Dark, CodeForge Light, High Contrast Black, GitHub Dark, Dracula, Monokai).
- Adjustable typography, font size (11px–24px), tab indentation size (2, 4, 8 spaces), and word wrapping.

### 2. VS Code-Style File Explorer
- Full hierarchical tree with custom icons for HTML, CSS, JavaScript, TypeScript, Python, Markdown, JSON, C/C++, and Java.
- Create, rename, delete files and nested folders.
- Organize project files, multi-tab switching, and unsaved changes dirty indicators.
- Quick boilerplate generator (`index.html`, `style.css`, `script.js`).

### 3. Live Sandboxed Execution & Preview
- Real-time HTML5, CSS3, and JavaScript preview in an isolated sandboxed iframe (`srcdoc` isolation).
- Bi-directional Console Bridge: Intercepts `console.log`, `console.info`, `console.warn`, `console.error`, and uncaught runtime errors.
- Device viewport simulation: Responsive (100%), Tablet (768px), and Mobile (375px).
- External popout preview in new browser tab.
- Interactive JavaScript REPL console to evaluate expressions dynamically in the preview context.

### 4. Multi-Language Runtimes & Architecture
- **Web Stacks (HTML, CSS, JS, TS)**: Browser-native execution with real-time DOM rendering and styles.
- **Python**: In-browser algorithmic execution and standard output stream.
- **Markdown**: Live formatted markdown documentation rendering.
- **Compiled Languages (C, C++, Java)**: Architecture-ready compiler interface ready for backend integration (e.g., Piston API or Docker sandbox).

### 5. Project Persistence & Portability
- Browser local storage & IndexedDB persistence — no login required.
- Export full project as a standard `.zip` archive.
- Import existing `.zip` projects with complete folder hierarchy.
- Duplicate, rename, and delete projects.
- Sample starter projects included:
  1. *Modern Glassmorphic App* (Counter, reactive cards, audio haptics)
  2. *Canvas Particle Constellation* (Interactive 2D physics simulation)
  3. *Python Algorithmic Playground* (Primes sieve, benchmarks, Fibonacci)
  4. *Markdown Documentation Notebook* (Formatting guide and cheat sheet)

---

## 🛠️ Technology Stack

- **Frontend**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor (`@monaco-editor/react`)
- **Icons**: Lucide React
- **ZIP Archiving**: JSZip
- **Bundler / Server**: Vite 5

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn

### Installation
```bash
# Clone or navigate to the project directory
cd codeforge

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Description |
| :--- | :--- |
| `Ctrl` + `Enter` | Run project & refresh live preview |
| `Ctrl` + `S` | Save all active files to local storage |
| `Ctrl` + `B` | Toggle sidebar file explorer |
| `Ctrl` + `K` | Open keyboard shortcuts cheatsheet |
| `Ctrl` + `F` | Find and replace within active file |
| `Shift` + `Alt` + `F` | Format document |
| `F11` | Toggle full screen mode |

---

## 📦 Deployment

### Deploy to Vercel
```bash
npx vercel
```

### Deploy to Netlify
```bash
npx netlify deploy --prod --dir=dist
```

---

## 📄 License
MIT License. Free for personal and commercial development.
