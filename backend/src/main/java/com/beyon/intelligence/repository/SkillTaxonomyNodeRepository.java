package com.beyon.intelligence.repository;

import com.beyon.intelligence.model.SkillTaxonomyNode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SkillTaxonomyNodeRepository extends JpaRepository<SkillTaxonomyNode, UUID> {
    Optional<SkillTaxonomyNode> findBySlug(String slug);
    List<SkillTaxonomyNode> findByParentIdAndActiveTrueOrderBySortOrder(UUID parentId);
    List<SkillTaxonomyNode> findByParentIdIsNullAndActiveTrueOrderBySortOrder();
    List<SkillTaxonomyNode> findByActiveTrueOrderBySortOrder();
}
