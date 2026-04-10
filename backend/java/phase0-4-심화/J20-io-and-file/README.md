# J20. I/O와 파일 처리 — "파일 읽고 쓰기"

> **키워드**: `InputStream` `OutputStream` `Reader` `Writer` `NIO` `Path` `Files` `try-with-resources`

---

## 핵심만 한 문장

**Java I/O는 바이트 스트림(InputStream)과 문자 스트림(Reader) 두 갈래다. 최신 코드는 NIO의 Files 클래스를 쓴다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~2장 (try-with-resources, Files 클래스) | 파일 처리 기본 |
| 🟡 이해 | 3장 (InputStream vs Reader) | I/O 구조 이해 |
| 🟢 참고 | 4장 (NIO 채널/버퍼) | 고성능 I/O |

---

## 1장. try-with-resources 🔴

```java
// ✅ 파일 자동 close (Java 7+)
try (BufferedReader reader = new BufferedReader(new FileReader("test.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}  // ← 자동으로 reader.close() 호출!
// catch 안 해도 됨 (throws IOException으로 위임 가능)
```

---

## 2장. Files 클래스 (NIO) — 실무에서 쓰는 것 🔴

```java
import java.nio.file.*;

// 파일 읽기 (한 줄로!)
String content = Files.readString(Path.of("test.txt"));
List<String> lines = Files.readAllLines(Path.of("test.txt"));

// 파일 쓰기
Files.writeString(Path.of("output.txt"), "Hello, Java!");
Files.write(Path.of("output.txt"), List.of("줄1", "줄2"));

// 파일 존재 확인
boolean exists = Files.exists(Path.of("test.txt"));

// 파일 복사/이동/삭제
Files.copy(Path.of("a.txt"), Path.of("b.txt"));
Files.move(Path.of("a.txt"), Path.of("c.txt"));
Files.delete(Path.of("temp.txt"));

// 디렉토리 생성
Files.createDirectories(Path.of("uploads/images"));

// 디렉토리 내 파일 목록
try (Stream<Path> paths = Files.list(Path.of("uploads"))) {
    paths.forEach(System.out::println);
}
```

---

## 3장. InputStream vs Reader 🟡

```
바이트 스트림 (InputStream/OutputStream)
  → 이미지, 동영상, 바이너리 파일
  → 1바이트 단위

문자 스트림 (Reader/Writer)  
  → 텍스트 파일
  → 문자(char) 단위

💡 실무: 텍스트는 Files.readString(), 바이너리는 Files.readAllBytes()
```

---

## 면접 대비

### 🔴 필수

**Q: "try-with-resources가 뭔가요?"**

> AutoCloseable을 구현한 리소스를 try 블록에 선언하면 블록 종료 시 자동으로 close()가 호출됩니다. finally에서 수동으로 close하는 것보다 안전하고 간결합니다.

---

## 정리

```
🎯 파일 읽기: Files.readString(Path.of("file.txt"))
🎯 파일 쓰기: Files.writeString(Path.of("file.txt"), content)
🎯 자동 close: try-with-resources
🎯 실무: NIO의 Files 클래스 사용 (구식 File 클래스 X)
```

---

> 🎯 **다음 주제**: J21 "동시성 기초" — Thread, synchronized, 데드락!

