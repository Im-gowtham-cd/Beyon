package com.beyon.assessment.repository;

import com.beyon.assessment.model.ProctoringDevice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProctoringDeviceRepository extends JpaRepository<ProctoringDevice, UUID> {
    List<ProctoringDevice> findByProctoringSessionId(UUID proctoringSessionId);
    List<ProctoringDevice> findByProctoringSessionIdAndDeviceType(UUID proctoringSessionId, String deviceType);
    Optional<ProctoringDevice> findByPairingToken(String pairingToken);
}
