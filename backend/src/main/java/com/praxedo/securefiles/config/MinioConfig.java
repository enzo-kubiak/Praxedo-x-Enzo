package com.praxedo.securefiles.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;

import java.net.URI;

@Configuration
@Slf4j
public class MinioConfig {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket}")
    private String bucketName;

    @Bean
    public S3Client s3Client() {
        S3Client client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .region(Region.US_EAST_1) // required by SDK, MinIO ignores it
                .forcePathStyle(true)      // required for MinIO
                .build();

        ensureBucketExists(client);
        return client;
    }

    private void ensureBucketExists(S3Client client) {
        try {
            client.headBucket(HeadBucketRequest.builder().bucket(bucketName).build());
            log.info("MinIO bucket '{}' already exists", bucketName);
        } catch (NoSuchBucketException e) {
            client.createBucket(CreateBucketRequest.builder().bucket(bucketName).build());
            log.info("Created MinIO bucket '{}'", bucketName);
        } catch (Exception e) {
            log.warn("Could not verify/create bucket '{}': {}", bucketName, e.getMessage());
        }
    }
}
