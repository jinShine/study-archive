package com.buzz.redis.mvc;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
public class ThreadController {

    // 이 요청을 처리하는 스레드 이름을 돌려준다
    // Tomcat 스레드 풀의 스레드는 http-nio-8080-exec-N 이름을 가진다
    @GetMapping("/thread")
    public String thread() throws InterruptedException {
        String name = Thread.currentThread().getName();
        log.info("[Controller] 요청 처리 스레드 = {}", name);
        // 동시 요청 시 서로 다른 스레드가 배정되는 것을 보기 위해 잠깐 붙잡아 둔다
        Thread.sleep(300);
        return name;
    }
}
