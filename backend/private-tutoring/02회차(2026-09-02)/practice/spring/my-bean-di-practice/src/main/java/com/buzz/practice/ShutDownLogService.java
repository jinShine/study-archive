package com.buzz.practice;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Component
public class ShutDownLogService {

    @PostConstruct
    public void init() {
        System.out.println("[init] ShutDownLogService initialized");
    }

    @PreDestroy
    public void destroy() {
        System.out.println("[destroy] 종료 전 정리 작업 시작");
        System.out.println("[destroy] 처리 중인 작업 마무리");
        System.out.println("[destroy] 외부 리소스 정리");
        System.out.println("[destroy] 종료 전 정리 작업 완료");
    }
}
