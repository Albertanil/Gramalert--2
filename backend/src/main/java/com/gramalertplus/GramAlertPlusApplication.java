// In backend/src/main/java/com/gramalertplus/GramAlertPlusApplication.java
package com.gramalertplus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling // <-- ADD THIS ANNOTATION
public class GramAlertPlusApplication {
    public static void main(String[] args) {
        SpringApplication.run(GramAlertPlusApplication.class, args);
    }
}