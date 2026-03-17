package org.example.studydiary.domain.studylog.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

/**
 * 📖 11-dto-and-validation 참고!
 *
 * 응답 DTO는 Validation이 필요 없다 (서버가 만드는 데이터니까)
 * 대신 @Schema로 Swagger 문서화만 해준다
 */
@Schema(description = "학습 기록 응답")
@Getter
@Builder
public class StudyLogResponse {

    @Schema(description = "학습 기록 ID", example = "1")
    private Long id;

    @Schema(description = "학습 주제", example = "Spring AOP 개념 학습")
    private String title;

    @Schema(description = "학습 내용")
    private String content;

    @Schema(description = "카테고리", example = "SPRING")
    private String category;

    @Schema(description = "카테고리 한글명", example = "Spring")
    private String categoryDisplayName;

    @Schema(description = "학습 시간 (분)", example = "90")
    private int studyMinutes;

    @Schema(description = "학습 날짜", example = "2026-03-12")
    private LocalDate studyDate;

    @Schema(description = "생성 일시")
    private LocalDateTime createdAt;

    @Schema(description = "수정 일시")
    private LocalDateTime updatedAt;
}
