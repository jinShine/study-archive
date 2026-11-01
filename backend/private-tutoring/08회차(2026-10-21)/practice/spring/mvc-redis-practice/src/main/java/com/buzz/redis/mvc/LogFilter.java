package com.buzz.redis.mvc;

import java.io.IOException;

import org.springframework.stereotype.Component;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

// Servlet 표준 Filter: DispatcherServlet보다 앞에서 실행된다
// @Component로 등록하면 모든 URL에 적용된다
@Slf4j
@Component
public class LogFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String uri = ((HttpServletRequest) request).getRequestURI();
        log.info("[Filter] 시작 {}", uri);
        // 다음 단계(다음 Filter 또는 DispatcherServlet)로 넘긴다
        chain.doFilter(request, response);
        log.info("[Filter] 끝 {}", uri);
    }
}
