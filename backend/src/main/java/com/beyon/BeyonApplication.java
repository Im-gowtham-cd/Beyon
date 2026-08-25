package com.beyon;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BeyonApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .filename(".env")
                .load();

        dotenv.entries().forEach(entry ->
            System.setProperty(entry.getKey(), entry.getValue())
        );

        SpringApplication.run(BeyonApplication.class, args);
    }
}
