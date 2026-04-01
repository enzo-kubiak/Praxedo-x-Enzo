package com.praxedo.securefiles.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
@Slf4j
public class StorageService {

    private final S3Client s3Client;

    @Value("${minio.bucket}")
    private String bucketName;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * Stocke un fichier dans MinIO et retourne sa storage key.
     */
    public String store(MultipartFile file) throws IOException {
        String key = UUID.randomUUID() + "_" + file.getOriginalFilename();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .contentLength(file.getSize())
                .build();

        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        log.info("Stored file with key: {}", key);
        return key;
    }

    /**
     * Télécharge un fichier depuis MinIO
     */
    public InputStream download(String key) {
        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        ResponseInputStream<GetObjectResponse> response = s3Client.getObject(request);
        log.info("Retrieved file with key: {}", key);
        return response;
    }

    /**
     * Downloads a file as bytes (used by antivirus scanner).
     * -> proposé par l'intelligence artificielle
     */
    public byte[] downloadBytes(String key) throws IOException {
        try (InputStream is = download(key)) {
            return is.readAllBytes();
        }
    }

    /**
     * Supprime un fichier dans MinIO.
     */
    public void delete(String key) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        s3Client.deleteObject(request);
        log.info("Deleted file with key: {}", key);
    }
}
