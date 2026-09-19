package com.beyon.practice.service;

import com.beyon.common.exception.ForbiddenException;
import com.beyon.common.exception.ResourceNotFoundException;
import com.beyon.practice.model.*;
import com.beyon.practice.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class QuestionBankService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final QuestionTestCaseRepository testCaseRepository;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    public QuestionBankService(QuestionRepository questionRepository,
                                QuestionOptionRepository optionRepository,
                                QuestionTestCaseRepository testCaseRepository,
                                org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.testCaseRepository = testCaseRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Question> getPublishedQuestions(int page, int size) {
        return questionRepository.findByStatusInOrderByCreatedAtDesc(List.of("PUBLISHED", "ACTIVE"), PageRequest.of(page, size));
    }

    public List<Question> getQuestionsBySkill(UUID skillId, int limit) {
        return questionRepository.findBySkillIdPublished(skillId, PageRequest.of(0, limit));
    }

    public List<Question> getQuestionsByTopic(UUID topicId, int limit) {
        return questionRepository.findByTopicIdPublished(topicId, PageRequest.of(0, limit));
    }

    public List<Question> getQuestionsByDifficulty(String difficulty, int limit) {
        return questionRepository.findByDifficultyPublished(difficulty, PageRequest.of(0, limit));
    }

    public List<Question> searchQuestions(String query, int limit) {
        String search = query != null ? query.trim() : "";
        return questionRepository.findByStatusInAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(List.of("PUBLISHED", "ACTIVE"), search, PageRequest.of(0, limit));
    }

    public List<Question> getQuestionsBySkillFiltered(UUID skillId, String search, String difficulty, int limit) {
        StringBuilder sql = new StringBuilder("SELECT id FROM questions WHERE (status = 'PUBLISHED' OR status = 'ACTIVE') AND skill_id = ?");
        List<Object> params = new java.util.ArrayList<>();
        params.add(skillId.toString());
        if (difficulty != null && !difficulty.isBlank() && !"ALL".equalsIgnoreCase(difficulty)) {
            sql.append(" AND difficulty = ?");
            params.add(difficulty.toUpperCase());
        }
        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(tags) LIKE ?)");
            String term = "%" + search.toLowerCase().trim() + "%";
            params.add(term);
            params.add(term);
            params.add(term);
        }
        sql.append(" ORDER BY created_at DESC LIMIT ?");
        params.add(limit > 0 ? limit : 100);

        List<String> ids = jdbcTemplate.query(sql.toString(), (rs, rowNum) -> rs.getString("id"), params.toArray());
        if (ids.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        List<UUID> uuids = ids.stream().map(UUID::fromString).toList();
        return questionRepository.findAllById(uuids);
    }

    public List<Question> getQuestionsBySkillAndDifficulty(UUID skillId, String difficulty, int limit) {
        return questionRepository.findBySkillAndDifficulty(skillId, difficulty, PageRequest.of(0, limit));
    }

    public Question getQuestion(UUID id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
    }

    public List<QuestionOption> getOptions(UUID questionId) {
        return optionRepository.findByQuestionIdOrderByDisplayOrder(questionId);
    }

    public List<QuestionTestCase> getTestCases(UUID questionId) {
        return testCaseRepository.findByQuestionIdAndHiddenFalse(questionId);
    }

    public List<QuestionTestCase> getSampleTestCases(UUID questionId) {
        return testCaseRepository.findByQuestionIdAndSampleTrue(questionId);
    }

    public List<Question> getUnsolvedForStudent(UUID studentId, int limit) {
        return questionRepository.findUnsolvedForStudent(studentId, PageRequest.of(0, limit));
    }

    @Transactional
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    @Transactional
    public Question createFullQuestion(Question question, List<QuestionOption> options, List<QuestionTestCase> testCases) {
        if (question.getStatus() == null) question.setStatus("ACTIVE");
        Question saved = questionRepository.save(question);
        if (options != null) {
            int order = 1;
            for (QuestionOption opt : options) {
                opt.setQuestionId(saved.getId());
                opt.setDisplayOrder(order++);
                optionRepository.save(opt);
            }
        }
        if (testCases != null) {
            for (QuestionTestCase tc : testCases) {
                tc.setQuestionId(saved.getId());
                testCaseRepository.save(tc);
            }
        }
        return saved;
    }

    @Transactional
    public Question updateQuestion(UUID id, Question update, UUID userId) {
        return updateFullQuestion(id, update, null, null, userId, false);
    }

    @Transactional
    public Question updateFullQuestion(UUID id, Question update, List<QuestionOption> options, List<QuestionTestCase> testCases, UUID userId, boolean isAdmin) {
        Question question = getQuestion(id);
        if (!isAdmin && question.getCreatedBy() != null && !question.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("Cannot modify another user's question");
        }
        if (update.getTitle() != null) question.setTitle(update.getTitle());
        if (update.getDescription() != null) question.setDescription(update.getDescription());
        if (update.getQuestionType() != null) question.setQuestionType(update.getQuestionType());
        if (update.getDifficulty() != null) question.setDifficulty(update.getDifficulty());
        if (update.getExpectedOutput() != null) question.setExpectedOutput(update.getExpectedOutput());
        if (update.getCodeTemplate() != null) question.setCodeTemplate(update.getCodeTemplate());
        if (update.getSolution() != null) question.setSolution(update.getSolution());
        if (update.getExplanation() != null) question.setExplanation(update.getExplanation());
        if (update.getTags() != null) question.setTags(update.getTags());
        if (update.getStatus() != null) question.setStatus(update.getStatus());
        if (update.getSkillId() != null) question.setSkillId(update.getSkillId());
        if (update.getTopicId() != null) question.setTopicId(update.getTopicId());
        if (update.getEvaluationMethod() != null) question.setEvaluationMethod(update.getEvaluationMethod());
        question.setVersion(question.getVersion() + 1);
        Question saved = questionRepository.save(question);

        if (options != null) {
            List<QuestionOption> existing = optionRepository.findByQuestionId(id);
            if (!existing.isEmpty()) {
                optionRepository.deleteAll(existing);
                optionRepository.flush();
            }
            int order = 1;
            for (QuestionOption opt : options) {
                opt.setId(null);
                opt.setQuestionId(saved.getId());
                opt.setDisplayOrder(order++);
                optionRepository.save(opt);
            }
        }

        if (testCases != null) {
            List<QuestionTestCase> existingTc = testCaseRepository.findByQuestionIdOrderByDisplayOrder(id);
            if (!existingTc.isEmpty()) {
                testCaseRepository.deleteAll(existingTc);
                testCaseRepository.flush();
            }
            for (QuestionTestCase tc : testCases) {
                tc.setId(null);
                tc.setQuestionId(saved.getId());
                testCaseRepository.save(tc);
            }
        }

        return saved;
    }

    @Transactional
    public void deleteQuestion(UUID id, UUID userId, boolean isAdmin) {
        Question question = getQuestion(id);
        if (!isAdmin && question.getCreatedBy() != null && !question.getCreatedBy().equals(userId)) {
            throw new ForbiddenException("Cannot delete another user's question");
        }

        List<QuestionOption> existingOptions = optionRepository.findByQuestionId(id);
        if (!existingOptions.isEmpty()) {
            optionRepository.deleteAll(existingOptions);
        }

        List<QuestionTestCase> existingTc = testCaseRepository.findByQuestionIdOrderByDisplayOrder(id);
        if (!existingTc.isEmpty()) {
            testCaseRepository.deleteAll(existingTc);
        }

        try {
            jdbcTemplate.update("DELETE FROM student_question_attempts WHERE question_id = ?", id.toString());
        } catch (Exception ignored) {}

        questionRepository.delete(question);
    }

    @Transactional
    public List<Question> recommendAndSeedQuestionsForSkill(UUID skillId, String skillName) {
        return recommendAndSeedQuestionsForSkill(skillId, skillName, "ALL");
    }

    @Transactional
    public List<Question> recommendAndSeedQuestionsForSkill(UUID skillId, String skillName, String requestedLevel) {
        String name = skillName;
        if (name == null || name.isBlank()) {
            try {
                name = jdbcTemplate.queryForObject("SELECT name FROM skills WHERE id = ?", String.class, skillId.toString());
            } catch (Exception e) {
                name = "Technical Skill";
            }
        }
        if (name == null || name.isBlank()) name = "Competency";

        String targetLevel = requestedLevel != null ? requestedLevel.toUpperCase().trim() : "ALL";
        String normalizedName = name.toLowerCase().trim();
        List<Question> generated = new java.util.ArrayList<>();

        // Generate authentic, level-by-level questions tailored to domain
        List<QuestionSpec> specs = getCuratedQuestionSpecs(name, normalizedName, targetLevel);

        for (QuestionSpec spec : specs) {
            // Avoid duplicate question titles for the same skill
            List<Question> existing = questionRepository.findBySkillId(skillId);
            boolean alreadyExists = existing.stream().anyMatch(q -> q.getTitle().equalsIgnoreCase(spec.title));
            if (alreadyExists) continue;

            Question q = new Question();
            q.setSkillId(skillId);
            q.setTitle(spec.title);
            q.setDescription(spec.description);
            q.setQuestionType(spec.questionType);
            q.setDifficulty(spec.difficulty);
            q.setEvaluationMethod("EXACT_MATCH");
            q.setTags(spec.tags);
            q.setStatus("ACTIVE");
            q.setCodeTemplate(spec.codeTemplate);
            q.setExplanation(spec.explanation);

            List<QuestionOption> options = new java.util.ArrayList<>();
            int order = 1;
            for (OptionSpec optSpec : spec.options) {
                options.add(createOption(optSpec.text, optSpec.isCorrect, order++, optSpec.explanation));
            }

            generated.add(createFullQuestion(q, options, null));
        }

        return generated;
    }

    private static class OptionSpec {
        String text;
        boolean isCorrect;
        String explanation;
        OptionSpec(String text, boolean isCorrect, String explanation) {
            this.text = text;
            this.isCorrect = isCorrect;
            this.explanation = explanation;
        }
    }

    private static class QuestionSpec {
        String title;
        String description;
        String questionType;
        String difficulty;
        String explanation;
        String codeTemplate;
        String tags;
        List<OptionSpec> options;

        QuestionSpec(String title, String description, String questionType, String difficulty,
                     String explanation, String codeTemplate, String tags, List<OptionSpec> options) {
            this.title = title;
            this.description = description;
            this.questionType = questionType;
            this.difficulty = difficulty;
            this.explanation = explanation;
            this.codeTemplate = codeTemplate;
            this.tags = tags;
            this.options = options;
        }
    }

    private List<QuestionSpec> getCuratedQuestionSpecs(String skillName, String normalizedName, String level) {
        List<QuestionSpec> list = new java.util.ArrayList<>();
        String slug = skillName.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");

        boolean wantEasy = level.equals("ALL") || level.equals("EASY") || level.contains("1");
        boolean wantMed = level.equals("ALL") || level.equals("MEDIUM") || level.contains("2");
        boolean wantHard = level.equals("ALL") || level.equals("HARD") || level.contains("3");

        if (normalizedName.equals("c")) {
            if (wantEasy) {
                list.add(new QuestionSpec(
                    "C Level 1: Operator Precedence & Postfix vs Prefix Increment",
                    "Trace the evaluation order of postfix and prefix increment operators in C.",
                    "SINGLE_CHOICE", "EASY",
                    "a++ evaluates to 10 then increments a to 11. ++b increments b from 20 to 21 first, then evaluates to 21. c = 10 + 21 = 31.",
                    "#include <stdio.h>\nint main() {\n    int a = 10, b = 20;\n    int c = a++ + ++b;\n    printf(\"%d %d %d\\n\", a, b, c);\n    return 0;\n}",
                    "c,operators,precedence,level-1,beginner",
                    List.of(
                        new OptionSpec("11 21 31", true, "a evaluates to 10 then increments; b increments to 21 first; 10 + 21 = 31."),
                        new OptionSpec("11 21 32", false, "Incorrect increment order."),
                        new OptionSpec("10 20 30", false, "Variables are permanently modified by increment."),
                        new OptionSpec("11 20 31", false, "++b increments b to 21.")
                    )
                ));
                list.add(new QuestionSpec(
                    "C Level 1: Integer Division and Floating-Point Assignment",
                    "Analyze the result of the division expression when assigning to a float variable in C.",
                    "SINGLE_CHOICE", "EASY",
                    "Both operands are integers, so integer division truncates 5 / 2 to 2 before assigning to float result (2.00).",
                    "#include <stdio.h>\nint main() {\n    int x = 5, y = 2;\n    float result = x / y;\n    printf(\"%.2f\\n\", result);\n    return 0;\n}",
                    "c,division,casting,level-1,beginner",
                    List.of(
                        new OptionSpec("2.00", true, "Integer division produces 2, implicitly cast to 2.00f."),
                        new OptionSpec("2.50", false, "Requires explicit floating cast, e.g. (float)x / y."),
                        new OptionSpec("2.5", false, "Printf specifier %.2f forces two decimal digits."),
                        new OptionSpec("Compilation Error", false, "Integer division is valid standard C.")
                    )
                ));
            }
            if (wantMed) {
                list.add(new QuestionSpec(
                    "C Level 2: Pointer Arithmetic & Array Subscript Invariants",
                    "Calculate the outputs when performing pointer offset arithmetic and negative array indexing in C.",
                    "SINGLE_CHOICE", "MEDIUM",
                    "ptr points to arr[3]. ptr - 1 points to arr[2] (30); ptr[-2] is *(ptr - 2), which is arr[1] (20).",
                    "#include <stdio.h>\nint main() {\n    int arr[] = {10, 20, 30, 40, 50};\n    int *ptr = arr + 3;\n    printf(\"%d %d\\n\", *(ptr - 1), ptr[-2]);\n    return 0;\n}",
                    "c,pointers,pointer-arithmetic,level-2,intermediate",
                    List.of(
                        new OptionSpec("30 20", true, "*(ptr - 1) is arr[2] (30), ptr[-2] is arr[1] (20)."),
                        new OptionSpec("40 30", false, "Off by one error."),
                        new OptionSpec("20 10", false, "Incorrect pointer subtraction."),
                        new OptionSpec("Undefined Behavior: Negative index prohibited", false, "Negative subscript indexing is fully valid within array bounds.")
                    )
                ));
                list.add(new QuestionSpec(
                    "C Level 2: Dynamic Memory Allocation & Dangling Pointers",
                    "Identify the memory lifecycle bug that occurs when accessing a pointer after free() in C.",
                    "SINGLE_CHOICE", "MEDIUM",
                    "free(ptr) invalidates memory without zeroing the pointer variable. Dereferencing it is Use-After-Free (UAF).",
                    "#include <stdlib.h>\nint main() {\n    int *ptr = (int *)malloc(sizeof(int));\n    *ptr = 42;\n    free(ptr);\n    *ptr = 99; // Bug\n    return 0;\n}",
                    "c,memory,malloc,free,uaf,level-2,intermediate",
                    List.of(
                        new OptionSpec("Writing through a dangling pointer causing Use-After-Free (UAF) undefined behavior", true, "free() invalidates heap allocation without clearing pointer address."),
                        new OptionSpec("Automatic NULL assignment by runtime preventing access", false, "C runtime never zeroes freed pointers."),
                        new OptionSpec("Clean reallocation at the same heap address", false, "Allocator memory cannot be safely reused without malloc."),
                        new OptionSpec("Memory leak because primitive pointers cannot be freed", false, "Memory was freed; the bug is illegal dereferencing.")
                    )
                ));
            }
            if (wantHard) {
                list.add(new QuestionSpec(
                    "C Level 3: Struct Memory Alignment & Padding on 64-bit Architecture",
                    "Determine the exact byte size of a heterogeneous struct under standard 64-bit ABI alignment rules.",
                    "SINGLE_CHOICE", "HARD",
                    "1 byte (char) + 3 bytes pad + 4 bytes (int) + 2 bytes (short) + 2 bytes pad = 12 bytes total.",
                    "#include <stdio.h>\nstruct Data {\n    char a;    // 1 byte\n    int b;     // 4 bytes\n    short c;   // 2 bytes\n};\nint main() {\n    printf(\"%zu\\n\", sizeof(struct Data));\n    return 0;\n}",
                    "c,structs,memory-alignment,padding,abi,level-3,advanced",
                    List.of(
                        new OptionSpec("12 bytes", true, "1 byte + 3 pad + 4 bytes + 2 bytes + 2 pad to satisfy 4-byte natural alignment = 12 bytes."),
                        new OptionSpec("7 bytes", false, "7 is raw unpadded sum; natural alignment requires word boundaries."),
                        new OptionSpec("8 bytes", false, "Fails to include short member padding."),
                        new OptionSpec("16 bytes", false, "Requires 8-byte members like double or pointer.")
                    )
                ));
                list.add(new QuestionSpec(
                    "C Level 3: The volatile Keyword and Compiler Register Caching",
                    "Explain how the volatile qualifier prevents dangerous compiler optimizations when polling hardware registers or shared memory.",
                    "SINGLE_CHOICE", "HARD",
                    "Without volatile, compiler optimizations (-O2/-O3) cache status in a CPU register, creating an infinite loop.",
                    "int status = 0; // Not declared volatile!\nvoid wait_for_ready() {\n    while (status == 0) {\n        // Polling memory-mapped I/O register modified by hardware interrupt\n    }\n}",
                    "c,volatile,compiler-optimization,hardware-polling,level-3,advanced",
                    List.of(
                        new OptionSpec("The compiler may optimize the loop into an infinite loop by caching status in a register", true, "volatile forces memory bus read on every access."),
                        new OptionSpec("The compiler rejects polling loops as dead code", false, "Polling loops are syntactically standard."),
                        new OptionSpec("The memory bus throws a hardware segmentation fault", false, "Memory reads succeed; the flaw is register caching."),
                        new OptionSpec("The compiler automatically wraps the loop in a POSIX mutex lock", false, "C compilers never synthesize mutexes automatically.")
                    )
                ));
            }
        } else if (normalizedName.contains("cpp") || normalizedName.contains("c++")) {
            if (wantEasy) {
                list.add(new QuestionSpec(
                    "C++ Level 1: Pass-by-Reference vs Pass-by-Value Semantics",
                    "Trace the modification of integer variables passed using C++ reference syntax (&).",
                    "SINGLE_CHOICE", "EASY",
                    "Pass-by-reference (&b) binds directly to y in main(), modifying it to 30. Variable x is passed by value, remaining 10.",
                    "#include <iostream>\nvoid modify(int a, int &b) {\n    a += 10;\n    b += 10;\n}\nint main() {\n    int x = 10, y = 20;\n    modify(x, y);\n    std::cout << x << \" \" << y << std::endl;\n    return 0;\n}",
                    "cpp,references,pass-by-reference,level-1,beginner",
                    List.of(
                        new OptionSpec("10 30", true, "a is passed by value (x unchanged); b is passed by reference (y modified to 30)."),
                        new OptionSpec("20 30", false, "x was passed by value."),
                        new OptionSpec("10 20", false, "y was modified through reference b."),
                        new OptionSpec("Compilation Error", false, "Non-const lvalue references bind cleanly to lvalues.")
                    )
                ));
            }
            if (wantMed) {
                list.add(new QuestionSpec(
                    "C++ Level 2: RAII & std::unique_ptr Ownership Transfer",
                    "Identify the valid ownership transfer semantics when working with std::unique_ptr in Modern C++.",
                    "SINGLE_CHOICE", "MEDIUM",
                    "std::unique_ptr is move-only. Copying produces a compilation error; ownership must be transferred via std::move().",
                    "#include <memory>\nint main() {\n    std::unique_ptr<int> p1 = std::make_unique<int>(100);\n    std::unique_ptr<int> p2 = std::move(p1); // Ownership transfer\n    return 0;\n}",
                    "cpp,raii,smart-pointers,unique-ptr,move-semantics,level-2,intermediate",
                    List.of(
                        new OptionSpec("std::unique_ptr cannot be copied; ownership must be transferred explicitly using std::move()", true, "unique_ptr deletes its copy constructor to enforce single exclusive ownership."),
                        new OptionSpec("Copying duplicates the underlying heap resource automatically", false, "Deep copy is not performed by unique_ptr."),
                        new OptionSpec("Copying creates a shared reference count like std::shared_ptr", false, "unique_ptr has zero reference counting overhead."),
                        new OptionSpec("Ownership can only be transferred using raw pointer release()", false, "std::move() is the standard idiomatic way.")
                    )
                ));
            }
            if (wantHard) {
                list.add(new QuestionSpec(
                    "C++ Level 3: Virtual Destructors & Polymorphic Memory Leaks",
                    "Analyze what critical flaw occurs when deleting a derived object through a base class pointer without a virtual destructor.",
                    "SINGLE_CHOICE", "HARD",
                    "Deleting through a base pointer with non-virtual destructor results in Undefined Behavior and leaks Derived class resources.",
                    "class Base {\npublic:\n    ~Base() { std::cout << \"~Base\\n\"; }\n};\nclass Derived : public Base {\n    int *data = new int[1000];\npublic:\n    ~Derived() { delete[] data; std::cout << \"~Derived\\n\"; }\n};\nint main() {\n    Base *b = new Derived();\n    delete b; // Flaw: Non-virtual destructor!\n}",
                    "cpp,virtual-destructor,polymorphism,vtable,level-3,advanced",
                    List.of(
                        new OptionSpec("Undefined Behavior: Derived destructor is never invoked, leaking Derived resources", true, "Base destructor must be declared virtual to dispatch through the vtable."),
                        new OptionSpec("Compile-time error: Base pointer cannot point to Derived", false, "Upcasting is valid standard C++."),
                        new OptionSpec("The runtime automatically synthesizes a virtual destructor at link time", false, "C++ does not synthesize virtual destructors."),
                        new OptionSpec("Derived destructor executes first, followed by Base destructor normally", false, "Only occurs if declared virtual.")
                    )
                ));
            }
        } else {
            // General Level 1, 2, 3 tailored to skillName
            if (wantEasy) {
                list.add(new QuestionSpec(
                    skillName + " Level 1: Core Syntax, Data Types & Scoping Rules",
                    "In " + skillName + ", which principle governs variable declaration scope, memory lifetime, and fundamental type evaluation?",
                    "SINGLE_CHOICE", "EASY",
                    "Core variables in " + skillName + " follow strict block-scoping and compile-time type validation to prevent uninitialized memory reads.",
                    "// Core Syntax & Type Verification in " + skillName + "\nlet baseline_value = 100;\n// How is scope and lifetime resolved?",
                    slug + ",syntax,scoping,types,level-1,beginner",
                    List.of(
                        new OptionSpec("Block-scoped allocation where lifetime ends at the enclosing block exit", true, "Guarantees predictable deallocation and zero out-of-scope access in " + skillName + "."),
                        new OptionSpec("Global heap leakage across all unrelated execution threads", false, "Severe anti-pattern causing state corruption."),
                        new OptionSpec("Variables are unallocated and point to undefined CPU registers", false, "Types must be predictably defined."),
                        new OptionSpec("Dynamic runtime type conversion without boundary checks", false, "Leads to runtime type errors.")
                    )
                ));
            }
            if (wantMed) {
                list.add(new QuestionSpec(
                    skillName + " Level 2: Modular Architecture & Resource Lifecycle Management",
                    "When building production modules with " + skillName + ", which architectural practice reliably prevents resource exhaustion and connection leaks?",
                    "SINGLE_CHOICE", "MEDIUM",
                    "Deterministic resource cleanup patterns (RAII, try-with-resources, or automatic context disposal) ensure handles are released under all exit paths.",
                    "// Resource Lifecycle Management in " + skillName + "\n// Handling file descriptors, sockets, or connection pools safely",
                    slug + ",resources,lifecycle,modular,level-2,intermediate",
                    List.of(
                        new OptionSpec("Deterministic disposal wrappers (RAII / context handlers) ensuring cleanup on all code paths", true, "Standard industry practice in " + skillName + " for leak-free resource lifecycles."),
                        new OptionSpec("Leaving connections open indefinitely hoping the OS closes them", false, "Exhausts system file descriptors and connection pools."),
                        new OptionSpec("Triggering manual process restarts on every batch operation", false, "Unacceptable operational disruption."),
                        new OptionSpec("Swallowing all I/O exceptions silently without releasing handles", false, "Hides degradation and starves thread pools.")
                    )
                ));
            }
            if (wantHard) {
                list.add(new QuestionSpec(
                    skillName + " Level 3: Concurrency Hazards, Memory Consistency & Optimization",
                    "Under high concurrent throughput in " + skillName + ", how should shared mutable state be synchronized to eliminate race conditions without severe lock contention?",
                    "SINGLE_CHOICE", "HARD",
                    "Employing lock-free atomic primitives or partitioned fine-grained concurrency models eliminates thread contention while maintaining memory visibility.",
                    "// High-Throughput Concurrent Synchronization in " + skillName + "\n// Eliminating race conditions and lock contention",
                    slug + ",concurrency,memory-model,synchronization,optimization,level-3,advanced",
                    List.of(
                        new OptionSpec("Partitioned fine-grained locking or lock-free atomic CAS primitives to maximize throughput", true, "Minimizes thread contention and eliminates race conditions under heavy load in " + skillName + "."),
                        new OptionSpec("A single global mutual exclusion lock wrapping all application methods", false, "Serializes execution and creates catastrophic bottleneck."),
                        new OptionSpec("Disabling memory barriers and speculative store buffers entirely", false, "Causes stale memory visibility bugs across CPU cores."),
                        new OptionSpec("Spawning unmanaged background threads without backpressure bounds", false, "Causes thread starvation and OutOfMemory crashes.")
                    )
                ));
            }
        }

        return list;
    }

    private QuestionOption createOption(String text, boolean isCorrect, int order, String explanation) {
        QuestionOption opt = new QuestionOption();
        opt.setOptionText(text);
        opt.setCorrect(isCorrect);
        opt.setDisplayOrder(order);
        opt.setExplanation(explanation);
        return opt;
    }

    public long countPublished() {
        return questionRepository.countPublished();
    }

    public long countByDifficulty(String difficulty) {
        return questionRepository.countPublishedByDifficulty(difficulty);
    }
}

