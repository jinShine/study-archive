package com.buzz.redis.mvc;

import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

// /orders/** 요청은 Authorization 헤더가 있어야 Controller까지 갈 수 있다
@Slf4j
public class LoginCheckInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (request.getHeader("Authorization") == null) {
            log.info("[LoginCheck] Authorization 헤더 없음 → 401, Controller 실행 안 함");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        return true;
    }
}
