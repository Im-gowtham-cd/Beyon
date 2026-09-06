import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_26_TO_30: Record<string, TopicContent> = {
  'level-26-io-nio-serialization': {
    slug: 'level-26-io-nio-serialization',
    title: 'Level 26: I/O, NIO & Serialization',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Master Byte vs Character streams, Java NIO Non-Blocking Channels, Buffers & Selectors (I/O multiplexing), Java serialization, transient fields, and secure deserialization protocols.`,
    coreConcepts: [
      {
        heading: '1. Traditional I/O vs Java NIO Non-Blocking Architecture',
        description: `How high-concurrency servers handle thousands of client connections:`,
        bulletPoints: [
          'Traditional Blocking I/O: One thread per connection. Threads block on read/write, exhausting memory and OS thread limits at scale.',
          'Java NIO (Non-Blocking): Uses Channels, ByteBuffers, and Selectors (epoll/kqueue). A single worker thread monitors thousands of network sockets simultaneously (I/O Multiplexing).',
          'transient Keyword: Marks fields to be excluded from standard Java object serialization byte streams.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Java NIO Architecture: Channels, Buffers & Non-Blocking Selectors': {
        title: 'Java NIO & I/O Multiplexing',
        conceptSummary: 'NIO allows asynchronous socket handling without thread-per-client scaling bottlenecks (powering Netty and high-performance gateways).',
        keyPoints: ['Use transient to protect sensitive fields from being serialized.'],
        interviewQA: {
          question: 'Why does Netty/NIO scale to millions of concurrent connections while traditional Java I/O fails?',
          answer: 'Traditional I/O requires a dedicated OS thread per socket, leading to thread stack memory exhaustion (1MB per thread) and massive context switching overhead. NIO uses OS kernel event notification (epoll) via Selectors, allowing a small pool of worker threads to multiplex millions of active sockets.'
        }
      }
    }
  },
  'level-27-reflection-annotations': {
    slug: 'level-27-reflection-annotations',
    title: 'Level 27: Reflection & Annotations',
    badge: '₹24+ LPA SDE Architecture',
    overview: `The Reflection API (inspecting metadata, private fields via setAccessible), custom annotation processing, and retention policies (@Retention: SOURCE, CLASS, RUNTIME).`,
    coreConcepts: [
      {
        heading: '1. Annotation Processing & Retention Policies',
        description: `How frameworks like Spring Boot and Hibernate process annotations:`,
        bulletPoints: [
          'RetentionPolicy.SOURCE: Discarded by javac (e.g., @Override, Lombok). Zero runtime memory overhead.',
          'RetentionPolicy.CLASS: Recorded in the .class file but not loaded into JVM memory at runtime.',
          'RetentionPolicy.RUNTIME: Loaded into JVM Metaspace and inspectable via Reflection (e.g., @Autowired, @Entity, @Transactional).'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Annotation Processing & Retention Policies (@Retention: SOURCE, CLASS, RUNTIME)': {
        title: 'Annotation Lifecycles & Retention',
        conceptSummary: 'Only RUNTIME annotations are accessible via reflection during application execution.',
        keyPoints: ['Reflection bypasses compile-time safety and incurs slight performance overhead.'],
        interviewQA: {
          question: 'Why must annotations like @Autowired be marked with @Retention(RetentionPolicy.RUNTIME)?',
          answer: 'Because Spring IoC container inspects bean classes at application startup using the Reflection API to inject dependencies. If the retention was SOURCE or CLASS, the annotation metadata would be discarded before JVM execution.'
        }
      }
    }
  },
  'level-28-jdbc-backend-java': {
    slug: 'level-28-jdbc-backend-java',
    title: 'Level 28: JDBC, Connection Pooling & Transactions',
    badge: '₹24+ LPA SDE Architecture',
    overview: `JDBC architecture, Statement vs PreparedStatement (SQL injection prevention), ACID transactions, setAutoCommit(false), savepoints, batch execution, and HikariCP connection pooling.`,
    coreConcepts: [
      {
        heading: '1. PreparedStatement SQL Injection Mitigation & HikariCP',
        description: `How enterprise Java services interact safely and efficiently with relational databases:`,
        bulletPoints: [
          'PreparedStatement: Precompiles SQL query template; user input parameters are treated strictly as literal data values rather than executable SQL syntax, preventing SQL Injection.',
          'Connection Pooling (HikariCP): Maintains a pool of reusable TCP database connections, eliminating the high latency of opening and closing physical database sockets on every HTTP request.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Statement vs PreparedStatement & SQL Injection Mitigation': {
        title: 'PreparedStatement vs SQL Injection',
        conceptSummary: 'PreparedStatement precompiles SQL and binds parameters securely.',
        keyPoints: ['Always disable auto-commit when executing multi-statement financial transactions.'],
        interviewQA: {
          question: 'How does PreparedStatement prevent SQL injection attacks?',
          answer: 'PreparedStatement compiles the SQL parse tree first on the database engine. User inputs are bound separately as literal values and cannot alter the compiled SQL query structure, preventing malicious injection of quotes or SQL commands.'
        }
      }
    }
  },
  'level-29-design-patterns': {
    slug: 'level-29-design-patterns',
    title: 'Level 29: Enterprise Design Patterns',
    badge: '₹24+ LPA SDE Architecture',
    overview: `GoF Design Patterns in Java: Thread-safe Singleton (Double-Checked Locking with volatile), Factory Method, Builder, Adapter, Decorator, Dynamic Proxy, Observer, and Strategy.`,
    coreConcepts: [
      {
        heading: '1. Thread-Safe Singleton & Double-Checked Locking',
        description: `Why volatile is strictly required in Double-Checked Locking:`,
        bulletPoints: [
          'Without volatile, instruction reordering during object instantiation (1. Allocate memory -> 2. Assign reference -> 3. Initialize fields) allows another thread to observe a non-null but uninitialized object reference.',
          'volatile enforces a memory write barrier, guaranteeing full object initialization before reference exposure.'
        ],
        codeSnippet: {
          title: 'Double-Checked Locking Singleton Pattern',
          language: 'java',
          code: `public class DatabaseConnectionPool {
    // volatile is mandatory to prevent CPU instruction reordering
    private static volatile DatabaseConnectionPool instance;

    private DatabaseConnectionPool() {
        // Prevent reflection instantiation attacks
        if (instance != null) throw new IllegalStateException("Already initialized");
    }

    public static DatabaseConnectionPool getInstance() {
        if (instance == null) { // 1st Check (Avoids synchronization overhead once initialized)
            synchronized (DatabaseConnectionPool.class) {
                if (instance == null) { // 2nd Check (Ensures only one instance created)
                    instance = new DatabaseConnectionPool();
                }
            }
        }
        return instance;
    }
}`,
          explanation: 'Double-checked locking guarantees lazy initialization, high concurrency performance without repeated synchronization, and complete thread safety.'
        }
      }
    ],
    subtopicBreakdowns: {
      'Creational Patterns: Thread-Safe Singleton, Factory Method & Builder': {
        title: 'Thread-Safe Singleton & Creational Patterns',
        conceptSummary: 'Double-checked locking requires volatile; Bill Pugh Holder is an alternative thread-safe lazy approach.',
        keyPoints: ['The Decorator pattern dynamically adds responsibilities without subclass explosion.'],
        interviewQA: {
          question: 'In a double-checked locking Singleton, why MUST the instance field be declared volatile?',
          answer: 'Without volatile, compiler/CPU instruction reordering can assign the memory address to the reference variable BEFORE the constructor finishes executing. A second thread executing the first null check could see a non-null reference and access a partially initialized, corrupted object.'
        }
      }
    }
  },
  'level-30-sde-architecture-best-practices': {
    slug: 'level-30-sde-architecture-best-practices',
    title: 'Level 30: SDE-Level Java Architecture & Best Practices',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Enterprise SDE architecture: SOLID principles, defensive copying, immutability, high-throughput scalability, and modern Java 21+ Virtual Threads (Project Loom).`,
    coreConcepts: [
      {
        heading: '1. Java 21+ Virtual Threads (Project Loom)',
        description: `Solving the high-concurrency thread-per-request scaling bottleneck:`,
        bulletPoints: [
          'Platform Threads (OS Kernel): Heavy (1MB memory stack, expensive OS context switching). Limits concurrency to a few thousand threads.',
          'Virtual Threads (Project Loom): Lightweight user-mode threads managed entirely by the JVM (thousands per MB of heap).',
          'Blocking I/O Unmounting: When a virtual thread executes blocking I/O (e.g. database query, HTTP call), the JVM automatically unmounts it from its carrier OS thread, allowing millions of concurrent tasks on a small carrier thread pool.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Modern Java 21+ Features: Virtual Threads (Project Loom), Pattern Matching & Records': {
        title: 'Java 21 Virtual Threads & Modern Features',
        conceptSummary: 'Virtual threads enable million-thread concurrency without reactive callback complexity.',
        keyPoints: ['Use Virtual Threads for I/O-bound enterprise microservices.'],
        interviewQA: {
          question: 'How do Java 21 Virtual Threads fundamentally change backend service scaling?',
          answer: 'Traditional microservices were limited by OS kernel thread overhead (1MB stack + context switching). Virtual threads are lightweight JVM-managed tasks that unmount from carrier threads on blocking I/O, allowing developers to write simple, synchronous-style code that easily scales to millions of concurrent requests.'
        }
      }
    }
  }
};

