package com.beyon.modules.telemetry.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Document(collection = "assessment_attempts")
public class AssessmentAttemptTelemetry {

    @Id
    private String id;
    private String studentId;
    private String assessmentId;
    private String sessionId;
    private Instant timestamp;
    private double overallScore;
    private int timeTakenSeconds;
    private List<QuestionAttemptItem> questionAttempts;
    private Map<String, Object> proctoringSummary;

    public AssessmentAttemptTelemetry() {
        this.timestamp = Instant.now();
    }

    public static class QuestionAttemptItem {
        private String questionId;
        private String skillName;
        private boolean correct;
        private int timeTakenSeconds;
        private String selectedOption;

        public QuestionAttemptItem() {}

        public QuestionAttemptItem(String questionId, String skillName, boolean correct, int timeTakenSeconds) {
            this.questionId = questionId;
            this.skillName = skillName;
            this.correct = correct;
            this.timeTakenSeconds = timeTakenSeconds;
        }

        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }
        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public boolean isCorrect() { return correct; }
        public void setCorrect(boolean correct) { this.correct = correct; }
        public int getTimeTakenSeconds() { return timeTakenSeconds; }
        public void setTimeTakenSeconds(int timeTakenSeconds) { this.timeTakenSeconds = timeTakenSeconds; }
        public String getSelectedOption() { return selectedOption; }
        public void setSelectedOption(String selectedOption) { this.selectedOption = selectedOption; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getAssessmentId() { return assessmentId; }
    public void setAssessmentId(String assessmentId) { this.assessmentId = assessmentId; }
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    public double getOverallScore() { return overallScore; }
    public void setOverallScore(double overallScore) { this.overallScore = overallScore; }
    public int getTimeTakenSeconds() { return timeTakenSeconds; }
    public void setTimeTakenSeconds(int timeTakenSeconds) { this.timeTakenSeconds = timeTakenSeconds; }
    public List<QuestionAttemptItem> getQuestionAttempts() { return questionAttempts; }
    public void setQuestionAttempts(List<QuestionAttemptItem> questionAttempts) { this.questionAttempts = questionAttempts; }
    public Map<String, Object> getProctoringSummary() { return proctoringSummary; }
    public void setProctoringSummary(Map<String, Object> proctoringSummary) { this.proctoringSummary = proctoringSummary; }
}
