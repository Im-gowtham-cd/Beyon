// ============================================================
// Module 06 — Question Bank Seeder
// Creates MCQ, SQL, and coding questions
// ============================================================

import { doltBatch, esc, escNum, doltQuery } from "../engine/dolt.js";
import { skillIds, skillTopicIds } from "./01-skills.js";
import { SeededRandom } from "../utils/faker.js";
import type { SeedConfig } from "../config.js";

export const questionIds: string[] = [];

/** Load skill IDs from DB if not already populated (for standalone modes) */
async function ensureSkillIds(): Promise<void> {
  if (Object.keys(skillIds).length > 0) return;
  const rows = doltQuery("SELECT id, slug FROM skills WHERE id LIKE 'beyon-skill-%'");
  for (const row of rows) {
    const key = "SKILL_" + row.slug.replace(/-/g, "_").toUpperCase();
    (skillIds as any)[key] = row.id;
  }
}

const DIFFICULTIES = ["EASY", "EASY", "MEDIUM", "MEDIUM", "HARD", "EXPERT"] as const;
const QUESTION_TYPES = ["MCQ", "MULTI_SELECT", "TRUE_FALSE", "SQL", "CODING", "OUTPUT_PREDICTION"] as const;

// ─── MCQ Templates per skill ─────────────────────────────────
const MCQ_TEMPLATES: Record<string, { q: string; opts: string[]; correct: number }[]> = {
  SKILL_JAVA: [
    { q: "What is the default value of an int variable in Java?", opts: ["0", "null", "undefined", "1"], correct: 0 },
    { q: "Which keyword is used to prevent method overriding in Java?", opts: ["static", "final", "private", "abstract"], correct: 1 },
    { q: "What is the parent class of all Java classes?", opts: ["Object", "Class", "Root", "Base"], correct: 0 },
    { q: "Which collection maintains insertion order and allows duplicates?", opts: ["HashSet", "TreeSet", "ArrayList", "HashMap"], correct: 2 },
    { q: "What does JVM stand for?", opts: ["Java Virtual Machine", "Java Verified Module", "Java Version Manager", "Java Variable Method"], correct: 0 },
    { q: "Which access modifier makes a member visible only within the same class?", opts: ["public", "protected", "private", "package"], correct: 2 },
    { q: "What is the output of: System.out.println(10 / 3)?", opts: ["3.33", "3", "3.0", "4"], correct: 1 },
    { q: "Which interface must be implemented to make an object sortable?", opts: ["Comparable", "Comparator", "Iterable", "Sortable"], correct: 0 },
  ],
  SKILL_PYTHON: [
    { q: "What is the output of: type([])?", opts: ["<class 'list'>", "<class 'array'>", "list", "Array"], correct: 0 },
    { q: "Which keyword is used to define a generator in Python?", opts: ["return", "yield", "generate", "create"], correct: 1 },
    { q: "What does PEP 8 define?", opts: ["Python performance standards", "Python style guide", "Python error handling", "Python version 8"], correct: 1 },
    { q: "Which data structure is immutable in Python?", opts: ["list", "dict", "set", "tuple"], correct: 3 },
    { q: "What is the output of: print(2 ** 10)?", opts: ["20", "1024", "20.0", "2048"], correct: 1 },
  ],
  SKILL_DSA: [
    { q: "What is the time complexity of binary search?", opts: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct: 1 },
    { q: "Which data structure uses LIFO (Last In First Out)?", opts: ["Queue", "Stack", "Deque", "Array"], correct: 1 },
    { q: "What is the worst case time complexity of QuickSort?", opts: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"], correct: 1 },
    { q: "Which traversal visits root first, then left, then right?", opts: ["Inorder", "Preorder", "Postorder", "Level order"], correct: 1 },
    { q: "What is the space complexity of merge sort?", opts: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 2 },
    { q: "Which algorithm is used to find the shortest path in a weighted graph?", opts: ["BFS", "DFS", "Dijkstra", "Kruskal"], correct: 2 },
  ],
  SKILL_SQL: [
    { q: "Which SQL clause filters rows after grouping?", opts: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], correct: 1 },
    { q: "What does INNER JOIN return?", opts: ["All rows from both tables", "Only matching rows from both tables", "Rows from the left table", "Rows from the right table"], correct: 1 },
    { q: "Which function returns the number of rows?", opts: ["SUM()", "MAX()", "COUNT()", "AVG()"], correct: 2 },
    { q: "What does DISTINCT do in a SELECT statement?", opts: ["Filters NULL values", "Returns unique values", "Sorts results", "Limits results"], correct: 1 },
    { q: "Which JOIN returns all rows from the left table even if no match?", opts: ["INNER JOIN", "RIGHT JOIN", "LEFT JOIN", "FULL JOIN"], correct: 2 },
  ],
  SKILL_SPRING: [
    { q: "Which annotation marks a class as a REST controller in Spring?", opts: ["@Controller", "@RestController", "@Service", "@Component"], correct: 1 },
    { q: "What does @Autowired do in Spring?", opts: ["Marks a method as transactional", "Injects dependencies automatically", "Creates a new bean", "Starts the application"], correct: 1 },
    { q: "Which Spring annotation is used for transaction management?", opts: ["@Autowired", "@Service", "@Transactional", "@Repository"], correct: 2 },
  ],
};

const SQL_QUESTIONS = [
  { title: "Find all employees with salary > 50000", q: "Given a table 'employees(id, name, salary, department)', write a query to find all employees whose salary is greater than 50000.", ans: "SELECT * FROM employees WHERE salary > 50000;" },
  { title: "Count employees per department", q: "Write a query to count the number of employees in each department from the employees table.", ans: "SELECT department, COUNT(*) as count FROM employees GROUP BY department;" },
  { title: "Top 5 highest paid employees", q: "Write a query to retrieve the top 5 highest-paid employees.", ans: "SELECT * FROM employees ORDER BY salary DESC LIMIT 5;" },
  { title: "Find departments with avg salary > 60000", q: "Write a query to find departments where the average salary is greater than 60000.", ans: "SELECT department, AVG(salary) as avg_sal FROM employees GROUP BY department HAVING AVG(salary) > 60000;" },
  { title: "Self join to find employees and managers", q: "Given employees(id, name, manager_id), write a query to list each employee with their manager's name.", ans: "SELECT e.name as employee, m.name as manager FROM employees e LEFT JOIN employees m ON e.manager_id = m.id;" },
  { title: "Second highest salary", q: "Write a query to find the second highest salary in the employees table.", ans: "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);" },
  { title: "Students who never attended class", q: "Given tables students(id, name) and attendance(student_id, date), find students who have never attended.", ans: "SELECT s.* FROM students s LEFT JOIN attendance a ON s.id = a.student_id WHERE a.student_id IS NULL;" },
  { title: "Running total of sales", q: "Given sales(id, amount, sale_date), write a query to compute the running total of sales ordered by date.", ans: "SELECT id, amount, SUM(amount) OVER (ORDER BY sale_date) as running_total FROM sales;" },
  { title: "Monthly revenue using DATE_FORMAT", q: "Given orders(id, total, created_at), write a query for monthly revenue.", ans: "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(total) as revenue FROM orders GROUP BY month ORDER BY month;" },
  { title: "CTE: recursive hierarchy", q: "Write a CTE to find all subordinates of manager with id = 1.", ans: "WITH RECURSIVE sub AS (SELECT id, name, manager_id FROM employees WHERE id=1 UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN sub s ON e.manager_id = s.id) SELECT * FROM sub;" },
];

const CODING_QUESTIONS = [
  { title: "Two Sum", desc: "Given an array of integers and a target, return indices of the two numbers that add up to the target.", difficulty: "EASY", skillKey: "SKILL_DSA" },
  { title: "Reverse a String", desc: "Write a function that reverses a given string.", difficulty: "EASY", skillKey: "SKILL_DSA" },
  { title: "Fibonacci Series", desc: "Write a function to return the nth Fibonacci number.", difficulty: "EASY", skillKey: "SKILL_DSA" },
  { title: "Check Palindrome", desc: "Write a function to check if a given string is a palindrome.", difficulty: "EASY", skillKey: "SKILL_DSA" },
  { title: "Find Duplicate in Array", desc: "Given an array of n+1 integers between 1 and n, find the duplicate.", difficulty: "MEDIUM", skillKey: "SKILL_DSA" },
  { title: "Longest Substring Without Repeating Characters", desc: "Find the length of the longest substring without repeating characters.", difficulty: "MEDIUM", skillKey: "SKILL_DSA" },
  { title: "Merge Two Sorted Lists", desc: "Merge two sorted linked lists and return as a new sorted list.", difficulty: "MEDIUM", skillKey: "SKILL_DSA" },
  { title: "Binary Tree Level Order Traversal", desc: "Given a binary tree, return level order traversal of its node values.", difficulty: "MEDIUM", skillKey: "SKILL_DSA" },
  { title: "Valid Parentheses", desc: "Given a string of brackets, determine if the input is valid.", difficulty: "EASY", skillKey: "SKILL_DSA" },
  { title: "Maximum Subarray (Kadane's)", desc: "Find the contiguous subarray with the largest sum.", difficulty: "MEDIUM", skillKey: "SKILL_DSA" },
  { title: "Implement Stack using Queues", desc: "Implement a stack using only queue operations.", difficulty: "MEDIUM", skillKey: "SKILL_DSA" },
  { title: "Word Search in Matrix", desc: "Given an m×n grid and a word, find if the word exists in the grid.", difficulty: "HARD", skillKey: "SKILL_DSA" },
  { title: "Coin Change Problem", desc: "Find the minimum number of coins to make a given amount.", difficulty: "MEDIUM", skillKey: "SKILL_DSA" },
  { title: "Longest Common Subsequence", desc: "Find the length of the longest common subsequence of two strings.", difficulty: "HARD", skillKey: "SKILL_DSA" },
  { title: "Implement a LRU Cache", desc: "Design a data structure that follows the LRU cache eviction policy.", difficulty: "HARD", skillKey: "SKILL_DSA" },
  { title: "Java: Reverse Linked List", desc: "Reverse a singly linked list in Java.", difficulty: "EASY", skillKey: "SKILL_JAVA" },
  { title: "Python: Flatten Nested List", desc: "Write a Python function to flatten a nested list.", difficulty: "MEDIUM", skillKey: "SKILL_PYTHON" },
  { title: "Java: Producer-Consumer", desc: "Implement producer-consumer using Java threads and synchronized blocks.", difficulty: "HARD", skillKey: "SKILL_JAVA" },
  { title: "Python: Count Word Frequency", desc: "Write a function that counts the frequency of each word in a given text.", difficulty: "EASY", skillKey: "SKILL_PYTHON" },
  { title: "JavaScript: Debounce Function", desc: "Implement a debounce function in JavaScript.", difficulty: "MEDIUM", skillKey: "SKILL_JS" },
];

export async function seedQuestions(cfg: SeedConfig): Promise<void> {
  console.log("\n❓ Seeding question bank...");

  await ensureSkillIds();

  const rng = new SeededRandom(cfg.seed + 2000);
  const stmts: string[] = [];
  const optionStmts: string[] = [];

  // ─── MCQ Questions ───
  let mcqCount = 0;
  for (const [skillKey, templates] of Object.entries(MCQ_TEMPLATES)) {
    const skillId = skillIds[skillKey];
    if (!skillId) continue;
    for (const tmpl of templates) {
      const id = `beyon-q-mcq-${skillKey}-${mcqCount}`;
      questionIds.push(id);
      stmts.push(
        `INSERT IGNORE INTO questions (id, skill_id, title, description, question_type, difficulty, evaluation_method, status, created_at, updated_at)
         VALUES (${esc(id)}, ${esc(skillId)}, ${esc(tmpl.q)}, ${esc(tmpl.q)}, 'MCQ', 'EASY', 'EXACT_MATCH', 'ACTIVE', NOW(), NOW());`
      );
      // Options
      for (let oi = 0; oi < tmpl.opts.length; oi++) {
        const optId = `beyon-opt-${id}-${oi}`;
        const isCorrect = oi === tmpl.correct ? 1 : 0;
        optionStmts.push(
          `INSERT IGNORE INTO question_options (id, question_id, option_text, is_correct, display_order)
           VALUES (${esc(optId)}, ${esc(id)}, ${esc(tmpl.opts[oi])}, ${isCorrect}, ${oi + 1});`
        );
      }
      mcqCount++;
    }
  }

  // ─── SQL Questions ───
  let sqlCount = 0;
  const sqlSkillId = skillIds["SKILL_SQL"];
  for (const sq of SQL_QUESTIONS) {
    const id = `beyon-q-sql-${sqlCount}`;
    questionIds.push(id);
    stmts.push(
      `INSERT IGNORE INTO questions (id, skill_id, title, description, question_type, difficulty, expected_output, evaluation_method, status, created_at, updated_at)
       VALUES (${esc(id)}, ${esc(sqlSkillId)}, ${esc(sq.title)}, ${esc(sq.q)}, 'SQL', 'MEDIUM', ${esc(sq.ans)}, 'EXACT_MATCH', 'ACTIVE', NOW(), NOW());`
    );
    sqlCount++;
  }

  // ─── Coding Questions ───
  let codingCount = 0;
  for (const cq of CODING_QUESTIONS) {
    const skillId = skillIds[cq.skillKey];
    if (!skillId) continue;
    const id = `beyon-q-coding-${codingCount}`;
    questionIds.push(id);
    stmts.push(
      `INSERT IGNORE INTO questions (id, skill_id, title, description, question_type, difficulty, evaluation_method, status, created_at, updated_at)
       VALUES (${esc(id)}, ${esc(skillId)}, ${esc(cq.title)}, ${esc(cq.desc)}, 'CODING', ${esc(cq.difficulty)}, 'TEST_CASE', 'ACTIVE', NOW(), NOW());`
    );
    codingCount++;
  }

  // ─── Generated MCQ padding (up to cfg.counts.questions) ───
  const SKILL_KEYS_LIST = Object.keys(skillIds);
  let genCount = 0;
  const target = Math.max(0, cfg.counts.questions - (mcqCount + sqlCount + codingCount));
  for (let i = 0; i < target; i++) {
    const skillKey = SKILL_KEYS_LIST[i % SKILL_KEYS_LIST.length];
    const skillId = skillIds[skillKey];
    if (!skillId) continue;
    const diff = rng.pick(["EASY", "EASY", "MEDIUM", "MEDIUM", "HARD"]);
    const id = `beyon-q-gen-${i}`;
    questionIds.push(id);
    const qText = `Practice question ${i + 1}: Which of the following best describes a concept in ${skillKey.replace("SKILL_", "")}?`;
    stmts.push(
      `INSERT IGNORE INTO questions (id, skill_id, title, description, question_type, difficulty, evaluation_method, status, created_at, updated_at)
       VALUES (${esc(id)}, ${esc(skillId)}, ${esc(qText)}, ${esc(qText)}, 'MCQ', ${esc(diff)}, 'EXACT_MATCH', 'ACTIVE', NOW(), NOW());`
    );
    for (let oi = 0; oi < 4; oi++) {
      const optId = `beyon-opt-${id}-${oi}`;
      optionStmts.push(
        `INSERT IGNORE INTO question_options (id, question_id, option_text, is_correct, display_order)
         VALUES (${esc(optId)}, ${esc(id)}, ${esc(`Option ${String.fromCharCode(65 + oi)}`)}, ${oi === 0 ? 1 : 0}, ${oi + 1});`
      );
    }
    genCount++;
  }

  doltBatch(stmts, 100);
  doltBatch(optionStmts, 200);

  console.log(`  ✅ ${mcqCount} MCQ questions`);
  console.log(`  ✅ ${sqlCount} SQL questions`);
  console.log(`  ✅ ${codingCount} coding questions`);
  console.log(`  ✅ ${genCount} generated fill questions`);
  console.log(`  ✅ Total: ${questionIds.length} questions`);
}
