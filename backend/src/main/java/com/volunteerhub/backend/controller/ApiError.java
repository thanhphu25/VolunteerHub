package com.volunteerhub.backend.controller;

/**
 * Standard API error wrapper
 */
public class ApiError {
    private boolean success;
    private String error;
    private Object details;

    public ApiError() {}

    public ApiError(boolean success, String error, Object details) {
        this.success = success;
        this.error = error;
        this.details = details;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public Object getDetails() { return details; }
    public void setDetails(Object details) { this.details = details; }
}
