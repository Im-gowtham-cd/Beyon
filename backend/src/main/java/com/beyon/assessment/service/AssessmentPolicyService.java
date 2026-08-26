package com.beyon.assessment.service;

import com.beyon.assessment.model.AssessmentPolicy;
import com.beyon.assessment.repository.AssessmentPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class AssessmentPolicyService {

    private final AssessmentPolicyRepository policyRepository;

    public AssessmentPolicyService(AssessmentPolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    public AssessmentPolicy createPolicy(AssessmentPolicy policy) {
        return policyRepository.save(policy);
    }

    public AssessmentPolicy updatePolicy(UUID id, AssessmentPolicy updates) {
        AssessmentPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));

        if (updates.getMaxWarningsBeforeFlag() != null) policy.setMaxWarningsBeforeFlag(updates.getMaxWarningsBeforeFlag());
        if (updates.getMaxWarningsBeforeTerminate() != null) policy.setMaxWarningsBeforeTerminate(updates.getMaxWarningsBeforeTerminate());
        if (updates.getCriticalViolationTerminate() != null) policy.setCriticalViolationTerminate(updates.getCriticalViolationTerminate());
        if (updates.getAllowCameraToggle() != null) policy.setAllowCameraToggle(updates.getAllowCameraToggle());
        if (updates.getAllowFullscreenExit() != null) policy.setAllowFullscreenExit(updates.getAllowFullscreenExit());
        if (updates.getMaxFullscreenExits() != null) policy.setMaxFullscreenExits(updates.getMaxFullscreenExits());
        if (updates.getMaxSessionInterruptions() != null) policy.setMaxSessionInterruptions(updates.getMaxSessionInterruptions());
        if (updates.getTimeExtensionAllowed() != null) policy.setTimeExtensionAllowed(updates.getTimeExtensionAllowed());
        if (updates.getAutoSubmitOnExpire() != null) policy.setAutoSubmitOnExpire(updates.getAutoSubmitOnExpire());
        if (updates.getRecordScreen() != null) policy.setRecordScreen(updates.getRecordScreen());
        if (updates.getRecordCamera() != null) policy.setRecordCamera(updates.getRecordCamera());
        if (updates.getRecordAudio() != null) policy.setRecordAudio(updates.getRecordAudio());
        if (updates.getName() != null) policy.setName(updates.getName());

        policy.setUpdatedAt(OffsetDateTime.now());
        return policyRepository.save(policy);
    }

    public List<AssessmentPolicy> getPoliciesByCompany(UUID companyUserId) {
        return policyRepository.findByCompanyUserId(companyUserId);
    }

    public AssessmentPolicy getPolicyByOpportunity(UUID opportunityId) {
        return policyRepository.findByOpportunityId(opportunityId)
                .orElseGet(() -> createDefaultPolicy(opportunityId));
    }

    private AssessmentPolicy createDefaultPolicy(UUID opportunityId) {
        AssessmentPolicy policy = new AssessmentPolicy();
        policy.setOpportunityId(opportunityId);
        policy.setName("Default Assessment Policy");
        policy.setMaxWarningsBeforeFlag(3);
        policy.setMaxWarningsBeforeTerminate(5);
        policy.setCriticalViolationTerminate(true);
        policy.setAllowFullscreenExit(false);
        policy.setMaxFullscreenExits(3);
        policy.setMaxSessionInterruptions(2);
        policy.setAutoSubmitOnExpire(true);
        policy.setRecordScreen(true);
        policy.setRecordCamera(true);
        policy.setRecordAudio(false);
        return policyRepository.save(policy);
    }
}
