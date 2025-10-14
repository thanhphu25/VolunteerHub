package com.volunteerhub.backend.dto;

public class CompleteRequest {
    private String attendanceStatus; // "present" or "absent"
    private String completionNote;

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }
    public String getCompletionNote() { return completionNote; }
    public void setCompletionNote(String completionNote) { this.completionNote = completionNote; }
}
