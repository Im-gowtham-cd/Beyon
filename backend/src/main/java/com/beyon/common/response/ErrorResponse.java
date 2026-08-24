package com.beyon.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private boolean success = false;
    private ErrorBody error;
    private Instant timestamp;
    private String traceId;

    public ErrorResponse(String code, String message) {
        this.error = new ErrorBody(code, message);
        this.timestamp = Instant.now();
    }

    public ErrorResponse(String code, String message, List<ErrorDetail> details) {
        this.error = new ErrorBody(code, message, details);
        this.timestamp = Instant.now();
    }

    public boolean isSuccess() {
        return success;
    }

    public ErrorBody getError() {
        return error;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public String getTraceId() {
        return traceId;
    }

    public void setTraceId(String traceId) {
        this.traceId = traceId;
    }

    public static class ErrorBody {
        private String code;
        private String message;
        private List<ErrorDetail> details;

        public ErrorBody(String code, String message) {
            this.code = code;
            this.message = message;
        }

        public ErrorBody(String code, String message, List<ErrorDetail> details) {
            this.code = code;
            this.message = message;
            this.details = details;
        }

        public String getCode() {
            return code;
        }

        public String getMessage() {
            return message;
        }

        public List<ErrorDetail> getDetails() {
            return details;
        }
    }

    public static class ErrorDetail {
        private String field;
        private String message;

        public ErrorDetail(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() {
            return field;
        }

        public String getMessage() {
            return message;
        }
    }
}
