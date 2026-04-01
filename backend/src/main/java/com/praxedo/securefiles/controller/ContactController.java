package com.praxedo.securefiles.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@Slf4j
@CrossOrigin(origins = "*")
public class ContactController {

    /* En production, il faudrait utiliser un service mail ou autre pour la réception des messages
     */
     
     
    @PostMapping
    public ResponseEntity<Map<String, String>> submitContact(@RequestBody ContactRequest request) {
        log.info("Contact form received from: {} <{}>", request.name(), request.email());
        
        return ResponseEntity.ok(Map.of(
            "status", "received",
            "message", "Your message has been received. We'll get back to you shortly."
        ));
    }

    public record ContactRequest(String name, String email, String subject, String message) {}
}
