package com.praxedo.securefiles;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SecureFilesApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecureFilesApplication.class, args);
    }
}
