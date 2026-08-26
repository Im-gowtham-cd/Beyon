package com.beyon.intelligence.service;

import com.beyon.intelligence.model.SkillTaxonomyNode;
import com.beyon.intelligence.repository.SkillTaxonomyNodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SkillTaxonomyService {

    private final SkillTaxonomyNodeRepository taxonomyRepo;

    public SkillTaxonomyService(SkillTaxonomyNodeRepository taxonomyRepo) {
        this.taxonomyRepo = taxonomyRepo;
    }

    public List<SkillTaxonomyNode> getRootNodes() {
        return taxonomyRepo.findByParentIdIsNullAndActiveTrueOrderBySortOrder();
    }

    public List<SkillTaxonomyNode> getChildren(UUID parentId) {
        return taxonomyRepo.findByParentIdAndActiveTrueOrderBySortOrder(parentId);
    }

    public SkillTaxonomyNode getBySlug(String slug) {
        return taxonomyRepo.findBySlug(slug).orElseThrow(() -> new RuntimeException("Taxonomy node not found"));
    }

    public Map<String, Object> getTree(UUID nodeId) {
        SkillTaxonomyNode node = taxonomyRepo.findById(nodeId).orElseThrow(() -> new RuntimeException("Not found"));
        List<SkillTaxonomyNode> children = taxonomyRepo.findByParentIdAndActiveTrueOrderBySortOrder(nodeId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("node", node);
        result.put("children", children.stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("name", c.getName());
            m.put("slug", c.getSlug());
            m.put("level", c.getLevel());
            m.put("icon", c.getIcon());
            m.put("industryDemand", c.getIndustryDemand());
            return m;
        }).collect(Collectors.toList()));
        return result;
    }

    public List<Map<String, Object>> search(String query) {
        String q = query.toLowerCase();
        return taxonomyRepo.findByActiveTrueOrderBySortOrder().stream()
            .filter(n -> n.getName().toLowerCase().contains(q) || (n.getDescription() != null && n.getDescription().toLowerCase().contains(q)))
            .limit(20)
            .map(n -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", n.getId());
                m.put("name", n.getName());
                m.put("slug", n.getSlug());
                m.put("level", n.getLevel());
                m.put("industryDemand", n.getIndustryDemand());
                return m;
            })
            .collect(Collectors.toList());
    }

    public SkillTaxonomyNode createNode(SkillTaxonomyNode node) {
        return taxonomyRepo.save(node);
    }
}
