package com.buzz.redis.mvc;

import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

// Spring MVC Interceptor: DispatcherServlet 뒤, Controller 앞에서 실행된다
// Filter와 달리 "어떤 Controller 메서드가 실행될지(handler)"를 안다
@Slf4j
public class LogInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        log.info("[Interceptor] preHandle → 실행할 메서드 = {}", handlerName(handler));
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                Exception ex) {
        log.info("[Interceptor] afterCompletion status={}", response.getStatus());
    }

    private String handlerName(Object handler) {
        if (handler instanceof HandlerMethod method) {
            return method.getBeanType().getSimpleName() + "." + method.getMethod().getName() + "()";
        }
        return handler.getClass().getSimpleName();
    }
}
