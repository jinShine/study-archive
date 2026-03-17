package org.example.studydiary.global.aop;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

/**
 * 📖 05-aop 참고!
 *
 * @Aspect — 이 클래스가 AOP 관심사를 담당한다고 선언
 * @Component — Spring Bean으로 등록 (AOP가 동작하려면 Bean이어야 함)
 *
 *            AOP = 핵심 로직(CRUD)과 부가 로직(로깅, 시간 측정)을 분리
 *            → Controller/Service에 log.info()를 하나하나 넣지 않아도 된다!
 */
@Aspect
@Component
@Slf4j
public class LoggingAspect {

    /**
     * @Around — 메서드 실행 전/후를 모두 감싼다
     *
     *         포인트컷 해석:
     *         execution(* com.example.studydiary.domain..controller..*(..))
     *         → domain 패키지 하위의 모든 controller 패키지의 모든 메서드
     *
     *         이 하나의 Aspect로 모든 Controller 메서드에 자동 적용!
     */
    @Around("execution(* com.example.studydiary.domain..controller..*(..))")
    public Object logApiCall(ProceedingJoinPoint joinPoint) throws Throwable {

        // 메서드 이름: "createStudyLog", "getStudyLog" 등
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();

        log.info("▶ [API 호출] {}.{}() 시작", className, methodName);

        long startTime = System.currentTimeMillis();

        try {
            // 실제 메서드 실행
            Object result = joinPoint.proceed();

            long elapsed = System.currentTimeMillis() - startTime;
            log.info("◀ [API 완료] {}.{}() — {}ms", className, methodName, elapsed);

            return result;
        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("✖ [API 에러] {}.{}() — {}ms — {}", className, methodName, elapsed, e.getMessage());
            throw e; // 예외는 다시 던져서 GlobalExceptionHandler가 처리
        }
    }
}