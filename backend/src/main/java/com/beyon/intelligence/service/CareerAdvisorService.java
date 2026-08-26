package com.beyon.intelligence.service;

import com.beyon.intelligence.model.*;
import com.beyon.intelligence.repository.*;
import com.beyon.profile.model.Skill;
import com.beyon.profile.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CareerAdvisorService {

    private final AdvisorChatSessionRepository sessionRepo;
    private final AdvisorChatMessageRepository messageRepo;
    private final StudentSkillGraphRepository graphRepo;
    private final CareerPathRepository careerPathRepo;
    private final CareerPathSkillRepository pathSkillRepo;
    private final SkillRepository skillRepo;

    public CareerAdvisorService(AdvisorChatSessionRepository sessionRepo,
                                 AdvisorChatMessageRepository messageRepo,
                                 StudentSkillGraphRepository graphRepo,
                                 CareerPathRepository careerPathRepo,
                                 CareerPathSkillRepository pathSkillRepo,
                                 SkillRepository skillRepo) {
        this.sessionRepo = sessionRepo;
        this.messageRepo = messageRepo;
        this.graphRepo = graphRepo;
        this.careerPathRepo = careerPathRepo;
        this.pathSkillRepo = pathSkillRepo;
        this.skillRepo = skillRepo;
    }

    public AdvisorChatSession createSession(UUID studentId) {
        AdvisorChatSession session = new AdvisorChatSession();
        session.setStudentId(studentId);
        session.setTitle("Career Advice");
        return sessionRepo.save(session);
    }

    public List<AdvisorChatSession> getMySessions(UUID studentId) {
        return sessionRepo.findByStudentIdOrderByUpdatedAtDesc(studentId);
    }

    public List<AdvisorChatMessage> getSessionMessages(UUID sessionId, UUID studentId) {
        AdvisorChatSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");
        return messageRepo.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    public Map<String, Object> askQuestion(UUID sessionId, String question, UUID studentId) {
        AdvisorChatSession session = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        if (!session.getStudentId().equals(studentId)) throw new RuntimeException("Forbidden");

        // Save user message
        AdvisorChatMessage userMsg = new AdvisorChatMessage();
        userMsg.setSessionId(sessionId);
        userMsg.setRole("user");
        userMsg.setContent(question);
        messageRepo.save(userMsg);

        // Generate deterministic response based on Beyon data
        String response = generateResponse(question, studentId);
        String dataRefs = generateDataReferences(question, studentId);

        AdvisorChatMessage aiMsg = new AdvisorChatMessage();
        aiMsg.setSessionId(sessionId);
        aiMsg.setRole("assistant");
        aiMsg.setContent(response);
        aiMsg.setDataReferences(dataRefs);
        messageRepo.save(aiMsg);

        session.setUpdatedAt(OffsetDateTime.now());
        sessionRepo.save(session);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userMessage", userMsg);
        result.put("assistantMessage", aiMsg);
        return result;
    }

    private String generateResponse(String question, UUID studentId) {
        String q = question.toLowerCase();
        List<StudentSkillGraph> graph = graphRepo.findByStudentIdOrderByProficiencyPctDesc(studentId);

        if (q.contains("learn next") || q.contains("what should") || q.contains("next step")) {
            return generateNextStepsAdvice(graph, studentId);
        } else if (q.contains("missing") || q.contains("gap") || q.contains("skill")) {
            return generateSkillGapAdvice(graph, studentId);
        } else if (q.contains("eligible") || q.contains("job") || q.contains("role")) {
            return generateCareerMatchAdvice(graph, studentId);
        } else if (q.contains("improve") || q.contains("placement") || q.contains("ready")) {
            return generateReadinessAdvice(graph, studentId);
        } else if (q.contains("assessment") || q.contains("test")) {
            return generateAssessmentAdvice(graph, studentId);
        } else {
            return generateGeneralAdvice(graph, studentId);
        }
    }

    private String generateNextStepsAdvice(List<StudentSkillGraph> graph, UUID studentId) {
        if (graph.isEmpty()) {
            return "You haven't built your skill graph yet. Start by taking the daily challenge and practicing questions to build your skill profile. Once I can see your skills, I'll give you personalized recommendations.";
        }

        List<StudentSkillGraph> weakest = graph.stream()
            .sorted(Comparator.comparing(StudentSkillGraph::getProficiencyPct))
            .limit(3)
            .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("**Based on your current profile:**\n\n");
        for (StudentSkillGraph g : graph.stream().limit(5).collect(Collectors.toList())) {
            Skill skill = skillRepo.findById(g.getSkillId()).orElse(null);
            String name = skill != null ? skill.getName() : "Unknown";
            sb.append(String.format("• %s: %s (%s%%)\n", name, g.getLevel(), g.getProficiencyPct()));
        }

        sb.append("\n**Your biggest areas for improvement:**\n");
        for (StudentSkillGraph w : weakest) {
            Skill skill = skillRepo.findById(w.getSkillId()).orElse(null);
            String name = skill != null ? skill.getName() : "Unknown";
            sb.append(String.format("→ %s (%s, %s%%) — Focus on practice questions and take an assessment\n", name, w.getLevel(), w.getProficiencyPct()));
        }

        List<CareerPath> paths = careerPathRepo.findByActiveTrue();
        if (!paths.isEmpty()) {
            sb.append("\n**Recommended career paths to explore:**\n");
            paths.stream().limit(3).forEach(p ->
                sb.append(String.format("• %s — %s\n", p.getName(), p.getDescription() != null ? p.getDescription().substring(0, Math.min(80, p.getDescription().length())) : ""))
            );
        }

        return sb.toString();
    }

    private String generateSkillGapAdvice(List<StudentSkillGraph> graph, UUID studentId) {
        if (graph.isEmpty()) {
            return "Your skill graph is empty. Complete some practice questions and assessments first, then I can analyze your skill gaps.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("**Your current skill levels:**\n\n");
        for (StudentSkillGraph g : graph) {
            Skill skill = skillRepo.findById(g.getSkillId()).orElse(null);
            String name = skill != null ? skill.getName() : "Unknown";
            String bar = "█".repeat((int)(g.getProficiencyPct().doubleValue() / 10)) +
                        "░".repeat(10 - (int)(g.getProficiencyPct().doubleValue() / 10));
            sb.append(String.format("%-20s %s %s%% (%s)\n", name, bar, g.getProficiencyPct(), g.getLevel()));
        }

        List<StudentSkillGraph> gaps = graph.stream()
            .filter(g -> g.getProficiencyPct().doubleValue() < 50)
            .sorted(Comparator.comparing(StudentSkillGraph::getProficiencyPct))
            .collect(Collectors.toList());

        if (!gaps.isEmpty()) {
            sb.append("\n**Skills needing attention:**\n");
            for (StudentSkillGraph g : gaps) {
                Skill skill = skillRepo.findById(g.getSkillId()).orElse(null);
                String name = skill != null ? skill.getName() : "Unknown";
                sb.append(String.format("⚠ %s — Currently %s. Practice more questions and take a skill assessment.\n", name, g.getLevel()));
            }
        } else {
            sb.append("\n✅ Your skills are well-developed! Consider advancing to expert level in your strongest areas.");
        }

        return sb.toString();
    }

    private String generateCareerMatchAdvice(List<StudentSkillGraph> graph, UUID studentId) {
        List<CareerPath> paths = careerPathRepo.findByActiveTrue();
        if (paths.isEmpty()) {
            return "No career paths are available yet. Check back later for career recommendations.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("**Based on your skill profile, here are your best career matches:**\n\n");

        Map<UUID, StudentSkillGraph> skillMap = new HashMap<>();
        graph.forEach(g -> skillMap.put(g.getSkillId(), g));

        for (CareerPath path : paths.stream().limit(5).collect(Collectors.toList())) {
            List<CareerPathSkill> required = pathSkillRepo.findByCareerPathIdOrderBySortOrder(path.getId());
            int matched = 0;
            for (CareerPathSkill req : required) {
                StudentSkillGraph sg = skillMap.get(req.getSkillId());
                if (sg != null && levelOrder(sg.getLevel()) >= levelOrder(req.getProficiencyLevel())) {
                    matched++;
                }
            }
            int total = required.size();
            int pct = total > 0 ? (matched * 100 / total) : 0;
            sb.append(String.format("• **%s** — %d/%d skills matched (%d%%)\n", path.getName(), matched, total, pct));
        }

        return sb.toString();
    }

    private String generateReadinessAdvice(List<StudentSkillGraph> graph, UUID studentId) {
        if (graph.isEmpty()) {
            return "Complete your profile setup and start practicing to build your skill intelligence. Then I can assess your placement readiness.";
        }

        double avgProficiency = graph.stream()
            .mapToDouble(g -> g.getProficiencyPct().doubleValue())
            .average().orElse(0);
        long verifiedCount = graph.stream().filter(StudentSkillGraph::getVerified).count();
        long advancedPlus = graph.stream().filter(g -> levelOrder(g.getLevel()) >= 4).count();

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("**Your Placement Readiness:**\n\n"));
        sb.append(String.format("• Average Skill Level: %.0f%%\n", avgProficiency));
        sb.append(String.format("• Verified Skills: %d/%d\n", verifiedCount, graph.size()));
        sb.append(String.format("• Advanced/Expert Skills: %d\n", advancedPlus));

        if (avgProficiency >= 70 && verifiedCount > 3) {
            sb.append("\n✅ You're in good shape for placements! Focus on maintaining consistency and adding certifications.");
        } else if (avgProficiency >= 40) {
            sb.append("\n⚡ You're making progress. Focus on strengthening your weakest skills and taking more assessments to get verified scores.");
        } else {
            sb.append("\n🎯 Keep practicing daily. Take the daily challenge consistently and focus on building foundational skills.");
        }

        return sb.toString();
    }

    private String generateAssessmentAdvice(List<StudentSkillGraph> graph, UUID studentId) {
        if (graph.isEmpty()) {
            return "Start with the daily challenge to build your skill profile. Once you have some skills scored, I can recommend targeted assessments.";
        }

        List<StudentSkillGraph> weakest = graph.stream()
            .sorted(Comparator.comparing(StudentSkillGraph::getProficiencyPct))
            .limit(3)
            .collect(Collectors.toList());

        StringBuilder sb = new StringBuilder();
        sb.append("**Recommended assessments based on your profile:**\n\n");

        for (StudentSkillGraph w : weakest) {
            Skill skill = skillRepo.findById(w.getSkillId()).orElse(null);
            String name = skill != null ? skill.getName() : "Unknown";
            sb.append(String.format("→ Take a **%s** assessment to verify and improve your %s skills (currently %s)\n", name, name, w.getLevel()));
        }

        sb.append("\nTip: Taking assessments helps verify your skills and makes them visible to recruiters.");
        return sb.toString();
    }

    private String generateGeneralAdvice(List<StudentSkillGraph> graph, UUID studentId) {
        StringBuilder sb = new StringBuilder();
        sb.append("**Here's what I can help you with:**\n\n");
        sb.append("• \"What should I learn next?\" — Personalized learning recommendations\n");
        sb.append("• \"What skills am I missing?\" — Skill gap analysis\n");
        sb.append("• \"Which roles suit my skills?\" — Career matching\n");
        sb.append("• \"How can I improve my placement readiness?\" — Readiness assessment\n");
        sb.append("• \"Which assessment should I take?\" — Targeted assessment advice\n");

        if (!graph.isEmpty()) {
            sb.append(String.format("\n**Quick overview:** You have %d skills in your graph. ", graph.size()));
            long strong = graph.stream().filter(g -> levelOrder(g.getLevel()) >= 3).count();
            sb.append(String.format("%d are at intermediate level or above.\n", strong));
        }

        return sb.toString();
    }

    private String generateDataReferences(String question, UUID studentId) {
        return "{\"sources\": [\"skill_graph\", \"career_paths\"], \"studentId\": \"" + studentId + "\"}";
    }

    private int levelOrder(String level) {
        return switch (level) {
            case "EXPERT" -> 5; case "ADVANCED" -> 4; case "INTERMEDIATE" -> 3;
            case "ELEMENTARY" -> 2; case "BEGINNER" -> 1; default -> 0;
        };
    }
}
