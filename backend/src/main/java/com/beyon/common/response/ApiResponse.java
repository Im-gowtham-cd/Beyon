package com.beyon.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;
    private String error;
    private PaginationMeta pagination;

    public ApiResponse() {}

    public static <T> ApiResponse<T> ok() {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.message = "Operation successful";
        return r;
    }

    public static <T> ApiResponse<T> ok(T data) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data = data;
        r.message = "Operation successful";
        return r;
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data = data;
        r.message = message;
        return r;
    }

    public static <T> ApiResponse<T> error(String message) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = false;
        r.error = message;
        return r;
    }

    public static <T> ApiResponse<T> paginated(T data, int page, int size, long total) {
        ApiResponse<T> r = new ApiResponse<>();
        r.success = true;
        r.data = data;
        r.message = "Operation successful";
        r.pagination = new PaginationMeta(page, size, total, (int) Math.ceil((double) total / size));
        return r;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean v) { this.success = v; }
    public T getData() { return data; }
    public void setData(T v) { this.data = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public String getError() { return error; }
    public void setError(String v) { this.error = v; }
    public PaginationMeta getPagination() { return pagination; }
    public void setPagination(PaginationMeta v) { this.pagination = v; }
}
