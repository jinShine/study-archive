package org.example.studydiary.global.common;

import lombok.Builder;
import lombok.Getter;

/**
 * 모든 API 응답을 이 형태로 통일:
 * {
 * "status": 200,
 * "data": { ... }, ← 성공 시 데이터
 * "message": null ← 에러 시 메시지
 * }
 *
 * @JsonInclude(NON_NULL) — null인 필드는 JSON에 포함하지 않음
 * 성공 시: { "status": 200, "data": {...} } ← message 없음
 * 실패 시: { "status": 404, "message": "에러 메시지" } ← data 없음
 */
@Getter
@Builder
// @JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final int status;
    private final T data;
    private final String message;

    // 성공 응답
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .data(data)
                .build();
    }

    // 성공 응답 (커스텀 상태 코드)
    public static <T> ApiResponse<T> success(int status, T data) {
        return ApiResponse.<T>builder()
                .status(status)
                .data(data)
                .build();
    }

    // 에러 응답
    public static <Void> ApiResponse<Void> error(int status, String message) {
        return ApiResponse.<Void>builder()
                .status(status)
                .message(message)
                .build();
    }
}