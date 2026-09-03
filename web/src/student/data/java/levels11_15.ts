import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_11_TO_15: Record<string, TopicContent> = {
  'level-11-encapsulation': {
    slug: 'level-11-encapsulation',
    title: 'Level 11: Encapsulation & Data Hiding',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Encapsulation is the principle of bundling an object's state and operations together while controlling access through meaningful business operations. For SDE interviews, understand that encapsulation is NOT just "private fields + getters/setters" — it is about protecting business invariants and enforcing state validation.`,
    coreConcepts: [
      {
        heading: '1. Encapsulation vs Data Hiding vs Getters/Setters',
        description: `Crucial distinctions expected in senior technical rounds:`,
        bulletPoints: [
          'Data Hiding: Restricting direct external access to internal data fields using the `private` modifier.',
          'Encapsulation: The broader OOP design pattern of packaging data and behavior together with controlled public operations.',
          'The Setter Anti-Pattern: Unrestricted setters like `setBalance(-50000)` destroy encapsulation. True encapsulation exposes domain operations like `deposit()` and `withdraw()` with invariant validation.',
          'Tell, Don\'t Ask Principle: Ask the object to perform an operation rather than querying its fields and manipulating its data externally.'
        ],
        codeSnippet: {
          title: 'Robust Encapsulation Blueprint',
          language: 'java',
          code: `class BankAccount {
    private final String accountNumber;
    private double balance; // Data hiding

    public BankAccount(String accountNumber, double initialBalance) {
        if (accountNumber == null || accountNumber.isBlank()) throw new IllegalArgumentException("Invalid account");
        if (initialBalance < 0) throw new IllegalArgumentException("Initial balance cannot be negative");
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }

    // Controlled operation enforcing invariants
    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit must be positive");
        this.balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal must be positive");
        if (amount > this.balance) throw new IllegalArgumentException("Insufficient funds");
        this.balance -= amount;
    }

    public double getBalance() { return balance; } // Read-only query
    public String getAccountNumber() { return accountNumber; }
}`,
          explanation: 'There is no setBalance() method. The class enforces the business rule that balance >= 0 at all times.'
        }
      }
    ],
    subtopicBreakdowns: {
      'Data Hiding vs Encapsulation Core Distinction': {
        title: 'Data Hiding vs Encapsulation',
        conceptSummary: 'Data hiding restricts direct access; encapsulation bundles state and logic with controlled domain operations.',
        keyPoints: ['Unnecessary setters weaken encapsulation.'],
        interviewQA: {
          question: 'Can encapsulation exist without getters and setters?',
          answer: 'Yes. Encapsulation is about bundling state and behavior with controlled access. Exposing domain operations (deposit, withdraw, increment) without raw getters/setters provides much stronger encapsulation by protecting internal invariants.'
        }
      }
    }
  },
  'level-12-inheritance': {
    slug: 'level-12-inheritance',
    title: 'Level 12: Inheritance & Class Hierarchies',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Inheritance models IS-A relationships allowing subclasses to acquire superclass properties and methods. Master single inheritance architecture, the Diamond Problem, and Composition Over Inheritance.`,
    coreConcepts: [
      {
        heading: '1. Why Java Disallows Multiple Class Inheritance (The Diamond Problem)',
        description: 'When Class D extends both Class B and Class C (which both inherit from Class A) and both override method m(), the compiler cannot determine which implementation D inherits. Java solves this by permitting single class inheritance and multiple interface contracts:',
        bulletPoints: [
          'Single Inheritance: A class can extend only one direct superclass.',
          'Interface Implementation: A class can implement multiple interfaces because interfaces traditionally contained only method signatures without mutable state.',
          'Composition Over Inheritance (HAS-A > IS-A): Favor composition to reduce tight coupling and fragile base class vulnerabilities.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'The Diamond Problem & Why Java Disallows Multiple Class Inheritance': {
        title: 'The Diamond Problem in Java',
        conceptSummary: 'Avoids state ambiguity and method collision conflicts present in C++ multiple inheritance.',
        keyPoints: ['Java interfaces allow multiple inheritance of type, not mutable state.'],
        interviewQA: {
          question: 'Are constructors and private fields inherited by subclasses?',
          answer: 'No. Constructors belong to the class in which they are declared and are invoked via super(), not inherited. Private fields exist inside the heap object but are not directly accessible by subclass code without protected/public accessors.'
        }
      }
    }
  },
  'level-13-polymorphism': {
    slug: 'level-13-polymorphism',
    title: 'Level 13: Polymorphism & Dynamic Dispatch',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Polymorphism allows "one interface, multiple implementations." Understand compile-time overloading vs runtime overriding, virtual method tables (vtables), dynamic method dispatch, and covariant return types.`,
    coreConcepts: [
      {
        heading: '1. Dynamic Method Dispatch & Virtual Method Tables (vtables)',
        description: `How the JVM resolves overridden methods at runtime:`,
        bulletPoints: [
          'Overloading (Static Polymorphism): Resolved at compile time based on parameter types. Method signature consists of name + parameters (return type is NOT part of signature).',
          'Overriding (Dynamic Polymorphism): Resolved at runtime based on the actual Heap object type.',
          'vtable Mechanics: Each class has a Virtual Method Table in Metaspace. At runtime, the JVM looks up the vtable offset for the target method to execute the subclass override.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Dynamic Method Dispatch & Virtual Method Table (vtable) Mechanics': {
        title: 'Dynamic Method Dispatch & vtable',
        conceptSummary: 'Dynamic method dispatch uses the runtime instance vtable to invoke the most specific overridden method.',
        keyPoints: ['Static, private, and final methods use static binding (invokestatic/invokespecial) and bypass vtable.'],
        interviewQA: {
          question: 'Can you overload a method by changing ONLY the return type in Java?',
          answer: 'No. In Java, a method signature consists strictly of the method name and the ordered list of parameter types. Return type is not part of the signature, causing a compile-time "method already defined" error.'
        }
      }
    }
  },
  'level-14-abstraction-interfaces': {
    slug: 'level-14-abstraction-interfaces',
    title: 'Level 14: Abstraction & Modern Interfaces',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Abstraction hides complex implementation details behind clean public contracts. Master Abstract Classes vs Interfaces, default/static interface methods (Java 8), private methods (Java 9), and @FunctionalInterface.`,
    coreConcepts: [
      {
        heading: '1. Abstract Classes vs Modern Interfaces',
        description: `Architectural differences in modern Java (Java 8+ to 21+):`,
        bulletPoints: [
          'Abstract Classes: Can maintain instance state (fields), constructors, and partial implementations. Represents core "IS-A" identity.',
          'Interfaces: Define contracts ("CAN-DO"). Can contain abstract methods, default methods (backward compatibility), static utility methods, and private helper methods. Cannot have instance state or constructors.',
          'Functional Interfaces: Interfaces with exactly one Single Abstract Method (SAM), enabling lambda expressions.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Abstract Classes vs Interfaces Architectural Tradeoffs': {
        title: 'Abstract Classes vs Modern Interfaces',
        conceptSummary: 'Abstract classes provide shared instance state and base constructors; interfaces provide decoupled contracts and multiple implementation capabilities.',
        keyPoints: ['default methods were introduced in Java 8 to evolve core library interfaces without breaking legacy implementations.'],
        interviewQA: {
          question: 'Why did Java 8 introduce default methods in interfaces?',
          answer: 'To enable backward compatibility. Adding new methods (like stream() or forEach()) to the existing Collection interface would have broken every third-party library implementing Collection. Default methods provided default implementations directly on interfaces.'
        }
      }
    }
  },
  'level-15-access-modifiers': {
    slug: 'level-15-access-modifiers',
    title: 'Level 15: Access Modifiers & Scoping',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Master the 4 Java access modifiers: public, protected, default (package-private), and private, cross-package inheritance rules, and package-private clean architecture.`,
    coreConcepts: [
      {
        heading: '1. The 4 Access Levels & Visibility Matrix',
        description: `Accessibility boundaries across classes, packages, and subclasses:`,
        bulletPoints: [
          'private: Accessible ONLY within the declaring class.',
          'default (Package-Private): Accessible within the same package. No modifier keyword.',
          'protected: Accessible within the same package AND by subclasses in different packages (via inheritance).',
          'public: Globally accessible from anywhere.',
          'Top-level classes can ONLY be public or package-private (never private or protected).'
        ]
      }
    ],
    subtopicBreakdowns: {
      'The 4 Access Levels: public, protected, package-private, private': {
        title: 'The 4 Access Levels Matrix',
        conceptSummary: 'Scoping rules from tightest (private) to broadest (public).',
        keyPoints: ['Use package-private to hide internal service implementation classes within a module.'],
        interviewQA: {
          question: 'Where are protected members accessible from?',
          answer: 'Protected members are accessible from all classes in the same package, plus subclasses in different packages through inheritance.'
        }
      }
    }
  }
};
