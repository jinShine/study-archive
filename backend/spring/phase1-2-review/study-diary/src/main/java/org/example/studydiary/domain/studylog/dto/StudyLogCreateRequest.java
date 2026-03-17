package org.example.studydiary.domain.studylog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

/**
 * 📖 11-dto-and-validation, 15-api-docs 참고!
 *
 * DTO를 요청/응답으로 분리하는 이유:
 * - 요청: 클라이언트가 보내는 데이터 (검증 필요)
 * - 응답: 클라이언트에게 보여줄 데이터 (검증 불필요)
 * - Entity의 내부 구조를 외부에 노출하지 않는다
 *
 * @Valid를 Controller에서 걸면, 여기의 @NotBlank 등이 자동 검증됨
 *         → 검증 실패 시 MethodArgumentNotValidException 발생
 *         → GlobalExceptionHandler가 400 에러로 응답
 */
@Schema(description = "학습 기록 생성 요청") // ← 15번 Swagger
@Getter
@Builder
public class StudyLogCreateRequest {

    @Schema(description = "학습 주제", example = "Spring AOP 개념 학습", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotBlank(message = "학습 주제는 필수입니다")
    @Size(max = 100, message = "학습 주제는 100자 이내여야 합니다")
    private String title;

    @Schema(description = "학습 내용", example = "AOP의 핵심 개념과 포인트컷 표현식을 학습했다")
    @NotBlank(message = "학습 내용은 필수입니다")
    @Size(max = 2000, message = "학습 내용은 2000자 이내여야 합니다")
    private String content;

    @Schema(description = "카테고리", example = "SPRING", allowableValues = { "JAVA", "SPRING", "JPA", "DATABASE",
            "NETWORK", "CS", "ETC" })
    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @Schema(description = "학습 시간 (분)", example = "90", minimum = "1", maximum = "1440")
    @NotNull(message = "학습 시간은 필수입니다")
    @Min(value = 1, message = "학습 시간은 1분 이상이어야 합니다")
    @Max(value = 1440, message = "학습 시간은 1440분(24시간) 이내여야 합니다")
    private Integer studyMinutes;

    @Schema(description = "학습 날짜 (YYYY-MM-DD)", example = "2026-03-12", type = "string", format = "date")
    private String studyDate; // null이면 오늘 날짜 사용
}