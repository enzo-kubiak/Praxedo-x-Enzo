package com.praxedo.scanner.controller;

import com.praxedo.scanner.service.ClamAvService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * REST API for antivirus scanning.
 *
 * POST /scan
 *   Accepts: multipart/form-data  { file: <bytes> }
 *   Returns: application/json
 *   {
 *     "clean":  true | false,
 *     "detail": "No threat detected" | "Threat detected: <VirusName>"
 *   }
 *
 * GET /ping
 *   Health check — returns 200 OK if the service is up.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ScanController {

    private final ClamAvService clamAvService;

    @PostMapping("/scan")
    public ResponseEntity<Map<String, Object>> scan(
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        log.info("Scan request: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        ClamAvService.ScanResult result = clamAvService.scan(
                file.getOriginalFilename(),
                file.getBytes()
        );

        return ResponseEntity.ok(Map.of(
                "clean",  result.clean(),
                "detail", result.detail()
        ));
    }

    @GetMapping("/ping")
    public ResponseEntity<Map<String, String>> ping() {
        return ResponseEntity.ok(Map.of("status", "ok", "service", "scanner-service"));
    }
}
