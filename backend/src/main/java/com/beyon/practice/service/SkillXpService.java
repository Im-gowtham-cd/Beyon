package com.beyon.practice.service;

import com.beyon.practice.model.SkillLevel;
import com.beyon.practice.model.SkillXpTransaction;
import com.beyon.practice.repository.SkillLevelRepository;
import com.beyon.practice.repository.SkillXpTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
public class SkillXpService {

    private final SkillXpTransactionRepository xpRepo;
    private final SkillLevelRepository levelRepo;

    private static final int[][] LEVEL_THRESHOLDS = {
        {1, 499}, {500, 1499}, {1500, 3999}, {4000, 7999}, {8000, 99999}
    };
    private static final String[] LEVEL_NAMES = {"BEGINNER","INTERMEDIATE","ADVANCED","EXPERT","INDUSTRY_READY"};

    public SkillXpService(SkillXpTransactionRepository xpRepo, SkillLevelRepository levelRepo) {
        this.xpRepo = xpRepo;
        this.levelRepo = levelRepo;
    }

    @Transactional
    public SkillXpTransaction earnXp(UUID studentId, UUID skillId, int amount, String source, UUID sourceId, String description) {
        if (xpRepo.existsByStudentIdAndSkillIdAndSourceAndSourceId(studentId, skillId, source, sourceId)) {
            return null;
        }
        SkillXpTransaction txn = new SkillXpTransaction();
        txn.setStudentId(studentId);
        txn.setSkillId(skillId);
        txn.setAmount(amount);
        txn.setSource(source);
        txn.setSourceId(sourceId);
        txn.setDescription(description);
        xpRepo.save(txn);
        recalculateLevel(studentId, skillId);
        return txn;
    }

    private void recalculateLevel(UUID studentId, UUID skillId) {
        Long totalXp = xpRepo.sumXpByStudentAndSkill(studentId, skillId);
        SkillLevel level = levelRepo.findByStudentIdAndSkillId(studentId, skillId)
                .orElseGet(() -> {
                    SkillLevel l = new SkillLevel();
                    l.setStudentId(studentId);
                    l.setSkillId(skillId);
                    return l;
                });
        level.setTotalXp(totalXp.intValue());
        int newLevel = 1;
        for (int i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (totalXp >= LEVEL_THRESHOLDS[i][0]) { newLevel = i + 1; break; }
        }
        level.setLevel(newLevel);
        level.setLevelName(LEVEL_NAMES[newLevel - 1]);
        levelRepo.save(level);
    }

    public List<SkillLevel> getSkillLevels(UUID studentId) {
        return levelRepo.findByStudentIdOrderByTotalXpDesc(studentId);
    }

    public Map<String, Object> getSkillDetail(UUID studentId, UUID skillId) {
        SkillLevel level = levelRepo.findByStudentIdAndSkillId(studentId, skillId).orElse(null);
        List<SkillXpTransaction> txns = xpRepo.findByStudentIdAndSkillIdOrderByCreatedAtDesc(studentId, skillId);
        Map<String, Object> result = new HashMap<>();
        result.put("level", level);
        result.put("transactions", txns);
        if (level != null) {
            int currentLevelIdx = level.getLevel() - 1;
            int minXp = currentLevelIdx < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[currentLevelIdx][0] : 0;
            int maxXp = currentLevelIdx < LEVEL_THRESHOLDS.length - 1 ? LEVEL_THRESHOLDS[currentLevelIdx + 1][0] : 99999;
            result.put("progressInLevel", BigDecimal.valueOf(level.getTotalXp() - minXp)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(maxXp - minXp), 1, BigDecimal.ROUND_HALF_UP));
        }
        return result;
    }
}
