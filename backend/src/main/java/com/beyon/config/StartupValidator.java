package com.beyon.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class StartupValidator implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(StartupValidator.class);

    private final Environment environment;

    public StartupValidator(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(String... args) {
        List<String> missing = new ArrayList<>();

        if (!isActiveProfile("test")) {
            checkRequired(missing, "DATABASE_URL", "DATABASE_URL");
        }

        String profile = environment.getActiveProfiles().length > 0
                ? environment.getActiveProfiles()[0]
                : "dev";

        log.info("Beyon backend started [profile={}]", profile);
    }

    private void checkRequired(List<String> missing, String envVar, String description) {
        String value = System.getenv(envVar);
        if (value == null || value.isBlank()) {
            missing.add(description);
        }
    }

    private boolean isActiveProfile(String profile) {
        for (String active : environment.getActiveProfiles()) {
            if (active.equals(profile)) {
                return true;
            }
        }
        return false;
    }
}
