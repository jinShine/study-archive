# 01. Servlet → Spring → Spring Boot — "왜 이렇게 바뀌었을까?"

> **키워드**: `Servlet` `Spring Framework` `Spring Boot` `POJO` `DispatcherServlet` `AutoConfiguration`

---

## 핵심만 한 문장

**Servlet(복잡) → Spring(좀 나음) → Spring Boot(편함) 순서로 발전했고, 우리는 Spring Boot를 쓴다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (Servlet→Spring→Boot 진화, Boot가 해주는 것) | 면접 단골 + 왜 Boot를 쓰는지 이해 |
| 🟡 이해 | 4장 (AutoConfiguration) | 내부 동작 이해 |
| 🟢 참고 | 5장 (어노테이션 정리) | 필요할 때 찾아보기 |

---

## 1장. Servlet: 직접 다 해야 하던 시절 🔴

### 비유

```
Servlet = 수동 자판기

1. 동전 넣으면 직접 음료를 찾아서
2. 직접 컵에 담아서
3. 직접 손님에게 건네줘야 함

모든 걸 개발자가 직접 해야 했다!
```

### 코드로 보면

```java
// ❌ Servlet 방식 (2000년대)
public class HelloServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) 
            throws ServletException, IOException {
        
        // 1. 파라미터를 직접 꺼낸다
        String name = req.getParameter("name");
        
        // 2. 응답 타입을 직접 설정한다
        resp.setContentType("text/html; charset=UTF-8");
        
        // 3. HTML을 직접 문자열로 쓴다
        PrintWriter out = resp.getWriter();
        out.println("<html><body>");
        out.println("<h1>안녕하세요, " + name + "</h1>");
        out.println("</body></html>");
    }
}
```

```xml
<!-- 그리고 web.xml에 URL을 직접 매핑해야 함 -->
<servlet>
    <servlet-name>hello</servlet-name>
    <servlet-class>com.example.HelloServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>hello</servlet-name>
    <url-pattern>/hello</url-pattern>
</servlet-mapping>
```

**문제점:**

| 문제 | 설명 |
|------|------|
| HTML을 Java 코드 안에 작성 | 유지보수 불가능 |
| web.xml에 모든 URL 등록 | URL 하나 추가할 때마다 XML 수정 |
| 요청/응답 객체 직접 조작 | 반복 코드 많음 |
| 비즈니스 로직과 웹 로직 섞임 | 테스트 어려움 |

---

## 2장. Spring Framework: 좀 나아짐 🔴

### 비유

```
Spring = 반자동 자판기

1. 동전 넣으면 음료는 자동으로 나옴
2. 근데 자판기 설치(설정)는 직접 해야 함
3. 전기 연결, 음료 채우기, 온도 설정... 설정이 많다!
```

### 코드로 보면

```java
// Spring Framework 방식 (2010년대)
@Controller
public class HelloController {
    
    @GetMapping("/hello")
    @ResponseBody
    public String hello(@RequestParam String name) {
        return "안녕하세요, " + name;  // ← web.xml 없이 URL 매핑!
    }
}
```

**Servlet보다 좋아진 점:**
- ✅ `@GetMapping`으로 URL 매핑 (web.xml 불필요)
- ✅ `@RequestParam`으로 파라미터 자동 바인딩
- ✅ HTML 직접 안 써도 됨

**하지만 여전히 귀찮은 점:**

```xml
<!-- applicationContext.xml (Spring 설정 파일) -->
<beans>
    <context:component-scan base-package="com.example"/>
    <bean id="dataSource" class="org.apache.commons.dbcp.BasicDataSource">
        <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
        <property name="url" value="jdbc:mysql://localhost:3306/mydb"/>
        <property name="username" value="root"/>
        <property name="password" value="1234"/>
    </bean>
    <bean id="entityManagerFactory" class="org.springframework.orm.jpa...">
        <!-- 수십 줄의 설정... -->
    </bean>
    <!-- 더 많은 설정... -->
</beans>
```

**설정 지옥! (Configuration Hell)**
- DB 연결: XML 20줄
- JPA 설정: XML 30줄
- 웹 설정: XML 15줄
- 보안 설정: XML 25줄
- **프로젝트 시작하기도 전에 설정만 100줄 넘음**

---

## 3장. Spring Boot: 설정? 내가 알아서 할게 🔴

### 비유

```
Spring Boot = 완전 자동 자판기

1. 전원만 꽂으면 됨 (의존성 추가)
2. 음료도 자동 채움 (AutoConfiguration)
3. 온도도 자동 설정 (기본값 제공)
4. 버튼만 누르면 끝!
```

### 코드로 보면

```java
// ✅ Spring Boot (지금!)
@RestController
public class HelloController {
    
    @GetMapping("/hello")
    public String hello(@RequestParam String name) {
        return "안녕하세요, " + name;
    }
}
```

**Spring Boot가 자동으로 해주는 것:**

```
의존성 추가만 하면:

spring-boot-starter-web 추가
  → 내장 Tomcat 자동 설정 ✅
  → DispatcherServlet 자동 등록 ✅
  → JSON 변환(Jackson) 자동 설정 ✅
  → 포트 8080 자동 설정 ✅

spring-boot-starter-data-jpa 추가
  → DataSource 자동 설정 ✅
  → EntityManager 자동 설정 ✅
  → 트랜잭션 매니저 자동 설정 ✅

XML 설정 파일? 필요 없음!
```

### 3단계 진화 비교

```
                  Servlet          Spring          Spring Boot
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
URL 매핑         web.xml          @GetMapping     @GetMapping
서버             외부 Tomcat      외부 Tomcat     내장 Tomcat ✅
설정             web.xml          XML/Java 설정    자동 설정 ✅
실행             WAR 배포         WAR 배포        java -jar ✅
JSON 변환        직접 구현        Jackson 설정     자동 ✅
DB 설정          직접 구현        XML로 설정       application.yml ✅
```

### 따라 쳐보기: "Hello World" 찍어보기

```bash
# 1. start.spring.io에서 프로젝트 생성
#    - Spring Web 의존성 추가
#    - Generate → 다운로드 → IntelliJ에서 열기

# 2. HelloController.java 작성 (위 코드 복사)

# 3. 실행
gradle bootRun

# 4. 브라우저에서 확인
# http://localhost:8080/hello?name=김개발
# → "안녕하세요, 김개발"
```

---

## 4장. AutoConfiguration: Boot가 자동 설정하는 원리 🟡

### @SpringBootApplication 분해

```java
@SpringBootApplication  // ← 이 하나가 3개를 합친 것!
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

```
@SpringBootApplication
  ├─ @SpringBootConfiguration   → "이 클래스가 설정 파일이다"
  ├─ @ComponentScan             → "이 패키지 아래 @Component 다 찾아라"
  └─ @EnableAutoConfiguration   → "의존성 보고 자동 설정해라" ← 핵심!
```

### @EnableAutoConfiguration이 하는 일

```
Spring Boot 시작
  ↓
build.gradle의 의존성 확인
  ↓
"spring-boot-starter-web이 있네?"
  ↓
자동으로:
  ✅ Tomcat 시작
  ✅ DispatcherServlet 등록
  ✅ 포트 8080 설정
  
"spring-boot-starter-data-jpa가 있네?"
  ↓
자동으로:
  ✅ DataSource 생성
  ✅ EntityManager 생성
  ✅ 트랜잭션 매니저 등록
```

**💡 개발자는 의존성만 추가하면 된다. 나머지는 Boot가 알아서!**

### application.yml로 기본값 변경

```yaml
# src/main/resources/application.yml

server:
  port: 9090           # 기본 8080 → 9090으로 변경

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: 1234
```

---

## 5장. 핵심 어노테이션 정리 🟢

| 어노테이션 | 역할 | 언제 씀? |
|-----------|------|---------|
| `@SpringBootApplication` | 애플리케이션 시작점 | main 클래스에 1개 |
| `@RestController` | REST API 컨트롤러 | API 만들 때 |
| `@GetMapping` | GET 요청 매핑 | 조회 API |
| `@PostMapping` | POST 요청 매핑 | 생성 API |
| `@RequestParam` | 쿼리 파라미터 받기 | `?name=김개발` |
| `@PathVariable` | URL 경로 변수 받기 | `/users/{id}` |
| `@RequestBody` | JSON 바디 받기 | POST/PUT 요청 |
| `@Component` | Spring이 관리하는 객체 | 일반 클래스 |
| `@Service` | 비즈니스 로직 | Service 계층 |
| `@Repository` | DB 접근 | Repository 계층 |

---

## 면접 대비

### 🔴 필수

**Q: "Servlet, Spring, Spring Boot의 차이를 설명해주세요"**

> Servlet은 Java로 HTTP를 처리하는 가장 기본적인 기술로, URL 매핑부터 응답 생성까지 모두 직접 해야 합니다. Spring Framework는 `@Controller`, `@GetMapping` 같은 어노테이션으로 편하게 만들었지만 XML 설정이 많았습니다. Spring Boot는 AutoConfiguration으로 의존성만 추가하면 자동 설정되고, 내장 Tomcat으로 별도 서버 없이 실행할 수 있습니다.

**Q: "Spring Boot가 Spring과 다른 점은?"**

> 가장 큰 차이는 AutoConfiguration입니다. Spring은 DataSource, EntityManager 등을 XML이나 Java 코드로 직접 설정해야 했는데, Spring Boot는 의존성(starter)만 추가하면 자동으로 설정합니다. 또한 내장 Tomcat이 포함되어 WAR 배포 없이 `java -jar`로 실행할 수 있습니다.

**Q: "@SpringBootApplication이 하는 일은?"**

> 3가지 어노테이션의 조합입니다. `@SpringBootConfiguration`은 설정 클래스 선언, `@ComponentScan`은 해당 패키지 하위의 `@Component`를 자동 스캔, `@EnableAutoConfiguration`은 classpath의 의존성을 보고 필요한 Bean을 자동 등록합니다.

### 🟡 개념

**Q: "DispatcherServlet이 뭔가요?"**

> 모든 HTTP 요청을 가장 먼저 받는 "프론트 컨트롤러"입니다. 클라이언트 요청이 오면 DispatcherServlet이 URL 패턴을 보고 적절한 Controller에 전달합니다. Spring Boot에서는 자동으로 등록됩니다.

---

## 정리: 이것만 기억하기

```
🎯 진화 순서:

Servlet (2000년대) → "모든 걸 직접 해야 함"
  ↓
Spring (2010년대) → "어노테이션으로 편해졌지만 설정 지옥"
  ↓
Spring Boot (현재) → "의존성만 추가하면 자동 설정!"

우리가 쓰는 건 Spring Boot!
  ✅ 내장 Tomcat (서버 설치 불필요)
  ✅ AutoConfiguration (설정 자동)
  ✅ starter 의존성 (필요한 것만 추가)
  ✅ application.yml (기본값 변경)
```

---

> 🎯 **다음 주제**: 02번 "Resources 폴더 구조" — Spring Boot 프로젝트의 폴더 구조와 설정 파일을 이해한다.

