package com.praxedo.scanner.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

/**
 * Talks to ClamAV daemon via the INSTREAM TCP protocol (port 3310).
 *
 * Protocol:
 *   → "zINSTREAM\0"
 *   → [4-byte chunk size][chunk bytes] × N
 *   → [4 zero bytes]  (end of stream)
 *   ← "stream: OK"              clean
 *   ← "stream: <name> FOUND"    infected
 */
@Service
@Slf4j
public class ClamAvService {

    private static final int CHUNK_SIZE = 4096;

    @Value("${clamav.host:localhost}")
    private String host;

    @Value("${clamav.port:3310}")
    private int port;

    @Value("${clamav.timeout-seconds:60}")
    private int timeoutSeconds;

    public record ScanResult(boolean clean, String detail) {}

    public ScanResult scan(String fileName, byte[] bytes) {
        log.info("Scanning '{}' ({} bytes) → clamd at {}:{}", fileName, bytes.length, host, port);
        try (Socket socket = new Socket(host, port)) {
            socket.setSoTimeout(timeoutSeconds * 1000);
            OutputStream out = socket.getOutputStream();
            InputStream  in  = socket.getInputStream();

            out.write("zINSTREAM\0".getBytes(StandardCharsets.US_ASCII));

            int offset = 0;
            while (offset < bytes.length) {
                int len = Math.min(CHUNK_SIZE, bytes.length - offset);
                out.write(ByteBuffer.allocate(4).putInt(len).array());
                out.write(bytes, offset, len);
                offset += len;
            }
            out.write(new byte[4]); // end-of-stream signal
            out.flush();

            String response = readResponse(in);
            log.info("clamd response for '{}': '{}'", fileName, response);
            return parse(response);

        } catch (Exception e) {
            log.error("clamd error for '{}': {}", fileName, e.getMessage());
            throw new RuntimeException("ClamAV unreachable: " + e.getMessage(), e);
        }
    }

    private String readResponse(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        int b;
        while ((b = in.read()) != -1 && b != 0) sb.append((char) b);
        return sb.toString().trim();
    }

    private ScanResult parse(String response) {
        if (response.endsWith("OK"))    return new ScanResult(true,  "No threat detected");
        if (response.endsWith("FOUND")) {
            String virus = response.replace("stream:", "").replace("FOUND", "").trim();
            return new ScanResult(false, "Threat detected: " + virus);
        }
        throw new RuntimeException("Unexpected clamd response: " + response);
    }
}
