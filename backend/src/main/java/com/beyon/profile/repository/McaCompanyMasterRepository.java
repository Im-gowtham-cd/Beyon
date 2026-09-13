package com.beyon.profile.repository;

import com.beyon.profile.model.McaCompanyMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface McaCompanyMasterRepository extends JpaRepository<McaCompanyMaster, String> {

    Optional<McaCompanyMaster> findByCin(String cin);

    Optional<McaCompanyMaster> findByCinIgnoreCase(String cin);

    @Query("SELECT m FROM McaCompanyMaster m WHERE LOWER(m.companyName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<McaCompanyMaster> searchByCompanyName(@Param("query") String query);
}
