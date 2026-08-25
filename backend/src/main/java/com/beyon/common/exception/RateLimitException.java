package com.beyon.common.exception;

public class RateLimitException extends RuntimeException {
    public RateLimitException(String message) { super(message); }
    public RateLimitException() { super("Rate limit exceeded. Please try again later."); }
}
