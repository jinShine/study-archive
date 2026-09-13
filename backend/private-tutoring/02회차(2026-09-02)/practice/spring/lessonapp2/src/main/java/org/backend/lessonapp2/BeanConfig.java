package org.backend.lessonapp2;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BeanConfig {
	@Bean
	public PayService payService() {
		return new PayService(new PointService());
	}
}
