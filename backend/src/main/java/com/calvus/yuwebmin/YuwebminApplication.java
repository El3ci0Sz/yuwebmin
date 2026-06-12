package com.calvus.yuwebmin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YuwebminApplication {

	public static void main(String[] args) {
		SpringApplication.run(YuwebminApplication.class, args);
	}

}
