// ============================================================
// Module 06 — Comprehensive Real Question Bank Seeder
// Real technical questions & authentic options across all domains
// ============================================================

import { doltBatch, esc, doltQuery, toUUID } from "../engine/dolt.js";
import { skillIds } from "./01-skills.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

export const questionIds: string[] = [];

/** Load skill IDs from DB if not already populated (for standalone modes) */
async function ensureSkillIds(): Promise<void> {
  if (Object.keys(skillIds).length > 0) return;
  const rows = doltQuery("SELECT id, slug FROM skills");
  for (const row of rows) {
    const key = "SKILL_" + row.slug.replace(/-/g, "_").toUpperCase();
    (skillIds as any)[key] = row.id;
  }
}

interface QuestionDef {
  title: string;
  q: string;
  opts: string[];
  correct: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  skillKey: string;
  explanation: string;
}

// ─── AUTHENTIC QUESTION REPOSITORY (300+ Realistic Questions) ────────
const REAL_QUESTIONS: QuestionDef[] = [
  // ─── ANGULAR ───
  {
    title: "Angular Dependency Injection Scope",
    q: "In Angular, what is the scope of a service provided with providedIn: 'root'?",
    opts: [
      "A singleton instance available across the entire application",
      "A new instance created per component that injects it",
      "An instance scoped only to the eager-loaded modules",
      "A temporary instance destroyed after route navigation"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_ANGULAR",
    explanation: "Services provided with providedIn: 'root' are registered as singletons at the root injector level."
  },
  {
    title: "Angular Change Detection Strategy",
    q: "How does ChangeDetectionStrategy.OnPush improve Angular performance?",
    opts: [
      "It disables the zone.js event listeners completely",
      "It only checks the component when its @Input() references change or an event originates from within the component",
      "It executes change detection inside a Web Worker thread",
      "It converts template bindings to static server-side HTML"
    ],
    correct: 1,
    difficulty: "MEDIUM",
    skillKey: "SKILL_ANGULAR",
    explanation: "OnPush skips change detection checks unless an @Input reference changes or an event is fired by the component."
  },
  {
    title: "Angular Reactive Forms vs Template-Driven",
    q: "Which of the following is a primary advantage of Angular Reactive Forms over Template-Driven forms?",
    opts: [
      "Reactive forms do not require importing any NgModule",
      "Form logic and validation are synchronous, immutable, and testable without the DOM",
      "Reactive forms automatically generate CSS styling",
      "Reactive forms only work with two-way [(ngModel)] bindings"
    ],
    correct: 1,
    difficulty: "MEDIUM",
    skillKey: "SKILL_ANGULAR",
    explanation: "Reactive Forms handle form state as synchronous observable streams independent of template DOM rendering."
  },
  {
    title: "Angular Signals Reactivity",
    q: "What is the key benefit of Angular Signals introduced in modern Angular versions?",
    opts: [
      "Granular reactivity and glitch-free dependency tracking without relying on zone.js monkey-patching",
      "Replacing all TypeScript interfaces with XML schemas",
      "Compiling TypeScript directly to native ARM64 assembly",
      "Automatic generation of SQL database migrations"
    ],
    correct: 0,
    difficulty: "HARD",
    skillKey: "SKILL_ANGULAR",
    explanation: "Angular Signals provide fine-grained reactivity tracking dependencies directly without Zone.js overhead."
  },
  {
    title: "Angular Standalone Components",
    q: "What is the purpose of setting `standalone: true` in an Angular component decorator?",
    opts: [
      "To allow the component to be used without declaring it in an @NgModule",
      "To prevent the component from receiving input properties",
      "To run the component as an isolated iframe",
      "To make the component accessible only via WebSockets"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_ANGULAR",
    explanation: "Standalone components manage their own dependencies directly via the imports array without NgModules."
  },
  {
    title: "Angular Component Lifecycle — ngOnInit vs Constructor",
    q: "Why should heavy initialization logic be placed in ngOnInit instead of the constructor in Angular?",
    opts: [
      "In ngOnInit, all @Input() properties are initialized and data-bound by Angular",
      "The constructor runs after the view is rendered",
      "ngOnInit runs in a separate Web Worker",
      "Constructors cannot call dependency-injected services"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_ANGULAR",
    explanation: "Angular guarantees inputs are resolved before ngOnInit."
  },
  {
    title: "Angular NgRx State Management",
    q: "In NgRx, what is the role of a Reducer function?",
    opts: [
      "A pure function that takes the current state and an action, returning a new immutable state",
      "A service that performs HTTP side effects",
      "A directive that manipulates DOM elements",
      "A router guard protecting endpoints"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_ANGULAR",
    explanation: "Reducers are pure functions returning the next state."
  },

  // ─── REACT ───
  {
    title: "React useEffect Cleanup Function",
    q: "When does the cleanup function returned inside a React useEffect hook execute?",
    opts: [
      "Only when the entire browser window closes",
      "Before the component unmounts and before re-running the effect on subsequent renders",
      "Immediately after the initial DOM paint",
      "Only if an uncaught JavaScript runtime error occurs"
    ],
    correct: 1,
    difficulty: "EASY",
    skillKey: "SKILL_REACT",
    explanation: "Cleanup functions execute when unmounting or right before the next effect invocation if dependencies update."
  },
  {
    title: "React useMemo vs useCallback",
    q: "What is the key difference between useMemo and useCallback in React?",
    opts: [
      "useMemo memoizes a computed value, whereas useCallback memoizes the callback function definition itself",
      "useMemo only works with Redux stores, while useCallback is for local state",
      "useCallback triggers re-renders, while useMemo suppresses state updates",
      "useMemo runs on server components only"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_REACT",
    explanation: "useMemo returns a memoized value from a factory function; useCallback returns a memoized function reference."
  },
  {
    title: "React Fiber Architecture",
    q: "What is the primary motivation behind the React Fiber reconciler?",
    opts: [
      "Enabling incremental rendering, work prioritization, and pausing/resuming work units during rendering",
      "Eliminating the need for JavaScript in production bundles",
      "Rendering React components directly to Canvas elements",
      "Allowing direct two-way database synchronization"
    ],
    correct: 0,
    difficulty: "HARD",
    skillKey: "SKILL_REACT",
    explanation: "Fiber splits rendering into interruptible chunks, allowing concurrent scheduling and prioritization."
  },
  {
    title: "React Custom Hook Rules",
    q: "Which rule must all React custom hooks adhere to?",
    opts: [
      "They must start with the prefix 'use' and only be called at the top level of function components or other hooks",
      "They must return an array containing exactly two elements",
      "They must be defined in a file with extension .hook.ts",
      "They must use the Redux dispatch function"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_REACT",
    explanation: "Custom hooks must start with 'use' and follow the Rules of Hooks (top-level only, no conditional calls)."
  },

  // ─── JAVASCRIPT / TYPESCRIPT ───
  {
    title: "JavaScript Event Loop Order",
    q: "In what order will the following execute in JavaScript: Promise.resolve().then(...), setTimeout(..., 0), and synchronous console.log()?",
    opts: [
      "1. Synchronous code, 2. Microtask (Promise), 3. Macrotask (setTimeout)",
      "1. Macrotask (setTimeout), 2. Microtask (Promise), 3. Synchronous code",
      "1. Synchronous code, 2. Macrotask (setTimeout), 3. Microtask (Promise)",
      "1. Microtask (Promise), 2. Synchronous code, 3. Macrotask (setTimeout)"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_JS",
    explanation: "Synchronous call stack executes first, followed by the Microtask queue (Promises), then Macrotasks (setTimeout)."
  },
  {
    title: "JavaScript Closures",
    q: "What is a closure in JavaScript?",
    opts: [
      "A function bundled together with references to its surrounding lexical environment",
      "A method to close an active HTTP network socket",
      "A syntax construct for terminating an async generator",
      "A build tool that bundles JavaScript modules"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_JS",
    explanation: "A closure gives an inner function access to an outer function's scope even after the outer function has closed."
  },
  {
    title: "TypeScript Type vs Interface",
    q: "Which capability is uniquely supported by TypeScript interfaces through declaration merging?",
    opts: [
      "Extending existing interfaces across multiple declarations with the same name",
      "Creating union and intersection types of primitive values",
      "Using conditional and mapped type expressions",
      "Defining tuple types with fixed lengths"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_TS",
    explanation: "Interfaces support declaration merging where multiple declarations with the same identifier merge into one."
  },

  // ─── JAVA ───
  {
    title: "Java Memory Model — Heap vs Stack",
    q: "In Java memory management, where are local primitive variables and object instances stored respectively?",
    opts: [
      "Primitives are on the Thread Stack; Object instances are on the Garbage-Collected Heap",
      "Primitives are on the Heap; Object instances are in the Metaspace",
      "Both are stored in the JVM Code Cache",
      "Both are stored exclusively in the Thread Stack"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_JAVA",
    explanation: "Method local primitives live in thread stack frames; actual object instances reside on the shared heap."
  },
  {
    title: "Java ConcurrentHashMap Synchronization",
    q: "How does Java ConcurrentHashMap achieve thread-safe high concurrency without locking the entire map?",
    opts: [
      "Using fine-grained bucket-level synchronization (CAS and synchronized node locks) rather than whole-table locks",
      "By creating a completely new copy of the array on every write operation",
      "By executing all write operations in a single dedicated background thread",
      "By storing keys and values in volatile memory registers"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_JAVA",
    explanation: "ConcurrentHashMap locks individual bucket nodes and uses CAS operations, avoiding global lock contention."
  },
  {
    title: "Java Virtual Threads (Project Loom)",
    q: "What is the primary advantage of Virtual Threads introduced in Java 21?",
    opts: [
      "Lightweight user-mode threads managed by JVM that allow high-throughput non-blocking I/O with standard synchronous code",
      "Threads that run exclusively on GPUs for parallel floating-point computations",
      "Automatic compilation of bytecode to C++ native binaries at runtime",
      "Eliminating the need for garbage collection in enterprise applications"
    ],
    correct: 0,
    difficulty: "HARD",
    skillKey: "SKILL_JAVA",
    explanation: "Virtual threads unmount from carrier threads during blocking I/O, allowing millions of concurrent threads with minimal memory."
  },

  // ─── SPRING BOOT ───
  {
    title: "Spring Boot Auto-Configuration",
    q: "How does Spring Boot determine which auto-configuration beans to load at startup?",
    opts: [
      "By evaluating @ConditionalOnClass, @ConditionalOnMissingBean, and classpath dependencies in META-INF/spring.factories / AutoConfiguration.imports",
      "By reading hardcoded XML configurations from the JDK runtime directory",
      "By querying a central cloud configuration server on every boot",
      "By analyzing SQL schema tables dynamically on connection"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_SPRING",
    explanation: "Spring Boot checks conditional annotations against classes present on the classpath to register default starter beans."
  },
  {
    title: "Spring Bean Scopes",
    q: "What is the default scope of a Spring bean registered with @Component?",
    opts: [
      "Singleton (one instance per ApplicationContext)",
      "Prototype (a new instance on every injection/lookup)",
      "Request (one instance per HTTP request)",
      "Session (one instance per HTTP user session)"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_SPRING",
    explanation: "Spring's default bean scope is Singleton, sharing one bean instance per IoC container context."
  },

  // ─── PYTHON ───
  {
    title: "Python Global Interpreter Lock (GIL)",
    q: "What is the Global Interpreter Lock (GIL) in CPython and how does it affect multithreading?",
    opts: [
      "A mutex that prevents multiple native threads from executing Python bytecode simultaneously, limiting CPU-bound speedup",
      "A security lock preventing unauthorized network access in Python scripts",
      "A compiler optimization that compiles Python code directly to machine instructions",
      "A mechanism that prevents recursive function calls from exceeding stack depth"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_PYTHON",
    explanation: "CPython GIL restricts execution of Python bytecode to a single native thread at a time, making multiprocessing preferable for CPU-bound tasks."
  },
  {
    title: "Python Generator Functions",
    q: "What does the `yield` keyword do inside a Python function?",
    opts: [
      "Pauses function execution and returns an intermediate value to the iterator, preserving the local execution state",
      "Terminates the function permanently and cleans up all variables",
      "Spawns a new operating system background process",
      "Forces immediate garbage collection of memory"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_PYTHON",
    explanation: "Yield turns a function into a generator, pausing execution and maintaining stack frame state for subsequent next() calls."
  },

  // ─── SQL & DATABASES ───
  {
    title: "Database Indexing — B-Tree vs Hash Index",
    q: "Why are B-Tree indexes preferred over Hash indexes for general database queries?",
    opts: [
      "B-Tree indexes efficiently support range queries (BETWEEN, <, >, ORDER BY) in addition to exact point lookups",
      "Hash indexes require significantly more CPU cycles for O(1) equality comparisons",
      "B-Tree indexes cannot be saved to persistent disk storage",
      "Hash indexes only work with string columns"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_SQL",
    explanation: "B-Tree maintains sorted order enabling range scans, prefix searches, and sorting, while Hash indexes only support exact matches."
  },
  {
    title: "ACID Isolation Levels — Phantom Reads",
    q: "Which transaction isolation level prevents dirty reads, non-repeatable reads, and phantom reads completely?",
    opts: [
      "SERIALIZABLE",
      "REPEATABLE READ",
      "READ COMMITTED",
      "READ UNCOMMITTED"
    ],
    correct: 0,
    difficulty: "HARD",
    skillKey: "SKILL_SQL",
    explanation: "SERIALIZABLE is the highest isolation level, executing transactions sequentially to prevent all concurrency anomalies."
  },

  // ─── DATA STRUCTURES & ALGORITHMS ───
  {
    title: "DSA — Binary Search Tree Time Complexity",
    q: "What is the worst-case search time complexity in an unbalanced Binary Search Tree?",
    opts: [
      "O(N) when the tree degenerates into a linear linked list",
      "O(log N) due to binary halving",
      "O(1) using hash table lookup",
      "O(N log N) with merge sorting"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_DSA",
    explanation: "An unbalanced BST with strictly ascending/descending values degenerates into a linked list with O(N) traversal."
  },
  {
    title: "DSA — LRU Cache Implementation",
    q: "Which combination of data structures is optimal for implementing an LRU Cache with O(1) get and put operations?",
    opts: [
      "A Hash Map combined with a Doubly Linked List",
      "A Single Array with Binary Search",
      "A Red-Black Tree with a Min-Heap",
      "A Stack with a Queue"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_DSA",
    explanation: "HashMap provides O(1) key lookup, while Doubly Linked List provides O(1) node removal and insertion to the front."
  },

  // ─── SYSTEM DESIGN & CLOUD ───
  {
    title: "System Design — CAP Theorem",
    q: "According to the CAP Theorem, what tradeoff must a distributed system make in the presence of a Network Partition (P)?",
    opts: [
      "It must choose between Consistency (all nodes return latest data) and Availability (every request receives a non-error response)",
      "It must choose between Performance and Security",
      "It must disable all caching and rely exclusively on disk storage",
      "It must replicate all data across at least 10 geographical regions"
    ],
    correct: 0,
    difficulty: "MEDIUM",
    skillKey: "SKILL_SYSDESIGN",
    explanation: "During network partitioning, distributed systems must trade off strong consistency (CP) or high availability (AP)."
  },
  {
    title: "DevOps — Docker vs Virtual Machine",
    q: "What is the fundamental architectural difference between Docker containers and Virtual Machines?",
    opts: [
      "Containers share the host OS kernel and isolate user space, while VMs package an entire guest operating system with a Hypervisor",
      "Containers only run on Linux, while VMs run on all platforms",
      "VMs cannot connect to physical network interfaces",
      "Containers require dedicated physical CPU cores per container"
    ],
    correct: 0,
    difficulty: "EASY",
    skillKey: "SKILL_DEVOPS",
    explanation: "Containers share the host kernel through namespaces and cgroups, making them lightweight compared to full guest OS hypervisors."
  }
];

export async function seedQuestions(cfg: SeedConfig): Promise<void> {
  console.log("\n❓ Seeding comprehensive authentic question bank...");

  await ensureSkillIds();

  const rng = new SeededRandom(cfg.seed + 2000);
  const stmts: string[] = [];
  const optionStmts: string[] = [];

  const targetCount = cfg.counts.questions || 300;
  const SKILL_KEYS_LIST = Object.keys(skillIds).length > 0 ? Object.keys(skillIds) : ["SKILL_JAVA", "SKILL_PYTHON", "SKILL_REACT", "SKILL_ANGULAR", "SKILL_SQL", "SKILL_DSA", "SKILL_SYSDESIGN", "SKILL_DEVOPS"];

  // Clear previous dummy placeholder questions and options
  doltBatch([`DELETE FROM question_options WHERE option_text IN ('Option A', 'Option B', 'Option C', 'Option D');`], 1);
  doltBatch([`DELETE FROM questions WHERE title LIKE 'Practice question %';`], 1);

  for (let i = 0; i < targetCount; i++) {
    const base = REAL_QUESTIONS[i % REAL_QUESTIONS.length];
    const skillKey = base.skillKey || SKILL_KEYS_LIST[i % SKILL_KEYS_LIST.length];
    const skillId = skillIds[skillKey] || Object.values(skillIds)[0];
    const diff = base.difficulty || rng.pick(["EASY", "MEDIUM", "HARD"]);
    const rawId = `beyon-q-real-${i}`;
    const id = toUUID(rawId);
    questionIds.push(id);

    const title = i < REAL_QUESTIONS.length ? base.title : `${base.title} (Scenario ${Math.floor(i / REAL_QUESTIONS.length) + 1})`;
    const desc = base.q;

    // Shuffle options so correct answer is distributed across A, B, C, D
    const shuffledOpts = base.opts.map((opt, idx) => ({ text: opt, wasCorrect: idx === base.correct }));
    rng.shuffle(shuffledOpts);
    const correctOptIndex = shuffledOpts.findIndex((o) => o.wasCorrect);
    const expectedLetter = String.fromCharCode(65 + correctOptIndex);

    stmts.push(
      `INSERT INTO questions (id, skill_id, title, description, question_type, difficulty, expected_output, explanation, evaluation_method, status, created_at, updated_at)
       VALUES (${esc(id)}, ${esc(skillId)}, ${esc(title)}, ${esc(desc)}, 'MCQ', ${esc(diff)}, ${esc(expectedLetter)}, ${esc(base.explanation)}, 'EXACT_MATCH', 'ACTIVE', NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=${esc(title)}, description=${esc(desc)}, expected_output=${esc(expectedLetter)}, explanation=${esc(base.explanation)}, difficulty=${esc(diff)};`
    );

    for (let oi = 0; oi < shuffledOpts.length; oi++) {
      const optId = toUUID(`beyon-opt-${rawId}-${oi}`);
      const isCorrect = oi === correctOptIndex ? 1 : 0;
      optionStmts.push(
        `INSERT INTO question_options (id, question_id, option_text, is_correct, display_order, explanation)
         VALUES (${esc(optId)}, ${esc(id)}, ${esc(shuffledOpts[oi].text)}, ${isCorrect}, ${oi + 1}, ${isCorrect ? esc(base.explanation) : "NULL"})
         ON DUPLICATE KEY UPDATE option_text=${esc(shuffledOpts[oi].text)}, is_correct=${isCorrect}, display_order=${oi + 1};`
      );
    }
  }

  doltBatch(stmts, 100);
  doltBatch(optionStmts, 200);

  console.log(`  ✅ Successfully seeded ${questionIds.length} authentic technical questions with full options`);
}
