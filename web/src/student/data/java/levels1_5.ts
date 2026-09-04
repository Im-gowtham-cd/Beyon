import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_1_TO_5: Record<string, TopicContent> = {
  'level-1-java-fundamentals': {
    slug: 'level-1-java-fundamentals',
    title: 'Level 1: Java Fundamentals',
    levelHeading: 'LEVEL 1 — Java Fundamentals 🟢',
    badge: '₹24+ LPA SDE Architecture',
    targetBanner: {
      roles: 'For ₹24+ LPA SDE roles (Presidio, Oracle, Zoho R&D, Amazon, Microsoft, Adobe, Atlassian, Walmart, JPMorgan, etc.)',
      tagline: 'Interviewers don\'t expect textbook definitions. They expect you to explain why a technology exists, how it works internally, what problem it solves, and its trade-offs. So let\'s study like an SDE, not like someone preparing for a theory exam.'
    },
    overview: `Java is a high-level, class-based, object-oriented programming language developed by Sun Microsystems (now Oracle) for building applications that can run on multiple operating systems without modifying the source code. Java follows the principle of platform independence through the Java Virtual Machine (JVM).`,
    sdeQuestions: [
      {
        number: 1,
        question: 'What is Java?',
        officialDefinition: 'Java is a high-level, class-based, object-oriented programming language developed by Sun Microsystems (now Oracle) for building applications that can run on multiple operating systems without modifying the source code. Java follows the principle of platform independence through the Java Virtual Machine (JVM).',
        whyNeeded: `Before Java, languages like C and C++ generated machine code specific to an operating system.
Example: A C program compiled on Windows cannot directly run on Linux because each OS uses different machine instructions. Developers had to maintain separate builds for different operating systems.
Java solved this by introducing an intermediate representation called bytecode. Only the JVM changes for each operating system; the Java code remains the same.`,
        diagram: `Java Code
      ↓
Compiler (javac)
      ↓
Bytecode (.class)
      ↓
JVM
      ↓
Machine Code of current OS`,
        whereUsed: [
          'Enterprise applications',
          'Banking systems',
          'Android applications (legacy ecosystem)',
          'Backend APIs',
          'Distributed systems',
          'Big Data (Hadoop)',
          'Cloud services',
          'Financial software',
          'E-commerce platforms'
        ],
        interviewAnswer: 'Java is a high-level, object-oriented programming language designed to build secure, scalable, and platform-independent applications. Unlike C or C++, Java compiles source code into bytecode instead of machine code. This bytecode is executed by the JVM, allowing the same application to run on Windows, Linux, or macOS without recompilation. Java is widely used for enterprise backend systems, banking applications, cloud services, and large-scale distributed systems because of its portability, security, and extensive ecosystem.'
      },
      {
        number: 2,
        question: 'Why was Java created?',
        problemBefore: `In the early 1990s, software had major portability problems. A program written for one operating system often failed on another. Developers had to rewrite or recompile applications for every platform. This increased:
• Development cost
• Testing effort
• Maintenance complexity
Sun Microsystems wanted a language that could run on different devices without rewriting the application.`,
        solution: `Java introduced:
• Bytecode
• JVM
• Automatic memory management (Garbage Collection)
• Strong security model
These allowed applications to execute consistently across different platforms.`,
        realWorldExample: `Suppose a company develops an HR management system.
Without Java: Windows version + Linux version + Mac version = Three builds.
With Java: One Java application -> Runs on every platform.`,
        interviewAnswer: 'Java was created to solve the portability problem of existing programming languages. Earlier, applications were compiled into machine code specific to an operating system, requiring separate builds for different platforms. Java introduced bytecode and the JVM, allowing the same compiled program to run on any operating system that provides a compatible JVM. This significantly reduced development and maintenance effort while improving portability and security.'
      },
      {
        number: 3,
        question: 'What are the main features of Java?',
        explanation: 'The interviewer expects explanations, not just a list.',
        keyPoints: [
          'Platform Independent: Runs on any operating system through the JVM.',
          'Object-Oriented: Uses classes and objects to organize code into reusable and maintainable components.',
          'Simple: Removes complex C++ features such as pointer arithmetic, multiple inheritance through classes, and manual memory management.',
          'Secure: Java provides bytecode verification, ClassLoader isolation, Security Manager (legacy), and no direct memory access through raw pointers.',
          'Robust: Handles errors through structured exception handling, automated garbage collection, and strong static type checking.',
          'Multithreaded: Built-in support for concurrent thread execution, critical for web servers, games, and high-throughput banking systems.',
          'High Performance: Although Java uses a JVM, modern JVMs use JIT compilation to optimize frequently executed code into native machine instructions.',
          'Distributed: Provides rich native APIs for networking (Sockets, HTTP, RMI, Web Services).',
          'Dynamic: Classes and libraries can be linked and loaded on demand at runtime (Reflection, ClassLoaders, Plugins).'
        ],
        interviewAnswer: 'Java provides platform independence through the JVM, object-oriented programming for modular design, automatic memory management through garbage collection, strong security, exception handling for robustness, multithreading for concurrency, networking support for distributed applications, and JIT compilation for improved runtime performance.'
      },
      {
        number: 4,
        question: 'Why is Java called Platform Independent?',
        explanation: `Platform independence means the same compiled program can run on multiple operating systems without recompilation.
How? Instead of generating machine code directly, Java generates bytecode. The JVM converts bytecode into native machine code at runtime.
Important: The program is not running directly on Windows or Linux. It runs inside the JVM.`,
        diagram: `Java
  ↓
Bytecode
  ↓
 JVM
  ↓
Windows Machine Code OR Linux Machine Code OR macOS Machine Code`,
        interviewAnswer: 'Java is platform independent because its compiler generates platform-neutral bytecode instead of native machine code. This bytecode is executed by the JVM, which translates it into machine code for the underlying operating system. As long as a compatible JVM is available, the same Java program can run without recompilation.'
      },
      {
        number: 5,
        question: 'What does "Write Once, Run Anywhere" (WORA) mean?',
        explanation: `WORA means:
• Write the application once.
• Compile it once.
• Run it on any operating system without modifying source code.`,
        diagram: `Compile Once
     ↓
 Bytecode
     ↓
Windows | Linux | Mac | Unix`,
        interviewAnswer: '"Write Once, Run Anywhere" refers to Java\'s ability to compile source code into platform-independent bytecode. This bytecode can be executed on any operating system that provides a compatible JVM, eliminating the need to recompile the application for different platforms.'
      },
      {
        number: 6,
        question: 'Is Java completely platform independent?',
        explanation: `No. This is a common interview trap!
Java source code and bytecode are platform independent.
The JVM is platform dependent.
Each operating system requires its own JVM implementation because the JVM must interact with the underlying OS kernel and physical hardware.
For example: Windows uses a Windows JVM; Linux uses a Linux JVM; macOS uses a macOS JVM. Without a compatible JVM, Java bytecode cannot execute.`,
        interviewAnswer: 'Java is not completely platform independent. The compiled bytecode is platform independent, but the JVM is platform dependent because it must translate bytecode into native machine code for the specific operating system and processor architecture.'
      },
      {
        number: 7,
        question: 'Why is Java considered an object-oriented language?',
        explanation: `Java organizes programs around classes and objects rather than standalone procedural functions. It supports the four core OOP principles:
1. Encapsulation
2. Inheritance
3. Polymorphism
4. Abstraction
These principles help build modular, reusable, and maintainable software.`,
        interviewAnswer: 'Java is considered an object-oriented language because programs are organized around classes and objects rather than procedural functions, fully implementing the four pillars of OOP: Encapsulation, Inheritance, Polymorphism, and Abstraction to deliver modular, maintainable, and scalable enterprise architectures.'
      },
      {
        number: 8,
        question: 'Is Java a purely object-oriented language?',
        explanation: `No. A purely object-oriented language requires everything to be an object (like Smalltalk).
Java includes 8 primitive data types:
• byte, short, int, long, float, double, char, boolean
These are raw binary values stored directly on the stack without object headers or method tables. Therefore, Java is object-oriented but not purely object-oriented.`,
        interviewAnswer: 'Java is not a purely object-oriented language because it retains 8 primitive data types (int, boolean, double, etc.) that do not inherit from java.lang.Object. These primitive types exist for performance and memory efficiency.'
      },
      {
        number: 9,
        question: 'Is Java a compiled language or interpreted language?',
        explanation: `Java is both.
• Compilation: javac converts .java source files into platform-independent bytecode (.class).
• Execution: The JVM interprets bytecode initially and uses the Just-In-Time (JIT) compiler to compile frequently executed code (hot spots) into native machine code for maximum runtime performance.`,
        interviewAnswer: 'Java is both compiled and interpreted. The Java compiler (javac) compiles source code into platform-independent bytecode, and the JVM executes this bytecode through a combination of an interpreter and a Just-In-Time (JIT) compiler that translates hot code paths directly into optimized native machine code.'
      },
      {
        number: 10,
        question: 'Why is Java both compiled and interpreted?',
        explanation: `Java uses a two-step execution model:
1. javac compiles source code into bytecode (achieving WORA portability).
2. The JVM executes the bytecode. Initially it interprets instructions for fast startup, and the JIT compiler optimizes frequently executed sections into native machine code.
This unique combination delivers cross-platform portability without sacrificing high execution throughput.`,
        interviewAnswer: 'Java is both compiled and interpreted to balance cross-platform portability with high runtime performance. Compiling to bytecode allows Java to run anywhere a JVM exists, while dynamic interpretation combined with JIT native compilation enables applications to start quickly and run at near-native speeds.'
      },
      {
        number: 11,
        question: 'What is bytecode?',
        officialDefinition: 'Bytecode is the platform-independent intermediate code produced by the Java compiler. It is stored in .class files and is designed to be executed by the JVM rather than directly by the physical CPU.',
        interviewAnswer: 'Bytecode is the compact, platform-neutral instruction set generated by javac from Java source code. It is stored in .class files and serves as the universal contract executed, verified, and optimized by the JVM across all operating systems.'
      },
      {
        number: 12,
        question: 'What is the .class file?',
        explanation: `A .class file contains the compiled bytecode of a single Java class. It includes:
• Bytecode instructions
• Metadata (access flags, class names)
• Constant pool (strings, method references, symbolic links)
• Method and field descriptor information
The JVM loads and links this binary file during execution.`,
        interviewAnswer: 'A .class file is the compiled binary file containing the bytecode, constant pool, type metadata, field descriptors, and method instructions for a single Java class, loaded and executed by the JVM ClassLoader.'
      },
      {
        number: 13,
        question: 'What happens when a Java program is compiled?',
        explanation: `Compilation steps:
1. Write source code (Example.java).
2. Run javac Example.java.
3. The compiler performs lexical analysis, syntax parsing, semantic validation, and type checks.
4. If successful, it generates Example.class containing platform-neutral bytecode.
Important: Compilation does not execute the program!`,
        interviewAnswer: 'During compilation, the Java compiler (javac) parses the source code into an Abstract Syntax Tree (AST), performs strict type and syntax checking, resolves symbols, and outputs a .class file containing platform-independent JVM bytecode.'
      },
      {
        number: 14,
        question: 'What happens when a Java program is executed?',
        explanation: `Execution steps:
1. Run java Example.
2. The JVM starts and allocates runtime data areas (Heap, Stack, Metaspace).
3. The ClassLoader loads required .class files into memory.
4. The Bytecode Verifier validates the bytecode to ensure memory safety and access compliance.
5. The JVM interpreter begins executing bytecode instructions.
6. The JIT compiler identifies hot methods and compiles them into native CPU machine instructions.
7. The operating system executes the generated machine code.`,
        interviewAnswer: 'When a Java program is executed with the java command, the JVM initializes, loads the target class via ClassLoaders, verifies bytecode safety via the Bytecode Verifier, and begins execution using the interpreter and JIT compiler to translate bytecode into CPU machine instructions.'
      },
      {
        number: 15,
        question: 'What is the role of the Java compiler?',
        explanation: `The Java compiler (javac) converts human-readable Java source code into platform-independent bytecode. Its responsibilities include:
• Syntax checking
• Type checking
• Semantic validation
• Bytecode generation`,
        interviewAnswer: 'The Java compiler (javac) is responsible for syntax analysis, type verification, and translating human-readable Java source code (.java) into platform-neutral bytecode (.class) for execution by the JVM.'
      },
      {
        number: 16,
        question: 'What is javac?',
        explanation: `javac is the Java compiler included in the JDK.
Example: javac Hello.java -> Generates Hello.class.`,
        interviewAnswer: 'javac is the primary command-line compiler provided by the JDK that translates Java source code into executable JVM bytecode.'
      },
      {
        number: 17,
        question: 'What is the java command?',
        explanation: `The java command launches the JVM and executes the compiled bytecode.
Example: java Hello
It does not compile the source code; it invokes the JVM entrypoint.`,
        interviewAnswer: 'The java command is the application launcher that initializes the JVM, loads the specified class file, and executes its public static void main(String[] args) method.'
      },
      {
        number: 18,
        question: 'Difference between source code, bytecode, and machine code',
        table: {
          headers: ['Type', 'Format', 'Created By', 'Executed By', 'Platform Dependent'],
          rows: [
            ['Source Code', '.java', 'Developer', 'Java Compiler (javac)', 'No'],
            ['Bytecode', '.class', 'Java Compiler (javac)', 'JVM', 'No'],
            ['Machine Code', 'Native binary', 'JIT Compiler', 'CPU', 'Yes']
          ]
        },
        interviewAnswer: 'Source code is human-readable code written by developers (.java). Bytecode is intermediate, platform-neutral binary code produced by javac (.class). Machine code is the native binary instruction set executed directly by the physical CPU registers, generated at runtime by the JVM JIT compiler.'
      },
      {
        number: 19,
        question: 'Why is bytecode important?',
        explanation: `Bytecode is the key to Java\'s architecture because it:
1. Enables platform independence (Write Once, Run Anywhere).
2. Allows JVM-based security checks and bytecode verification before execution.
3. Supports dynamic runtime optimizations through the JIT compiler.
4. Decouples the Java compiler from the underlying physical hardware.
Without bytecode, Java would need separate binaries for each operating system, similar to traditional compiled languages.`,
        interviewAnswer: 'Bytecode is critical because it decouples language syntax from hardware architectures. It provides a standardized intermediate format that enables platform independence, strict security verification prior to execution, and dynamic profiling optimizations by the HotSpot JIT compiler.'
      },
      {
        number: 20,
        question: 'What makes Java different from C and C++?',
        table: {
          headers: ['Feature', 'Java', 'C', 'C++'],
          rows: [
            ['Platform Independence', 'Yes (JVM + Bytecode)', 'No (Native Machine Code)', 'No (Native Machine Code)'],
            ['Memory Management', 'Automatic (Garbage Collection)', 'Manual (malloc / free)', 'Manual (new / delete) & RAII'],
            ['Pointer Arithmetic', 'Not supported (Safe references)', 'Supported (Raw pointers)', 'Supported (Raw pointers)'],
            ['Multiple Inheritance (Classes)', 'No (Uses interfaces)', 'No (Procedural)', 'Yes (Multiple class inheritance)'],
            ['Compilation Target', 'Bytecode', 'Native Machine Code', 'Native Machine Code'],
            ['Runtime Environment', 'JVM', 'None (OS direct)', 'None (OS direct)'],
            ['Security', 'Strong runtime checks & sandbox', 'Limited', 'Limited'],
            ['Primary Use', 'Enterprise, Backend, Cloud', 'Systems Programming, OS', 'Systems, Games, High-Performance']
          ]
        },
        interviewAnswer: 'Java differs from C and C++ primarily in its execution model. C and C++ compile directly to native machine code, producing platform-specific binaries. Java compiles to platform-independent bytecode that runs on the JVM, enabling portability. Java also provides automatic garbage collection, strong runtime safety, built-in exception handling, and avoids pointer arithmetic, making it well-suited for large-scale enterprise and cloud applications.'
      }
    ]
  },
  'level-2-jdk-jre-jvm': {
    slug: 'level-2-jdk-jre-jvm',
    title: 'Level 2: JDK, JRE & JVM Architecture',
    levelHeading: 'LEVEL 2 — JDK, JRE & JVM Architecture 🟢',
    badge: '₹24+ LPA SDE Architecture',
    targetBanner: {
      roles: 'For ₹24+ LPA SDE roles (Presidio, Oracle, Zoho R&D, Amazon, Microsoft, Adobe, Atlassian, Walmart, JPMorgan, etc.)',
      tagline: 'Interviewers don\'t expect textbook definitions. They expect you to explain why a technology exists, how it works internally, what problem it solves, and its trade-offs. So let\'s study like an SDE, not like someone preparing for a theory exam.'
    },
    overview: `Understanding the exact boundaries between JDK (development), JRE (runtime libraries), and JVM (execution engine) is essential for diagnosing production memory crashes, class loading failures, and GC bottlenecks.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'What is JVM?',
        officialDefinition: 'The JVM (Java Virtual Machine) is an abstract computing machine that enables a computer to run a Java program. It provides the runtime environment in which Java bytecode can be executed.',
        interviewAnswer: 'The JVM is the core runtime engine responsible for loading bytecode (.class), verifying its safety, allocating memory, and executing instructions via an interpreter and JIT compiler while managing automatic Garbage Collection.'
      },
      {
        number: 2,
        question: 'What is JRE?',
        officialDefinition: 'JRE stands for Java Runtime Environment. It is the implementation of the JVM and provides all the runtime libraries and components necessary to run Java applications.',
        interviewAnswer: 'The JRE is the package that provides the JVM plus core standard class libraries (like java.lang, java.util) needed to execute a Java application. It does not contain development tools like javac.'
      },
      {
        number: 3,
        question: 'What is JDK?',
        officialDefinition: 'JDK stands for Java Development Kit. It is a full-featured software development environment used for developing Java applications and applets.',
        interviewAnswer: 'The JDK is the complete developer toolkit containing the JRE, JVM, compiler (javac), archiver (jar), documentation generator (javadoc), and diagnostic tools (jstack, jmap, jconsole).'
      },
      {
        number: 4,
        question: 'Difference between JDK, JRE, and JVM',
        diagram: `┌──────────────────────────────────────────────┐
│ JDK (Development Kit)                        │
│ ┌──────────────────────────────────────────┐ │
│ │ JRE (Runtime Environment)                │ │
│ │ ┌───────────────────┐ ┌────────────────┐ │ │
│ │ │ JVM (Exec Engine) │ │ Core Libraries │ │ │
│ │ └───────────────────┘ └────────────────┘ │ │
│ └──────────────────────────────────────────┘ │
│ Developer Tools (javac, javap, jstack, etc.) │
└──────────────────────────────────────────────┘`,
        interviewAnswer: 'JDK is for developers to write and compile code (JDK = JRE + Tools). JRE is for running pre-compiled Java applications (JRE = JVM + Class Libraries). JVM is the virtual machine that actually executes the bytecode.'
      },
      {
        number: 5,
        question: 'Is JVM platform independent?',
        explanation: 'No! The JVM is platform dependent. Each operating system has a customized JVM binary built specifically for its underlying hardware architecture and OS system calls.',
        interviewAnswer: 'The JVM is platform dependent because it must directly interface with the host operating system kernel and physical CPU instructions. However, the bytecode it executes is platform independent.'
      }
    ]
  },
  'level-3-program-fundamentals': {
    slug: 'level-3-program-fundamentals',
    title: 'Level 3: Java Program Fundamentals',
    levelHeading: 'LEVEL 3 — Java Program Fundamentals 🟢',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Master the anatomy of Java programs: public static void main(String[] args) execution lifecycle, static initialization, packages, classpath resolution, and entrypoint mechanics.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'Why is main() public, static, and void in Java?',
        explanation: `• public: Accessible by the JVM runtime from outside the package.
• static: Allows the JVM to invoke the entrypoint on the Class object directly without instantiating an object first.
• void: The JVM process does not expect a return value from main(); exit codes are communicated via System.exit(status).
• String[] args: Accepts command-line parameters passed to the process.`,
        interviewAnswer: 'main() must be public so the JVM launcher can access it from outside its package, static so it can be invoked without allocating an instance of the class on the heap, and void because process completion status is handled by the JVM runtime rather than a return value.'
      }
    ]
  },
  'level-4-variables-data-types': {
    slug: 'level-4-variables-data-types',
    title: 'Level 4: Variables & Data Types',
    levelHeading: 'LEVEL 4 — Variables & Data Types 🟢',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Deep dive into local vs instance vs static variables, memory allocation lifecycles (Stack vs Heap vs Metaspace), and the 8 primitive bit layouts.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'Difference between Local, Instance, and Static Variables',
        table: {
          headers: ['Variable Type', 'Memory Location', 'Scope', 'Default Value', 'Thread Safety'],
          rows: [
            ['Local Variable', 'Thread Stack frame', 'Method/Block only', 'No default (Must initialize)', 'Thread-safe (Isolated)'],
            ['Instance Variable', 'Heap (Inside object)', 'Object lifetime', 'Defaults (0, null, false)', 'Needs synchronization'],
            ['Static Variable', 'Metaspace / Class Area', 'ClassLoader lifetime', 'Defaults (0, null, false)', 'Shared across all threads']
          ]
        },
        interviewAnswer: 'Local variables reside on the thread stack and are inherently thread-safe. Instance variables reside in the heap inside object instances and live as long as the object is referenced. Static variables reside in Metaspace tied to the Class definition and are shared across all instances.'
      }
    ]
  },
  'level-5-type-casting-conversion': {
    slug: 'level-5-type-casting-conversion',
    title: 'Level 5: Type Casting & Type Conversion',
    levelHeading: 'LEVEL 5 — Type Casting & Type Conversion 🟢',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Widening conversions (lossless), narrowing casts (data loss & integer overflow risks), arithmetic numeric promotions, and IEEE 754 float behavior.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'Implicit Widening vs Explicit Narrowing Conversions',
        explanation: `• Widening (byte -> short -> int -> long -> float -> double): Safe, lossless conversion performed automatically by the compiler.
• Narrowing (double -> float -> long -> int -> short -> byte): High-order bits are discarded, requiring an explicit cast operator (type) to acknowledge potential data loss.`,
        interviewAnswer: 'Widening is an automatic lossless conversion from a smaller type to a larger type. Narrowing is an explicit conversion from a larger type to a smaller type that requires casting because it truncates high-order bits and can result in data loss or sign reversal.'
      }
    ]
  }
};
