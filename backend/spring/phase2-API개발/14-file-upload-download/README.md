# 14. 파일 업로드/다운로드 🟡 — "파일을 주고받기"

> **키워드**: `MultipartFile` `Resource` `Content-Disposition` `저장 전략`

---

## 핵심만 한 문장

**MultipartFile로 파일을 받고, Resource로 파일을 내려준다. 저장은 로컬 또는 클라우드(S3)**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🟡 이해 | 1~2장 (업로드, 다운로드) | 파일 기능 필요할 때 |
| 🟢 참고 | 3장 (S3 연동) | 배포 시 필요 |

> 💡 **이 주제는 🟡 도구 수준이다.** 모든 프로젝트에 필요한 건 아니지만, 프로필 이미지/첨부파일 기능에 필수다.

---

## 1장. 파일 업로드

### application.yml 설정

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB        # 파일 1개 최대 크기
      max-request-size: 30MB     # 요청 전체 최대 크기
```

### Controller

```java
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    
    private final FileService fileService;
    
    // 단일 파일 업로드
    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        String savedPath = fileService.save(file);
        return ResponseEntity.ok(savedPath);
    }
    
    // 다중 파일 업로드
    @PostMapping("/upload-multiple")
    public ResponseEntity<List<String>> uploadMultiple(
        @RequestParam("files") List<MultipartFile> files
    ) {
        List<String> paths = files.stream()
            .map(fileService::save)
            .toList();
        return ResponseEntity.ok(paths);
    }
}
```

### Service (로컬 저장)

```java
@Service
public class FileService {
    
    private final String uploadDir = "uploads/";
    
    public String save(MultipartFile file) {
        try {
            // 폴더 생성
            Path dir = Paths.get(uploadDir);
            if (!Files.exists(dir)) Files.createDirectories(dir);
            
            // 파일명 중복 방지 (UUID 추가)
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = dir.resolve(filename);
            
            // 저장
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            
            return path.toString();
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }
}
```

### 테스트 (curl)

```bash
curl -X POST http://localhost:8080/api/files/upload \
  -F "file=@/Users/buzz/Desktop/photo.jpg"

# 응답: "uploads/a1b2c3d4_photo.jpg"
```

---

## 2장. 파일 다운로드

```java
@GetMapping("/download/{filename}")
public ResponseEntity<Resource> download(@PathVariable String filename) {
    Path path = Paths.get("uploads/" + filename);
    Resource resource = new UrlResource(path.toUri());
    
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=\"" + filename + "\"")
        .body(resource);
}
```

---

## 3장. 실무: S3 저장 🟢

로컬 저장은 개발용. 운영에서는 AWS S3 같은 클라우드 스토리지를 사용한다.

```
개발: 로컬 파일 시스템 (uploads/ 폴더)
운영: AWS S3, Google Cloud Storage 등

→ 36번(클라우드 배포)에서 S3 연동을 배운다
```

---

## 정리

```
🎯 업로드: @RequestParam("file") MultipartFile file
🎯 다운로드: ResponseEntity<Resource> + Content-Disposition
🎯 파일명 중복 방지: UUID + 원본 파일명
🎯 운영: S3 사용 (로컬은 개발용)
```

---

> 🎯 **다음 주제**: 15번 "API 문서화"

