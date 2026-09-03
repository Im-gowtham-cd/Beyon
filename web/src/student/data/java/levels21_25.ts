import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_21_TO_25: Record<string, TopicContent> = {
  'level-21-generics-type-erasure': {
    slug: 'level-21-generics-type-erasure',
    title: 'Level 21: Generics & Type Erasure',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Generics provide compile-time type safety. Master bounded type parameters, wildcards (? extends / ? super), the PECS principle (Producer Extends, Consumer Super), and Type Erasure mechanics in the JVM.`,
    coreConcepts: [
      {
        heading: '1. Type Erasure & The PECS Principle',
        description: `How Java maintains backward compatibility with pre-generic JVM bytecode:`,
        bulletPoints: [
          'Type Erasure: The compiler replaces all generic type parameters with their bounds (or Object) and inserts necessary casts. Generic type information does NOT exist at runtime.',
          'PECS (Producer Extends, Consumer Super): If a collection produces data for reading, use `? extends T`. If a collection consumes data for writing, use `? super T`.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'The PECS Principle: Producer Extends, Consumer Super': {
        title: 'The PECS Principle in Generic API Design',
        conceptSummary: 'Producer Extends for read-only sources; Consumer Super for write-only destinations.',
        keyPoints: ['Collections.copy(List<? super T> dest, List<? extends T> src) is the classic textbook example of PECS.'],
        interviewQA: {
          question: 'What is Type Erasure and why was it introduced in Java 5?',
          answer: 'Type Erasure removes generic type signatures during compilation, replacing them with raw types and casting. It was introduced to ensure binary backward compatibility with legacy Java 1.4 bytecode without requiring changes to the JVM runtime engine.'
        }
      }
    }
  },
  'level-22-java8-lambdas-streams': {
    slug: 'level-22-java8-lambdas-streams',
    title: 'Level 22: Java 8+ Lambdas, Streams & Functional APIs',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Functional programming in Java: Single Abstract Method (SAM) interfaces, lambda expressions, method references (::), lazy stream pipelines, map vs flatMap, reduce, and Optional.`,
    coreConcepts: [
      {
        heading: '1. Stream Pipeline Lifecycle & Lazy Evaluation',
        description: `Intermediate vs Terminal operations in Stream architecture:`,
        bulletPoints: [
          'Intermediate Operations (filter, map, sorted): Lazy and fused together. They do NOT process any elements until a terminal operation is called.',
          'Terminal Operations (collect, count, forEach, reduce): Triggers stream pipeline execution and produces a result.',
          'map() vs flatMap(): map() performs 1-to-1 transformation; flatMap() performs 1-to-many transformation and flattens nested streams into a single stream.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Stream API: Lazy Evaluation, Intermediate vs Terminal Operations': {
        title: 'Stream API Lazy Evaluation',
        conceptSummary: 'Streams optimize processing by executing operations in a single pass when triggered by a terminal operation.',
        keyPoints: ['Streams are single-use and cannot be re-consumed after terminal evaluation.'],
        interviewQA: {
          question: 'What is the functional difference between map() and flatMap() in Java Streams?',
          answer: '`map(Function<T, R>)` transforms each stream element into another single value (1-to-1). `flatMap(Function<T, Stream<R>>)` transforms each element into a Stream of values and flattens the resulting streams into a single consolidated Stream (1-to-many).'
        }
      }
    }
  },
  'level-23-multithreading-concurrency': {
    slug: 'level-23-multithreading-concurrency',
    title: 'Level 23: Multithreading, Concurrency & Executors',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Thread lifecycles, Runnable vs Callable, synchronization, intrinsic monitor locks, race conditions, deadlocks (Coffman conditions), volatile visibility, Atomic variables, and ThreadPoolExecutor.`,
    coreConcepts: [
      {
        heading: '1. Thread Safety, Volatile, and Atomic CAS Operations',
        description: `Managing shared mutable state across concurrent threads:`,
        bulletPoints: [
          'volatile: Guarantees memory visibility by reading/writing directly to Main Memory (RAM), bypassing CPU caches. Prevents instruction reordering but does NOT guarantee atomicity for compound operations like `count++`.',
          'Atomic Variables (AtomicInteger): Uses CPU hardware-level Compare-And-Swap (CAS) instructions for lock-free thread-safe updates.',
          'Deadlock Coffman Conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'volatile Memory Visibility & AtomicInteger CAS Operations': {
        title: 'Volatile vs Atomic Variables',
        conceptSummary: 'Volatile provides visibility; Atomic provides visibility plus atomicity via lock-free hardware CAS.',
        keyPoints: ['Use ThreadPoolExecutor instead of manually creating raw threads.'],
        interviewQA: {
          question: 'Why is volatile int count = 0 not thread-safe for count++?',
          answer: '`count++` is not an atomic operation. It consists of 3 distinct steps: read count from memory, increment value in CPU register, and write back to memory. If two threads read simultaneously, race condition overwrites occur. Use AtomicInteger.incrementAndGet() for atomicity.'
        }
      }
    }
  },
  'level-24-jvm-internals-gc': {
    slug: 'level-24-jvm-internals-gc',
    title: 'Level 24: JVM Internals, Memory & Garbage Collection',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Deconstruct JVM Generational Heap (Eden, Survivor S0/S1, Old Gen), Metaspace, GC algorithms (Serial, Parallel, G1 GC, ZGC, Shenandoah), GC Roots, and diagnosing OutOfMemoryError.`,
    coreConcepts: [
      {
        heading: '1. Generational Heap & GC Roots Reachability',
        description: `How modern JVM Garbage Collectors manage object lifecycles:`,
        bulletPoints: [
          'Young Generation (Eden, S0, S1): Newly allocated objects start in Eden. Surviving objects are promoted to Old Generation after surviving several Minor GC cycles.',
          'Old Generation: Long-lived objects; collected during Major/Full GC.',
          'GC Roots: Active stack local variables, active threads, static references, and JNI global pointers. Objects unreachable from GC roots are marked for deletion.',
          'ZGC & Shenandoah: Concurrent, ultra-low latency garbage collectors targeting sub-millisecond Stop-The-World pause times.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Garbage Collection Algorithms: Serial, Parallel, G1 GC, ZGC & Shenandoah': {
        title: 'Modern Garbage Collection Algorithms',
        conceptSummary: 'G1 partitions heap into regions; ZGC uses colored pointers and load barriers for concurrent pause-less GC.',
        keyPoints: ['OutOfMemoryError occurs when GC cannot reclaim enough heap for new object allocations.'],
        interviewQA: {
          question: 'What defines a GC Root in JVM Garbage Collection?',
          answer: 'GC Roots are special objects that are always considered reachable: 1) Local variables on active thread stack frames, 2) Active threads, 3) Static variables loaded in Metaspace, 4) JNI local and global references.'
        }
      }
    }
  },
  'level-25-jmm-concurrency': {
    slug: 'level-25-jmm-concurrency',
    title: 'Level 25: Java Memory Model & Advanced Concurrency',
    badge: '₹24+ LPA SDE Architecture',
    overview: `The formal Java Memory Model (JMM): Happens-Before relationships, memory ordering, CPU instruction reordering, lock-free algorithms, and false sharing mitigation.`,
    coreConcepts: [
      {
        heading: '1. Happens-Before Guarantee & Memory Barriers',
        description: `Ensuring deterministic memory visibility across threads:`,
        bulletPoints: [
          'Happens-Before Relationship: If Action A happens-before Action B, memory writes performed by A are guaranteed to be visible to B.',
          'Monitor Lock Rule: Unlocking a monitor happens-before every subsequent lock of the same monitor.',
          'Volatile Variable Rule: A write to a volatile variable happens-before every subsequent read of that same volatile variable.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'The Java Memory Model (JMM) & Happens-Before Formal Semantics': {
        title: 'Java Memory Model & Happens-Before',
        conceptSummary: 'JMM defines strict memory write visibility and prevents invalid compiler/CPU instruction reordering.',
        keyPoints: ['Use @Contended to prevent CPU cache line false sharing in high-frequency trading services.'],
        interviewQA: {
          question: 'What is the Happens-Before relationship in Java Concurrency?',
          answer: 'It is the formal specification in the JMM guaranteeing that memory writes by one thread are guaranteed to be visible to reads by another thread without race conditions (e.g. synchronized release -> acquire, volatile write -> read).'
        }
      }
    }
  }
};
