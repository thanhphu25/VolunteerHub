package com.volunteerhub.backend.controller;

import com.volunteerhub.backend.dto.*;
import com.volunteerhub.backend.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    // POST /api/v1/registrations  (volunteer)
    @PostMapping
    public ResponseEntity<?> register(@Valid @RequestBody RegistrationRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        var resp = registrationService.registerForEvent(req, email);
        return ResponseEntity.status(201).body(new ApiSuccess(true, resp, "Registered (pending)"));
    }

    // DELETE /api/v1/registrations/:id  (volunteer cancel)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        registrationService.cancelRegistration(id, email);
        return ResponseEntity.ok(new ApiSuccess(true, null, "Registration cancelled"));
    }

    // GET /api/v1/registrations/my-registrations
    @GetMapping("/my-registrations")
    public ResponseEntity<?> myRegistrations(
            Authentication auth,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String status
    ) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        var resp = registrationService.myRegistrations(email, page, limit, status);
        return ResponseEntity.ok(resp);
    }

    // Approve registration (organizer)
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @Valid @RequestBody ApproveRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        var resp = registrationService.approveRegistration(id, email, req.getOrganizerNote());
        return ResponseEntity.ok(new ApiSuccess(true, resp, "Registration approved"));
    }

    // Reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @Valid @RequestBody ApproveRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        var resp = registrationService.rejectRegistration(id, email, req.getOrganizerNote());
        return ResponseEntity.ok(new ApiSuccess(true, resp, "Registration rejected"));
    }

    // Complete
    @PutMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id, @Valid @RequestBody CompleteRequest req, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiError(false, "Unauthorized", null));
        }
        String email = auth.getName();
        var resp = registrationService.completeRegistration(id, email, req);
        return ResponseEntity.ok(new ApiSuccess(true, resp, "Registration completed"));
    }
}
