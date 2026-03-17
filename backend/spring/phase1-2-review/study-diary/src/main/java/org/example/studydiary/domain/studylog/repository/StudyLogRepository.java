package org.example.studydiary.domain.studylog.repository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import org.example.studydiary.domain.studylog.entity.Category;
import org.example.studydiary.domain.studylog.entity.StudyLog;
import org.springframework.stereotype.Repository;

@Repository
public class StudyLogRepository {

    private final Map<Long, StudyLog> store = new HashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    public StudyLog save(StudyLog studyLog) {
        if (studyLog.getId() == null) {
            StudyLog saved = StudyLog.builder()
                    .id(sequence.getAndIncrement())
                    .title(studyLog.getTitle())
                    .content(studyLog.getContent())
                    .category(studyLog.getCategory())
                    .studyMinutes(studyLog.getStudyMinutes())
                    .studyDate(studyLog.getStudyDate())
                    .createdAt(studyLog.getCreatedAt())
                    .updatedAt(studyLog.getUpdatedAt())
                    .build();

            store.put(saved.getId(), saved);
            return saved;
        }

        store.put(studyLog.getId(), studyLog);
        return studyLog;
    }

    public Optional<StudyLog> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public List<StudyLog> findAll() {
        return new ArrayList<>(store.values());
    }

    public List<StudyLog> findByCategory(Category category) {
        return store.values().stream()
                .filter(log -> log.getCategory() == category)
                .toList();
    }

    public void deleteById(Long id) {
        store.remove(id);
    }

    public boolean existsById(Long id) {
        return store.containsKey(id);
    }
}
