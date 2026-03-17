package org.example.studydiary.domain.studylog.mapper;

import java.time.LocalDate;

import org.example.studydiary.domain.studylog.dto.StudyLogCreateRequest;
import org.example.studydiary.domain.studylog.dto.StudyLogResponse;
import org.example.studydiary.domain.studylog.entity.StudyLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * 📖 12-mapstruct 참고!
 *
 * @Mapper(componentModel = "spring")
 *                        → Spring Bean으로 등록되어 @RequiredArgsConstructor로 주입 가능
 *
 *                        MapStruct가 컴파일 시점에 구현 클래스를 자동 생성해준다
 *                        → 런타임 리플렉션 없음, 타입 안전, 빠름
 */
@Mapper(componentModel = "spring")
public interface StudyLogMapper {

    /**
     * Request DTO → Entity 변환
     *
     * 📖 12-mapstruct 참고: @Mapping은 자동 매핑이 안 되는 필드만 명시!
     *
     * 자동 매핑 가능: title, content, studyMinutes
     * 수동 매핑 필요: category(String→Enum), studyDate(String→LocalDate), createdAt,
     * updatedAt
     */
    @Mapping(target = "id", ignore = true) // 새로 생성이니까 ID는 무시
    @Mapping(target = "category", expression = "java(Category.valueOf(request.getCategory()))")
    @Mapping(target = "studyDate", expression = "java(parseStudyDate(request.getStudyDate()))")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "updatedAt", expression = "java(java.time.LocalDateTime.now())")
    StudyLog toEntity(StudyLogCreateRequest request);

    /**
     * Entity → Response DTO 변환
     *
     * 📖 12-mapstruct 참고: category 필드명은 같지만 타입이 다름 (Enum→String)
     * MapStruct가 자동으로 .name() 호출해줌!
     */
    @Mapping(target = "category", expression = "java(studyLog.getCategory().name())")
    @Mapping(target = "categoryDisplayName", expression = "java(studyLog.getCategory().getDisplayName())")
    StudyLogResponse toResponse(StudyLog studyLog);

    /**
     * 커스텀 매핑 메서드: String → LocalDate 변환
     * null이면 오늘 날짜 반환
     */
    default LocalDate parseStudyDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return LocalDate.now();
        }
        return LocalDate.parse(dateStr);
    }
}
