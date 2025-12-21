package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.ChangeRoleRequest;
import com.volunteerhub.backend.dto.UserResponse;
import com.volunteerhub.backend.service.IAdminService;
import com.volunteerhub.backend.service.IAuditService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller providing administrative functionalities.
 * Handles user management, account status control, and data export features.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final IAdminService svc;
    private final IAuditService auditService;

    /**
     * Initializes the AdminController with administration and audit services.
     * * @param svc The administrative service for user operations.
     * @param auditService The service for tracking administrative actions.
     */
    public AdminController(IAdminService svc, IAuditService auditService) {
        this.svc = svc;
        this.auditService = auditService;
    }

    /**
     * Retrieves a paginated list of all users in the system.
     * * @param page The page index to retrieve (default 0).
     * @param size The number of records per page (default 20).
     * @param auth Current authentication details for auditing.
     * @return A ResponseEntity containing the paginated user data.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<?> listUsers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        var p = svc.listUsers(PageRequest.of(page, size));
        // audit the listing (non-fatal)
        try {
            auditService.log(auth, "admin:list_users", Map.of("page", page, "size", size));
        } catch (Exception ignore) {
        }
        return ResponseEntity.ok(p);
    }

    /**
     * Locks a user account to prevent login access.
     * * @param id The unique ID of the user to be locked.
     * @param auth Current authentication details for auditing.
     * @return A success message or a 404 error if the user is not found.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/lock")
    public ResponseEntity<?> lockUser(@PathVariable Long id, Authentication auth) {
        try {
            svc.lockUser(id);
            try {
                auditService.log(auth, "admin:lock_user", Map.of("targetUserId", id));
            } catch (Exception ignore) {
            }
            return ResponseEntity.ok(Map.of("message", "locked"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Unlocks a previously locked user account.
     * * @param id The unique ID of the user to be unlocked.
     * @param auth Current authentication details for auditing.
     * @return A success message or a 404 error if the user is not found.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable Long id, Authentication auth) {
        try {
            svc.unlockUser(id);
            try {
                auditService.log(auth, "admin:unlock_user", Map.of("targetUserId", id));
            } catch (Exception ignore) {
            }
            return ResponseEntity.ok(Map.of("message", "unlocked"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(404).body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Updates the role of a specific user.
     * * @param id The unique ID of the user.
     * @param req The request body containing the new role.
     * @param auth Current authentication details for auditing.
     * @return A success message or a 400 error if the request is invalid.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{id}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long id, @Valid @RequestBody ChangeRoleRequest req,
            Authentication auth) {
        try {
            svc.changeUserRole(id, req.getRole());
            try {
                auditService.log(auth, "admin:change_role", Map.of("targetUserId", id, "newRole", req.getRole()));
            } catch (Exception ignore) {
            }
            return ResponseEntity.ok(Map.of("message", "role-updated"));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    /**
     * Exports the user list into a file (CSV or JSON).
     * * @param format The desired file format ("csv" or "json").
     * @param auth Current authentication details for auditing.
     * @return A ResponseEntity containing the file byte data.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/export/users")
    public ResponseEntity<?> exportUsers(@RequestParam(defaultValue = "csv") String format, Authentication auth) {
        try {
            byte[] data = svc.exportUsers(format);
            String filename = "users." + (format.equalsIgnoreCase("json") ? "json" : "csv");
            MediaType contentType = format.equalsIgnoreCase("json") ? MediaType.APPLICATION_JSON : MediaType.TEXT_PLAIN;
            try {
                auditService.log(auth, "admin:export_users", Map.of("format", format));
            } catch (Exception ignore) {
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(contentType)
                    .body(data);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Export failed"));
        }
    }

    /**
     * Exports the event list into a file (CSV or JSON).
     * * @param format The desired file format ("csv" or "json").
     * @param auth Current authentication details for auditing.
     * @return A ResponseEntity containing the file byte data.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/export/events")
    public ResponseEntity<?> exportEvents(@RequestParam(defaultValue = "csv") String format, Authentication auth) {
        try {
            byte[] data = svc.exportEvents(format);
            String filename = "events." + (format.equalsIgnoreCase("json") ? "json" : "csv");
            MediaType contentType = format.equalsIgnoreCase("json") ? MediaType.APPLICATION_JSON : MediaType.TEXT_PLAIN;
            try {
                auditService.log(auth, "admin:export_events", Map.of("format", format));
            } catch (Exception ignore) {
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(contentType)
                    .body(data);
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of("error", "Export failed"));
        }
    }
}