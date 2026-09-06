import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_6_TO_10: Record<string, TopicContent> = {
  'level-6-operators-control-flow': {
    slug: 'level-6-operators-control-flow',
    title: 'Level 6: Operators & Control Flow',
    levelHeading: 'LEVEL 6 — Operators & Control Flow 🟢',
    badge: '₹24+ LPA SDE Architecture',
    targetBanner: {
      roles: 'For ₹24+ LPA SDE roles (Presidio, Oracle, Zoho R&D, Amazon, Microsoft, Adobe, Atlassian, Walmart, JPMorgan, etc.)',
      tagline: 'Interviewers don\'t expect textbook definitions. They expect you to explain why a technology exists, how it works internally, what problem it solves, and its trade-offs. So let\'s study like an SDE, not like someone preparing for a theory exam.'
    },
    overview: `Master operator precedence, short-circuit boolean evaluation, bitwise manipulations, modern Java switch expressions with pattern matching (yield), and loop memory mechanics.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'Short-Circuit Evaluation (&&, ||) vs Bitwise Operators (&, |)',
        explanation: `• Logical Short-Circuit (&&, ||): Skips evaluation of the right operand if the left operand determines the outcome. This is essential for defensive null checks:
if (user != null && user.isActive()) { ... }
If user is null, user.isActive() is never evaluated, avoiding a NullPointerException.
• Bitwise / Eager (&, |): Always evaluates both operands regardless of the left operand's truth value. If user is null, it evaluates user.isActive() and throws a NullPointerException!`,
        interviewAnswer: 'Short-circuit operators (&& and ||) cease expression evaluation as soon as the outcome is determined, which is essential for null-safety guards. Bitwise/eager operators (& and |) evaluate both operands unconditionally, making them dangerous for null checking.'
      }
    ]
  },
  'level-7-arrays': {
    slug: 'level-7-arrays',
    title: 'Level 7: Arrays & Memory Model',
    levelHeading: 'LEVEL 7 — Arrays & Memory Model 🟢',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Arrays in Java are first-class heap objects with fixed length, contiguous memory storage, O(1) index access, CPU cache line benefits, and boundary verification.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'How are Arrays Allocated and Stored in Memory?',
        explanation: `In Java, arrays are true objects allocated on the Heap, even when holding primitive values:
• Contiguous Memory: Elements are laid out sequentially in memory, enabling the CPU hardware prefetcher to load adjacent cache lines for ultra-fast traversal.
• Object Header: In a 64-bit JVM, an array object has a 16-byte header containing Mark Word, Klass Word, and a 4-byte length field.
• O(1) Access: Calculated via direct memory offset: Address = BaseAddress + (index * elementSize).`,
        interviewAnswer: 'Arrays in Java are first-class objects allocated on the heap with a 16-byte header storing array length. Elements are stored in contiguous memory locations, providing O(1) random index access and superior CPU cache locality compared to pointer-based collections.'
      }
    ]
  },
  'level-8-strings': {
    slug: 'level-8-strings',
    title: 'Level 8: Strings, Immutability & String Pool',
    levelHeading: 'LEVEL 8 — Strings, Immutability & String Pool 🟢',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Deep dive into String immutability, the String Constant Pool (SCP) in Heap memory, .intern() mechanics, String vs StringBuilder vs StringBuffer, and hash code caching.`,
    sdeQuestions: [
      {
        number: 1,
        question: 'Why is String Immutable in Java?',
        explanation: `String immutability is one of the most critical design decisions in Java for 4 major reasons:
1. String Constant Pool (SCP): Permits identical string literals to share the exact same memory instance, saving massive heap space.
2. Thread Safety: Immutable objects are inherently thread-safe and can be shared freely across threads without synchronization locks.
3. Security: Sensitive parameters (DB URLs, file paths, passwords, network ports) cannot be modified after validation.
4. HashCode Caching: Since content never mutates, the hashCode is calculated once and cached, enabling O(1) HashMap lookups.`,
        interviewAnswer: 'Strings are immutable in Java to support String Constant Pool memory optimization, ensure thread safety without locking, guarantee security for class loading and network connections, and allow caching of the hash code for high-speed hash table operations.'
      }
    ]
  },
  'level-9-oop-fundamentals': {
    slug: 'level-9-oop-fundamentals',
    title: 'Level 9: OOP Fundamentals',
    levelHeading: 'LEVEL 9 — OOP Fundamentals 🟢',
    badge: '₹24+ LPA SDE Architecture',
    targetBanner: {
      roles: 'For ₹24+ LPA SDE roles (Presidio, Oracle, Zoho R&D, Amazon, Microsoft, Adobe, Atlassian, Walmart, JPMorgan, etc.)',
      tagline: 'Interviewers don\'t expect textbook definitions. They expect you to explain why a technology exists, how it works internally, what problem it solves, and its trade-offs. So let\'s study like an SDE, not like someone preparing for a theory exam.'
    },
    overview: `Object-Oriented Programming (OOP) is the core of Java. Everything after this—Constructors, Inheritance, Polymorphism, Abstraction, Interfaces, Collections, Spring Boot—builds on these concepts.
For 24+ LPA SDE interviews, simply saying "OOP is programming using objects" is not enough. Interviewers expect you to understand:
• Why OOP was introduced
• How objects are represented in memory
• How references work
• How the JVM allocates objects
• How Garbage Collection reclaims memory`,
    sdeQuestions: [
      {
        number: 1,
        question: 'What is Object-Oriented Programming (OOP)?',
        officialDefinition: 'Object-Oriented Programming (OOP) is a programming paradigm that models software as a collection of objects, where each object encapsulates data (state) and behavior (methods). Unlike procedural programming, OOP organizes programs around objects that interact with each other.',
        whyNeeded: `Early procedural languages (like C) stored data and functions separately:
Employee Data: Name, Age, Salary
Functions: calculateSalary(), updateEmployee(), printEmployee()

Problems:
• Poor data security
• Difficult to maintain
• Difficult to reuse
• Tight coupling

OOP groups data and methods together inside one object:
Employee Object:
┌───────────────────────────────┐
│ Name, Age, Salary             │
│ calculateSalary()             │
│ updateEmployee()              │
│ printEmployee()               │
└───────────────────────────────┘
Everything related to an employee stays inside one object.`,
        realWorldExample: `Think about a Car.
A car has:
• State: Color, Brand, Speed
• Behavior: Start(), Accelerate(), Brake()
Java models software exactly like this.`,
        code: `class Car {
    String brand;
    String color;

    void start() {
        System.out.println("Car Started");
    }
}

public class Main {
    public static void main(String[] args) {
        Car car = new Car();
        car.brand = "BMW";
        car.color = "Black";
        car.start();
    }
}`,
        output: `Car Started`,
        interviewAnswer: 'Object-Oriented Programming is a programming paradigm that organizes software as a collection of objects. Each object combines state (data) and behavior (methods), enabling modularity, encapsulation, code reuse, and maintainability.'
      },
      {
        number: 2,
        question: 'Why is OOP Important?',
        explanation: `Modern software systems are large and complex. Imagine building:
• WhatsApp
• Amazon
• Banking System
• Hospital Management

Without OOP:
• Thousands of global variables
• Thousands of unrelated functions
• Difficult debugging
• Difficult testing

OOP solves these issues through:
1. Encapsulation: Protects data.
2. Reusability: Reuse existing classes.
3. Modularity: Breaks software into independent components.
4. Maintainability: Easy to update.
5. Scalability: Large projects become manageable.`,
        interviewAnswer: 'OOP improves software design by promoting modularity, encapsulation, code reuse, maintainability, scalability, and easier testing. It is well suited for building large enterprise applications.'
      },
      {
        number: 3,
        question: 'What are the Four Pillars of OOP?',
        explanation: `The four fundamental principles are:
1. Encapsulation: Wrapping data and methods into one unit while controlling access.
Example:
class BankAccount {
    private double balance;
    public void deposit(double amount) { balance += amount; }
}

2. Inheritance: Acquiring properties from another class.
class Animal {}
class Dog extends Animal {}

3. Polymorphism: One interface, multiple implementations.
Animal a = new Dog(); // Method executed depends on actual object

4. Abstraction: Hide implementation details.
interface Payment { void pay(); } // Users call pay() without knowing internal implementation`,
        interviewAnswer: 'The four pillars of OOP are Encapsulation, Inheritance, Polymorphism, and Abstraction. Together they improve data protection, code reuse, flexibility, and maintainability.'
      },
      {
        number: 4,
        question: 'What is a Class?',
        officialDefinition: 'A class is a blueprint or template that defines the properties (fields) and behaviors (methods) of objects. A class itself does not consume memory for instances until objects are created.',
        diagram: `Blueprint (House Plan) ───► Actual House (Object)`,
        code: `class Student {
    String name;
    int age;

    void study() {
        System.out.println("Studying");
    }
}
// No object yet. Only a blueprint.`,
        interviewAnswer: 'A class is a user-defined blueprint that defines the state and behavior of objects. Objects are instances created from a class.'
      },
      {
        number: 5,
        question: 'What is an Object?',
        explanation: `An object is a runtime instance of a class. Objects occupy memory.
Example: Student s = new Student();
Here new Student() creates an object.`,
        diagram: `Stack           Heap
┌───┐           ┌──────────────────┐
│ s │──────────►│ Student Object   │
└───┘           │ name = null      │
                │ age = 0          │
                └──────────────────┘`,
        interviewAnswer: 'An object is a runtime instance of a class. It contains its own copy of instance variables and can invoke the methods defined by the class.'
      },
      {
        number: 6,
        question: 'Difference between Class and Object',
        table: {
          headers: ['Class', 'Object'],
          rows: [
            ['Blueprint', 'Instance of a class'],
            ['Logical entity', 'Physical entity in memory'],
            ['No instance data', 'Holds actual data'],
            ['Defined once', 'Many objects can be created'],
            ['Doesn\'t represent a real entity by itself', 'Represents a real entity at runtime']
          ]
        },
        code: `class Car {} // Class

Car c1 = new Car(); // Object 1
Car c2 = new Car(); // Object 2`,
        interviewAnswer: 'A class is a logical blueprint defined once in code, consuming no heap memory for instance fields. An object is a concrete physical entity created dynamically on the heap at runtime that holds actual state.'
      },
      {
        number: 7,
        question: 'What is Object State?',
        explanation: `State represents the current values stored in an object's fields.`,
        code: `class Car {
    String color;
    int speed;
}

Car car = new Car();
car.color = "Red";
car.speed = 120;
// State: color = Red, speed = 120`,
        interviewAnswer: 'Object state is the collection of values stored in an object\'s instance variables at a given point in time.'
      },
      {
        number: 8,
        question: 'What is Object Behavior?',
        explanation: `Behavior is defined by methods that operate on an object.`,
        code: `class Fan {
    void switchOn() {}
    void switchOff() {}
}
// Methods represent behavior.`,
        interviewAnswer: 'Object behavior consists of the actions an object can perform, represented by its methods.'
      },
      {
        number: 9,
        question: 'What is Object Identity?',
        explanation: `Identity uniquely distinguishes one object from another, even if their contents are identical.
Example:
Student s1 = new Student();
Student s2 = new Student();
Even if s1.name = "John" and s2.name = "John", they are completely different objects.`,
        diagram: `Stack           Heap
┌────┐          ┌──────────────┐
│ s1 │─────────►│ Object A     │
└────┘          └──────────────┘
┌────┐          ┌──────────────┐
│ s2 │─────────►│ Object B     │
└────┘          └──────────────┘`,
        interviewAnswer: 'Object identity is the unique identity of an object in memory. Two objects can have identical state but still have different identities because they occupy different memory locations.'
      },
      {
        number: 10,
        question: 'How are Objects Created?',
        explanation: `Using the new keyword: Student s = new Student();
Steps:
1. JVM allocates memory on the heap.
2. Instance variables receive default values.
3. Constructor executes.
4. Reference to the object is returned.`,
        diagram: `Stack               Heap
┌───┐               ┌────────────────┐
│ s │──────────────►│ Student Object │
└───┘               └────────────────┘`,
        interviewAnswer: 'Objects are typically created using the new keyword. The JVM allocates memory on the heap, initializes instance variables, invokes the constructor, and returns a reference to the newly created object.'
      },
      {
        number: 11,
        question: 'Where are Objects Stored?',
        explanation: `Objects are stored in Heap memory.
Reference variables are stored:
• On the stack (for local variables)
• Inside other objects (for fields)
Example: Student s = new Student();
s is a local reference on the Stack; Student object is on the Heap.`,
        interviewAnswer: 'Objects are allocated on the heap, while references to those objects are stored wherever the reference variable itself is declared, such as the stack for local variables.'
      },
      {
        number: 12,
        question: 'What is a Reference?',
        explanation: `A reference is a variable that stores the location of an object, not the object itself.
Example: Student s = new Student();
Student s is a reference variable pointing to the object.`,
        interviewAnswer: 'A reference is a variable that holds the address-like reference to an object in memory. It allows the program to access the object\'s fields and methods.'
      },
      {
        number: 13,
        question: 'What is an Object Reference?',
        explanation: `Object reference means the value stored inside a reference variable that identifies a specific object.
Example: Student s = new Student();
Reference variable: s
Object reference: 0x100A (conceptually)
Java hides the actual physical memory address, but internally the JVM uses object references.`,
        interviewAnswer: 'An object reference is the internal value held by a reference variable that allows the JVM to locate and access an object.'
      },
      {
        number: 14,
        question: 'Can Multiple References Point to the Same Object?',
        explanation: `Yes! Multiple reference variables can point to the exact same object in heap memory.`,
        code: `class Student {
    String name;
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student();
        s1.name = "Alice";

        Student s2 = s1; // Copies reference pointer
        s2.name = "Bob";

        System.out.println(s1.name); // Prints Bob
        System.out.println(s2.name); // Prints Bob
    }
}`,
        output: `Bob
Bob`,
        diagram: `Stack           Heap
┌────┐
│ s1 │─────┐
└────┘     │    ┌─────────────────┐
           ├───►│ Student         │
┌────┐     │    │ name = "Bob"    │
│ s2 │─────┘    └─────────────────┘
└────┘`,
        interviewAnswer: 'Yes. Multiple reference variables can point to the same object. Any modification made through one reference is visible through all references pointing to that object.'
      },
      {
        number: 15,
        question: 'What Happens When an Object Has No Reference?',
        explanation: `Example:
Student s = new Student();
s = null;
Heap: Student Object (No references pointing to it).
The object becomes eligible for garbage collection. It is not destroyed immediately; the JVM decides when to reclaim memory.`,
        interviewAnswer: 'When an object becomes unreachable because no live references point to it, it becomes eligible for garbage collection. The JVM later reclaims its memory automatically.'
      },
      {
        number: 16,
        question: 'What is Garbage Collection?',
        officialDefinition: 'Garbage Collection (GC) is the JVM\'s automatic memory management mechanism that identifies and reclaims memory occupied by objects that are no longer reachable.',
        whyNeeded: `Without GC:
• Memory leaks become common.
• Developers must manually free memory (like malloc/free in C).
• Incorrect deallocation causes dangling pointers and crashes.
Java automates this process.`,
        code: `class Student {}

public class Main {
    public static void main(String[] args) {
        Student s = new Student();
        s = null;
        System.gc(); // Request, NOT a guarantee
        System.out.println("Program continues...");
    }
}`,
        explanation: 'Important: System.gc() only requests garbage collection. The JVM is free to ignore the request.',
        diagram: `new Student()
     │
     ▼
Heap Object Created
     │
     ▼
Reference Exists
     │
     ▼
Reference Removed (s = null)
     │
     ▼
Object Becomes Unreachable
     │
     ▼
Garbage Collector Reclaims Memory`,
        interviewAnswer: 'Garbage Collection is the JVM\'s automatic process of reclaiming memory occupied by unreachable objects. It helps prevent memory leaks and eliminates the need for manual memory deallocation.'
      }
    ],
    comprehensiveDemo: {
      title: 'Comprehensive Example (Applying All Concepts)',
      code: `class Student {
    // State
    String name;
    int age;

    // Behavior
    void display() {
        System.out.println("Name : " + name);
        System.out.println("Age  : " + age);
    }
}

public class OOPFundamentalsDemo {
    public static void main(String[] args) {
        // Creating an object
        Student s1 = new Student();
        s1.name = "Gowtham";
        s1.age = 21;

        // Another reference to the same object
        Student s2 = s1;
        s2.age = 22;

        System.out.println("Displaying using s1:");
        s1.display();

        System.out.println();

        System.out.println("Displaying using s2:");
        s2.display();

        // Remove one reference
        s1 = null;

        System.out.println("\\ns1 = " + s1);

        // Object is still reachable through s2
        s2.display();

        // Remove last reference
        s2 = null;

        // Now the Student object is eligible for GC
        System.gc();

        System.out.println("\\nProgram continues...");
    }
}`,
      output: `Displaying using s1:
Name : Gowtham
Age  : 22

Displaying using s2:
Name : Gowtham
Age  : 22

s1 = null
Name : Gowtham
Age  : 22

Program continues...`
    },
    sdeTraps: [
      {
        title: 'Q1. What is the difference between a class and an object?',
        answer: 'Class -> Blueprint or template. Object -> Runtime instance created from that blueprint.'
      },
      {
        title: 'Q2. What is stored in the stack and heap?',
        code: `Student s = new Student();`,
        answer: 's (local reference variable) -> Stack. Student object -> Heap.'
      },
      {
        title: 'Q3. Predict the output',
        code: `class Car { String color; }
public class Test {
    public static void main(String[] args) {
        Car c1 = new Car();
        c1.color = "Red";
        Car c2 = c1;
        c2.color = "Blue";
        System.out.println(c1.color);
    }
}`,
        output: 'Blue',
        reason: 'c1 and c2 refer to the exact same object in heap memory.'
      },
      {
        title: 'Q4. Is null an object?',
        answer: 'No. null is a special literal that represents the absence of an object reference.'
      },
      {
        title: 'Q5. Does System.gc() guarantee garbage collection?',
        answer: 'No. It only requests that the JVM perform garbage collection. The JVM decides if and when to run the garbage collector based on heap pressure.'
      }
    ],
    mentalModel: {
      title: 'OOP Mental Model & Key Takeaways',
      diagram: `Stack (References)        Heap (Instances)
┌───────┐                 ┌───────────────────────────┐
│  s1   │────────────────►│ Student                   │
└───────┘                 │ State: name="Gowtham"     │
┌───────┐                 │ Behavior: display()       │
│  s2   │────────────────►│ Identity: 0x4f3a (unique) │
└───────┘                 └───────────────────────────┘`,
      keyTakeaways: [
        'Class defines the structure; objects represent real entities at runtime.',
        'Objects encapsulate state (fields) and behavior (methods).',
        'Objects are stored on the heap; local reference variables are stored on the stack.',
        'Multiple references can point to the same object.',
        'When an object becomes unreachable, it is eligible for garbage collection.',
        'Java\'s automatic garbage collection simplifies memory management and is one of the language\'s major advantages.'
      ]
    }
  },
  'level-10-constructors': {
    slug: 'level-10-constructors',
    title: 'Level 10: Constructors',
    levelHeading: 'LEVEL 10 — Constructors 🟢 → 🟡',
    badge: '₹24+ LPA SDE Architecture',
    targetBanner: {
      roles: 'For ₹24+ LPA SDE roles (Presidio, Oracle, Zoho R&D, Amazon, Microsoft, Adobe, Atlassian, Walmart, JPMorgan, etc.)',
      tagline: 'Interviewers don\'t expect textbook definitions. They expect you to explain why a technology exists, how it works internally, what problem it solves, and its trade-offs. So let\'s study like an SDE, not like someone preparing for a theory exam.'
    },
    overview: `Constructors are important because they explain how an object gets initialized when it is created.
For SDE-level interviews, don't memorize only "constructor is used to initialize an object." You should understand:
Object creation -> constructor invocation -> constructor chaining -> this() / super() -> inheritance rules`,
    sdeQuestions: [
      {
        number: 1,
        question: 'What is a Constructor?',
        officialDefinition: 'A constructor is a special member of a class that is executed when an object is created.',
        code: `class Student {
    String name;
    Student() {
        name = "Gowtham";
    }
}

// Creating the object:
Student s = new Student();
System.out.println(s.name); // Prints: Gowtham`,
        explanation: 'The important point is: new Student() creates the object and invokes the constructor.',
        interviewAnswer: 'A constructor is a special member of a class that is invoked during object creation and is primarily used to initialize the object\'s state.'
      },
      {
        number: 2,
        question: 'Why are Constructors Used?',
        explanation: `Without a constructor:
Student s = new Student();
s.name = "Gowtham";
s.age = 21;
The object has to be initialized manually.

With a constructor:
Student s = new Student("Gowtham", 21);
Initialization happens immediately and ensures the object is created in a valid initialized state.`,
        code: `class Student {
    String name;
    int age;

    Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
}`,
        interviewAnswer: 'Constructors centralize object initialization and ensure that required state can be established at the time an object is created.'
      },
      {
        number: 3,
        question: 'What are the Characteristics of Constructors?',
        keyPoints: [
          '1. Same name as the class: class Student { Student() {} }',
          '2. No return type: Student() {} is valid. void Student() {} is a method, not a constructor!',
          '3. Automatically invoked during object creation: new Student();',
          '4. Can be overloaded: Student() {}, Student(String name) {}, Student(String name, int age) {}',
          '5. Cannot be inherited: Constructors belong to the class in which they are declared.',
          '6. Cannot be overridden: Overriding requires inheritance, but constructors are not inherited.',
          '7. Can have access modifiers: public, protected, private, or package-private.'
        ],
        interviewAnswer: 'Constructors have the same name as the class, have no return type, are automatically executed on new object instantiation, can be overloaded, can take access modifiers, but cannot be inherited, overridden, static, or final.'
      },
      {
        number: 4,
        question: 'What is a Default Constructor?',
        explanation: `A default constructor is the no-argument constructor that the Java compiler automatically provides ONLY when you don't declare any constructor in the class.
Example:
class Student { String name; }
You did not write a constructor. The compiler provides:
Student() { super(); }
Therefore Student s = new Student(); works.

IMPORTANT INTERVIEW TRAP:
If you define your own constructor:
class Student {
    Student(String name) { System.out.println(name); }
}
Then Student s = new Student(); will NOT compile! Because the compiler no longer provides the no-argument constructor. You must explicitly define it.`,
        interviewAnswer: 'A default constructor is the no-argument constructor automatically supplied by the compiler when a class declares no constructor at all.'
      },
      {
        number: 5,
        question: 'What is a Parameterized Constructor?',
        explanation: 'A constructor that accepts parameters to initialize instance fields with custom values.',
        code: `class Student {
    String name;
    int age;
    Student(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
// Usage: Student s = new Student("Gowtham", 21);`,
        interviewAnswer: 'A parameterized constructor is a constructor that accepts arguments, allowing callers to initialize an object with specific state at creation time.'
      },
      {
        number: 6,
        question: 'What is Constructor Overloading?',
        explanation: `Having multiple constructors in the same class with different parameter lists. This is compile-time polymorphism.`,
        code: `class Student {
    String name;
    int age;
    Student() { name = "Unknown"; age = 0; }
    Student(String name) { this.name = name; }
    Student(String name, int age) { this.name = name; this.age = age; }
}`,
        interviewAnswer: 'Constructor overloading is defining multiple constructors with different parameter signatures within the same class, enabling flexible object initialization.'
      },
      {
        number: 7,
        question: 'Can Constructors Be Inherited?',
        explanation: `No!
class Parent { Parent() { System.out.println("Parent"); } }
class Child extends Parent { Child() { System.out.println("Child"); } }
Child does not inherit Parent(). However, when a Child object is created, the parent constructor is invoked through super().
Child c = new Child(); // Prints: Parent then Child
Constructor invocation happens through the inheritance hierarchy, but constructors themselves are NOT inherited.`,
        interviewAnswer: 'Constructors cannot be inherited. Each class defines its own constructors, though a subclass constructor automatically or explicitly invokes a superclass constructor via super().'
      },
      {
        number: 8,
        question: 'Can Constructors Be Overridden?',
        explanation: `No. Constructor overriding is impossible.
Why? Method overriding requires:
Parent method -> Child overrides method.
Since constructors are not inherited, they cannot be overridden.`,
        interviewAnswer: 'Constructors cannot be overridden because constructors are not inherited by subclasses. Each class defines and invokes its own constructors.'
      },
      {
        number: 9,
        question: 'Can Constructors Be Static?',
        explanation: `No. A constructor belongs to the object creation process.
static members belong to the class rather than an object instance.
This makes "static Student()" completely invalid.`,
        interviewAnswer: 'Constructors cannot be static because their purpose is to initialize an instance during object creation, while static members belong to the class rather than an instance.'
      },
      {
        number: 10,
        question: 'Can Constructors Be Final?',
        explanation: `No. final prevents overriding. But constructors cannot be overridden anyway! Therefore "final Student() {}" is invalid syntax.`,
        interviewAnswer: 'Constructors cannot be final because final is used to prevent overriding, and constructors cannot be overridden in the first place.'
      },
      {
        number: 11,
        question: 'Can Constructors Be Private?',
        explanation: `Yes!
class Database {
    private Database() { System.out.println("Created"); }
}
Now "Database db = new Database();" is disallowed outside the class because the constructor is private.`,
        interviewAnswer: 'Yes, constructors can be private. Marking a constructor private prevents other classes from directly instantiating the class.'
      },
      {
        number: 12,
        question: 'Why Would We Use a Private Constructor?',
        explanation: `There are several critical design reasons:
1. Singleton Pattern: Prevents outside code from creating arbitrary instances.
class Singleton {
    private static Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
        if (instance == null) instance = new Singleton();
        return instance;
    }
}
2. Utility Classes: A class containing only static methods (like MathUtils, java.lang.Math).
class MathUtils {
    private MathUtils() {}
    static int add(int a, int b) { return a + b; }
}
This prevents meaningless instantiation: new MathUtils();`,
        interviewAnswer: 'A private constructor prevents external code from directly creating instances. It is commonly used in Singleton designs and utility classes where object creation should be restricted.'
      },
      {
        number: 13,
        question: 'What is Constructor Chaining?',
        explanation: `Constructor chaining means one constructor invokes another constructor using this() or super().
class Student {
    String name;
    int age;
    Student() { this("Unknown", 0); }
    Student(String name) { this(name, 0); }
    Student(String name, int age) { this.name = name; this.age = age; }
}
Flow: Student() -> Student(String) -> Student(String, int). This avoids duplicate initialization code.`,
        interviewAnswer: 'Constructor chaining is the practice of having one constructor call another constructor within the same class (using this()) or in the superclass (using super()), reducing code duplication.'
      },
      {
        number: 14,
        question: 'What is this()?',
        explanation: `this() invokes another constructor of the SAME class.
CRITICAL RULE: this() MUST be the first statement in a constructor!
Correct:
Student() { this("Unknown"); }
Incorrect (Compile Error):
Student() { System.out.println("Hello"); this("Unknown"); }`,
        interviewAnswer: 'this() is used within a constructor to call another overloaded constructor in the same class. It must be the very first line of the constructor body.'
      },
      {
        number: 15,
        question: 'What is super()?',
        explanation: `super() invokes the constructor of the immediate parent class.
class Animal { Animal() { System.out.println("Animal constructor"); } }
class Dog extends Animal {
    Dog() {
        super();
        System.out.println("Dog constructor");
    }
}
Dog d = new Dog(); // Prints: Animal constructor then Dog constructor`,
        interviewAnswer: 'super() invokes the constructor of the immediate superclass. If not explicitly specified, the compiler automatically inserts super() as the first statement.'
      },
      {
        number: 16,
        question: 'Difference between this() and super()',
        table: {
          headers: ['this()', 'super()'],
          rows: [
            ['Calls constructor in same class', 'Calls parent constructor'],
            ['Used for constructor chaining', 'Used for superclass initialization'],
            ['Refers to current class', 'Refers to immediate superclass'],
            ['Must be first constructor statement', 'Must be first constructor statement']
          ]
        },
        diagram: `Child Constructor              Constructor A
       │                              │
       │ super()                      │ this()
       ▼                              ▼
Parent Constructor             Constructor B
       │                              │
       ▼                              ▼
Parent initialization          Initialization
       │
       ▼
Child initialization`,
        interviewAnswer: 'this() calls an overloaded constructor in the same class for chaining, while super() calls the superclass constructor to initialize parent state. Both must be the first statement.'
      },
      {
        number: 17,
        question: 'What Happens If No Constructor Is Defined?',
        explanation: `If you do not declare any constructor, the compiler automatically provides a default no-argument constructor:
Student() { super(); }
Therefore Student s = new Student(); works.`,
        interviewAnswer: 'If no constructor is declared, the Java compiler automatically generates a public, no-argument default constructor with a single call to super().'
      },
      {
        number: 18,
        question: 'Can a Constructor Call Another Constructor?',
        explanation: `Yes, using this(). A constructor can also invoke the parent constructor using super().
BUT REMEMBER: A constructor cannot call BOTH this() and super() because both must be the first statement!
Invalid:
Employee() {
    this();
    super(); // Compile error!
}`,
        interviewAnswer: 'Yes, via this() or super(). However, a constructor cannot call both in the same constructor body because each must be the first statement.'
      },
      {
        number: 19,
        question: 'Can a Constructor Call a Method?',
        explanation: `Yes, but there is an important SDE-level warning:
Calling overridable instance methods from constructors is dangerous!
Example:
class Parent {
    Parent() { show(); }
    void show() { System.out.println("Parent"); }
}
class Child extends Parent {
    int value = 100;
    @Override void show() { System.out.println(value); }
}
Child c = new Child();
Output is: 0 (NOT 100!)
Why? Because Java\'s dynamic dispatch calls Child.show(), but Child\'s instance field initialization has not yet completed when Parent() executes.`,
        interviewAnswer: 'Yes, a constructor can call a method, but calling overridable instance methods from constructors is dangerous because subclass fields are not yet initialized when the superclass constructor runs.'
      },
      {
        number: 20,
        question: 'Constructor vs Method',
        table: {
          headers: ['Constructor', 'Method'],
          rows: [
            ['Initializes an object', 'Performs an operation'],
            ['Same name as class', 'Can have any valid name'],
            ['No return type', 'Can have a return type'],
            ['Automatically invoked during creation', 'Explicitly invoked or called'],
            ['Cannot be inherited', 'Methods can be inherited'],
            ['Cannot be overridden', 'Can be overridden'],
            ['Cannot be static', 'Can be static'],
            ['Cannot be final', 'Can be final'],
            ['Can be overloaded', 'Can be overloaded']
          ]
        },
        interviewAnswer: 'A constructor initializes an object\'s state, has the same name as the class, has no return type, cannot be inherited or overridden, and is invoked automatically during object creation. A method represents behavior, has a return type, can be inherited, overridden, static, or final.'
      }
    ],
    comprehensiveDemo: {
      title: 'Complete Example — Constructor Concepts Together',
      code: `class Person {
    String name;
    int age;

    // Constructor 1
    Person() {
        this("Unknown", 0);
    }

    // Constructor 2
    Person(String name) {
        this(name, 0);
    }

    // Constructor 3
    Person(String name, int age) {
        this.name = name;
        this.age = age;
        System.out.println("Person constructor executed");
    }

    void display() {
        System.out.println("Name : " + name);
        System.out.println("Age  : " + age);
    }
}

class Student extends Person {
    String course;

    Student() {
        super("Gowtham", 21);
        course = "Computer Science";
    }

    void showStudent() {
        display();
        System.out.println("Course : " + course);
    }
}

public class ConstructorDemo {
    public static void main(String[] args) {
        Person p1 = new Person();
        System.out.println();
        Person p2 = new Person("Rahul");
        System.out.println();
        Person p3 = new Person("Arun", 22);
        System.out.println();
        Student s = new Student();
        s.showStudent();
    }
}`,
      output: `Person constructor executed

Person constructor executed

Person constructor executed

Person constructor executed
Name : Gowtham
Age  : 21
Course : Computer Science`,
      deepDiveNotes: [
        '🔥 Understand the Student Object Creation Flow:',
        'new Student() -> Student() -> super("Gowtham", 21) -> Person(String, int) -> Person initialization -> return to Student() -> course = "Computer Science" -> Student initialization complete.'
      ]
    },
    sdeTraps: [
      {
        title: 'Trap 1: Parameterized constructor eliminates default constructor',
        code: `class A { A(int x) {} }
public class Test {
    public static void main(String[] args) {
        A obj = new A(); // Error!
    }
}`,
        answer: 'Compilation error. Declaring A(int x) stops the compiler from generating the no-arg default constructor. You must explicitly add A() {}.'
      },
      {
        title: 'Trap 2: Implicit super() invocation',
        code: `class A { A() { System.out.println("A"); } }
class B extends A { B() { System.out.println("B"); } }
public class Test {
    public static void main(String[] args) { new B(); }
}`,
        output: `A
B`,
        reason: 'The compiler implicitly inserts super(); as the first statement in B().'
      },
      {
        title: 'Trap 3: Constructor with return type is a method',
        code: `class Student { void Student() {} }
Student s = new Student();`,
        answer: 'void Student() is a METHOD, not a constructor! The compiler still provides the default constructor.'
      },
      {
        title: 'Trap 4: this() and super() cannot co-exist',
        code: `class A {
    A() {
        this(10);
        super(); // Error!
    }
    A(int x) {}
}`,
        answer: 'Compilation error. Both this() and super() must be the first statement, so they cannot both appear.'
      },
      {
        title: 'Trap 5: Constructor chaining execution order',
        code: `class A {
    A() {
        this(10);
        System.out.println("A()");
    }
    A(int x) {
        System.out.println("A(int)");
    }
}
new A();`,
        output: `A(int)
A()`,
        reason: 'A() calls this(10) first, so A(int) executes and prints before A() prints.'
      }
    ],
    mentalModel: {
      title: 'The Constructor Mental Model',
      diagram: `              new Student()
                    │
                    ▼
           Memory allocated
                    │
                    ▼
       Instance fields get defaults
                    │
                    ▼
        Constructor chain begins
                    │
             ┌──────┴──────┐
             │             │
          this()        super()
             │             │
             ▼             ▼
       Same class      Parent class
             │             │
             └──────┬──────┘
                    ▼
          Constructor body
                    │
                    ▼
          Object initialized`,
      keyTakeaways: [
        'Constructor name = class name, with NO return type.',
        'Called during object creation to initialize object state.',
        'Can be overloaded; cannot be inherited, overridden, static, or final.',
        'Can be private (used in Singletons and Utility classes).',
        'this() calls same-class constructor; super() calls parent constructor.',
        'this() or super() must be the very first statement.',
        'Default constructor = compiler-provided no-arg constructor (only when NO constructor is declared).',
        'No-argument constructor = any constructor taking zero arguments.'
      ]
    }
  }
};

