package com.praxedo.securefiles.dto;

import com.praxedo.securefiles.model.FileMetadata;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class FileMetadataDto {

    private UUID id;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private FileMetadata.ScanStatus scanStatus;
    private String scanResult;
    private Instant uploadedAt;
    private Instant scannedAt;
    private String uploadedBy;
    private boolean downloadable;

    public static FileMetadataDto from(FileMetadata entity) {
        return FileMetadataDto.builder()
                .id(entity.getId())
                .originalFileName(entity.getOriginalFileName())
                .contentType(entity.getContentType())
                .fileSize(entity.getFileSize())
                .scanStatus(entity.getScanStatus())
                .scanResult(entity.getScanResult())
                .uploadedAt(entity.getUploadedAt())
                .scannedAt(entity.getScannedAt())
                .uploadedBy(entity.getUploadedBy())
                .downloadable(entity.getScanStatus() == FileMetadata.ScanStatus.CLEAN)
                .build();
    }
}
