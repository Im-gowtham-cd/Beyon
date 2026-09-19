package com.beyon.profile.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "aicte_institutions")
public class AicteInstitution {

    @Id
    @Column(columnDefinition = "varchar(36)")
    private String id;

    @Column(name = "aicte_id", nullable = false, unique = true, length = 50)
    private String aicteId;

    @Column(name = "institute_name", nullable = false, length = 500)
    private String instituteName;

    @Column(length = 100)
    private String region;

    @Column(length = 100)
    private String state;

    @Column(length = 100)
    private String district;

    @Column(length = 100)
    private String city;

    @Column(name = "user_group", length = 50)
    private String userGroup;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AicteInstitution() {}

    public AicteInstitution(String id, String aicteId, String instituteName, String region, String state, String district, String city, String userGroup) {
        this.id = id;
        this.aicteId = aicteId;
        this.instituteName = instituteName;
        this.region = region;
        this.state = state;
        this.district = district;
        this.city = city;
        this.userGroup = userGroup;
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAicteId() { return aicteId; }
    public void setAicteId(String aicteId) { this.aicteId = aicteId; }

    public String getInstituteName() { return instituteName; }
    public void setInstituteName(String instituteName) { this.instituteName = instituteName; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getUserGroup() { return userGroup; }
    public void setUserGroup(String userGroup) { this.userGroup = userGroup; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
