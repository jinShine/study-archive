package org.example.studydiary.domain.studylog.entity;

public enum Category {
    JAVA("Java"),
    SPRING("Spring"),
    JPA("JPA"),
    DATABASE("Database"),
    NETWORK("Network"),
    CS("CS"),
    ETC("기타");

    private final String displayName;

    Category(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
