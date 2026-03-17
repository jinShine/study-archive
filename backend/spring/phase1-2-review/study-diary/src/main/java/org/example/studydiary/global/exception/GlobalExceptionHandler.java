package org.example.studydiary.global.exception;

import org.example.studydiary.global.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import lombok.extern.slf4j.Slf4j;

/**
 *
 * @RestControllerAdvice — 모든 Controller에서 발생하는 예외를 여기서 잡는다
 *
 *                       장점:
 *                       1. Controller에 try-catch 안 써도 됨
 *                       2. 에러 응답 형태가 통일됨 (ApiResponse 형태)
 *                       3. 예외 종류별로 적절한 HTTP 상태 코드 반환
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 비즈니스 예외 처리
     * ex) "학습 기록을 찾을 수 없습니다" (404)
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("비즈니스 예외: {}", e.getMessage());
        ErrorCode errorCode = e.getErrorCode();
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ApiResponse.error(errorCode.getStatus().value(), errorCode.getMessage()));
    }

    /**
     * @Valid 검증 실패 시 처리
     *        ex) "학습 주제는 필수입니다" (400)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException e) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("입력값 검증에 실패했습니다");

        log.warn("Validation 실패: {}", message);
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(400, message));
    }

    /**
     * 파일 크기 초과 시 처리
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxSizeException(
            MaxUploadSizeExceededException e) {
        log.warn("파일 크기 초과: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponse.error(413, "파일 크기가 제한을 초과했습니다 (최대 10MB)"));
    }

    /**
     * 예상 못한 예외 (최후의 안전망)
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("예상 못한 예외 발생", e);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, "서버 내부 오류가 발생했습니다"));
    }
}