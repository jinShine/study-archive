package org.example.studydiary.domain.studylog.controller;

import org.example.studydiary.domain.studylog.dto.StudyLogCreateRequest;
import org.example.studydiary.domain.studylog.dto.StudyLogResponse;
import org.example.studydiary.domain.studylog.service.StudyLogService;
import org.example.studydiary.global.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Tag(name = "학습 기록", description = "학습 기록 CURD API")
@RestController
@RequestMapping("/api/v1/study-logs")
@RequiredArgsConstructor
public class StudyLogController {

    private final StudyLogService studyLogService;

    @PostMapping
    public ResponseEntity<ApiResponse<StudyLogResponse>> create(
            @Valid @RequestBody StudyLogCreateRequest request) {
        StudyLogResponse response = studyLogService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(201, response));
    }
}
