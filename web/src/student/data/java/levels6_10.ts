import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_6_TO_10: Record<string, TopicContent> = {
  'level-6-operators-control-flow': {
    slug: 'level-6-operators-control-flow',
    title: 'Level 6: Operators & Control Flow',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Master operator precedence, short-circuit boolean evaluation, bitwise manipulations, modern Java switch expressions with pattern matching (yield), and loop memory mechanics.`,
    coreConcepts: [
      {
        heading: '1. Short-Circuit Evaluation vs Bitwise Operations',
        description: `Understanding the performance and null-safety implications of && vs & and || vs |:`,
        bulletPoints: [
          'Logical Short-Circuit (&&, ||): Skips evaluation of the right operand if the left operand determines the outcome. Crucial for null guards: `if (obj != null && obj.isValid())`.',
          'Bitwise/Non-Short-Circuit (&, |): Always evaluates both operands regardless of truth value.',
          'Prefix (++i) vs Postfix (i++): Prefix increments first and evaluates the new value; postfix evaluates the current value and increments afterwards.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Short-Circuit Evaluation (&&, ||) vs Bitwise (&, |)': {
        title: 'Short-Circuit Evaluation vs Bitwise Operators',
        conceptSummary: '&& and || guard against NullPointerExceptions by aborting early when the first condition fails.',
        keyPoints: ['Always use short-circuit operators for object validation chains.'],
        interviewQA: {
          question: 'What is the danger of using & instead of && when checking object properties?',
          answer: 'If `obj` is null in `if (obj != null & obj.isActive())`, `&` will evaluate `obj.isActive()` anyway, throwing a NullPointerException. `&&` short-circuits on the null check and avoids calling the method.'
        }
      }
    }
  },
  'level-7-arrays': {
    slug: 'level-7-arrays',
    title: 'Level 7: Arrays & Memory Model',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Arrays in Java are first-class heap objects with fixed length, contiguous memory storage, O(1) index access, CPU cache line benefits, and boundary verification.`,
    coreConcepts: [
      {
        heading: '1. Array Heap Allocation & Memory Layout',
        description: `Even primitive arrays are allocated as objects on the Heap:`,
        bulletPoints: [
          'Contiguous Memory: Array elements are stored in contiguous memory blocks, maximizing CPU L1/L2 cache locality.',
          'Object Header: Array objects in 64-bit JVMs hold a 16-byte header containing mark word, klass pointer, and array length (4 bytes).',
          'ArrayIndexOutOfBoundsException: The JVM verifies bounds at runtime before memory offset lookup.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Array Allocation as Heap Objects & Limitations': {
        title: 'Array Allocation as Heap Objects',
        conceptSummary: 'Arrays are objects on the Heap with fixed length. Dynamic resizing requires allocating a new array and copying elements (System.arraycopy).',
        keyPoints: ['Contiguous memory allocation offers O(1) random access.'],
        interviewQA: {
          question: 'Why does ArrayList offer faster sequential reads than LinkedList in backend services?',
          answer: 'ArrayList is backed by a contiguous array, utilizing CPU hardware prefetching and cache lines efficiently. LinkedList uses disjoint heap nodes linked by pointers, causing CPU cache misses on every node traversal.'
        }
      }
    }
  },
  'level-8-strings': {
    slug: 'level-8-strings',
    title: 'Level 8: Strings, Immutability & String Pool',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Deep dive into String immutability, the String Constant Pool (SCP) in Heap memory, .intern() mechanics, String vs StringBuilder vs StringBuffer, and hash code caching.`,
    coreConcepts: [
      {
        heading: '1. Why String is Immutable in Java',
        description: `String immutability is one of the most critical architectural decisions in the JVM:`,
        bulletPoints: [
          '1. String Constant Pool (SCP): Allows identical string literals to share the exact same memory instance, saving massive heap space.',
          '2. Thread Safety: Immutable strings can be freely shared across multiple concurrent threads without synchronization locks.',
          '3. Security: Sensitive data (DB URLs, usernames, passwords, network sockets) cannot be mutated in-place by malicious callers.',
          '4. HashCode Caching: Because the string content never changes, hashCode is calculated once and cached, enabling O(1) HashMap lookups.'
        ],
        codeSnippet: {
          title: 'String Literal vs new String() Heap Allocation',
          language: 'java',
          code: `public class StringPoolDemo {
    public static void main(String[] args) {
        String s1 = "Hello";                  // Stored in String Constant Pool (Heap)
        String s2 = "Hello";                  // Points to the SAME instance in SCP
        String s3 = new String("Hello");      // Creates a NEW object in normal Heap

        System.out.println(s1 == s2);         // true (Same memory reference)
        System.out.println(s1 == s3);         // false (Different heap references)
        System.out.println(s1.equals(s3));    // true (Content is identical)

        String s4 = s3.intern();              // Returns reference from SCP
        System.out.println(s1 == s4);         // true
    }
}`,
          explanation: '`==` checks reference equality (memory location), while `.equals()` checks value equivalence. `s.intern()` places or retrieves the string literal from SCP.'
        }
      }
    ],
    subtopicBreakdowns: {
      'Why String is Immutable & Security/Performance Advantages': {
        title: 'Why String is Immutable in Java',
        conceptSummary: 'String immutability enables SCP caching, thread safety without locking, security for system class loading, and cached hashCode calculation.',
        keyPoints: ['Strings are immutable and final in java.lang.'],
        interviewQA: {
          question: 'What would break if the String class were mutable in Java?',
          answer: '1) String Constant Pool would corrupt: modifying one string would alter all shared instances. 2) Security would collapse: file paths and network sockets could be mutated after validation. 3) HashMaps would break: mutating a String key changes its hash code, making it unretrievable.'
        }
      }
    }
  },
  'level-9-oop-fundamentals': {
    slug: 'level-9-oop-fundamentals',
    title: 'Level 9: OOP Fundamentals & The 4 Pillars',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Object-Oriented Programming (OOP) models software as a collection of objects combining state (data) and behavior (methods). For SDE interviews, understand how objects are represented in Heap memory, how references point to memory, and how Garbage Collection reclaims unreachable instances.`,
    coreConcepts: [
      {
        heading: '1. Why was OOP Introduced? (Procedural vs OOP)',
        description: `Early procedural languages (like C) stored data and functions separately. Global state was vulnerable, tightly coupled, and difficult to test. OOP bundles state and operations together into cohesive domain entities:`,
        bulletPoints: [
          'State (Fields): The attributes and data stored inside an object.',
          'Behavior (Methods): The operations that act upon and validate that state.',
          'Identity: The unique memory address of the object on the Heap, distinct from its field values.'
        ],
        codeSnippet: {
          title: 'Object State, Behavior & Reference Semantics',
          language: 'java',
          code: `class Student {
    String name;
    int age;

    void display() {
        System.out.println("Name: " + name + ", Age: " + age);
    }
}

public class OOPFundamentalsDemo {
    public static void main(String[] args) {
        // s1 is a reference variable on the Stack pointing to Student object on the Heap
        Student s1 = new Student();
        s1.name = "Gowtham";
        s1.age = 21;

        // s2 copies the reference pointer, both point to the SAME object on Heap
        Student s2 = s1;
        s2.age = 22;

        s1.display(); // Prints Age: 22
        s2.display(); // Prints Age: 22

        s1 = null;    // Object is still reachable via s2
        s2 = null;    // Object is now unreachable -> Eligible for Garbage Collection
    }
}`,
          explanation: 'Stack holds local reference variables (s1, s2). Heap holds the actual Student object. When all references are severed (null), the object becomes eligible for GC.'
        }
      },
      {
        heading: '2. The 4 Pillars of OOP',
        description: `The foundational architecture of enterprise Java systems:`,
        bulletPoints: [
          'Encapsulation: Bundling data and methods into a single unit while restricting direct external modification.',
          'Inheritance: Deriving new classes from existing classes to establish IS-A relationships and code reuse.',
          'Polymorphism: One interface, multiple implementations (Compile-time overloading and runtime dynamic dispatch).',
          'Abstraction: Hiding internal implementation complexities behind clean public contracts (Interfaces / Abstract classes).'
        ]
      }
    ],
    subtopicBreakdowns: {
      'The 4 Pillars of OOP: Encapsulation, Inheritance, Polymorphism, Abstraction': {
        title: 'The 4 Pillars of OOP',
        conceptSummary: 'Encapsulation protects invariants; Inheritance models relationships; Polymorphism enables dynamic dispatch; Abstraction hides implementation.',
        keyPoints: ['State + Behavior = Cohesive Object.'],
        interviewQA: {
          question: 'What is the difference between object state, behavior, and identity?',
          answer: 'State is the current value of instance variables. Behavior is defined by methods that operate on that state. Identity is the unique memory address on the Heap. Two objects can have identical state (e.g. name="John", age=25), but they maintain distinct identities.'
        }
      },
      'Object Reference Pointers & Garbage Collection Triggers': {
        title: 'Object References & GC Triggers',
        conceptSummary: 'Objects live on the Heap. When an object has zero active reference pointers from GC roots, it becomes unreachable and eligible for GC.',
        keyPoints: ['System.gc() only requests garbage collection; JVM is free to ignore it.'],
        interviewQA: {
          question: 'Does setting an object reference to null destroy the object immediately?',
          answer: 'No. Setting a reference to null merely severs that pointer. If no other live references point to the object, it becomes eligible for Garbage Collection. The JVM GC runs asynchronously and decides when to reclaim memory based on heap pressure.'
        }
      }
    }
  },
  'level-10-constructors': {
    slug: 'level-10-constructors',
    title: 'Level 10: Constructors & Initialization',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Constructors initialize an object's state at creation time. Master constructor overloading, chaining with this() and super(), private constructor design patterns (Singleton/Utility), and object initialization ordering.`,
    coreConcepts: [
      {
        heading: '1. Constructor Characteristics & Compilation Rules',
        description: `How constructors differ from regular methods in the JVM:`,
        bulletPoints: [
          '1. Same name as class, with NO return type (not even void).',
          '2. Automatically invoked during `new ClassName()` object creation.',
          '3. Default Constructor: If NO constructor is declared, the compiler provides a public no-arg default constructor calling `super()`.',
          '4. Compiler Trap: If you declare ANY parameterized constructor, the compiler will NOT generate the default constructor.',
          '5. Cannot be inherited, cannot be overridden, cannot be static, cannot be final.'
        ],
        codeSnippet: {
          title: 'Constructor Chaining: this() and super()',
          language: 'java',
          code: `class Person {
    String name;
    int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
        System.out.println("1. Person initialized");
    }
}

class Student extends Person {
    String course;

    Student() {
        this("Gowtham", 21, "CS"); // Calls overloaded constructor
        System.out.println("3. Student default constructor complete");
    }

    Student(String name, int age, String course) {
        super(name, age);           // Calls parent constructor (MUST be first line)
        this.course = course;
        System.out.println("2. Student parameterized constructor complete");
    }
}

public class Main {
    public static void main(String[] args) {
        Student s = new Student();
    }
}`,
          explanation: 'Initialization flow: new Student() -> this() -> super() -> Person constructor executes -> Student fields initialized.'
        }
      },
      {
        heading: '2. Private Constructors & Design Patterns',
        description: `Why declare a constructor as private:`,
        bulletPoints: [
          'Singleton Pattern: Prevents outside classes from instantiating multiple instances, controlling access via `getInstance()`.',
          'Utility Classes: Classes with only static methods (e.g., java.lang.Math, Collections) declare a private constructor to prevent meaningless object creation.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Constructor Overloading & Chaining (this(), super())': {
        title: 'Constructor Chaining with this() and super()',
        conceptSummary: 'this() invokes another constructor in the same class; super() invokes the parent class constructor. Both MUST be the first statement.',
        keyPoints: ['A constructor cannot call both this() and super() directly.'],
        interviewQA: {
          question: 'Why cannot constructors be declared static or final in Java?',
          answer: 'Constructors initialize specific object instances (and require an implicit `this` pointer), so they cannot be static (class-level). Final prevents overriding, but constructors are not inherited in the first place, making final redundant and illegal.'
        }
      }
    }
  }
};
