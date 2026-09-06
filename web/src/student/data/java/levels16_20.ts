import type { TopicContent } from '../topicElaborateContent';

export const LEVELS_16_TO_20: Record<string, TopicContent> = {
  'level-16-keywords-this-super-static-final': {
    slug: 'level-16-keywords-this-super-static-final',
    title: 'Level 16: this, super, static, final Keywords',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Master the four core keywords that govern object references, inheritance chains, class-level state, and immutability guarantees in Java.`,
    coreConcepts: [
      {
        heading: '1. Class-Level vs Instance-Level Mechanics',
        description: `Deep dive into static, final, this, and super:`,
        bulletPoints: [
          'static: Belongs to the Class object in Metaspace; executes without `this` reference. Loaded during class initialization.',
          'final: final variables cannot be reassigned; final methods cannot be overridden; final classes cannot be extended.',
          'final vs finally vs finalize: final is a modifier; finally is a block that always executes after try/catch; finalize was an old GC cleanup method (now deprecated).'
        ]
      }
    ],
    subtopicBreakdowns: {
      'static Variables, Methods, Static Blocks & Class Initialization': {
        title: 'Static Members & Class Initialization',
        conceptSummary: 'Static methods belong to the class and cannot access instance variables or `this`.',
        keyPoints: ['Static initialization blocks execute once when the class is loaded.'],
        interviewQA: {
          question: 'Why can static methods not access instance variables directly?',
          answer: 'Static methods belong to the Class object and can be invoked before any instance of the class is created. Without a specific instance, there is no `this` reference on the Call Stack to locate instance variables on the Heap.'
        }
      }
    }
  },
  'level-17-object-class-equality': {
    slug: 'level-17-object-class-equality',
    title: 'Level 17: Object Class & The Equals-HashCode Contract',
    badge: '₹24+ LPA SDE Architecture',
    overview: `java.lang.Object is the root of the Java class hierarchy. Master the fundamental equals() and hashCode() contract, consequences in hash collections (HashMap, HashSet), and shallow vs deep cloning.`,
    coreConcepts: [
      {
        heading: '1. The Equals and HashCode Contract',
        description: `The golden rule of Java collections:`,
        bulletPoints: [
          '1. If two objects are equal according to `equals()`, their `hashCode()` MUST produce the exact same integer value.',
          '2. If two objects have the same `hashCode()`, they are NOT necessarily equal (Hash Collision).',
          '3. Breaking the Contract: If you override `equals()` without overriding `hashCode()`, equal objects will land in different HashMap buckets, returning null during `map.get(key)`.'
        ],
        codeSnippet: {
          title: 'Consistent Equals and HashCode Implementation',
          language: 'java',
          code: `import java.util.Objects;

class User {
    private final String email;
    private final int id;

    public User(int id, String email) {
        this.id = id;
        this.email = email;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return id == user.id && Objects.equals(email, user.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email);
    }
}`,
          explanation: 'Objects.hash() combines field hash codes. If equals() returns true, hashCode() is guaranteed to return the exact same integer.'
        }
      }
    ],
    subtopicBreakdowns: {
      'The equals() & hashCode() Contract in Hash Collections': {
        title: 'The Equals & HashCode Contract',
        conceptSummary: 'Equal objects MUST produce identical hash codes to function correctly in hash-based collections.',
        keyPoints: ['HashMap uses hashCode() to locate the bucket and equals() to resolve bucket collisions.'],
        interviewQA: {
          question: 'What happens in a HashMap if you override equals() but forget to override hashCode()?',
          answer: 'Two logically equal objects will generate different default identity hash codes. When inserting an entry with key1 and attempting to retrieve it with key2 (`key1.equals(key2) == true`), the HashMap will look in the wrong bucket and return null.'
        }
      }
    }
  },
  'level-18-exception-handling': {
    slug: 'level-18-exception-handling',
    title: 'Level 18: Exception Handling Architecture',
    badge: '₹24+ LPA SDE Architecture',
    overview: `The Throwable hierarchy: Error vs Exception (Checked vs Unchecked RuntimeException), try-with-resources (AutoCloseable), stack unwinding, and enterprise exception translation.`,
    coreConcepts: [
      {
        heading: '1. Throwable Hierarchy & Checked vs Unchecked',
        description: `How Java handles abnormal runtime conditions:`,
        bulletPoints: [
          'Throwable: Root class for all exceptions and errors.',
          'Error: Fatal system-level conditions (OutOfMemoryError, StackOverflowError) that applications should NOT try to catch.',
          'Checked Exceptions (Exception subclasses): Compile-time enforced for recoverable external conditions (IOException, SQLException).',
          'Unchecked Exceptions (RuntimeException subclasses): Programming bugs and logic errors (NullPointerException, IllegalArgumentException).',
          'try-with-resources: Automatically closes AutoCloseable resources in reverse order of acquisition, preventing resource leaks.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Throwable Hierarchy: Error vs Exception (Checked vs Unchecked)': {
        title: 'Throwable Hierarchy & Exception Types',
        conceptSummary: 'Checked exceptions are enforced by the compiler; unchecked exceptions indicate programming defects.',
        keyPoints: ['try-with-resources avoids verbose finally { resource.close() } boilerplate.'],
        interviewQA: {
          question: 'When will a finally block NOT execute in Java?',
          answer: 'When System.exit(status) is called, when the host JVM process crashes, or when fatal hardware power loss occurs.'
        }
      }
    }
  },
  'level-19-collections-framework': {
    slug: 'level-19-collections-framework',
    title: 'Level 19: Collections Framework & Data Structures',
    badge: '₹24+ LPA SDE Architecture',
    overview: `List, Set, Queue, and Map architectures. Deep dive into ArrayList 1.5x resizing vs LinkedList, HashMap bucket hashing, hash collisions, Red-Black treeification (threshold 8), and ConcurrentHashMap.`,
    coreConcepts: [
      {
        heading: '1. HashMap Internal Mechanics & Java 8 Treeification',
        description: `How HashMap achieves O(1) average lookup and O(log n) worst-case performance:`,
        bulletPoints: [
          '1. Bucket Index Calculation: `index = (n - 1) & hash(key)`.',
          '2. Collision Resolution: Colliding keys are stored in a singly-linked list node chain.',
          '3. Treeification Threshold (8): When a bucket chain reaches TREEIFY_THRESHOLD (8 entries) and table capacity >= 64, the linked list transforms into a balanced Red-Black Tree (TreeNode), reducing worst-case lookups from O(n) to O(log n).',
          '4. Untreeify Threshold (6): When bucket size shrinks to 6 during resizing or deletion, it reverts back to a linked list.',
          '5. Load Factor (0.75): Balances time and space costs; table doubles in size when capacity * loadFactor is exceeded.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'HashMap Internal Mechanics: Hash Functions, Buckets & Red-Black Treeification': {
        title: 'HashMap Internal Mechanics & Treeification',
        conceptSummary: 'HashMap uses bucket arrays, bitwise hash distribution, and Red-Black treeification at threshold 8 to mitigate Denial-of-Service hash collision attacks.',
        keyPoints: ['ConcurrentHashMap uses CAS operations and synchronized bin locking instead of full map locks.'],
        interviewQA: {
          question: 'Why did Java 8 replace linked list collision chains with Red-Black trees in HashMap?',
          answer: 'To prevent Hash Collision Denial-of-Service attacks. If an attacker crafts thousands of keys with identical hash codes, linked list lookup degrades to O(n). Red-Black trees guarantee O(log n) worst-case lookup performance.'
        }
      }
    }
  },
  'level-20-comparable-comparator-iterators': {
    slug: 'level-20-comparable-comparator-iterators',
    title: 'Level 20: Comparable, Comparator & Iterators',
    badge: '₹24+ LPA SDE Architecture',
    overview: `Natural ordering (Comparable.compareTo) vs custom sorting strategies (Comparator.compare), fail-fast vs fail-safe iterators, modCount tracking, and ConcurrentModificationException prevention.`,
    coreConcepts: [
      {
        heading: '1. Fail-Fast vs Fail-Safe Iterators',
        description: `Why ConcurrentModificationException occurs during collection iteration:`,
        bulletPoints: [
          'Fail-Fast (ArrayList, HashMap, HashSet): Tracks internal `modCount`. If the collection is structurally modified during iteration (except via `iterator.remove()`), it throws `ConcurrentModificationException`.',
          'Fail-Safe / Snapshot (CopyOnWriteArrayList, ConcurrentHashMap): Iterates over a snapshot or non-blocking view, never throwing ConcurrentModificationException.'
        ]
      }
    ],
    subtopicBreakdowns: {
      'Fail-Fast Iterators, modCount & ConcurrentModificationException': {
        title: 'Fail-Fast Iterators & modCount',
        conceptSummary: 'Fail-fast iterators detect concurrent modifications immediately to prevent undefined data corruption.',
        keyPoints: ['Use iterator.remove() to safely remove items while looping.'],
        interviewQA: {
          question: 'Why does removing an element in a for-each loop throw ConcurrentModificationException?',
          answer: 'The for-each loop uses an internal Iterator. When `list.remove()` is called, `modCount` increments, but the iterator\'s `expectedModCount` is not updated. On the next `iterator.next()` call, the mismatch throws ConcurrentModificationException.'
        }
      }
    }
  }
};

