package org.example.studydiary.global.exception;

import lombok.Getter;

/**
 * 비즈니스 로직에서 발생하는 모든 예외의 부모 클래스
 *
 * throw new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND);
 * → GlobalExceptionHandler가 잡아서 일관된 응답으로 변환
 */

@Getter
public class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
