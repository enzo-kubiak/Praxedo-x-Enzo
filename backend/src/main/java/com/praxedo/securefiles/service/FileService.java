package com.praxedo.securefiles.service;

import com.praxedo.securefiles.dto.FileMetadataDto;
import com.praxedo.securefiles.model.FileMetadata;
import com.praxedo.securefiles.repository.FileMetadataRepository;
import io.micrometer.core.instrument.Counter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final FileMetadataRepository repository;
    private final StorageService storageService;
    private final AntivirusService antivirusService;
    private final Counter infectedFilesCounter;
    private final Counter scannedFilesCounter;

    @Transactional
    public FileMetadataDto upload(MultipartFile file, String uploadedBy) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Cannot upload empty file");
        String storedKey = storageService.store(file);
        FileMetadata metadata = FileMetadata.builder()
                .originalFileName(file.getOriginalFilename())
                .storedFileName(storedKey)
                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                .fileSize(file.getSize())
                .uploadedBy(uploadedBy)
                .scanStatus(FileMetadata.ScanStatus.PENDING)
                .build();
        FileMetadata saved = repository.save(metadata);
        log.info("File uploaded: {} (id={})", file.getOriginalFilename(), saved.getId());
        return FileMetadataDto.from(saved);
    }

    public List<FileMetadataDto> listAll() {
        return repository.findByOrderByUploadedAtDesc().stream().map(FileMetadataDto::from).toList();
    }

    public FileMetadataDto getById(UUID id) {
        return repository.findById(id)
                .map(FileMetadataDto::from)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + id));
    }

    public DownloadResult download(UUID id) {
        FileMetadata metadata = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("File not found: " + id));
        if (metadata.getScanStatus() != FileMetadata.ScanStatus.CLEAN) {
            throw new IllegalStateException("File cannot be downloaded. Status: " + metadata.getScanStatus());
        }
        InputStream stream = storageService.download(metadata.getStoredFileName());
        return new DownloadResult(stream, metadata.getOriginalFileName(), metadata.getContentType(), metadata.getFileSize());
    }

    @Scheduled(fixedRateString = "${scan.scheduler.fixed-rate-ms:10000}")
    @Transactional
    public void processPendingScans() {
        List<FileMetadata> pending = repository.findByScanStatus(FileMetadata.ScanStatus.PENDING);
        if (pending.isEmpty()) return;
        log.info("Scan scheduler: {} file(s) to scan", pending.size());

        for (FileMetadata file : pending) {
            try {
                file.setScanStatus(FileMetadata.ScanStatus.SCANNING);
                repository.save(file);

                byte[] bytes = storageService.downloadBytes(file.getStoredFileName());
                AntivirusService.ScanResult result = antivirusService.scan(file.getOriginalFileName(), bytes);

                scannedFilesCounter.increment();

                if (result.clean()) {
                    file.setScanStatus(FileMetadata.ScanStatus.CLEAN);
                    file.setScanResult(result.detail());
                } else {
                    file.setScanStatus(FileMetadata.ScanStatus.INFECTED);
                    file.setScanResult(result.detail());
                    infectedFilesCounter.increment(); // ← déclenche l'alerte Grafana
                    storageService.delete(file.getStoredFileName());
                    log.warn("INFECTED file deleted: {} (id={})", file.getOriginalFileName(), file.getId());
                }

                file.setScannedAt(Instant.now());
                repository.save(file);
                log.info("Scan complete: {} → {}", file.getOriginalFileName(), file.getScanStatus());

            } catch (Exception e) {
                log.error("Scan failed for id={}: {}", file.getId(), e.getMessage());
                file.setScanStatus(FileMetadata.ScanStatus.PENDING);
                repository.save(file);
            }
        }
    }

    public record DownloadResult(InputStream inputStream, String fileName, String contentType, long fileSize) {}
}
