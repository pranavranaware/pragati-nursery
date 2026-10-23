package com.pragatinursery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class PragatiNurseryApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(PragatiNurseryApplication.class, args);
    }

    private static void loadDotEnv() {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            envFile = new File("../.env");
        }
        if (envFile.exists()) {
            try {
                boolean isDocker = new File("/.dockerenv").exists() || System.getenv("IS_DOCKER") != null;
                boolean localMysqlActive = !isDocker && isLocalMysqlReachable();

                List<String> lines = Files.readAllLines(envFile.toPath());
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                        continue;
                    }
                    String[] parts = line.split("=", 2);
                    String key = parts[0].trim();
                    String value = parts[1].trim();

                    // If running outside Docker, map mysql-db to localhost
                    if (!isDocker && value.contains("jdbc:mysql://mysql-db:")) {
                        value = value.replace("jdbc:mysql://mysql-db:", "jdbc:mysql://localhost:");
                    }

                    // Skip database credentials if local MySQL is not active, to allow fallback to H2
                    if (!isDocker && !localMysqlActive) {
                        if (key.equals("DB_URL") || key.equals("DB_USERNAME") || key.equals("DB_PASSWORD") ||
                            key.equals("MYSQL_ROOT_PASSWORD") || key.equals("MYSQL_DATABASE") ||
                            key.equals("MYSQL_USER") || key.equals("MYSQL_PASSWORD")) {
                            continue;
                        }
                    }

                    if (System.getProperty(key) == null && System.getenv(key) == null) {
                        System.setProperty(key, value);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to load .env file: " + e.getMessage());
            }
        }
    }

    private static boolean isLocalMysqlReachable() {
        try (java.net.Socket socket = new java.net.Socket("localhost", 3306)) {
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
