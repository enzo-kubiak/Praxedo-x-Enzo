package com.praxedo.securefiles.controller;

import com.praxedo.securefiles.dto.FileMetadataDto;
import com.praxedo.securefiles.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FileController {

    private final FileService fileService;

    /**
     * POST /api/files/upload
     * Accepts a multipart file, stores it, returns metadata with PENDING status.
     */
    @PostMapping("/upload")
    public ResponseEntity<FileMetadataDto> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "uploadedBy", defaultValue = "anonymous") String uploadedBy
    ) throws IOException {
        log.info("Upload request: {} ({} bytes) by {}", file.getOriginalFilename(), file.getSize(), uploadedBy);
        FileMetadataDto result = fileService.upload(file, uploadedBy);
        return ResponseEntity.accepted().body(result);
    }

    /**
     * GET /api/files
     * Returns all files with their metadata and scan status.
     */
    @GetMapping
    public ResponseEntity<List<FileMetadataDto>> listFiles() {
        return ResponseEntity.ok(fileService.listAll());
    }

    /**
     * GET /api/files/{id}
     * Returns metadata for a specific file.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FileMetadataDto> getFile(@PathVariable UUID id) {
        return ResponseEntity.ok(fileService.getById(id));
    }

    /**
     * GET /api/files/{id}/download
     * Downloads a file — only possible if scan status is CLEAN.
     * Returns 403 if file is not yet clean.
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<InputStreamResource> download(@PathVariable UUID id) {
        try {
            FileService.DownloadResult result = fileService.download(id);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + result.fileName() + "\"")
                    .contentType(MediaType.parseMediaType(result.contentType()))
                    .contentLength(result.fileSize())
                    .body(new InputStreamResource(result.inputStream()));

        } catch (IllegalStateException e) {
            log.warn("Download denied for file {}: {}", id, e.getMessage());
            return ResponseEntity.status(403).build();
        }
    }
}
