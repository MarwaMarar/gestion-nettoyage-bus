package com.alsa.alsacleanfleet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AlsaCleanFleetApplication {

	public static void main(String[] args) {
		SpringApplication.run(AlsaCleanFleetApplication.class, args);
	}

}
