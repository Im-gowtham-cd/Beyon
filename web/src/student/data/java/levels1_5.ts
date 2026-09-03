import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_1_TO_5: Record<string, TopicContent> = {
  'level-1-java-fundamentals': {
    slug: 'level-1-java-fundamentals',
    title: 'Level 1: Java Fundamentals',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Java is a high-level, class-based, object-oriented language developed by Sun Microsystems (now Oracle) to build platform-independent, enterprise-grade distributed systems. Rather than compiling directly to OS-specific machine instructions like C/C++, Java compiles to platform-neutral bytecode executed by the Java Virtual Machine (JVM).`,
    coreConcepts: [
      {
        heading: '1. Why was Java Created? (The Portability & Memory Bottleneck)',
        description: `In the early 1990s, C and C++ generated machine code tightly coupled to a specific CPU architecture and OS. A binary compiled for Windows x86 failed on Unix or macOS. Developers had to maintain separate builds and manually manage memory with malloc/free, leading to dangling pointers and buffer overflow security vulnerabilities.`,
        bulletPoints: [
          'Problem: High porting costs, OS-specific recompilations, and memory corruption bugs in C/C++.',
          'Solution: Introduce an intermediate bytecode (.class) and a Virtual Machine (JVM) tailored for each target OS.',
          'Execution Flow: Java Source (.java) -> javac Compiler -> Bytecode (.class) -> JVM -> OS Native Machine Code.',
          'Crucial Distinction: Java code and bytecode are platform independent; the JVM itself is platform dependent.'
        ],
        codeSnippet: {
          title: 'Compilation & Disassembly Workflow',
          language: 'bash',
          code: `# 1. Compile source to platform-neutral bytecode
javac HelloWorld.java
# Produces: HelloWorld.class (Magic number: 0xCAFEBABE)

# 2. Launch platform JVM
java HelloWorld

# 3. Disassemble bytecode to inspect operand stack instructions
javap -c -v HelloWorld.class`,
          explanation: 'The compiler translates syntax into stack-based bytecode instructions. The JVM loads the bytecode and converts hot paths into native machine code via JIT.'
        }
      },
      {
        heading: '2. Why Java is Both Compiled and Interpreted (Two-Tier Execution)',
        description: `Java combines rapid startup with native execution speed using a hybrid execution pipeline:`,
        bulletPoints: [
          'Ahead-of-Time Bytecode Compilation: javac performs syntax, semantic, and type checking, generating standard .class bytecode.',
          'JVM Interpretation: On startup, the interpreter translates bytecode instruction-by-instruction for instant execution.',
          'HotSpot JIT Dynamic Compilation: JIT monitors method invocation counters. Frequently executed "hot spots" are compiled directly into native CPU machine instructions and cached in the Code Cache.',
          'Tiered Compilation (C1/C2): C1 (Client Compiler) compiles fast with lightweight optimizations; C2 (Server Compiler) performs aggressive optimizations like loop unrolling, escape analysis, and method inlining.'
        ]
      },
      {
        heading: '3. Object-Oriented Purity & The 8 Primitive Types Tradeoff',
        description: `Java is NOT 100% purely object-oriented because it retains 8 primitive data types (byte, short, int, long, float, double, char, boolean) for raw hardware execution speed and memory compactness.`,
        bulletPoints: [
          'Performance Rationale: Primitive variables store raw binary values directly on the thread Stack frame without object header overhead (12-16 bytes on 64-bit JVMs) or pointer dereferencing delays.',
          'Autoboxing Overhead: Converting between int and Integer incurs heap allocation and GC pressure in high-throughput loops.'
        ],
        codeSnippet: {
          title: 'Memory Overhead: Primitives vs Wrapper Objects',
          language: 'java',
          code: `public class MemoryTradeoff {
    public static void main(String[] args) {
        // Primitive: 4 bytes on Stack, 0 header overhead
        int primitiveCount = 1000;

        // Wrapper Object: 24 bytes on Heap (12-byte header + 4-byte payload + 8-byte padding)
        Integer objectCount = Integer.valueOf(1000);

        System.out.println("Primitive: " + primitiveCount + " | Wrapper: " + objectCount);
    }
}`,
          explanation: 'Primitives eliminate pointer indirection and heap metadata, allowing hardware CPUs to execute arithmetic operations in single-cycle register instructions.'
        }
      }
    ],
    comparisons: {
      title: 'Architectural Comparison: Java vs C vs C++',
      headers: ['Feature', 'Java', 'C', 'C++'],
      rows: [
        ['Platform Independence', 'Yes (JVM + Bytecode)', 'No (Native Machine Code)', 'No (Native Machine Code)'],
        ['Memory Management', 'Automatic (Garbage Collection)', 'Manual (malloc / free)', 'Manual (new / delete) & RAII'],
        ['Pointer Arithmetic', 'Not Supported (Safe References)', 'Fully Supported (Raw Pointers)', 'Fully Supported'],
        ['Multiple Inheritance', 'Interfaces Only (No Diamond Problem)', 'None (Procedural)', 'Yes (Multiple Class Inheritance)'],
        ['Runtime Safety', 'Bytecode Verifier & Array Bounds', 'No Runtime Bounds Check', 'No Runtime Bounds Check']
      ]
    },
    subtopicBreakdowns: {
      'What is Java & Why Was It Created?': {
        title: 'What is Java & Why Was It Created?',
        conceptSummary: 'Created by James Gosling at Sun Microsystems (1995) to solve the portability and memory corruption problems of C/C++ by compiling to an intermediate bytecode executed on a virtual machine.',
        keyPoints: [
          'Eliminates OS-specific recompilations for distributed enterprise backends.',
          'Replaces manual memory management with automated Garbage Collection.',
          'Enforces security via bytecode verification and memory sandboxing.'
        ],
        interviewQA: {
          question: 'Why did Sun Microsystems invent Java when C++ already dominated the industry?',
          answer: 'C++ programs compiled directly to platform-specific machine code, requiring separate codebases/builds per OS. Furthermore, manual memory management (malloc/free) and raw pointer arithmetic caused severe memory leaks, dangling pointers, and buffer overflows. Java solved this with bytecode, the JVM, automatic GC, and type-safe references.'
        }
      },
      'Main Architectural Features of Java': {
        title: 'Main Architectural Features of Java',
        conceptSummary: 'The core tenets: Simple, Object-Oriented, Distributed, Multithreaded, Robust, Secure, Architecture-Neutral, Portable, High-Performance (JIT), and Dynamic.',
        keyPoints: [
          'Architecture-Neutral: Fixed primitive sizes across all OS architectures (int is always 32 bits).',
          'Robust: Strong type checking at compile time and runtime boundary enforcement.',
          'Dynamic: Classes and libraries can be dynamically linked and loaded at runtime via ClassLoaders.'
        ],
        interviewQA: {
          question: 'What makes Java architecture-neutral compared to C/C++?',
          answer: 'In C/C++, primitive sizes vary by compiler and CPU architecture (e.g., int can be 16, 32, or 64 bits). In Java, data type specifications are fixed across all machines (int is strictly 32-bit two\'s complement, char is 16-bit UTF-16), ensuring deterministic cross-platform behavior.'
        }
      },
      'Why Java is Platform Independent (WORA)': {
        title: 'Why Java is Platform Independent (WORA)',
        conceptSummary: 'The Java compiler produces platform-neutral bytecode (.class) targeting the JVM rather than physical hardware. Any machine with a compatible JVM can execute this bytecode without recompilation.',
        keyPoints: [
          'Java source and bytecode are platform independent.',
          'The JVM itself is platform dependent (tailored for Windows, Linux, macOS).',
          'The JVM translates bytecode instructions to native CPU instructions at runtime.'
        ],
        interviewQA: {
          question: 'Is Java 100% platform independent? Explain the trap.',
          answer: 'No. The compiled bytecode is platform independent, but the JVM implementation is platform dependent because it must directly interface with the host OS kernel and native CPU instruction set.'
        }
      },
      'Is Java Purely Object-Oriented? (8 Primitives)': {
        title: 'Is Java Purely Object-Oriented? (8 Primitives)',
        conceptSummary: 'Java is not a pure OOP language because it supports 8 primitive types that do not inherit from java.lang.Object.',
        keyPoints: [
          'Pure OOP requires all entities to be objects (e.g., Smalltalk).',
          'Primitives exist for high-speed computation and low memory footprint.',
          'Wrapper classes provide object representations when needed by collections.'
        ],
        interviewQA: {
          question: 'Why did Java retain primitive types instead of making everything an object?',
          answer: 'For raw computational performance and memory efficiency. Primitive variables store values directly on the thread stack frame (4 bytes for int), whereas an Integer object requires 16-24 bytes on the heap, causes cache misses, and triggers Garbage Collection overhead.'
        }
      },
      'Why Java is Both Compiled and Interpreted': {
        title: 'Why Java is Both Compiled and Interpreted',
        conceptSummary: 'Java uses Ahead-of-Time compilation (javac -> bytecode) followed by JVM interpretation and HotSpot JIT native compilation at runtime.',
        keyPoints: [
          'javac compiles source to bytecode.',
          'JVM interpreter allows fast initial application boot.',
          'HotSpot JIT compiler optimizes hot execution paths into native machine code.'
        ],
        interviewQA: {
          question: 'How does the JVM achieve near-native execution performance despite being bytecode-interpreted?',
          answer: 'Through Tiered JIT Compilation. The JVM profiles execution at runtime. When a method exceeds invocation thresholds (hot spots), the JIT compiler compiles the bytecode directly into optimized native machine code with aggressive optimizations like method inlining and escape analysis.'
        }
      },
      'Bytecode & The .class Binary Format': {
        title: 'Bytecode & The .class Binary Format',
        conceptSummary: 'A binary format starting with magic number 0xCAFEBABE containing Constant Pool, access flags, field/method metadata, and stack-based JVM instructions.',
        keyPoints: [
          'Magic Number: 0xCAFEBABE validates JVM binary integrity.',
          'Stack-based execution: Bytecode instructions push/pop operands on the operand stack.',
          'Inspectable using javap -c -v.'
        ],
        interviewQA: {
          question: 'What is the internal structure of a .class file?',
          answer: 'It begins with magic number 0xCAFEBABE, followed by minor/major versions, Constant Pool (literals, method references), access flags, this_class, super_class, interfaces table, fields table, methods table (containing bytecode attribute arrays), and class attributes.'
        }
      },
      'Compilation Lifecycle (javac vs java command)': {
        title: 'Compilation Lifecycle (javac vs java command)',
        conceptSummary: 'javac parses and validates source code into bytecode; java launches the JVM, loads classes, verifies bytecode, and runs public static void main.',
        keyPoints: [
          'javac: Lexical analysis -> Syntax parsing -> AST -> Type Checking -> Bytecode generation.',
          'java: JVM initialization -> Bootstrap/App ClassLoaders -> Bytecode Verifier -> JIT / Interpreter execution.'
        ],
        interviewQA: {
          question: 'What happens during bytecode verification when the java command executes a class?',
          answer: 'The Bytecode Verifier ensures the .class file does not violate JVM constraints: checks for operand stack overflows/underflows, verifies parameter types match method descriptors, confirms no illegal data type conversions occur, and enforces access control modifiers.'
        }
      },
      'Source Code vs Bytecode vs Machine Code': {
        title: 'Source Code vs Bytecode vs Machine Code',
        conceptSummary: 'Source code is human-readable (.java), Bytecode is JVM intermediate representation (.class), and Machine code is CPU-executable binary.',
        keyPoints: [
          'Source code: Developer authored, platform-neutral.',
          'Bytecode: Compact, stack-based intermediate code for the JVM.',
          'Machine code: Binary instructions executed directly by CPU registers.'
        ],
        interviewQA: {
          question: 'Why doesn\'t javac compile directly to native machine code like gcc?',
          answer: 'Compiling directly to machine code produces OS-bound binaries, losing platform independence. Bytecode enables WORA portability while letting the JVM JIT compiler apply dynamic runtime optimizations that static AOT compilers cannot predict.'
        }
      },
      'Architectural Differences: Java vs C and C++': {
        title: 'Architectural Differences: Java vs C and C++',
        conceptSummary: 'Java eliminates manual memory deallocation, pointer arithmetic, and multiple class inheritance to deliver secure, portable enterprise software.',
        keyPoints: [
          'Automatic Garbage Collection prevents memory leaks.',
          'No pointer arithmetic eliminates segment faults and buffer overflows.',
          'Interfaces replace multiple class inheritance, avoiding Diamond Problem ambiguities.'
        ],
        interviewQA: {
          question: 'How does Java achieve superior memory safety compared to C++ in enterprise backends?',
          answer: 'Java eliminates raw pointer arithmetic and direct memory addressing. All heap allocations are managed by generational Garbage Collectors, array bounds are strictly validated at runtime, and the Bytecode Verifier prevents unauthorized memory tampering.'
        }
      }
    }
  },
  'level-2-jdk-jre-jvm': {
    slug: 'level-2-jdk-jre-jvm',
    title: 'Level 2: JDK, JRE & JVM Architecture',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Understanding the exact boundaries between JDK (development), JRE (runtime libraries), and JVM (execution engine) is essential for diagnosing production memory crashes, class loading failures, and GC bottlenecks.`,
    coreConcepts: [
      {
        heading: '1. Deconstructing JDK vs JRE vs JVM',
        description: `The Java execution ecosystem consists of three nested layers:`,
        bulletPoints: [
          'JVM (Java Virtual Machine): The abstract computing machine that loads, verifies, and executes bytecode. Contains ClassLoader, Runtime Data Areas (Heap, Stack, Metaspace), and Execution Engine (Interpreter, JIT, GC).',
          'JRE (Java Runtime Environment): JVM + Core Runtime Libraries (rt.jar, java.base) required to run Java applications.',
          'JDK (Java Development Kit): JRE + Developer Tools (javac, javap, jconsole, jstack, jmap, jshell).'
        ]
      },
      {
        heading: '2. JVM Subsystem Architecture',
        description: `The JVM is split into three core subsystems:`,
        bulletPoints: [
          '1. ClassLoader Subsystem: Loading (Bootstrap, Platform, App), Linking (Verify, Prepare, Resolve), and Initialization.',
          '2. Runtime Data Areas: Method Area/Metaspace (Class metadata, static variables), Heap (Objects, arrays), JVM Stacks (Frames, local variables), PC Registers, Native Method Stacks.',
          '3. Execution Engine: Interpreter, JIT Compiler (C1/C2), Garbage Collector, and JNI (Java Native Interface).'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Deconstructing JDK vs JRE vs JVM': {
        title: 'Deconstructing JDK vs JRE vs JVM',
        conceptSummary: 'JDK = JRE + Development Tools; JRE = JVM + Standard Library Class Libraries; JVM = Execution Engine + Memory Subsystems.',
        keyPoints: ['Production servers only require JRE/JVM runtime; developers require JDK.'],
        interviewQA: {
          question: 'What is the difference between JDK, JRE, and JVM in production container deployments?',
          answer: 'JDK contains compilers and diagnostic tools. JRE contains standard runtime libraries. JVM is the execution engine. In modern containerized microservices (Java 11+), jlink is used to create custom lightweight runtimes containing only the required modules and JVM, avoiding full JDK bloat.'
        }
      }
    }
  },
  'level-3-program-fundamentals': {
    slug: 'level-3-program-fundamentals',
    title: 'Level 3: Java Program Fundamentals',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Master the anatomy of Java programs: public static void main(String[] args) execution lifecycle, static initialization, packages, classpath resolution, and entrypoint mechanics.`,
    coreConcepts: [
      {
        heading: '1. Anatomy of public static void main(String[] args)',
        description: `Every modifier in the main entrypoint is strictly required by the JVM specification:`,
        bulletPoints: [
          'public: Accessible by the JVM runtime from outside the package.',
          'static: Invoked on the Class object directly without needing an instance created first.',
          'void: The JVM does not expect a return status code from the entry method.',
          'String[] args: Accepts command-line arguments passed to the application process.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Why main() is public, static, void, and accepts String[] args': {
        title: 'Why main() is public, static, void, and accepts String[] args',
        conceptSummary: 'JVM launches the program without constructor parameters. Making main static allows ClassName.main(args) direct invocation.',
        keyPoints: ['Overloading main is allowed; overriding is impossible (static method hiding).'],
        interviewQA: {
          question: 'Can main() be overloaded and overridden in Java?',
          answer: 'main() can be overloaded with different parameter signatures, but the JVM will only invoke main(String[]). It cannot be overridden polymorphically because static methods are bonded at compile time.'
        }
      }
    }
  },
  'level-4-variables-data-types': {
    slug: 'level-4-variables-data-types',
    title: 'Level 4: Variables & Data Types',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Deep dive into local vs instance vs static variables, memory allocation lifecycles (Stack vs Heap vs Metaspace), and the 8 primitive bit layouts.`,
    coreConcepts: [
      {
        heading: '1. Memory Lifecycles: Local, Instance, and Static Variables',
        description: `Where variables live and when they get reclaimed:`,
        bulletPoints: [
          'Local Variables: Declared inside methods, stored on thread Call Stack, destroyed on method return.',
          'Instance Variables: Declared inside class, stored on the Heap inside object instances, destroyed by GC when unreachable.',
          'Static Variables: Declared with static, stored in Metaspace / Class metadata, live for the lifetime of the ClassLoader.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Local vs Instance vs Static Variables (Scope & Lifetime)': {
        title: 'Local vs Instance vs Static Variables (Scope & Lifetime)',
        conceptSummary: 'Stack vs Heap vs Metaspace memory allocations dictate variable lifetime, thread-safety, and GC eligibility.',
        keyPoints: ['Local primitives are inherently thread-safe; instance and static variables require synchronization in multithreaded environments.'],
        interviewQA: {
          question: 'Why are local variables thread-safe while instance variables are not?',
          answer: 'Each thread has its own dedicated Call Stack memory. Local variables are allocated inside the stack frame of that specific thread and cannot be accessed by other threads. Instance variables reside in shared Heap memory accessible to all threads holding a reference.'
        }
      }
    }
  },
  'level-5-type-casting-conversion': {
    slug: 'level-5-type-casting-conversion',
    title: 'Level 5: Type Casting & Type Conversion',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Widening conversions (lossless), narrowing casts (data loss & integer overflow risks), arithmetic numeric promotions, and IEEE 754 float behavior.`,
    coreConcepts: [
      {
        heading: '1. Implicit Widening vs Explicit Narrowing',
        description: `How Java enforces safe type conversions across the numeric hierarchy:`,
        bulletPoints: [
          'Widening (byte -> short -> int -> long -> float -> double): Lossless, implicit conversion.',
          'Narrowing (double -> float -> long -> int -> short -> byte): Requires explicit cast (type) due to truncation and overflow risks.',
          'Binary Numeric Promotion: In arithmetic operations (+, -, *, /), operands smaller than int are automatically promoted to 32-bit int.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Implicit Widening vs Explicit Narrowing Conversions': {
        title: 'Implicit Widening vs Explicit Narrowing Conversions',
        conceptSummary: 'Safe widening vs explicit narrowing, truncation of high-order bits during narrowing casts.',
        keyPoints: ['Arithmetic with bytes/shorts automatically promotes to int.'],
        interviewQA: {
          question: 'Why does `byte b = 10; b = b + 1;` fail compilation while `b++` succeeds?',
          answer: 'In `b + 1`, binary numeric promotion promotes b to int, producing an int result that cannot be assigned to byte without explicit `(byte)(b + 1)`. The `b++` compound operator includes an implicit cast `(byte)(b + 1)` under the JVM specification.'
        }
      }
    }
  }
};
