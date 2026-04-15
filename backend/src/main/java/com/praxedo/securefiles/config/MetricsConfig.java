package com.praxedo.securefiles.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    /**
     * Compteur du nombre total de fichiers détectés comme infectés.
     * Exposé dans /actuator/prometheus sous le nom :
     *   files_infected_total
     * Utilisé par Grafana pour déclencher l'alerte mail.
     */
    @Bean
    public Counter infectedFilesCounter(MeterRegistry registry) {
        return Counter.builder("files.infected")
                .description("Total number of files detected as infected by the antivirus")
                .tag("service", "file-service")
                .register(registry);
    }

    /**
     * Compteur du nombre total de fichiers scannés (clean + infected).
     */
    @Bean
    public Counter scannedFilesCounter(MeterRegistry registry) {
        return Counter.builder("files.scanned")
                .description("Total number of files scanned by the antivirus")
                .tag("service", "file-service")
                .register(registry);
    }
}
