package com.praxedo.securefiles.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

/**
 * API contract:
 *   POST http://scanner-service:8090/scan
 *   Content-Type: multipart/form-data
 *   Body: file=<bytes>
 *
 *   Response 200 OK:
 *   { "clean": true,  "detail": "No threat detected"     }
 *   { "clean": false, "detail": "Threat detected: <name>" }
 *
 *   Response 503:
 *   { "error": "ClamAV unreachable: ..." }
 */
@Service
@Slf4j
public class AntivirusService {

    private final RestTemplate restTemplate;
    private final String scannerUrl;

    public AntivirusService(
            @Value("${scanner.url:http://localhost:8090}") String scannerUrl
    ) {
        this.scannerUrl   = scannerUrl;
        this.restTemplate = new RestTemplate();
    }

    public ScanResult scan(String fileName, byte[] fileBytes) {
        log.info("Sending '{}' ({} bytes) to scanner-service at {}", fileName, fileBytes.length, scannerUrl);

        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new NamedByteArrayResource(fileBytes, fileName));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<ScanResponse> response = restTemplate.postForEntity(
                    scannerUrl + "/scan",
                    request,
                    ScanResponse.class
            );

            ScanResponse resp = response.getBody();
            if (resp == null) return new ScanResult(false, "Empty response from scanner-service");

            log.info("scanner-service result for '{}': clean={} detail={}", fileName, resp.clean(), resp.detail());
            return new ScanResult(resp.clean(), resp.detail());

        } catch (Exception e) {
            log.error("scanner-service unreachable for '{}': {}", fileName, e.getMessage());
            // Return non-infected so the scheduler retries later
            return new ScanResult(false, "SCANNER_UNAVAILABLE: " + e.getMessage());
        }
    }

    /** Gives the byte array a filename so multipart sends it correctly. 
     * -> proposé par l'inteligence artificielle
    */
    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;
        NamedByteArrayResource(byte[] bytes, String filename) {
            super(bytes);
            this.filename = filename;
        }
        @Override public String getFilename() { return filename; }
    }

    private record ScanResponse(boolean clean, String detail) {}

    public record ScanResult(boolean clean, String detail) {}
}
