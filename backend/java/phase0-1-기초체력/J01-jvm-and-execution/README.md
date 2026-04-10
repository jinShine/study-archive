# J01. JVM과 Java 실행 구조 — "내가 쓴 코드가 어떻게 실행되나?"

> **키워드**: `JDK` `JRE` `JVM` `컴파일` `바이트코드` `.class` `javac` `java` `IntelliJ`

---

## 핵심만 한 문장

**Java 코드(.java)를 컴파일하면 바이트코드(.class)가 되고, JVM이 그걸 실행한다. "한 번 작성하면 어디서든 실행"이 Java의 핵심이다**

---

## 학습 우선순위

| 등급 | 섹션 | 의미 |
|------|------|------|
| 🔴 필수 | 1~3장 (JDK/JRE/JVM, 컴파일 과정, 실행 확인) | Java 이해의 출발점 |
| 🟡 이해 | 4장 (IntelliJ 세팅) | 개발 환경 |
| 🟢 참고 | 5장 (JVM 내부 구조) | 면접 심화 |

---

## 1장. Java는 왜 특별한가? 🔴

### 비유

```
C 언어 = 각 나라 언어로 직접 번역
  → 한국어 버전, 영어 버전, 일본어 버전 따로 만들어야 함
  → Windows용, Mac용, Linux용 따로 컴파일

Java = 국제 공용어(에스페란토)로 번역
  → 바이트코드라는 "중간 언어"로 한 번만 컴파일
  → 각 나라(OS)에 통역사(JVM)가 있어서 어디서든 실행!
```

### Write Once, Run Anywhere

```
Java 코드 (.java)
      ↓ javac (컴파일)
바이트코드 (.class)
      ↓ JVM이 실행
Windows / Mac / Linux 어디서든!
```

---

## 2장. JDK, JRE, JVM — 뭐가 뭔가? 🔴

### 비유

```
JDK = 요리사의 전체 도구 세트 (칼, 도마, 냄비, 레시피북)
JRE = 요리를 먹기 위한 식기 세트 (접시, 포크)
JVM = 전자레인지 (음식을 실제로 데워서 먹게 해주는 것)
```

### 포함 관계

```
┌─────────────────────────────────────┐
│  JDK (Java Development Kit)         │
│  → 개발 도구 (javac, jar, javadoc)  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  JRE (Java Runtime Env)     │    │
│  │  → 실행 환경 (라이브러리)    │    │
│  │                             │    │
│  │  ┌─────────────────────┐    │    │
│  │  │  JVM                 │    │    │
│  │  │  → 바이트코드 실행    │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

| 이름 | 역할 | 누가 쓰나? |
|------|------|-----------|
| **JDK** | Java 개발 + 실행 | **개발자** (우리!) |
| **JRE** | Java 실행만 | 사용자 (앱 실행만) |
| **JVM** | 바이트코드 실행 엔진 | 내부 동작 |

**💡 우리는 JDK를 설치하면 된다. JRE와 JVM은 JDK 안에 포함!**

---

## 3장. 컴파일과 실행 과정 🔴

### 따라 쳐보기

```java
// Hello.java (내가 작성한 코드)
public class Hello {
    public static void main(String[] args) {
        System.out.println("안녕하세요, Java!");
    }
}
```

### 실행 과정 추적

```bash
# Step 1. 컴파일 (javac)
javac Hello.java
# → Hello.class 파일 생성 (바이트코드)

# Step 2. 실행 (java)
java Hello
# → "안녕하세요, Java!" 출력
```

```
내가 작성                 컴파일러가 변환           JVM이 실행
Hello.java  ──javac──→  Hello.class  ──java──→  "안녕하세요, Java!"
(사람 언어)              (바이트코드)              (실행 결과)
```

### IntelliJ에서는?

```
1. 코드 작성 (Hello.java)
2. ▶ Run 버튼 클릭
3. IntelliJ가 javac + java를 자동으로 실행
4. 콘솔에 결과 출력

→ 수동으로 javac/java 안 쳐도 됨!
```

---

## 4장. IntelliJ + JDK 세팅 🟡

### JDK 설치

```
1. IntelliJ 실행
2. New Project
3. JDK 선택 → "Download JDK" 클릭
4. Version: 17 이상 (LTS)
5. Vendor: Amazon Corretto 또는 Eclipse Temurin (아무거나 OK)
6. Download 클릭
```

### 첫 프로젝트 생성

```
1. New Project → Java 선택
2. Project name: java-master
3. Location: 원하는 폴더
4. Build system: IntelliJ (Gradle 아님!)
5. JDK: 위에서 설치한 것 선택
6. Create
```

### main 메서드 작성

```java
// src/Main.java
public class Main {
    public static void main(String[] args) {
        System.out.println("Java 마스터 시작!");
    }
}
```

```
▶ Run 클릭 → 콘솔:
Java 마스터 시작!
```

**이게 보이면 성공!** ✅

---

## 5장. JVM 내부 구조 (개요) 🟢

```
┌─────────────────────────────────────┐
│              JVM                     │
├──────────┬──────────┬───────────────┤
│ Class    │ Runtime  │ Execution     │
│ Loader   │ Data     │ Engine        │
│          │ Area     │               │
│ .class   │ ┌─────┐ │ 인터프리터    │
│ 파일을   │ │Stack│ │ + JIT 컴파일러│
│ 메모리에 │ │Heap │ │               │
│ 로드     │ │Method│ │ 바이트코드 →  │
│          │ │Area │ │ 기계어 변환    │
│          │ └─────┘ │               │
└──────────┴──────────┴───────────────┘
```

| 영역 | 역할 |
|------|------|
| **Class Loader** | .class 파일을 메모리에 로드 |
| **Runtime Data Area** | Stack, Heap, Method Area (J06에서 자세히!) |
| **Execution Engine** | 바이트코드를 기계어로 변환해서 실행 |

**💡 J06 "Java 메모리 구조"에서 Stack/Heap을 자세히 배운다!**

---

## 면접 대비

### 🔴 필수

**Q: "JDK, JRE, JVM의 차이는?"**

> JDK는 개발 도구(javac 등)를 포함한 전체 패키지이고, JRE는 Java 프로그램 실행 환경이며, JVM은 바이트코드를 실행하는 엔진입니다. JDK 안에 JRE가 있고, JRE 안에 JVM이 있습니다. 개발자는 JDK를 설치합니다.

**Q: "Java가 플랫폼 독립적인 이유는?"**

> Java는 소스 코드를 바이트코드(.class)로 컴파일하고, 각 OS에 설치된 JVM이 바이트코드를 해당 OS의 기계어로 변환해서 실행합니다. 코드를 한 번만 작성하면 어디서든 실행할 수 있어서 "Write Once, Run Anywhere"라고 합니다.

---

## 정리: 이것만 기억하기

```
🎯 Java 실행 과정:

Hello.java → javac → Hello.class → java(JVM) → 실행!
(소스코드)  (컴파일) (바이트코드)   (실행)     (결과)

JDK > JRE > JVM (포함 관계)
  개발자는 JDK 설치!

IntelliJ에서는 ▶ 버튼 하나로 전부 자동!
```

---

> 🎯 **다음 주제**: J02 "변수, 자료형, 연산자" — 데이터를 저장하고 계산하는 방법을 배운다!

