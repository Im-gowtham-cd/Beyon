package com.beyon.institution.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class VerifyOtpRequest {

    @NotBlank(message = "AICTE ID is required")
    private String aicteId;

    @NotBlank(message = "Principal email is required")
    @Email(message = "Invalid email format")
    private String principalEmail;

    @NotBlank(message = "OTP code is required")
    private String otpCode;

    public String getAicteId() { return aicteId; }
    public void setAicteId(String aicteId) { this.aicteId = aicteId; }
    public String getPrincipalEmail() { return principalEmail; }
    public void setPrincipalEmail(String principalEmail) { this.principalEmail = principalEmail; }
    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }
}
