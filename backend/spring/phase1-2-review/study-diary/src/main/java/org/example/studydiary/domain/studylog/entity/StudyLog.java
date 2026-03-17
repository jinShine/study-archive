package org.example.studydiary.domain.studylog.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudyLog {

    private Long id;
    private String title; // 학습 주제
    private String content; // 학습 내용
    private Category category; // 카테고리
    private int studyMinutes; // 학습 시간 (분)
    private LocalDate studyDate; // 학습 날짜
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public void update(
            String title,
            String content,
            Category category,
            int studyMinutes,
            LocalDate studyDate) {
        this.title = title;
        this.content = content;
        this.category = category;
        this.studyMinutes = studyMinutes;
        this.studyDate = studyDate;
        this.updatedAt = LocalDateTime.now();
    }
}