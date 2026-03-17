package org.example.studydiary.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 *
 * 에러 코드를 enum으로 한 곳에서 관리
 * → 에러 응답이 일관되고, 새 에러 추가도 쉽다
 */

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400 Bad Request
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "잘못된 입력값입니다"),
    INVALID_CATEGORY(HttpStatus.BAD_REQUEST, "유효하지 않은 카테고리입니다"),

    // 404 Not Found
    STUDY_LOG_NOT_FOUND(HttpStatus.NOT_FOUND, "학습 기록을 찾을 수 없습니다"),
    FILE_NOT_FOUND(HttpStatus.NOT_FOUND, "파일을 찾을 수 없습니다"),

    // 413 Payload Too Large
    FILE_SIZE_EXCEEDED(HttpStatus.PAYLOAD_TOO_LARGE, "파일 크기가 제한을 초과했습니다"),

    // 500 Internal Server Error
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다");

    private final HttpStatus status;
    private final String message;
}
