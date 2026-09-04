import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_11_TO_15: Record<string, TopicContent> = {
  'level-11-encapsulation': {
    slug: 'level-11-encapsulation',
    title: 'Level 11: Encapsulation',
    levelHeading: 'LEVEL 11 — Encapsulation 🟢 → 🟡',
    badge: '₹24+ LPA SDE Architecture',
    targetBanner: {
      roles: 'For ₹24+ LPA SDE roles (Presidio, Oracle, Zoho R&D, Amazon, Microsoft, Adobe, Atlassian, Walmart, JPMorgan, etc.)',
      tagline: 'Interviewers don\'t expect textbook definitions. They expect you to explain why a technology exists, how it works internally, what problem it solves, and its trade-offs. So let\'s study like an SDE, not like someone preparing for a theory exam.'
    },
    overview: `Encapsulation is one of the four pillars of OOP, and for SDE interviews, the important thing is to understand that:
Encapsulation is not simply "private variables + getters/setters."
The real idea is: Keep an object's state and the operations that control that state together, while restricting direct access to the internal representation.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'What is Encapsulation?',
        officialDefinition: 'Encapsulation is the OOP principle of bundling an object\'s data and the methods that operate on that data into a single unit, while controlling how that data can be accessed or modified.',
        whyNeeded: `In Java, encapsulation is commonly implemented using:
• private fields
• Controlled methods
• Access modifiers
• Validation / business rules

Without Encapsulation:
class BankAccount { double balance; }
Anyone can do:
account.balance = -50000;
There is no control.

With Encapsulation:
class BankAccount {
    private double balance;
    public void deposit(double amount) {
        if (amount > 0) balance += amount;
    }
    public double getBalance() { return balance; }
}
Now account.deposit(5000) works, but account.balance = -50000 is impossible!`,
        diagram: `             BankAccount
       ┌─────────────────────┐
       │ private balance     │  ← Data
       │                     │
       │ deposit()           │  ← Controlled operations
       │ withdraw()          │
       │ getBalance()        │
       └─────────────────────┘
                 ▲
                 │
          Controlled access`,
        interviewAnswer: 'Encapsulation is the principle of bundling an object\'s state and behavior together while controlling access to its internal state. In Java, it is commonly achieved using private fields and controlled public or protected methods.'
      },
      {
        number: 2,
        question: 'Why is Encapsulation Important?',
        explanation: `The biggest reason is control over object state.
Suppose we have:
class Employee { public double salary; }
Anyone can write employee.salary = -100000; and the class cannot enforce any rule.

With encapsulation:
class Employee {
    private double salary;
    public void setSalary(double salary) {
        if (salary >= 0) this.salary = salary;
    }
    public double getSalary() { return salary; }
}

Encapsulation gives us:
1. Controlled access: The class decides what external code can access.
2. Validation: e.g. if (salary >= 0).
3. Maintainability: Internal implementation can change without affecting callers.
4. Protection of invariants: An invariant is a condition that should always remain valid (e.g. balance >= 0).
5. Reduced coupling: External code depends on the public interface rather than internal representation.`,
        interviewAnswer: 'Encapsulation is important because it allows a class to control access to its state, enforce invariants and validation rules, hide implementation details, and reduce coupling between components.'
      },
      {
        number: 3,
        question: 'How is Encapsulation Achieved in Java?',
        keyPoints: [
          '1. Make fields private: Restricts direct access from other classes.',
          '2. Expose controlled operations: Provide public methods that validate business rules before changing state.',
          '3. Use access modifiers: private, default, protected, and public control visibility.',
          '4. Put related state and behavior inside the class: Keep data and the logic controlling that data together.'
        ],
        interviewAnswer: 'Encapsulation is achieved in Java by declaring fields as private, exposing public methods with business validation to read or modify the state, and applying appropriate access modifiers.'
      },
      {
        number: 4,
        question: 'What is Data Hiding?',
        officialDefinition: 'Data hiding means preventing direct external access to an object\'s internal data, typically using the private access modifier.',
        diagram: `Outside World
      │
      │ ❌ Direct access
      ▼
private salary
      │
      │
      ▼
Controlled methods`,
        interviewAnswer: 'Data hiding is the practice of restricting direct access to an object\'s internal data, typically using access control such as the private modifier.'
      },
      {
        number: 5,
        question: 'Difference Between Encapsulation and Data Hiding',
        table: {
          headers: ['Encapsulation', 'Data Hiding'],
          rows: [
            ['Bundles data and behavior together', 'Restricts access to internal data'],
            ['Broader OOP concept', 'Part of access control'],
            ['Focuses on controlled interaction', 'Focuses on preventing direct access'],
            ['Achieved through classes, methods, APIs', 'Commonly achieved using private'],
            ['Example: BankAccount with balance + methods', 'Example: balance being private']
          ]
        },
        explanation: `Easy way to remember:
Think of a car.
• Encapsulation: The car combines Engine, Brakes, Transmission, and Controls into one system.
• Data Hiding: You don't directly manipulate fuel injection or transmission gears. You interact through accelerator, brake, and steering pedals.
Encapsulation = packaging + controlled interface. Data hiding = restricting internal access.`,
        interviewAnswer: 'Data hiding is a subset of encapsulation focused on restricting direct access to state (typically with private). Encapsulation is the broader architectural principle of packaging state and behavior together with a controlled interface.'
      },
      {
        number: 6,
        question: 'Why Are Fields Often Private?',
        explanation: `Because fields represent an object's internal state.
If balance is public, external code can assign balance = -100000, violating business invariants.
Instead, making balance private allows withdraw() to check if amount > balance before deducting.
Important SDE Point: private does not mean data is encrypted. It means other classes cannot directly access that field through normal Java access rules.`,
        interviewAnswer: 'Fields are declared private to protect internal object state from unauthorized or invalid external modifications, ensuring the class retains total control over its invariants.'
      },
      {
        number: 7,
        question: 'What Are Getters and Setters?',
        explanation: `Getters and setters are methods used to read or modify encapsulated fields.
Getter: Reads a value (e.g. getBalance()).
Setter: Changes a value with validation (e.g. setAge(int age) { if (age >= 0) this.age = age; }).`,
        code: `class Student {
    private String name;
    private int age;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) {
        if (age >= 0) this.age = age;
    }
}
Student s = new Student();
s.setName("Gowtham");
s.setAge(21);
System.out.println(s.getName()); // Gowtham
System.out.println(s.getAge());  // 21`,
        output: `Gowtham
21`,
        interviewAnswer: 'Getters and setters are accessor and mutator methods that provide controlled, validated read and write access to an object\'s private fields.'
      },
      {
        number: 8,
        question: 'Can Encapsulation Exist Without Getters and Setters?',
        explanation: `ABSOLUTELY YES! This is a very important interview point.
Many beginners think Encapsulation = private fields + getters + setters. That's incomplete and often weak!
Consider:
class BankAccount {
    private double balance;
    public void deposit(double amount) { if (amount > 0) balance += amount; }
    public void withdraw(double amount) { if (amount > 0 && amount <= balance) balance -= amount; }
}
There is NO setter for balance! That's intentional. We don't want external callers to arbitrarily do account.setBalance(999999999).
Instead, the class exposes meaningful domain operations: deposit() and withdraw().
Another example is Counter: exposes increment() and getCount(), but no setCount().`,
        interviewAnswer: 'Yes. Encapsulation does not require getters and setters. A class can expose only meaningful domain operations while keeping its internal state private. In fact, unrestricted setters can weaken encapsulation by allowing arbitrary state changes.'
      },
      {
        number: 9,
        question: 'What Are the Benefits of Encapsulation?',
        keyPoints: [
          '1. Controlled state modification: Only approved operations can modify data.',
          '2. Validation: The class can reject invalid data before updating fields.',
          '3. Maintains invariants: Guarantees conditions like balance >= 0 at all times.',
          '4. Implementation independence: Internal field representation can change (e.g., from fullName to firstName + lastName) without breaking external callers calling getFullName().',
          '5. Reduced coupling: Callers depend on public API methods rather than internal storage.',
          '6. Better maintainability: Business rules reside inside the class responsible for the data.'
        ],
        interviewAnswer: 'Encapsulation provides controlled state modification, strict data validation, invariant protection, implementation independence, reduced coupling, and superior long-term maintainability.'
      },
      {
        number: 10,
        question: 'Give a Real-World Example of Encapsulation',
        explanation: `The best example is a Bank Account.
You shouldn't be able to directly modify balance, accountNumber, or transactionHistory.
Instead, you interact through controlled operations: deposit(), withdraw(), transfer(), and getBalance().`,
        code: `class BankAccount {
    private final String accountNumber;
    private double balance;

    public BankAccount(String accountNumber, double initialBalance) {
        if (accountNumber == null || accountNumber.isBlank()) {
            throw new IllegalArgumentException("Invalid account number");
        }
        if (initialBalance < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }
        this.accountNumber = accountNumber;
        this.balance = initialBalance;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit must be positive");
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Withdrawal must be positive");
        if (amount > balance) throw new IllegalArgumentException("Insufficient balance");
        balance -= amount;
    }

    public double getBalance() { return balance; }
    public String getAccountNumber() { return accountNumber; }
}

public class Main {
    public static void main(String[] args) {
        BankAccount account = new BankAccount("ACC101", 10000);
        account.deposit(5000);
        account.withdraw(3000);
        System.out.println("Account : " + account.getAccountNumber());
        System.out.println("Balance : " + account.getBalance());
    }
}`,
        output: `Account : ACC101
Balance : 12000.0`,
        interviewAnswer: 'A classic example is a BankAccount class where balance and accountNumber are private, and the only way to alter balance is via deposit() or withdraw() methods that validate limits and enforce non-negative balances.'
      }
    ],
    comprehensiveDemo: {
      title: 'Complete Example — All Encapsulation Concepts',
      code: `class Employee {
    // Data hiding
    private final int id;
    private String name;
    private double salary;

    // Constructor
    public Employee(int id, String name, double salary) {
        if (id <= 0) throw new IllegalArgumentException("Invalid ID");
        if (salary < 0) throw new IllegalArgumentException("Salary cannot be negative");
        this.id = id;
        this.name = name;
        this.salary = salary;
    }

    // Getter
    public int getId() { return id; }
    public String getName() { return name; }

    // Controlled modification
    public void changeName(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Name cannot be empty");
        this.name = name;
    }

    // Getter
    public double getSalary() { return salary; }

    // Controlled modification
    public void increaseSalary(double percentage) {
        if (percentage <= 0) throw new IllegalArgumentException("Percentage must be positive");
        salary += salary * percentage / 100;
    }
}

public class Main {
    public static void main(String[] args) {
        Employee employee = new Employee(101, "Gowtham", 50000);
        System.out.println(employee.getName());
        System.out.println(employee.getSalary());

        employee.increaseSalary(10);
        System.out.println(employee.getSalary());

        employee.changeName("Gowtham C D");
        System.out.println(employee.getName());
    }
}`,
      output: `Gowtham
50000.0
55000.0
Gowtham C D`,
      deepDiveNotes: [
        'Notice what we didn\'t provide: setSalary()!',
        'Why? Because salary shouldn\'t be arbitrarily replaced with an unrestricted setter. Instead, increaseSalary(10) represents a meaningful business operation.'
      ]
    },
    sdeTraps: [
      {
        title: 'Q1. Is encapsulation the same as data hiding?',
        answer: 'No. Data hiding focuses on restricting access to internal data (e.g. private fields), while encapsulation is the broader concept of combining state and behavior and exposing controlled access to that state.'
      },
      {
        title: 'Q2. Is private enough to achieve good encapsulation?',
        answer: 'Not necessarily! If a private field has a setter that allows arbitrary or invalid state (e.g. setSalary(-100000)), the invariants are still broken. Good encapsulation requires state-control and validation rules.'
      },
      {
        title: 'Q3. Are getters and setters mandatory for encapsulation?',
        answer: 'No. You can expose meaningful operations instead: deposit(), withdraw(), increaseSalary(), activateAccount().'
      },
      {
        title: 'Q4. Why should we avoid unnecessary setters?',
        answer: 'Because setBalance(100000) allows arbitrary state manipulation, whereas deposit(1000) and withdraw(500) allow the class to enforce its business rules.'
      },
      {
        title: 'Q5. Can an immutable class be encapsulated?',
        answer: 'Yes! In fact, immutable classes (like String or a final class with final fields) are a prime example of encapsulation: their state is established once during construction and cannot be mutated.'
      }
    ],
    mentalModel: {
      title: 'The Encapsulation Mental Model',
      diagram: `             ENCAPSULATION
                   │
        ┌──────────┴──────────┐
        │                     │
      STATE                 BEHAVIOR
        │                     │
   private fields       public methods
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
          CONTROLLED ACCESS
                   │
                   ▼
          VALID OBJECT STATE`,
      keyTakeaways: [
        'Strongest one-line interview answer: "Encapsulation is the practice of keeping an object\'s state and the operations that manage that state together while exposing only a controlled interface to the outside world."',
        'Encapsulation = Broader design principle (combining state + behavior).',
        'Data Hiding = Restricting direct access (e.g., using private).',
        'Getters/Setters = One possible implementation technique, NOT mandatory.'
      ]
    }
  },
  'level-12-inheritance': {
    slug: 'level-12-inheritance',
    title: 'Level 12: Inheritance & Class Hierarchies',
    levelHeading: 'LEVEL 12 — Inheritance & Class Hierarchies 🟢 → 🟡',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Inheritance models IS-A relationships allowing subclasses to acquire superclass properties and methods. Master single inheritance architecture, the Diamond Problem, and Composition Over Inheritance.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'Why Does Java Disallow Multiple Class Inheritance (The Diamond Problem)?',
        explanation: `When Class D extends both Class B and Class C (which both inherit from Class A), and both override method m(), the compiler cannot determine which method D inherits.
Java eliminates this ambiguity by permitting single class inheritance, but allowing multiple interface implementations because interfaces do not carry mutable state.`,
        interviewAnswer: 'Java disallows multiple class inheritance to prevent the Diamond Problem—where method resolution and state duplication become ambiguous when inheriting from multiple classes with conflicting implementations.'
      }
    ]
  },
  'level-13-polymorphism': {
    slug: 'level-13-polymorphism',
    title: 'Level 13: Polymorphism & Dynamic Dispatch',
    levelHeading: 'LEVEL 13 — Polymorphism & Dynamic Dispatch 🟢 → 🟡',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Polymorphism allows "one interface, multiple implementations." Understand compile-time overloading vs runtime overriding, virtual method tables (vtables), dynamic method dispatch, and covariant return types.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'How Does Dynamic Method Dispatch Work Internally (vtables)?',
        explanation: `Overriding is resolved dynamically at runtime based on the actual object type on the Heap. The JVM uses a Virtual Method Table (vtable) stored in Metaspace for each class. At runtime, the JVM looks up the vtable offset to execute the subclass override.`,
        interviewAnswer: 'Dynamic method dispatch uses virtual method tables (vtables) located in Metaspace. When a method is called on a reference, the JVM looks up the actual object\'s vtable at runtime to resolve and invoke the subclass override.'
      }
    ]
  },
  'level-14-abstraction-interfaces': {
    slug: 'level-14-abstraction-interfaces',
    title: 'Level 14: Abstraction & Modern Interfaces',
    levelHeading: 'LEVEL 14 — Abstraction & Modern Interfaces 🟢 → 🟡',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Abstraction hides complex implementation details behind clean public contracts. Master Abstract Classes vs Interfaces, default/static interface methods (Java 8), private methods (Java 9), and @FunctionalInterface.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'Abstract Classes vs Modern Interfaces in Java',
        explanation: `• Abstract Classes: Represent core "IS-A" hierarchy, can hold instance state (non-final fields), and declare constructors.
• Interfaces: Represent "CAN-DO" behavioral contracts. Cannot hold instance fields or constructors. Can contain abstract methods, default methods, static methods, and private helper methods.`,
        interviewAnswer: 'Abstract classes are designed for code reuse and shared mutable state across closely related classes in an inheritance hierarchy. Interfaces define decoupled contracts that can be implemented by any class regardless of its position in the hierarchy.'
      }
    ]
  },
  'level-15-access-modifiers': {
    slug: 'level-15-access-modifiers',
    title: 'Level 15: Access Modifiers & Scoping',
    levelHeading: 'LEVEL 15 — Access Modifiers & Scoping 🟢 → 🟡',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Master the 4 Java access modifiers: public, protected, default (package-private), and private, cross-package inheritance rules, and package-private clean architecture.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'The 4 Access Modifiers Visibility Matrix',
        table: {
          headers: ['Modifier', 'Same Class', 'Same Package', 'Subclass (Diff Pkg)', 'World'],
          rows: [
            ['private', 'Yes', 'No', 'No', 'No'],
            ['default (package-private)', 'Yes', 'Yes', 'No', 'No'],
            ['protected', 'Yes', 'Yes', 'Yes', 'No'],
            ['public', 'Yes', 'Yes', 'Yes', 'Yes']
          ]
        },
        interviewAnswer: 'Java provides 4 visibility levels: private (declaring class only), default/package-private (same package), protected (same package plus subclasses), and public (everywhere).'
      }
    ]
  }
};
