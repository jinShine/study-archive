package org.example.studydiary.domain.studylog.service;

import java.time.LocalDate;
import java.util.List;

import org.example.studydiary.domain.studylog.dto.StudyLogCreateRequest;
import org.example.studydiary.domain.studylog.dto.StudyLogResponse;
import org.example.studydiary.domain.studylog.dto.StudyLogUpdateRequest;
import org.example.studydiary.domain.studylog.entity.Category;
import org.example.studydiary.domain.studylog.entity.StudyLog;
import org.example.studydiary.domain.studylog.mapper.StudyLogMapper;
import org.example.studydiary.domain.studylog.repository.StudyLogRepository;
import org.example.studydiary.global.exception.BusinessException;
import org.example.studydiary.global.exception.ErrorCode;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 📖 09-layered-architecture-dao, 04-ioc-di, 10-lombok 참고!
 *
 * @Service — 비즈니스 로직을 담당하는 계층
 * @RequiredArgsConstructor — final 필드의 생성자를 Lombok이 자동 생성
 *                          → Spring이 StudyLogRepository, StudyLogMapper를 자동 주입
 *                          (DI)
 * @Slf4j — log 변수 자동 생성 (Lombok)
 *
 *        계층 구조:
 *        Controller (요청 수신) → Service (비즈니스 로직) → Repository (데이터 접근)
 */

@Service
@RequiredArgsConstructor
@Slf4j
public class StudyLogService {

    private final StudyLogRepository studyLogRepository;
    private final StudyLogMapper studyLogMapper;

    /**
     * 학습 기록 생성
     */
    public StudyLogResponse create(StudyLogCreateRequest request) {
        // 1. 카테고리 유효성 검증
        validateCategory(request.getCategory());

        // 2. DTO → Entity 변환 (MapStruct)
        StudyLog studyLog = studyLogMapper.toEntity(request);
        log.debug("생성할 학습 기록: title={}, category={}", studyLog.getTitle(), studyLog.getCategory());

        // 3. 저장
        StudyLog saved = studyLogRepository.save(studyLog);
        log.info("학습 기록 생성 완료: id={}", saved.getId());

        // 4. Entity → Response DTO 변환 (MapStruct)
        return studyLogMapper.toResponse(saved);
    }

    /**
     * 학습 기록 단건 조회
     */
    public StudyLogResponse findById(Long id) {
        StudyLog studyLog = studyLogRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND));
        // ↑ 📖 06-exception-handling 참고! 없으면 404 에러

        return studyLogMapper.toResponse(studyLog);
    }

    /**
     * 전체 목록 조회
     */
    public List<StudyLogResponse> findAll() {
        return studyLogRepository.findAll().stream()
                .map(studyLogMapper::toResponse) // 각 Entity를 Response로 변환
                .toList();
    }

    /**
     * 카테고리별 조회
     */
    public List<StudyLogResponse> findByCategory(String categoryName) {
        Category category = parseCategory(categoryName);
        return studyLogRepository.findByCategory(category).stream()
                .map(studyLogMapper::toResponse)
                .toList();
    }

    /**
     * 학습 기록 수정
     */
    public StudyLogResponse update(Long id, StudyLogUpdateRequest request) {
        // 1. 기존 기록 조회 (없으면 404)
        StudyLog studyLog = studyLogRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND));

        // 2. 카테고리 검증
        Category category = parseCategory(request.getCategory());

        // 3. Entity 업데이트 (@Setter 대신 명시적 메서드)
        LocalDate studyDate = (request.getStudyDate() != null && !request.getStudyDate().isBlank())
                ? LocalDate.parse(request.getStudyDate())
                : studyLog.getStudyDate();

        studyLog.update(
                request.getTitle(),
                request.getContent(),
                category,
                request.getStudyMinutes(),
                studyDate);

        // 4. 저장 & 응답
        StudyLog saved = studyLogRepository.save(studyLog);
        log.info("학습 기록 수정 완료: id={}", saved.getId());
        return studyLogMapper.toResponse(saved);
    }

    /**
     * 학습 기록 삭제
     */
    public void delete(Long id) {
        if (!studyLogRepository.existsById(id)) {
            throw new BusinessException(ErrorCode.STUDY_LOG_NOT_FOUND);
        }
        studyLogRepository.deleteById(id);
        log.info("학습 기록 삭제 완료: id={}", id);
    }

    // ── private 헬퍼 메서드 ──

    private void validateCategory(String categoryName) {
        try {
            Category.valueOf(categoryName);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_CATEGORY);
        }
    }

    private Category parseCategory(String categoryName) {
        try {
            return Category.valueOf(categoryName);
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.INVALID_CATEGORY);
        }
    }
}
