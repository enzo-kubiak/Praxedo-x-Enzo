package com.praxedo.securefiles.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "file_metadata")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String originalFileName;

    @Column(nullable = false)
    private String storedFileName;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long fileSize;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ScanStatus scanStatus = ScanStatus.PENDING;

    @Column
    private String scanResult;

    @Column(nullable = false)
    @Builder.Default
    private Instant uploadedAt = Instant.now();

    @Column
    private Instant scannedAt;

    @Column
    private String uploadedBy;

    public enum ScanStatus {
        PENDING,
        SCANNING,
        CLEAN,
        INFECTED
    }
}
