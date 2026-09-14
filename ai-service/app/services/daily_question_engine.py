"""
Personalized Daily Question Generator
Generates question sprints tailored specifically to weak skills and highest priority gaps.
"""
from typing import Dict, List, Any, Optional
import random
import logging
from app.services.ollama_client import synthesize_targeted_questions_with_qwen

logger = logging.getLogger(__name__)

SAMPLE_QUESTION_BANK = {
    "Docker": [
        {
            "id": "q-docker-1",
            "title": "Docker Network Bridge Isolation",
            "subtopic": "Docker Networking",
            "skill": "Docker",
            "difficulty": "MEDIUM",
            "question": "Which command creates a user-defined bridge network in Docker that enables automatic DNS resolution between containers?",
            "options": [
                {"id": "opt-1", "text": "docker network create my-net", "correct": True},
                {"id": "opt-2", "text": "docker network join --default my-net", "correct": False},
                {"id": "opt-3", "text": "docker network link --all", "correct": False},
                {"id": "opt-4", "text": "docker bridge start my-net", "correct": False},
            ],
            "explanation": "User-defined bridge networks in Docker provide automatic DNS resolution between containers using container names as hostnames."
        },
        {
            "id": "q-docker-2",
            "title": "Multi-stage Dockerfile Optimization",
            "subtopic": "Dockerfile Best Practices",
            "skill": "Docker",
            "difficulty": "MEDIUM",
            "question": "What is the primary architectural benefit of multi-stage builds in Docker for compiled languages like Java?",
            "options": [
                {"id": "opt-1", "text": "Allows running containers on multiple CPU architectures simultaneously", "correct": False},
                {"id": "opt-2", "text": "Keeps the final runtime container image minimal by excluding build tools and source code", "correct": True},
                {"id": "opt-3", "text": "Increases disk cache allocation per container layer", "correct": False},
                {"id": "opt-4", "text": "Automatically scales container replica count", "correct": False},
            ],
            "explanation": "Multi-stage builds leave compiler SDKs and build tools in early stages, copying only the compiled artifacts into a lightweight JRE runtime image."
        }
    ],
    "Testing": [
        {
            "id": "q-test-1",
            "title": "JUnit 5 Parameterized Tests",
            "subtopic": "JUnit Mocking & Testing",
            "skill": "Testing",
            "difficulty": "EASY",
            "question": "Which JUnit 5 annotation is required alongside @ParameterizedTest to provide string arguments to a test method?",
            "options": [
                {"id": "opt-1", "text": "@ValueSource", "correct": True},
                {"id": "opt-2", "text": "@ArgSource", "correct": False},
                {"id": "opt-3", "text": "@InputList", "correct": False},
                {"id": "opt-4", "text": "@TestData", "correct": False},
            ],
            "explanation": "@ValueSource(strings = {...}) supplies a simple array of literal values to a @ParameterizedTest in JUnit 5."
        },
        {
            "id": "q-test-2",
            "title": "Mockito Lenient Stubbing",
            "subtopic": "Mocking Frameworks",
            "skill": "Testing",
            "difficulty": "MEDIUM",
            "question": "When does Mockito throw UnnecessaryStubbingException, and how can it be safely avoided?",
            "options": [
                {"id": "opt-1", "text": "When a stubbed method is never invoked during the test execution; avoid with lenient().when(...)", "correct": True},
                {"id": "opt-2", "text": "When a mock is called more than 100 times in a loop", "correct": False},
                {"id": "opt-3", "text": "When verifying private methods", "correct": False},
                {"id": "opt-4", "text": "When using spy instead of mock", "correct": False},
            ],
            "explanation": "Mockito detects unused stubs to prevent dead code in unit tests; lenient().when(...) marks stubs that may not be invoked in all test branches."
        }
    ],
    "Spring Boot": [
        {
            "id": "q-spring-1",
            "title": "Spring Boot Global Exception Handling",
            "subtopic": "REST Error Handling",
            "skill": "Spring Boot",
            "difficulty": "MEDIUM",
            "question": "Which combination of Spring annotations is standard for handling exceptions across all controllers and returning RFC-7807 ProblemDetail?",
            "options": [
                {"id": "opt-1", "text": "@ControllerAdvice (or @RestControllerAdvice) and @ExceptionHandler", "correct": True},
                {"id": "opt-2", "text": "@GlobalFilter and @Catch", "correct": False},
                {"id": "opt-3", "text": "@Service and @Fallback", "correct": False},
                {"id": "opt-4", "text": "@ErrorListener and @Recover", "correct": False},
            ],
            "explanation": "@RestControllerAdvice combined with @ExceptionHandler methods intercepts exceptions globally across all REST controllers."
        }
    ]
}

def generate_personalized_daily_questions(
    skill_gaps: List[Dict[str, Any]],
    question_count: int = 5
) -> List[Dict[str, Any]]:
    """
    Generates questions specifically targeting the student's highest priority skill gaps.
    """
    questions = []
    top_gap_skills = [g["skill_name"] for g in skill_gaps[:3]]

    if not top_gap_skills:
        top_gap_skills = ["Docker", "Testing", "Spring Boot"]

    for skill in top_gap_skills:
        available = SAMPLE_QUESTION_BANK.get(skill, [])
        for q in available:
            if len(questions) < question_count:
                questions.append(q)

    # Fallback to general questions if needed
    if len(questions) < question_count:
        for skill, bank in SAMPLE_QUESTION_BANK.items():
            for q in bank:
                if q not in questions and len(questions) < question_count:
                    questions.append(q)

    return questions


CONCEPT_QUESTION_BANK: List[Dict[str, Any]] = [
    # Java (Learned Skill)
    {
        "id": "java-dec-1",
        "title": "Decorator Pattern & Stream Wrapping",
        "skill_name": "Java",
        "concept": "Design Patterns: Decorator & Middleware",
        "difficulty": "INTERMEDIATE",
        "question": "In Java's java.io package, which statement accurately reflects why BufferedReader wraps an InputStreamReader instead of extending it directly?",
        "options": [
            {"id": "A", "optionText": "It uses the Decorator pattern to add buffering functionality dynamically at runtime without class explosion.", "isCorrect": True, "explanation": "The Decorator pattern attaches additional responsibilities to an object dynamically, providing a flexible alternative to subclassing for extending functionality."},
            {"id": "B", "optionText": "It enforces single-threaded byte stream synchronization.", "isCorrect": False, "explanation": "BufferedReader does not enforce single-threaded synchronization."},
            {"id": "C", "optionText": "It compiles the underlying byte stream into native C socket code.", "isCorrect": False, "explanation": "BufferedReader operates entirely within the JVM."},
            {"id": "D", "optionText": "It allows direct non-blocking asynchronous multiplexing.", "isCorrect": False, "explanation": "Non-blocking I/O is handled by Java NIO channels, not java.io streams."}
        ]
    },
    {
        "id": "java-conc-2",
        "title": "Volatile Visibility vs Atomic Invariants",
        "skill_name": "Java",
        "concept": "Concurrency Primitives & Mutexes",
        "difficulty": "INTERMEDIATE",
        "question": "Under the Java Memory Model (JMM), what happens when a thread updates a volatile boolean flag?",
        "options": [
            {"id": "A", "optionText": "All writes made before the volatile write are visible to any thread that subsequently reads the volatile flag.", "isCorrect": True, "explanation": "A write to a volatile variable establishes a happens-before relationship with subsequent reads of that same variable by other threads."},
            {"id": "B", "optionText": "The thread acquires an exclusive monitor lock on the enclosing class instance.", "isCorrect": False, "explanation": "Volatile variables do not acquire monitor locks."},
            {"id": "C", "optionText": "The update automatically provides atomic check-and-set semantics for composite operations.", "isCorrect": False, "explanation": "Volatile provides visibility, not atomicity for composite operations like count++."},
            {"id": "D", "optionText": "The JVM suspends all worker threads until garbage collection runs.", "isCorrect": False, "explanation": "Garbage collection is independent of volatile writes."}
        ]
    },
    # JavaScript (Learned Skill)
    {
        "id": "js-loop-1",
        "title": "Microtask Queue vs Macrotask Event Loop Timing",
        "skill_name": "JavaScript",
        "concept": "Event Loop Order",
        "difficulty": "INTERMEDIATE",
        "question": "What is the guaranteed output order of console.log for: setTimeout(() => console.log('A'), 0); Promise.resolve().then(() => console.log('B')); console.log('C');?",
        "options": [
            {"id": "A", "optionText": "C, B, A", "isCorrect": True, "explanation": "Synchronous code executes first ('C'), then the microtask queue resolves Promise callbacks ('B'), and finally the macrotask queue triggers the setTimeout callback ('A')."},
            {"id": "B", "optionText": "A, B, C", "isCorrect": False, "explanation": "Synchronous script execution always precedes timer callbacks."},
            {"id": "C", "optionText": "C, A, B", "isCorrect": False, "explanation": "Microtasks always drain completely before the next macrotask is processed."},
            {"id": "D", "optionText": "B, C, A", "isCorrect": False, "explanation": "'C' is synchronous code and must execute before any task queue callback."}
        ]
    },
    {
        "id": "js-clos-2",
        "title": "Closure Variable Capture & Scope Hoisting",
        "skill_name": "JavaScript",
        "concept": "Closures & Scope Invariants",
        "difficulty": "INTERMEDIATE",
        "question": "When creating a loop with var i = 0 vs let i = 0 containing asynchronous callbacks, why does let prevent all callbacks from logging the final index value?",
        "options": [
            {"id": "A", "optionText": "let creates a new lexical environment binding for each loop iteration, whereas var shares a single function-scoped variable.", "isCorrect": True, "explanation": "In ES6, let declarations in for-loop headers are bound separately for each iteration of the loop."},
            {"id": "B", "optionText": "let causes the loop to run synchronously on a separate web worker thread.", "isCorrect": False, "explanation": "let has nothing to do with web workers."},
            {"id": "C", "optionText": "var variables cannot be accessed inside callbacks due to strict mode.", "isCorrect": False, "explanation": "var variables are accessible in closures, but share the same instance."},
            {"id": "D", "optionText": "let freezes the underlying prototype chain.", "isCorrect": False, "explanation": "Variable declaration does not affect the prototype chain."}
        ]
    },
    # HTML (Learned Skill)
    {
        "id": "html-view-1",
        "title": "Mobile Viewport Meta Configuration",
        "skill_name": "HTML",
        "concept": "Viewport: Responsive Mobile Meta Tag",
        "difficulty": "INTERMEDIATE",
        "question": "What is the primary function of <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">?",
        "options": [
            {"id": "A", "optionText": "Sets the viewport width to match screen resolution and prevents desktop browser emulation zoom.", "isCorrect": True, "explanation": "It tells mobile browsers to render the page at the physical width of the device in CSS pixels and sets the initial zoom level to 1:1."},
            {"id": "B", "optionText": "Enforces offline caching for Progressive Web Apps.", "isCorrect": False, "explanation": "Viewport meta tag does not configure caching."},
            {"id": "C", "optionText": "Pre-renders HTML5 WebGL canvas elements.", "isCorrect": False, "explanation": "It does not control canvas rendering."},
            {"id": "D", "optionText": "Forces the page into dark mode on mobile devices.", "isCorrect": False, "explanation": "Color schemes are handled by CSS media queries or color-scheme meta tags."}
        ]
    },
    {
        "id": "html-val-2",
        "title": "Native Form Invariant Validation",
        "skill_name": "HTML",
        "concept": "Data Validation & Invariant Checking",
        "difficulty": "INTERMEDIATE",
        "question": "Which attribute on an HTML <input> enforces client-side regex boundary verification before form submission?",
        "options": [
            {"id": "A", "optionText": "pattern=\"...\"", "isCorrect": True, "explanation": "The pattern attribute specifies a regular expression that the <input> element's value must match for form validation to succeed."},
            {"id": "B", "optionText": "regex=\"...\"", "isCorrect": False, "explanation": "There is no 'regex' attribute in HTML5."},
            {"id": "C", "optionText": "validate=\"...\"", "isCorrect": False, "explanation": "'validate' is not an HTML attribute."},
            {"id": "D", "optionText": "match=\"...\"", "isCorrect": False, "explanation": "'match' is not an HTML attribute."}
        ]
    },
    # CSS (Lagged Concept)
    {
        "id": "css-box-1",
        "title": "box-sizing: border-box Calculation",
        "skill_name": "CSS",
        "concept": "box-sizing: content-box width calculation",
        "difficulty": "INTERMEDIATE",
        "question": "If an element has width: 200px, padding: 20px, border: 5px solid black, and box-sizing: border-box, what is the final rendered total width on the screen?",
        "options": [
            {"id": "A", "optionText": "200px", "isCorrect": True, "explanation": "With border-box, declared width includes content, padding, and border, so the total width remains exactly 200px."},
            {"id": "B", "optionText": "250px", "isCorrect": False, "explanation": "250px would be the total width under content-box (200 + 40 + 10)."},
            {"id": "C", "optionText": "225px", "isCorrect": False, "explanation": "Padding and border are applied symmetrically to both left and right sides."},
            {"id": "D", "optionText": "150px", "isCorrect": False, "explanation": "The declared width is 200px, not 150px."}
        ]
    },
    {
        "id": "css-marg-2",
        "title": "Vertical Margin Collapsing Siblings",
        "skill_name": "CSS",
        "concept": "Vertical margin collapsing between block-level siblings",
        "difficulty": "INTERMEDIATE",
        "question": "Two adjacent block elements in the normal flow have margin-bottom: 30px on the top element and margin-top: 20px on the bottom element. What is the computed distance between them?",
        "options": [
            {"id": "A", "optionText": "30px", "isCorrect": True, "explanation": "Vertical margins between adjacent block-level siblings collapse to the single largest margin, which is 30px."},
            {"id": "B", "optionText": "50px", "isCorrect": False, "explanation": "Margins do not sum together in vertical block flow; they collapse."},
            {"id": "C", "optionText": "10px", "isCorrect": False, "explanation": "Margins do not subtract from one another."},
            {"id": "D", "optionText": "20px", "isCorrect": False, "explanation": "The larger margin (30px) wins over the smaller margin (20px)."}
        ]
    },
    # React (Currently Learning / Lagged Concept)
    {
        "id": "react-fib-1",
        "title": "Fiber Architecture & Time-Slicing",
        "skill_name": "React",
        "concept": "fiber-architecture",
        "difficulty": "INTERMEDIATE",
        "question": "What is the primary architectural purpose of React Fiber's cooperative scheduling compared to the legacy stack reconciler?",
        "options": [
            {"id": "A", "optionText": "It splits reconciliation work into units called fibers that can be paused, aborted, or prioritized across frames.", "isCorrect": True, "explanation": "Fiber reimagines the reconciler as a virtual stack frame where work can be scheduled incrementally without blocking the main browser thread."},
            {"id": "B", "optionText": "It eliminates the need for virtual DOM diffing entirely.", "isCorrect": False, "explanation": "Fiber still performs diffing; it structures the work tree as a singly linked list of fibers."},
            {"id": "C", "optionText": "It compiles JSX into native WebAssembly binaries.", "isCorrect": False, "explanation": "JSX compiles to standard JavaScript functions."},
            {"id": "D", "optionText": "It automatically memoizes all component props by default.", "isCorrect": False, "explanation": "Memoization requires explicit use of React.memo or useMemo."}
        ]
    },
    {
        "id": "react-hook-2",
        "title": "useEffect Closure Invariants & Stale State",
        "skill_name": "React",
        "concept": "Hook Invariants & Closure State",
        "difficulty": "INTERMEDIATE",
        "question": "In a React component with a setInterval inside useEffect, why might the interval handler continuously read the initial state value instead of the latest state?",
        "options": [
            {"id": "A", "optionText": "The interval callback captured the state variable in its closure when the effect ran, and the effect dependency array was left empty [].", "isCorrect": True, "explanation": "When an effect closure captures a state variable without listing it in the dependency array (or using a functional state updater), it retains a stale reference to the initial render's state."},
            {"id": "B", "optionText": "React clears all state variables during timer ticks.", "isCorrect": False, "explanation": "React state is persistent across renders unless explicitly reset."},
            {"id": "C", "optionText": "setInterval is blocked by the React scheduler.", "isCorrect": False, "explanation": "setInterval is a browser API that runs on the macrotask queue."},
            {"id": "D", "optionText": "State updates in React are strictly synchronous.", "isCorrect": False, "explanation": "React state updates are batched and asynchronous."}
        ]
    },
    # TypeScript (Currently Learning / Lagged Concept)
    {
        "id": "ts-gen-1",
        "title": "Discriminated Unions & Type Narrowing",
        "skill_name": "TypeScript",
        "concept": "generics-and-type-narrowing",
        "difficulty": "INTERMEDIATE",
        "question": "What is the canonical requirement for TypeScript to successfully narrow a union type using a switch statement on a common property?",
        "options": [
            {"id": "A", "optionText": "The common property must have a literal type (string, number, or boolean) distinct in each member of the union.", "isCorrect": True, "explanation": "A discriminated union requires a common property with distinct unit/literal types in each constituent, allowing TypeScript to narrow the union exhaustively."},
            {"id": "B", "optionText": "All members of the union must inherit from a common abstract base class.", "isCorrect": False, "explanation": "Discriminated unions work with plain interfaces and type aliases."},
            {"id": "C", "optionText": "The variable must be cast using 'as any' before switching.", "isCorrect": False, "explanation": "Casting to any disables type checking and narrowing."},
            {"id": "D", "optionText": "The switch statement must include an 'eval' block.", "isCorrect": False, "explanation": "eval is never required or recommended."}
        ]
    },
    {
        "id": "ts-comp-2",
        "title": "Composition vs Polymorphism in Generic Interfaces",
        "skill_name": "TypeScript",
        "concept": "composition-inheritance-polymorphism",
        "difficulty": "INTERMEDIATE",
        "question": "Which TypeScript construct allows deriving a new type where all properties of type T are optional except for a specified subset K?",
        "options": [
            {"id": "A", "optionText": "Partial<T> & Pick<T, K>", "isCorrect": True, "explanation": "Combining Partial<T> (making everything optional) and Pick<T, K> (keeping K required) creates a type where only K remains mandatory."},
            {"id": "B", "optionText": "Omit<T, Partial<K>>", "isCorrect": False, "explanation": "Partial<K> is a type, not property keys."},
            {"id": "C", "optionText": "Required<Partial<T>>", "isCorrect": False, "explanation": "Required cancels out Partial, making all properties required."},
            {"id": "D", "optionText": "Exclude<T, K>", "isCorrect": False, "explanation": "Exclude operates on union types, not object properties."}
        ]
    },
    # Spring Boot (Currently Learning / Lagged Concept)
    {
        "id": "spring-jpa-1",
        "title": "JPA Dirty Checking & Managed Invariants",
        "skill_name": "Spring Boot",
        "concept": "jpa-lifecycle-and-invariants",
        "difficulty": "INTERMEDIATE",
        "question": "Inside a Spring @Transactional service method, why is an explicit repository.save(entity) call unnecessary when modifying a managed JPA entity?",
        "options": [
            {"id": "A", "optionText": "The Hibernate Persistence Context detects state mutations on managed entities and automatically flushes SQL UPDATEs at commit.", "isCorrect": True, "explanation": "JPA automatic dirty checking monitors all entities in the Managed state within an active transaction and executes necessary SQL UPDATEs when the transaction commits."},
            {"id": "B", "optionText": "Spring Boot injects an AOP proxy that intercepts direct field writes.", "isCorrect": False, "explanation": "Hibernate compares snapshots of entity state, not AOP field proxies."},
            {"id": "C", "optionText": "The database uses optimistic locking triggers to update records.", "isCorrect": False, "explanation": "Optimistic locking checks version numbers, not entity mutations."},
            {"id": "D", "optionText": "Managed entities write directly to disk without database interaction.", "isCorrect": False, "explanation": "All entity changes synchronize to the database."}
        ]
    },
    {
        "id": "spring-val-2",
        "title": "Bean Validation & Invariant Constraints",
        "skill_name": "Spring Boot",
        "concept": "data-validation-invariant-checking",
        "difficulty": "INTERMEDIATE",
        "question": "Which annotation is required on a Spring @RestController method argument to activate JSR-380 validation (@NotNull, @Size) on incoming request DTOs?",
        "options": [
            {"id": "A", "optionText": "@Valid or @Validated", "isCorrect": True, "explanation": "@Valid (standard Jakarta) or @Validated (Spring variant) instructs Spring's HandlerAdapter to invoke the Validator before passing the argument to the controller method."},
            {"id": "B", "optionText": "@CheckInvariants", "isCorrect": False, "explanation": "@CheckInvariants is not a standard Spring annotation."},
            {"id": "C", "optionText": "@SanitizePayload", "isCorrect": False, "explanation": "@SanitizePayload is not a standard annotation."},
            {"id": "D", "optionText": "@AssertTrue", "isCorrect": False, "explanation": "@AssertTrue is applied to fields/methods inside the DTO, not on controller parameters."}
        ]
    },
    # Python (Currently Learning / Lagged Concept)
    {
        "id": "py-gil-1",
        "title": "CPython GIL & Multi-Core Execution",
        "skill_name": "Python",
        "concept": "gil-and-threading",
        "difficulty": "INTERMEDIATE",
        "question": "Why does using the threading module in CPython fail to achieve true parallel CPU execution on multi-core machines for CPU-bound tasks?",
        "options": [
            {"id": "A", "optionText": "The Global Interpreter Lock (GIL) serializes Python bytecode execution so only one native thread runs Python code at a time.", "isCorrect": True, "explanation": "The CPython GIL prevents multiple native threads from executing Python bytecode simultaneously, requiring multiprocessing for CPU-bound parallelism."},
            {"id": "B", "optionText": "Python threads run in separate OS processes that cannot communicate.", "isCorrect": False, "explanation": "Threads share memory within the same OS process."},
            {"id": "C", "optionText": "The OS kernel assigns all Python threads to CPU core 0.", "isCorrect": False, "explanation": "OS schedulers distribute threads, but the GIL forces serialized execution."},
            {"id": "D", "optionText": "CPython converts all loops into recursive tail calls.", "isCorrect": False, "explanation": "Python does not have tail call optimization."}
        ]
    },
    {
        "id": "py-prim-2",
        "title": "Default Mutable Arguments & Reference Sharing",
        "skill_name": "Python",
        "concept": "core-syntax-primitive-types",
        "difficulty": "INTERMEDIATE",
        "question": "What happens when defining def append_item(val, target_list=[]): and calling it multiple times without passing target_list?",
        "options": [
            {"id": "A", "optionText": "The default list is created once at function definition time, so mutations persist across all invocations that use the default.", "isCorrect": True, "explanation": "In Python, default arguments are evaluated only once when the function definition is executed, creating a shared mutable reference."},
            {"id": "B", "optionText": "A new empty list is created dynamically on each function call.", "isCorrect": False, "explanation": "This only happens if default is None and initialized inside the function body."},
            {"id": "C", "optionText": "Python raises a TypeError because mutable default arguments are forbidden.", "isCorrect": False, "explanation": "Python allows mutable default arguments, but it is considered an anti-pattern."},
            {"id": "D", "optionText": "The list is garbage collected immediately after each function return.", "isCorrect": False, "explanation": "The function object retains a reference to the default list in __defaults__."}
        ]
    },
    # PostgreSQL (Currently Learning / Lagged Concept)
    {
        "id": "pg-mvcc-1",
        "title": "MVCC Vacuuming & Transaction Isolation",
        "skill_name": "PostgreSQL",
        "concept": "mvcc-and-indexing",
        "difficulty": "INTERMEDIATE",
        "question": "In PostgreSQL's Multi-Version Concurrency Control (MVCC), what is the function of VACUUM regarding dead row tuples created by UPDATE statements?",
        "options": [
            {"id": "A", "optionText": "It marks dead tuple space as reusable by subsequent INSERTs/UPDATEs without holding exclusive table locks.", "isCorrect": True, "explanation": "In PostgreSQL, UPDATE creates a new row version. VACUUM reclaims the space occupied by dead rows and updates the visibility map so pages can be reused."},
            {"id": "B", "optionText": "It compresses the entire table into a read-only Parquet file.", "isCorrect": False, "explanation": "VACUUM does not compress into Parquet format."},
            {"id": "C", "optionText": "It deletes all foreign key constraints on the table.", "isCorrect": False, "explanation": "Constraints remain unchanged."},
            {"id": "D", "optionText": "It rewrites all database WAL logs to Amazon S3.", "isCorrect": False, "explanation": "WAL archiving is handled separately."}
        ]
    },
    {
        "id": "pg-gin-2",
        "title": "B-Tree vs GIN Index Selection for JSONB",
        "skill_name": "PostgreSQL",
        "concept": "zero-copy-networking-memory-transfers",
        "difficulty": "INTERMEDIATE",
        "question": "When querying nested keys inside a JSONB column using the containment operator (@>), which index type delivers optimal lookup performance?",
        "options": [
            {"id": "A", "optionText": "GIN (Generalized Inverted Index)", "isCorrect": True, "explanation": "GIN indexes are designed to handle composite values where internal elements need to be searched, making them ideal for JSONB containment queries with @>."},
            {"id": "B", "optionText": "Standard B-Tree Index", "isCorrect": False, "explanation": "B-Tree indexes can only index whole JSONB values, not arbitrary internal keys with @>."},
            {"id": "C", "optionText": "BRIN (Block Range Index)", "isCorrect": False, "explanation": "BRIN indexes are for physically sorted linear data."},
            {"id": "D", "optionText": "Hash Index", "isCorrect": False, "explanation": "Hash indexes only support simple equality = comparisons."}
        ]
    }
]


async def generate_daily_challenge_sprint(
    student_id: str,
    target_role: str,
    learned_skills: List[str],
    lagged_concepts: List[str],
    skill_level: str,
    question_count: int = 15
) -> Dict[str, Any]:
    """
    Generates Daily Challenge Sprint questions:
    - Focuses on what the candidate ALREADY LEARNED.
    - Tailored to target company role requirements.
    - Specifically targets tricky edge cases and lagged concepts.
    - Dynamically synthesizes questions with Ollama qwen3.5:4b and enriches with concept bank.
    """
    logger.info(
        f"Generating Daily Challenge Sprint: student={student_id}, role={target_role}, "
        f"learned={learned_skills}, lagged={lagged_concepts}, level={skill_level}, count={question_count}"
    )

    learned_set = {s.lower() for s in learned_skills} if learned_skills else {"java", "javascript", "html", "css"}
    qwen_questions = []

    try:
        qwen_questions = await synthesize_targeted_questions_with_qwen(
            mode="DAILY_SPRINT",
            target_role=target_role,
            skills=list(learned_set)[:3],
            lagged_concepts=lagged_concepts[:3],
            skill_level=skill_level,
            count=2
        )
    except Exception as e:
        logger.warning(f"Ollama question generation bypassed: {e}")

    assembled: List[Dict[str, Any]] = []

    for idx, q in enumerate(qwen_questions):
        if isinstance(q, dict) and "title" in q and "options" in q:
            q_copy = dict(q)
            q_copy["id"] = f"qwen-sprint-{idx + 1}"
            q_copy["ai_synthesized"] = True
            q_copy["role_aligned"] = target_role
            q_copy["xpReward"] = 25
            q_copy["coinReward"] = 5
            assembled.append(q_copy)

    priority_matches = []
    secondary_matches = []
    other_matches = []

    for item in CONCEPT_QUESTION_BANK:
        s_name = item.get("skill_name", "").lower()
        c_name = item.get("concept", "").lower()
        is_learned = s_name in learned_set
        is_lagged = any(lc.lower() in c_name for lc in lagged_concepts)

        item_copy = dict(item)
        item_copy["xpReward"] = 20
        item_copy["coinReward"] = 3

        if is_learned and is_lagged:
            priority_matches.append(item_copy)
        elif is_learned:
            secondary_matches.append(item_copy)
        else:
            other_matches.append(item_copy)

    random.shuffle(priority_matches)
    random.shuffle(secondary_matches)
    random.shuffle(other_matches)

    for q in priority_matches:
        if len(assembled) < question_count and q["id"] not in [x["id"] for x in assembled]:
            assembled.append(q)

    for q in secondary_matches:
        if len(assembled) < question_count and q["id"] not in [x["id"] for x in assembled]:
            assembled.append(q)

    for q in other_matches:
        if len(assembled) < question_count and q["id"] not in [x["id"] for x in assembled]:
            assembled.append(q)

    for idx, q in enumerate(assembled):
        q["index"] = idx + 1
        q["difficulty"] = skill_level if skill_level else "INTERMEDIATE"

    return {
        "mode": "DAILY_SPRINT",
        "student_id": student_id,
        "target_role": target_role,
        "skill_level": skill_level,
        "total_questions": len(assembled),
        "ai_model": "qwen3.5:4b",
        "focus": "Learned Skills & Company Role Edge Cases",
        "questions": assembled[:question_count]
    }


async def generate_revise_recall_set(
    student_id: str,
    currently_learning_skills: List[str],
    lagged_concepts: List[str],
    incorrect_questions: List[Dict[str, Any]],
    skill_level: str,
    question_count: int = 10
) -> Dict[str, Any]:
    """
    Generates Revise & Recall questions:
    - Focuses strictly on what the candidate is CURRENTLY LEARNING.
    - Directly targets lagged concepts and incorrectly answered questions.
    - Formatted for active recall and spaced repetition.
    - Dynamically synthesizes questions with Ollama qwen3.5:4b and enriches with concept bank.
    """
    logger.info(
        f"Generating Revise & Recall: student={student_id}, currently_learning={currently_learning_skills}, "
        f"lagged={lagged_concepts}, level={skill_level}, count={question_count}"
    )

    learning_set = {s.lower() for s in currently_learning_skills} if currently_learning_skills else {"react", "typescript", "spring boot", "python", "css", "postgresql"}
    qwen_questions = []

    try:
        qwen_questions = await synthesize_targeted_questions_with_qwen(
            mode="REVISE_RECALL",
            target_role="Full-Stack Engineer",
            skills=list(learning_set)[:3],
            lagged_concepts=lagged_concepts[:3],
            skill_level=skill_level,
            count=2
        )
    except Exception as e:
        logger.warning(f"Ollama question generation bypassed: {e}")

    assembled: List[Dict[str, Any]] = []

    for idx, q in enumerate(qwen_questions):
        if isinstance(q, dict) and "title" in q and "options" in q:
            q_copy = dict(q)
            q_copy["id"] = f"qwen-recall-{idx + 1}"
            q_copy["ai_synthesized"] = True
            q_copy["recallStage"] = "STAGE_1_REINFORCEMENT"
            q_copy["retentionScore"] = 45.0
            q_copy["xpReward"] = 30
            q_copy["coinReward"] = 6
            assembled.append(q_copy)

    concept_matches = []
    learning_matches = []
    other_matches = []

    for item in CONCEPT_QUESTION_BANK:
        s_name = item.get("skill_name", "").lower()
        c_name = item.get("concept", "").lower()
        is_learning = s_name in learning_set
        is_lagged = any(lc.lower() in c_name for lc in lagged_concepts)

        item_copy = dict(item)
        item_copy["recallStage"] = "STAGE_2_ACTIVE_RECALL" if is_lagged else "STAGE_1_INITIAL"
        item_copy["retentionScore"] = 40.0 if is_lagged else 60.0
        item_copy["xpReward"] = 25
        item_copy["coinReward"] = 5

        if is_learning and is_lagged:
            concept_matches.append(item_copy)
        elif is_learning:
            learning_matches.append(item_copy)
        else:
            other_matches.append(item_copy)

    random.shuffle(concept_matches)
    random.shuffle(learning_matches)
    random.shuffle(other_matches)

    for q in concept_matches:
        if len(assembled) < question_count and q["id"] not in [x["id"] for x in assembled]:
            assembled.append(q)

    for q in learning_matches:
        if len(assembled) < question_count and q["id"] not in [x["id"] for x in assembled]:
            assembled.append(q)

    for q in other_matches:
        if len(assembled) < question_count and q["id"] not in [x["id"] for x in assembled]:
            assembled.append(q)

    for idx, q in enumerate(assembled):
        q["index"] = idx + 1
        q["difficulty"] = skill_level if skill_level else "INTERMEDIATE"

    return {
        "mode": "ACTIVE_RECALL",
        "student_id": student_id,
        "skill_level": skill_level,
        "total_questions": len(assembled),
        "ai_model": "qwen3.5:4b",
        "focus": "In-Progress Skills & Lagged Concept Remediation",
        "questions": assembled[:question_count]
    }

