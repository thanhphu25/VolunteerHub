package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.ChangeRoleRequest;
import com.volunteerhub.backend.dto.UserResponse;
import com.volunteerhub.backend.service.IAdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final IAdminService svc;

    public AdminController(IAdminService svc) {
        this.svc = svc;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        var p = svc.listUsers(PageRequest.of(page, size));
        return ResponseEntity.ok(p);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/lock")
    public ResponseEntity<?> lockUser(@PathVariable Long id) {
        try {
            svc.lockUser(id);
            return ResponseEntity.ok(java.util.Map.of("message", "locked"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable Long id) {
        try {
            svc.unlockUser(id);
            return ResponseEntity.ok(java.util.Map.of("message", "unlocked"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @Valid @RequestBody ChangeRoleRequest req) {
        try {
            svc.changeUserRole(id, req.getRole());
            return ResponseEntity.ok(java.util.Map.of("message", "role-updated"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", ex.getMessage()));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/export/users")
    public ResponseEntity<?> exportUsers(@RequestParam(defaultValue = "csv") String format) {
        try {
            byte[] data = svc.exportUsers(format);
            String filename = "users." + (format.equalsIgnoreCase("json") ? "json" : "csv");
            MediaType contentType = format.equalsIgnoreCase("json") ? MediaType.APPLICATION_JSON : MediaType.TEXT_PLAIN;
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(contentType)
                    .body(data);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Export failed"));
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/export/events")
    public ResponseEntity<?> exportEvents(@RequestParam(defaultValue = "csv") String format) {
        try {
            byte[] data = svc.exportEvents(format);
            String filename = "events." + (format.equalsIgnoreCase("json") ? "json" : "csv");
            MediaType contentType = format.equalsIgnoreCase("json") ? MediaType.APPLICATION_JSON : MediaType.TEXT_PLAIN;
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(contentType)
                    .body(data);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", "Export failed"));
        }
    }
}
