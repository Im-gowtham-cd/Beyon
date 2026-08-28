import mysql from "mysql2/promise";
import crypto from "crypto";

function toUUID(str: string): string {
  const hash = crypto.createHash("md5").update(str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`.toLowerCase();
}

interface QuestionDef {
  skillSlug: string;
  title: string;
  description: string;
  type: "MCQ" | "SQL" | "CODING";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  explanation?: string;
  options?: { text: string; correct: boolean }[];
  expectedOutput?: string;
  codeTemplate?: string;
}

const REAL_QUESTIONS: QuestionDef[] = [
  // ─── Computer Networks (CN) ───
  {
    skillSlug: "networking",
    title: "TCP Handshake Sequence",
    description: "Which packet sequence correctly represents the standard TCP three-way connection establishment handshake between client and server?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "TCP uses SYN from client, SYN-ACK from server, and final ACK from client to establish a reliable full-duplex connection.",
    options: [
      { text: "SYN -> SYN-ACK -> ACK", correct: true },
      { text: "ACK -> SYN -> SYN-ACK", correct: false },
      { text: "SYN -> ACK -> FIN", correct: false },
      { text: "PING -> PONG -> ACK", correct: false }
    ]
  },
  {
    skillSlug: "networking",
    title: "OSI Layer for IP Addressing & Routing",
    description: "At which layer of the OSI 7-layer reference model does logical IP addressing and packet routing occur?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "The Network Layer (Layer 3) handles logical addressing (IPv4/IPv6) and routing decisions across networks.",
    options: [
      { text: "Layer 3 — Network Layer", correct: true },
      { text: "Layer 2 — Data Link Layer", correct: false },
      { text: "Layer 4 — Transport Layer", correct: false },
      { text: "Layer 7 — Application Layer", correct: false }
    ]
  },
  {
    skillSlug: "networking",
    title: "DNS Resolution Protocol & Port",
    description: "What default transport protocol and port number are typically used for standard DNS lookups by resolvers?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Standard DNS queries use UDP on port 53 for fast, low-overhead name resolution. TCP is used when response exceeds 512 bytes or during zone transfers.",
    options: [
      { text: "UDP port 53", correct: true },
      { text: "TCP port 80", correct: false },
      { text: "UDP port 67", correct: false },
      { text: "TCP port 443", correct: false }
    ]
  },
  {
    skillSlug: "networking",
    title: "TCP vs UDP Reliability Characteristics",
    description: "Which statement accurately contrasts TCP and UDP transmission semantics?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "TCP guarantees ordered, loss-free delivery with flow & congestion control, while UDP prioritizes minimal latency with no delivery guarantees.",
    options: [
      { text: "TCP provides ordered, guaranteed byte-stream delivery with congestion control, while UDP is connectionless with no retransmission overhead.", correct: true },
      { text: "UDP includes automatic flow control and windowing, whereas TCP does not.", correct: false },
      { text: "TCP is connectionless and operates only on local broadcast domains.", correct: false },
      { text: "UDP creates a virtual circuit before sending datagrams.", correct: false }
    ]
  },
  {
    skillSlug: "networking",
    title: "Subnet Mask Usable Host Calculation",
    description: "Given a /26 CIDR subnet block (e.g., 192.168.1.0/26), how many usable IPv4 host addresses are available in this subnet?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "A /26 subnet has 32 - 26 = 6 host bits. 2^6 = 64 total addresses minus network and broadcast addresses = 62 usable hosts.",
    options: [
      { text: "62 usable host addresses", correct: true },
      { text: "64 usable host addresses", correct: false },
      { text: "30 usable host addresses", correct: false },
      { text: "126 usable host addresses", correct: false }
    ]
  },
  {
    skillSlug: "networking",
    title: "HTTP/2 Multiplexing Mechanism",
    description: "What key enhancement allows HTTP/2 to prevent Head-of-Line (HoL) blocking at the application layer compared to HTTP/1.1?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "HTTP/2 introduces binary framing and stream multiplexing over a single TCP connection, allowing concurrent requests/responses without sequential queuing.",
    options: [
      { text: "Binary framing layer allowing multiple concurrent streams over a single TCP connection", correct: true },
      { text: "Opening 6 parallel TCP sockets per origin domain", correct: false },
      { text: "Switching exclusively to UDP datagram transport", correct: false },
      { text: "Compressing HTTP payloads using gzip only", correct: false }
    ]
  },

  // ─── Database Systems & SQL ───
  {
    skillSlug: "sqlite",
    title: "ACID Properties: Atomicity Definition",
    description: "What does the 'Atomicity' property in relational database transactions guarantee?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "Atomicity ensures that all operations in a transaction either completely succeed or are entirely rolled back with no partial effects.",
    options: [
      { text: "All operations within a transaction succeed together or all fail completely ('all or nothing')", correct: true },
      { text: "Transactions execute concurrently without interfering with one another", correct: false },
      { text: "Data is committed directly to non-volatile storage immediately", correct: false },
      { text: "Database constraints are preserved after commit", correct: false }
    ]
  },
  {
    skillSlug: "sqlite",
    title: "Third Normal Form (3NF) Requirements",
    description: "A relational table is considered in Third Normal Form (3NF) if it is in 2NF and:",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "3NF requires no transitive functional dependencies of non-prime attributes on candidate keys.",
    options: [
      { text: "Every non-prime attribute is non-transitively dependent on every candidate key", correct: true },
      { text: "All columns contain only atomic values", correct: false },
      { text: "Every determinant is a primary key", correct: false },
      { text: "It contains no multi-valued dependencies", correct: false }
    ]
  },
  {
    skillSlug: "sqlite",
    title: "B+ Tree Index Internal Node Structure",
    description: "Why do relational database engines preferentially use B+ Trees over standard Binary Search Trees (BST) for disk-backed indexing?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "B+ Trees have high fan-out (reducing tree height and disk I/O) and linked leaf nodes for ultra-fast sequential range scans.",
    options: [
      { text: "High fan-out minimizes disk block reads, and leaf node linked pointers allow rapid range scans", correct: true },
      { text: "B+ Trees store all actual table row data inside internal routing nodes", correct: false },
      { text: "B+ Trees guarantee O(1) worst-case single-key lookups", correct: false },
      { text: "Binary search trees consume less memory on disk", correct: false }
    ]
  },
  {
    skillSlug: "sqlite",
    title: "Query to Find Department with Highest Total Salary",
    description: "Given table `employees(id, name, department_id, salary)`, write a query to find the department_id with the highest aggregate salary.",
    type: "SQL",
    difficulty: "MEDIUM",
    explanation: "Aggregate salaries with SUM(salary) grouped by department_id, order descending, and limit 1.",
    expectedOutput: "SELECT department_id, SUM(salary) AS total_salary FROM employees GROUP BY department_id ORDER BY total_salary DESC LIMIT 1;"
  },

  // ─── Data Structures & Algorithms (DSA) ───
  {
    skillSlug: "datastructures",
    title: "Balanced BST Lookup Time Complexity",
    description: "What is the worst-case time complexity of searching for an element in a balanced Red-Black Tree or AVL Tree containing N elements?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "Balanced binary search trees maintain height bounded by O(log N), giving O(log N) worst-case search, insertion, and deletion.",
    options: [
      { text: "O(log N)", correct: true },
      { text: "O(N)", correct: false },
      { text: "O(1)", correct: false },
      { text: "O(N log N)", correct: false }
    ]
  },
  {
    skillSlug: "datastructures",
    title: "Dijkstra Algorithm Priority Queue Complexity",
    description: "When implemented using an adjacency list and a min-binary heap priority queue, what is the asymptotic runtime of Dijkstra's single-source shortest path algorithm for graph G(V, E)?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "Each vertex extraction takes O(log V) and each edge relaxation takes O(log V), yielding O((V + E) log V).",
    options: [
      { text: "O((V + E) log V)", correct: true },
      { text: "O(V²)", correct: false },
      { text: "O(V * E)", correct: false },
      { text: "O(V + E)", correct: false }
    ]
  },
  {
    skillSlug: "datastructures",
    title: "Hash Collision Resolution via Open Addressing",
    description: "Which collision resolution technique probes sequential slots in the hash table array with a fixed step size until an empty slot is found?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Linear probing is an open addressing scheme that searches h(k) + i mod TableSize for consecutive values of i.",
    options: [
      { text: "Linear Probing", correct: true },
      { text: "Separate Chaining", correct: false },
      { text: "Cuckoo Hashing", correct: false },
      { text: "Consistent Hashing", correct: false }
    ]
  },
  {
    skillSlug: "datastructures",
    title: "Two Sum Target Indices",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume each input has exactly one solution.",
    type: "CODING",
    difficulty: "EASY",
    codeTemplate: "function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}"
  },

  // ─── Java & Spring Boot ───
  {
    skillSlug: "java",
    title: "Java Memory Model: Stack vs Heap",
    description: "In the Java Virtual Machine (JVM) runtime memory architecture, where are local primitive variables and method frames stored?",
    type: "MCQ",
    difficulty: "EASY",
    explanation: "Thread-specific Call Stacks store method execution frames and primitive local variables. Objects reside on the Garbage-Collected Heap.",
    options: [
      { text: "Call Stack (Thread Stack)", correct: true },
      { text: "Garbage Collected Heap", correct: false },
      { text: "Metaspace / Method Area", correct: false },
      { text: "Native Memory Buffer", correct: false }
    ]
  },
  {
    skillSlug: "java",
    title: "Java ConcurrentHashMap Synchronization Granularity",
    description: "How does Java's `ConcurrentHashMap` achieve high throughput for concurrent reads and writes compared to `Hashtable`?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "In Java 8+, ConcurrentHashMap uses lock-free volatile reads via CAS for empty bins and synchronized locks on individual bucket node heads rather than locking the entire map.",
    options: [
      { text: "Per-bucket synchronized lock stripping and CAS operations without locking the whole table", correct: true },
      { text: "Global table-level read-write mutex", correct: false },
      { text: "ThreadLocal cloning of internal table arrays", correct: false },
      { text: "Synchronized blocks around all get() and put() methods", correct: false }
    ]
  },

  // ─── Operating Systems (OS) ───
  {
    skillSlug: "linux",
    title: "Coffman Conditions for System Deadlock",
    description: "Which of the following is NOT one of the four necessary Coffman conditions required for a system deadlock to occur?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "Preemption PREVENTS deadlock. The 4 Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
    options: [
      { text: "Preemption Allowed", correct: true },
      { text: "Mutual Exclusion", correct: false },
      { text: "Hold and Wait", correct: false },
      { text: "Circular Wait", correct: false }
    ]
  },
  {
    skillSlug: "linux",
    title: "Virtual Memory Page Fault Handling",
    description: "When a process attempts to access a virtual memory address whose page table entry has the present bit set to 0, what hardware event occurs?",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "The Memory Management Unit (MMU) raises a Page Fault hardware interrupt, causing the OS kernel to load the page from disk swap/backing store into RAM.",
    options: [
      { text: "Page Fault Interrupt to the OS Kernel", correct: true },
      { text: "Process Termination with SIGSEGV immediately", correct: false },
      { text: "TLB Flush without kernel intervention", correct: false },
      { text: "Cache Coherency Invalidation", correct: false }
    ]
  },

  // ─── System Design & Cloud ───
  {
    skillSlug: "system-design",
    title: "CAP Theorem Trade-Offs",
    description: "According to Eric Brewer's CAP Theorem, in the presence of a Network Partition (P), a distributed data store must choose between:",
    type: "MCQ",
    difficulty: "MEDIUM",
    explanation: "When network partitions occur, distributed systems must trade off between returning the latest consistent data (Consistency) vs guaranteeing every non-failing node returns a response (Availability).",
    options: [
      { text: "Consistency (C) vs Availability (A)", correct: true },
      { text: "Performance (P) vs Scalability (S)", correct: false },
      { text: "Durability (D) vs Latency (L)", correct: false },
      { text: "Atomicity (A) vs Isolation (I)", correct: false }
    ]
  },
  {
    skillSlug: "system-design",
    title: "Consistent Hashing Node Ring Benefit",
    description: "What primary operational benefit does Consistent Hashing provide when scaling a distributed caching tier (e.g., Memcached / Redis clusters)?",
    type: "MCQ",
    difficulty: "HARD",
    explanation: "Consistent Hashing ensures that when a node is added or removed, only K/N keys need remapping on average (where K is total keys and N is nodes), preventing massive cache churn.",
    options: [
      { text: "Adding or removing cache nodes requires remapping only O(K/N) keys instead of almost all keys", correct: true },
      { text: "It converts all hash keys into sorted cryptographic signatures", correct: false },
      { text: "It guarantees zero network latency between nodes", correct: false },
      { text: "It replaces primary-replica replication topologies", correct: false }
    ]
  }
];

async function main() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    database: "beyon",
  });

  console.log("Cleaning up dummy placeholder questions...");
  // Delete options and attempts for generic placeholder questions
  const [dummyQs] = await conn.query(
    "SELECT id FROM questions WHERE title LIKE 'Practice question %: Which of the following best describes%' OR title LIKE 'Practice question %';"
  ) as any[];

  console.log(`Found ${dummyQs.length} dummy questions to replace.`);
  if (dummyQs.length > 0) {
    const ids = dummyQs.map((q: any) => `'${q.id}'`).join(",");
    await conn.query(`DELETE FROM question_options WHERE question_id IN (${ids});`);
    await conn.query(`DELETE FROM student_question_attempts WHERE question_id IN (${ids});`);
    await conn.query(`DELETE FROM daily_challenges WHERE question_id IN (${ids});`);
    await conn.query(`DELETE FROM questions WHERE id IN (${ids});`);
  }

  // Fetch skill map
  const [skills] = await conn.query("SELECT id, slug FROM skills;") as any[];
  const skillMap: Record<string, string> = {};
  for (const s of skills) {
    skillMap[s.slug] = s.id;
  }
  const defaultSkillId = skills[0]?.id;

  console.log("Seeding authentic domain questions with rich options & explanations...");
  let insertedCount = 0;
  let firstQId = "";

  for (let i = 0; i < REAL_QUESTIONS.length; i++) {
    const q = REAL_QUESTIONS[i];
    const skillId = skillMap[q.skillSlug] || defaultSkillId;
    const qId = toUUID(`beyon-curated-q-${i}-${q.title}`);
    if (!firstQId) firstQId = qId;

    await conn.query(
      `INSERT INTO questions (id, skill_id, title, description, question_type, difficulty, expected_output, code_template, explanation, evaluation_method, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'EXACT_MATCH', 'ACTIVE', NOW(), NOW())
       ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), explanation=VALUES(explanation);`,
      [
        qId,
        skillId,
        q.title,
        q.description,
        q.type,
        q.difficulty,
        q.expectedOutput || null,
        q.codeTemplate || null,
        q.explanation || null,
      ]
    );

    if (q.options) {
      // Remove old options for this question
      await conn.query("DELETE FROM question_options WHERE question_id = ?;", [qId]);
      for (let oi = 0; oi < q.options.length; oi++) {
        const opt = q.options[oi];
        const optId = toUUID(`beyon-curated-opt-${qId}-${oi}`);
        await conn.query(
          `INSERT INTO question_options (id, question_id, option_text, is_correct, display_order)
           VALUES (?, ?, ?, ?, ?);`,
          [optId, qId, opt.text, opt.correct ? 1 : 0, oi + 1]
        );
      }
    }
    insertedCount++;
  }

  console.log(`✅ Seeded ${insertedCount} authentic curated questions.`);

  // Update Today's Daily Challenge
  const today = new Date().toISOString().slice(0, 10);
  console.log(`Configuring Today's Daily Challenge for date: ${today}`);
  const [users] = await conn.query("SELECT id FROM users LIMIT 10;") as any[];
  for (const u of users) {
    const dcId = toUUID(`daily-challenge-${u.id}-${today}`);
    await conn.query(
      `INSERT INTO daily_challenges (id, student_id, challenge_date, question_id, status, is_correct, created_at)
       VALUES (?, ?, ?, ?, 'ACTIVE', 0, NOW())
       ON DUPLICATE KEY UPDATE question_id = VALUES(question_id), status = 'ACTIVE';`,
      [dcId, u.id, today, firstQId]
    );
  }
  console.log("✅ Daily challenges updated for active users.");

  const [totalQ] = await conn.query("SELECT count(*) as count FROM questions;") as any[];
  const [totalOpt] = await conn.query("SELECT count(*) as count FROM question_options;") as any[];
  console.log(`Total questions in DB: ${totalQ[0].count}, Total options in DB: ${totalOpt[0].count}`);

  await conn.end();
  process.exit(0);
}

main().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
