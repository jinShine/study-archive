package org.example.studydiary.domain.studylog.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Schema(description = "학습 기록 수정 요청")
@Getter
@Builder
public class StudyLogUpdateRequest {

    @Schema(description = "학습 주제", example = "Spring AOP 실전 적용")
    @NotBlank(message = "학습 주제는 필수입니다")
    @Size(max = 100, message = "학습 주제는 100자 이내여야 합니다")
    private String title;

    @Schema(description = "학습 내용", example = "LoggingAspect를 직접 구현하고 프로젝트에 적용했다")
    @NotBlank(message = "학습 내용은 필수입니다")
    @Size(max = 2000)
    private String content;

    @Schema(description = "카테고리", example = "SPRING")
    @NotBlank(message = "카테고리는 필수입니다")
    private String category;

    @Schema(description = "학습 시간 (분)", example = "120")
    @NotNull(message = "학습 시간은 필수입니다")
    @Min(1)
    @Max(1440)
    private Integer studyMinutes;

    @Schema(description = "학습 날짜", example = "2026-03-12")
    private String studyDate;
}