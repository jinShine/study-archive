# 빌드·번들링 심화 (Webpack · Vite · 트리셰이킹 · 코드 스플리팅 · 번들 최적화)

> 주제: 신입~주니어 프론트엔드가 면접에서 "Webpack/Vite 써봤어요"를 넘어 "왜 번들러가 필요한지, 트리셰이킹이 언제 깨지는지, 코드 스플리팅으로 초기 로딩을 어떻게 줄이는지, 번들 크기를 어떻게 측정·최적화하는지를 원리로 설명할 줄 안다"를 보여주는 심화 — 번들러의 존재 이유, 모듈 시스템(ESM vs CJS), Webpack vs Vite(dev 서버 원리·esbuild/Rollup), 트리셰이킹(사이드 이펙트·`sideEffects` 필드), 코드 스플리팅(동적 import·라우트 단위·`React.lazy`), 번들 분석과 최적화(청크 전략·소스맵·압축)
> 출처: 일일 심화 자료 (기존 5.common.md 성능/빌드 주제의 심화 확장편 · daily 미다룸 신규 영역)
> 🔴 면접 필수 · 🟡 알면 좋음 · 🟢 심화

## 📑 목차

- D1. 번들러(bundler)는 왜 필요한가요? 없으면 무슨 문제가 생기나요? 🔴
- D2. ESM과 CommonJS의 차이는 무엇이고, 왜 번들링·트리셰이킹에서 중요한가요? 🔴
- D3. Webpack의 빌드 파이프라인(entry·loader·plugin·output)을 설명해 주세요 🟡
- D4. Vite는 왜 빠른가요? Webpack의 dev 서버와 무엇이 다른가요? 🔴
- D5. 트리셰이킹(tree-shaking)이란 무엇이고, 언제 깨지나요? 🔴
- D6. 코드 스플리팅(code splitting)이란? 초기 로딩을 어떻게 줄이나요? 🔴
- D7. `React.lazy`/`Suspense`와 라우트 단위 스플리팅을 실무에서 어떻게 적용하나요? 🔴
- D8. 번들 크기를 어떻게 측정하고 무엇부터 줄이나요? 🟡
- D9. 소스맵·해시 파일명·캐싱·압축(gzip/brotli)은 어떻게 엮이나요? 🟡
- D10. 트랜스파일(Babel/SWC)과 번들링은 어떻게 다른가요? polyfill은? 🟢

---

## D1. 번들러(bundler)는 왜 필요한가요? 없으면 무슨 문제가 생기나요? 🔴

**💬 30초 답변**
> 번들러는 여러 개로 쪼개진 모듈(JS·CSS·이미지 등)과 그 의존 관계를 따라가며 하나(또는 소수)의 최적화된 파일로 묶어 주는 도구입니다. 없으면 ①`<script>`를 수십·수백 개 넣어야 해서 요청이 폭발하고(특히 HTTP/1.1), ②전역 스코프 충돌·로딩 순서 문제가 생기며, ③`node_modules`의 npm 패키지를 브라우저가 그대로 못 읽습니다. 번들러는 여기에 더해 트리셰이킹·코드 스플리팅·트랜스파일·압축 같은 최적화까지 붙여 줍니다. 즉 "**모듈을 브라우저가 실행 가능한 형태로 합치고 최적화하는 빌드 단계**"입니다.

**📖 핵심 개념**

🎯 **비유**: 번들러는 이사 포장 전문가입니다. 방마다 흩어진 짐(모듈)을 의존 관계에 맞게 정리하고, 안 쓰는 물건은 빼고(트리셰이킹), 무거운 짐은 나중에 부칠 박스로 따로 빼고(코드 스플리팅), 빈틈없이 압축 포장(minify)해서 트럭 몇 대로 딱 맞게 실어 줍니다.

📌 **번들러가 없던 시절의 문제 (왜 등장했나)**

- **스크립트 지옥**: 모든 파일을 `<script>`로 순서 맞춰 넣어야 했고, 하나 순서가 틀리면 `undefined` 에러.
- **전역 오염**: 모듈 시스템이 없어 모든 변수가 `window`에 붙어 이름 충돌.
- **npm 패키지 사용 불가**: npm 생태계는 `require`/`import` 기반인데 브라우저는(과거엔) 이를 이해 못 함.
- **최적화 부재**: 사용 안 하는 코드 제거, 파일 합치기, 압축을 자동으로 할 수단이 없었음.

📌 **번들러가 하는 일 (요약)**: 의존성 그래프 구성 → (트랜스파일) → 트리셰이킹 → 코드 스플리팅/청크 분리 → minify/압축 → 해시 파일명 output. Webpack, Rollup, Parcel, esbuild, Vite(내부적으로 Rollup+esbuild) 등이 대표적.

**🔥 예상 꼬리질문**

**Q. 요즘 브라우저는 `<script type="module">`로 ESM을 직접 지원하는데, 그래도 번들러가 필요한가요?**
A. 개발 중에는 브라우저 네이티브 ESM으로 충분할 수 있지만(Vite dev 서버가 이걸 활용), **프로덕션에서는 여전히 필요**합니다. 모듈을 안 합치면 요청 수가 많아지고(HTTP/2라도 요청당 오버헤드 존재), 트리셰이킹·minify·레거시 브라우저 대응이 안 됩니다. 그래서 Vite도 배포 빌드는 Rollup으로 번들링합니다.

**Q. 번들러(bundler)와 태스크 러너(gulp/grunt)의 차이는?**
A. 태스크 러너는 "파일을 이렇게 처리해라"라는 작업(task)을 순서대로 실행하는 도구고, 번들러는 **의존성 그래프를 이해**해서 모듈을 묶는 데 특화된 도구입니다. 오늘날은 번들러가 트랜스파일·minify까지 통합해 태스크 러너의 역할을 대부분 흡수했습니다.

<details><summary>📝 한 줄 요약</summary>
번들러 = 흩어진 모듈을 의존성 그래프 따라 하나로 묶고 트리셰이킹·스플리팅·압축까지 해 주는 빌드 도구. 요청 폭발·전역 충돌·npm 미지원·최적화 부재를 해결한다.
</details>

---

## D2. ESM과 CommonJS의 차이는 무엇이고, 왜 번들링·트리셰이킹에서 중요한가요? 🔴

**💬 30초 답변**
> **CommonJS(CJS)** 는 Node.js의 전통 모듈 시스템으로 `require()`/`module.exports`를 쓰고 **런타임에 동적으로** 모듈을 불러옵니다. **ESM(ES Modules)** 은 표준 모듈 시스템으로 `import`/`export`를 쓰고 **정적(static)** 이라 실행 전에 의존 관계를 분석할 수 있습니다. 이 "정적 분석 가능" 성질이 핵심인데, 번들러가 **컴파일 타임에 어떤 export가 실제로 쓰이는지 판단**할 수 있어 트리셰이킹이 가능해집니다. CJS는 `require`가 조건문 안에도 들어갈 수 있어(동적) 정적 분석이 어렵고, 그래서 트리셰이킹이 잘 안 됩니다. 결론: **트리셰이킹을 원하면 ESM을 써야 한다.**

**📖 핵심 개념**

🎯 **비유**: ESM은 미리 제출한 "부품 명세서"입니다. 조립 전에 명세서만 보고 "이 부품은 안 쓰이네" 하고 뺄 수 있습니다(트리셰이킹). CJS는 "일단 조립하면서 그때그때 부품을 요청"하는 방식이라, 조립을 실제로 해 보기 전엔 뭐가 안 쓰이는지 확신할 수 없습니다.

📌 **핵심 차이 비교**

| 구분 | CommonJS (CJS) | ES Modules (ESM) |
|---|---|---|
| 문법 | `require()` / `module.exports` | `import` / `export` |
| 로딩 시점 | 런타임(동적) | 정적(컴파일 타임 분석 가능) |
| 위치 제약 | 함수·조건문 안 어디서든 `require` 가능 | `import`는 최상위(top-level) 정적 위치 |
| 트리셰이킹 | 어려움 | 가능(핵심) |
| 바인딩 | 값 복사(스냅샷) | 살아있는 참조(live binding) |
| 로딩 | 동기(synchronous) | 비동기 지원(`import()`) |

📌 **live binding 예시**: ESM에서 export한 변수를 원본 모듈이 나중에 바꾸면, import한 쪽에서도 바뀐 값이 보인다(참조를 공유). CJS는 `require` 시점의 값을 복사한다.

```js
// counter.mjs (ESM)
export let count = 0;
export function inc() { count++; }

// main.mjs
import { count, inc } from './counter.mjs';
console.log(count); // 0
inc();
console.log(count); // 1  ← live binding: 원본이 바뀐 게 보인다
```

📌 **패키지의 이중 제공**: 많은 라이브러리가 `package.json`의 `main`(CJS)과 `module`/`exports`(ESM) 필드를 둘 다 제공한다. 번들러는 가능하면 ESM 진입점을 골라 트리셰이킹을 살린다. `lodash` 대신 `lodash-es`를 쓰라는 조언이 여기서 나온다.

**🔥 예상 꼬리질문**

**Q. `import { debounce } from 'lodash'` 하면 lodash 전체가 번들에 들어가나요?**
A. 상황에 따라 다릅니다. `lodash`(CJS)를 named import 해도 트리셰이킹이 잘 안 돼 전체가 들어갈 수 있습니다. 해결책은 ①`lodash-es`(ESM 빌드)를 쓰거나, ②`import debounce from 'lodash/debounce'`처럼 **경로를 직접 지정**해 필요한 모듈만 가져오는 것입니다.

**Q. `import()` (함수형 import)와 `import ... from`(정적)의 차이는?**
A. 정적 `import`는 최상위에서만 쓰며 번들 그래프에 정적으로 포함됩니다. 동적 `import()`는 **함수처럼 호출**하며 Promise를 반환하고, 조건부·지연 로딩에 쓰입니다. 번들러는 동적 `import()`를 만나면 그 지점을 **별도 청크로 분리**(코드 스플리팅)합니다.

**Q. `type: "module"`은 무엇인가요?**
A. `package.json`에 `"type": "module"`을 넣으면 그 패키지의 `.js`가 ESM으로 해석됩니다. 없으면 기본 CJS. 확장자로도 강제 가능한데 `.mjs`=ESM, `.cjs`=CJS입니다.

<details><summary>📝 한 줄 요약</summary>
ESM은 정적이라 컴파일 타임에 의존 관계를 분석할 수 있어 트리셰이킹이 가능하고, CJS는 동적 `require`라 어렵다. 트리셰이킹을 원하면 ESM 진입점(`lodash-es` 등)을 써라.
</details>

---

## D3. Webpack의 빌드 파이프라인(entry·loader·plugin·output)을 설명해 주세요 🟡

**💬 30초 답변**
> Webpack은 **엔트리(entry)** 파일부터 `import`/`require`를 따라가며 **의존성 그래프**를 만들고, JS가 아닌 파일(CSS·이미지·TS 등)은 **로더(loader)** 로 JS가 이해할 수 있게 변환하며, 번들 생성 과정 전반(압축·환경변수 주입·HTML 생성 등)에는 **플러그인(plugin)** 이 개입하고, 최종 결과를 **아웃풋(output)** 으로 내보냅니다. 한 줄로: "entry에서 시작해 loader로 변환하고 plugin으로 가공해 output으로 묶는다."

**📖 핵심 개념**

🎯 **비유**: 공장 컨베이어 벨트입니다. 원자재 투입구(entry) → 각 소재별 가공 기계(loader: 천은 재봉틀, 금속은 용접기) → 라인 전체를 감독하며 포장·검수하는 매니저(plugin) → 출고장(output).

📌 **4대 핵심 개념**

- **entry**: 그래프의 시작점. `src/index.js` 같은 진입 파일. 여러 개 지정하면 멀티 번들.
- **loader**: Webpack은 기본적으로 JS/JSON만 안다. 그 외 파일은 로더가 변환한다.
  - `babel-loader`(JS 트랜스파일), `ts-loader`(TS), `css-loader`+`style-loader`(CSS), `asset modules`(이미지·폰트).
  - 로더는 **오른쪽→왼쪽**(또는 아래→위) 순으로 체이닝된다: `['style-loader', 'css-loader']`면 css-loader가 먼저.
- **plugin**: 번들 최적화·자산 관리·환경변수 주입 등 **빌드 생애주기 전반**에 개입.
  - `HtmlWebpackPlugin`(HTML 자동 생성·스크립트 주입), `DefinePlugin`(환경변수), `MiniCssExtractPlugin`(CSS 파일 분리) 등.
- **output**: 번들 파일명·경로·public path. `[contenthash]`로 캐시 무효화용 해시를 넣는다.

```js
// webpack.config.js (개념 예시)
module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js', // 캐시 무효화용 해시
    path: __dirname + '/dist',
  },
  module: {
    rules: [
      { test: /\.jsx?$/, use: 'babel-loader', exclude: /node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }, // 오른→왼 실행
      { test: /\.(png|svg)$/, type: 'asset/resource' },
    ],
  },
  plugins: [ new HtmlWebpackPlugin({ template: './index.html' }) ],
  mode: 'production', // 자동으로 minify·트리셰이킹 활성
};
```

📌 **loader vs plugin 차이**(자주 나오는 질문): 로더는 "**개별 파일을 변환**"하는 함수, 플러그인은 "**빌드 프로세스 전체에 훅으로 개입**"하는 확장. 로더는 무엇을 JS로 바꿀지, 플러그인은 번들을 어떻게 다룰지를 담당한다.

**🔥 예상 꼬리질문**

**Q. `mode: 'production'`과 `'development'`의 차이는?**
A. `production`은 자동으로 minify(Terser), 트리셰이킹, `process.env.NODE_ENV='production'` 주입 등 최적화를 켭니다. `development`는 빌드 속도와 디버깅(소스맵·읽기 쉬운 출력)을 우선합니다.

**Q. HMR(Hot Module Replacement)이 뭔가요?**
A. 코드를 수정하면 **전체 새로고침 없이 바뀐 모듈만 교체**해 상태를 유지한 채 화면을 갱신하는 기능입니다. 개발 생산성을 크게 높입니다. Webpack dev server, Vite 모두 지원합니다.

<details><summary>📝 한 줄 요약</summary>
Webpack: entry에서 그래프를 만들고 → loader로 비-JS 파일을 변환 → plugin으로 빌드 전반을 가공 → output으로 묶는다. loader=파일 변환, plugin=빌드 훅.
</details>

---

## D4. Vite는 왜 빠른가요? Webpack의 dev 서버와 무엇이 다른가요? 🔴

**💬 30초 답변**
> Webpack dev 서버는 앱을 실행하기 전에 **전체를 번들링**해야 시작되므로, 프로젝트가 커질수록 초기 구동과 HMR이 느려집니다. Vite는 개발 중에는 번들링을 하지 않고, 브라우저의 **네이티브 ESM**을 활용해 요청이 들어온 모듈만 그때그때 변환해서 줍니다(on-demand). 그래서 **초기 서버 구동이 프로젝트 크기와 거의 무관하게 즉시**입니다. 또 변환은 Go로 짠 **esbuild**(JS 번들러보다 10~100배 빠름)로 하고, 의존성(node_modules)은 미리 한 번만 사전 번들링(pre-bundle)합니다. 프로덕션 빌드는 안정적인 **Rollup**으로 번들링합니다.

**📖 핵심 개념**

🎯 **비유**: Webpack dev는 뷔페를 열기 전에 **모든 요리를 다 만들어 놓고** 문을 여는 식당입니다(오픈까지 오래 걸림). Vite dev는 **주문이 들어온 요리만 즉석 조리**하는 식당입니다(오픈은 즉시, 손님이 시킨 것만 만듦).

📌 **Webpack dev vs Vite dev 핵심 차이**

| 구분 | Webpack dev server | Vite dev server |
|---|---|---|
| 시작 시 | 전체 번들링 후 구동 | 번들링 없이 즉시 구동 |
| 모듈 제공 | 번들된 하나의 파일 | 브라우저 네이티브 ESM, 요청 시 변환 |
| 변환 엔진 | JS 기반(babel-loader 등) | esbuild(Go, 초고속) |
| HMR 속도 | 프로젝트 클수록 느려짐 | 바뀐 모듈만 무효화, 크기와 무관하게 빠름 |
| 초기 구동 | 코드량에 비례 | 코드량과 거의 무관 |

📌 **의존성 사전 번들링(dependency pre-bundling)**: `node_modules`의 패키지는 수백 개의 내부 파일로 쪼개져 있어(특히 lodash-es 같은 것) ESM으로 그대로 주면 요청이 폭발한다. Vite는 이들을 esbuild로 **미리 하나로 묶어** 캐시(`node_modules/.vite`)한다. 또 CJS 패키지를 ESM으로 변환하는 역할도 여기서 한다.

📌 **왜 프로덕션은 Rollup?**: 개발용 네이티브 ESM은 요청 수가 많아 프로덕션엔 부적합하다. 배포 시엔 트리셰이킹·청크 최적화가 성숙한 Rollup으로 번들링한다. 즉 Vite = "dev는 esbuild+네이티브 ESM, prod는 Rollup" 하이브리드.

**🔥 예상 꼬리질문**

**Q. Vite가 그렇게 빠르면 Webpack은 이제 안 쓰나요?**
A. 신규 프로젝트는 Vite/Next(Turbopack)로 많이 넘어갔지만, Webpack은 여전히 거대한 생태계·세밀한 커스터마이징·기존 프로젝트에서 강력합니다. Next.js도 오랫동안 Webpack 기반이었고 점진적으로 Turbopack으로 이동 중입니다. "빠르다"뿐 아니라 **성숙도·플러그인 생태계·요구사항**으로 선택합니다.

**Q. esbuild가 그렇게 빠른데 왜 프로덕션 번들링까지 esbuild로 안 하나요?**
A. esbuild는 매우 빠르지만, 코드 스플리팅·CSS 처리·트리셰이킹 세부 제어 등 프로덕션에 필요한 일부 기능이 Rollup만큼 성숙하지 않았기 때문입니다(Vite 설계 당시 기준). 그래서 "빠른 변환은 esbuild, 정교한 번들링은 Rollup"으로 역할을 나눴습니다.

**Q. 개발과 프로덕션에서 번들러가 다르면 동작이 달라질 위험은 없나요?**
A. 있습니다. dev(네이티브 ESM)에서는 잘 되던 것이 prod(Rollup 번들) 빌드에서 트리셰이킹·순서 문제로 달라질 수 있어, **배포 전 `vite build` + `vite preview`로 프로덕션 빌드를 실제로 확인**하는 것이 중요합니다.

<details><summary>📝 한 줄 요약</summary>
Vite dev는 번들링 없이 네이티브 ESM으로 요청된 모듈만 esbuild로 즉석 변환 → 초기 구동이 크기와 무관하게 빠름. 의존성은 사전 번들링, 프로덕션은 Rollup으로 번들링하는 하이브리드.
</details>

---

## D5. 트리셰이킹(tree-shaking)이란 무엇이고, 언제 깨지나요? 🔴

**💬 30초 답변**
> 트리셰이킹은 **실제로 쓰이지 않는(dead) 코드를 번들에서 제거**하는 최적화입니다. 이름처럼 나무를 흔들어 죽은 잎(안 쓰는 export)을 털어내는 것입니다. ESM의 정적 구조 덕분에 번들러가 "이 export는 아무도 import 안 하네"를 컴파일 타임에 판단해 제거합니다. 하지만 ①CJS 모듈이거나, ②`import`로 가져온 모듈이 **사이드 이펙트**(단순 import만으로 전역을 바꾸는 코드)를 가질 수 있어 번들러가 지우기를 주저하거나, ③네임스페이스 전체를 import(`import * as`)하면 깨질 수 있습니다. 그래서 라이브러리는 `package.json`에 `"sideEffects": false`로 "안전하게 지워도 된다"를 알려 줍니다.

**📖 핵심 개념**

🎯 **비유**: 옷장 정리입니다. 지난 1년간 한 번도 안 입은 옷(안 쓰는 export)을 버리는 것. 다만 "이 옷은 안 입지만 옷장 습기 제거제 역할을 한다"(사이드 이펙트)면 함부로 못 버립니다. `sideEffects: false`는 "여긴 순수 옷만 있으니 안 입는 건 다 버려도 됨"이라는 라벨입니다.

📌 **트리셰이킹이 되는 조건**

- **ESM 문법**(`import`/`export`)을 써야 한다. CJS는 정적 분석이 어려워 잘 안 된다.
- 번들러가 **프로덕션 모드**여야 한다(Webpack `mode:'production'`, Rollup 기본).
- 제거 대상이 **사이드 이펙트가 없어야** 한다(순수 함수·값).

📌 **사이드 이펙트(side effect)란**: 모듈을 import하는 것만으로 프로그램 상태를 바꾸는 코드. 예: 전역 폴리필 등록, CSS import(`import './styles.css'`), `window.x = ...`. 번들러는 이런 모듈은 "안 쓰는 것 같아도 지우면 부작용이 사라질 수 있어" 함부로 안 지운다.

```jsonc
// package.json — 라이브러리 제작자가 트리셰이킹을 돕는 법
{
  "sideEffects": false            // 이 패키지의 모든 파일은 부작용 없음 → 자유롭게 제거 OK
}
// 또는 일부 파일만 부작용 있음을 명시
{
  "sideEffects": ["*.css", "./src/polyfill.js"]
}
```

📌 **트리셰이킹이 깨지는 대표 패턴**

```js
// ❌ 네임스페이스 전체 import — 무엇이 쓰이는지 번들러가 판단하기 어려움
import * as utils from './utils';
utils.a();

// ✅ named import — a만 남기고 나머지 제거 가능
import { a } from './utils';

// ❌ CJS 패키지의 named import — 전체가 들어올 수 있음
import { debounce } from 'lodash';

// ✅ ESM 빌드 또는 경로 직접 지정
import { debounce } from 'lodash-es';
import debounce from 'lodash/debounce';
```

**🔥 예상 꼬리질문**

**Q. dead code elimination(DCE)과 tree-shaking은 같은 건가요?**
A. 밀접하지만 층이 다릅니다. DCE는 minifier(Terser 등)가 **함수/모듈 내부**의 도달 불가능한 코드(`if(false){...}`)를 지우는 것이고, 트리셰이킹은 번들러가 **모듈 그래프 수준**에서 아무도 import 안 하는 export를 지우는 것입니다. 둘이 협력해 최종 번들을 줄입니다.

**Q. `import './styles.css'`는 아무 변수도 안 만드는데 왜 안 지워지나요?**
A. 그게 바로 사이드 이펙트 import입니다. import하는 행위 자체가 목적(CSS 주입)이므로 지우면 스타일이 사라집니다. 그래서 `sideEffects` 배열에 CSS를 넣어 "이건 지우지 말라"고 명시합니다.

**Q. 내 코드는 ESM인데도 트리셰이킹이 안 되는 것 같아요. 왜죠?**
A. 흔한 원인: ①Babel이 ESM을 CJS로 트랜스파일(`@babel/preset-env`의 `modules: false`로 꺼야 함), ②의존 패키지가 CJS만 제공, ③사이드 이펙트로 오인, ④개발 모드로 빌드. 번들 분석기로 실제로 뭐가 들어갔는지 확인하는 게 정답입니다.

<details><summary>📝 한 줄 요약</summary>
트리셰이킹 = 안 쓰는 export를 번들에서 제거. ESM+프로덕션 모드+사이드 이펙트 없음이 조건. `import *`·CJS·사이드 이펙트 import에서 깨진다. `sideEffects: false`로 돕는다.
</details>

---

## D6. 코드 스플리팅(code splitting)이란? 초기 로딩을 어떻게 줄이나요? 🔴

**💬 30초 답변**
> 코드 스플리팅은 하나의 거대한 번들을 **여러 청크(chunk)로 나눠, 지금 당장 필요한 것만 먼저 로드**하는 기법입니다. 예를 들어 사용자가 처음 보는 홈 화면 코드만 초기에 받고, 설정 페이지·차트 라이브러리처럼 나중에 필요한 코드는 그때 가서 받게 합니다. 방법은 크게 ①**동적 `import()`** (지연 로딩), ②**라우트 단위 분리**(페이지별 청크), ③**vendor 청크 분리**(자주 안 바뀌는 라이브러리를 따로 빼 캐시 효율↑)입니다. 목적은 **초기 번들(initial bundle)을 줄여 첫 로딩(FCP/LCP·TTI)을 빠르게** 하는 것입니다.

**📖 핵심 개념**

🎯 **비유**: 넷플릭스가 영화 전체를 다 받게 하지 않고 지금 보는 구간만 스트리밍하듯, 앱도 지금 화면에 필요한 코드만 조각으로 내려받습니다.

📌 **세 가지 스플리팅 축**

- **동적 import (지연 로딩)**: `import('./Heavy')`는 Promise를 반환하고, 번들러는 `Heavy`를 별도 청크로 분리해 **호출 시점에** 네트워크로 가져온다.
- **라우트 기반 분리**: 각 페이지를 lazy load. SPA에서 가장 효과가 크다(안 방문한 페이지 코드를 안 받음).
- **vendor/공통 청크 분리**: React·라이브러리처럼 자주 안 바뀌는 코드를 별도 청크로 빼면, 앱 코드만 바뀌어도 vendor 청크는 브라우저 캐시가 유지된다(재다운로드 X).

```js
// 동적 import — 버튼 클릭 시에만 무거운 모듈 로드
button.addEventListener('click', async () => {
  const { renderChart } = await import('./chart');  // 별도 청크로 분리됨
  renderChart(data);
});
```

📌 **주의 — 과하게 쪼개지 마라**: 청크가 너무 잘게 나뉘면 요청 수가 늘고, 각 요청의 오버헤드와 워터폴(순차 로딩)로 오히려 느려질 수 있다. "의미 있는 경계(라우트·큰 라이브러리·조건부 기능)"에서 나누는 게 핵심.

**🔥 예상 꼬리질문**

**Q. 코드 스플리팅과 트리셰이킹의 차이는?**
A. 트리셰이킹은 "**안 쓰는 코드를 아예 제거**"(총량 감소), 코드 스플리팅은 "**쓰는 코드를 언제 로드할지 시점을 나눔**"(초기 로드량 감소)입니다. 둘 다 초기 번들을 줄이지만 방식이 다르며, 함께 씁니다.

**Q. 동적 import한 청크는 언제 미리 받아두면 좋나요?**
A. 사용자가 곧 쓸 가능성이 높으면 **prefetch/preload**로 미리 받습니다. Webpack은 `import(/* webpackPrefetch: true */ './x')` 주석으로, 브라우저 유휴 시간에 미리 받아 클릭 시 즉시 실행되게 할 수 있습니다.

**Q. 라우트 스플리팅 시 로딩 중 화면 깜빡임은 어떻게 처리하나요?**
A. React라면 `Suspense`의 `fallback`으로 로딩 UI(스켈레톤)를 보여주고, 에러는 Error Boundary로 잡습니다. 또 데이터·코드 로딩을 함께 고려해 워터폴을 피합니다.

<details><summary>📝 한 줄 요약</summary>
코드 스플리팅 = 번들을 청크로 나눠 지금 필요한 것만 먼저 로드. 동적 import·라우트 분리·vendor 분리 3축. 초기 번들↓ → 첫 로딩↑. 단, 과분할은 요청·워터폴로 역효과.
</details>

---

## D7. `React.lazy`/`Suspense`와 라우트 단위 스플리팅을 실무에서 어떻게 적용하나요? 🔴

**💬 30초 답변**
> `React.lazy`는 컴포넌트를 **동적 import로 감싸 지연 로딩**하게 해 주는 API이고, 로딩되는 동안 보여줄 UI는 `Suspense`의 `fallback`으로 지정합니다. 실무에서는 주로 **라우터에서 페이지 컴포넌트를 `lazy`로 감싸** 방문하지 않은 페이지의 코드를 초기 번들에서 빼는 식으로 씁니다. 여기에 로딩 실패를 대비한 **Error Boundary**를 함께 두는 것이 정석입니다. 결과적으로 초기 번들이 홈 화면 정도로 작아지고, 나머지는 이동할 때 받아집니다.

**📖 핵심 개념**

🎯 **비유**: 놀이공원 입장 시 모든 놀이기구 이용권을 다 받는 게 아니라(전체 번들), 입장권만 받고(초기 청크) 각 놀이기구는 갈 때 표를 끊는(lazy 로딩) 방식입니다.

📌 **라우트 단위 lazy 로딩 정석 패턴**

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// 각 페이지를 동적 import로 감싸면 페이지별 청크로 분리된다
const Home = lazy(() => import('./pages/Home'));
const Settings = lazy(() => import('./pages/Settings'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <ErrorBoundary fallback={<p>로드 실패. 새로고침 해주세요.</p>}>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
```

📌 **어디를 lazy로 나눌지 판단 기준**

- **라우트(페이지)**: 거의 항상 좋은 경계. 방문 안 하면 코드도 안 받음.
- **무겁고 조건부인 컴포넌트**: 모달, 차트(예: `recharts`), 에디터(예: `monaco`), 지도 등. 열릴 때만 로드.
- **너무 작은 컴포넌트는 나누지 말 것**: 요청 오버헤드가 이득보다 큼.

📌 **Next.js에서는**: `next/dynamic`을 쓴다. `const Chart = dynamic(() => import('./Chart'), { ssr: false, loading: () => <Spinner/> })`처럼 SSR 여부까지 제어할 수 있다. App Router에선 서버 컴포넌트·`loading.tsx`·`Suspense`가 스트리밍과 결합된다(← 07-25 Next.js 심화 자료 참고).

**🔥 예상 꼬리질문**

**Q. `React.lazy`로 감싼 컴포넌트가 로딩 중 에러 나면?**
A. `Suspense`는 로딩만 담당하고 에러는 못 잡습니다. 네트워크 실패·청크 로드 실패를 대비해 **Error Boundary로 감싸야** 합니다(배포 후 오래된 청크 해시가 사라진 경우 등 실제로 발생).

**Q. lazy 로딩하면 SEO나 초기 콘텐츠에 문제 없나요?**
A. 클라이언트에서만 lazy 로드하면 그 부분은 초기 HTML에 없어 SEO·LCP에 불리할 수 있습니다. **처음 화면에 바로 보이는(above-the-fold) 핵심 콘텐츠는 lazy로 나누지 말고**, SSR/스트리밍으로 서버에서 그려 보내는 편이 낫습니다. lazy는 "당장 안 보이는 것"에 씁니다.

**Q. 라우트 스플리팅했더니 페이지 이동마다 살짝 지연이 생깁니다.**
A. 링크에 마우스를 올리거나 뷰포트에 들어올 때 **prefetch**로 미리 청크를 받아두면 클릭 시 즉시 전환됩니다. React Router의 데이터/lazy 프리페치, Next.js `<Link>`의 자동 prefetch가 이를 해 줍니다.

<details><summary>📝 한 줄 요약</summary>
`React.lazy`(동적 import)+`Suspense`(fallback)로 페이지 컴포넌트를 지연 로딩해 라우트 단위 스플리팅. Error Boundary 필수. above-the-fold 핵심 콘텐츠는 나누지 말고, prefetch로 이동 지연을 없앤다.
</details>

---

## D8. 번들 크기를 어떻게 측정하고 무엇부터 줄이나요? 🟡

**💬 30초 답변**
> 먼저 **측정**합니다. `webpack-bundle-analyzer`나 `rollup-plugin-visualizer`로 번들을 시각화하면 어떤 모듈이 얼마나 차지하는지 트리맵으로 보입니다. 그다음 큰 것부터 처리합니다: ①불필요하게 통째로 들어온 **거대 라이브러리**(moment→dayjs, lodash→lodash-es/개별 import), ②중복 포함된 의존성, ③트리셰이킹이 깨진 곳, ④초기에 필요 없는데 들어간 코드(→코드 스플리팅). 원칙은 "**추측하지 말고 측정하고, 큰 것부터, 초기 번들 우선**"입니다.

**📖 핵심 개념**

🎯 **비유**: 다이어트 전 체성분 분석부터 하듯, 감으로 줄이지 말고 번들 분석기로 "어디에 살이 쪘는지" 먼저 봅니다.

📌 **측정 도구**

- **webpack-bundle-analyzer / rollup-plugin-visualizer**: 모듈별 크기 트리맵.
- **소스맵 기반 분석**(`source-map-explorer`): 실제 배포 번들을 역추적.
- **Lighthouse / Coverage 탭**(크롬 DevTools): 실제로 실행 안 된(unused) JS 비율 확인.
- **번들 크기 예산(budget)**: CI에서 번들이 임계치를 넘으면 실패시키는 `bundlesize`/Lighthouse budget.

📌 **줄이는 우선순위(효과 큰 순)**

- **무거운 의존성 교체/제거**: `moment`(~수백KB, 로케일 포함) → `dayjs`/`date-fns`. 아이콘 전체 import → 개별 import.
- **트리셰이킹 복구**: ESM 진입점 사용, `import *` 지양, Babel `modules:false`.
- **코드 스플리팅**: 초기에 불필요한 것(관리자 페이지·차트·에디터)을 동적 import.
- **중복 제거**: 같은 라이브러리 다중 버전 → `npm dedupe`, resolutions.
- **이미지/폰트**: JS 밖 이야기지만 총 페이지 무게에 큰 영향(WebP/AVIF, 서브셋 폰트).

**🔥 예상 꼬리질문**

**Q. "parsed size"와 "gzipped size" 중 뭘 봐야 하나요?**
A. 사용자가 실제 다운로드하는 건 **gzip/brotli 압축된 크기**(전송량)라 네트워크 관점에선 그걸 봅니다. 다만 브라우저가 **파싱·실행**하는 비용은 압축 해제된 원본 크기에 비례하므로, 저사양 기기의 TTI를 볼 땐 원본 크기도 중요합니다. 둘 다 봅니다.

**Q. 라이브러리 하나가 너무 큰데 대체재가 없으면?**
A. ①해당 라이브러리를 **동적 import**로 미뤄 초기 번들에서 빼거나, ②필요한 기능만 쓰는 **경량 대안/직접 구현**을 검토하거나, ③트리셰이킹 가능한 ESM 빌드/개별 모듈 import가 되는지 확인합니다.

**Q. 번들이 커지는 걸 어떻게 사전에 막나요?**
A. CI에 **번들 크기 예산**을 걸어 PR에서 임계치 초과 시 실패시키고, 새 의존성 추가 시 크기 영향을 리뷰에서 확인합니다(예: bundlephobia로 사전 조회).

<details><summary>📝 한 줄 요약</summary>
"추측 말고 측정" — bundle-analyzer로 트리맵을 보고 큰 것부터: 무거운 의존성 교체(moment→dayjs), 트리셰이킹 복구, 코드 스플리팅, 중복 제거. 전송량은 gzip 크기, 실행 비용은 원본 크기로 본다.
</details>

---

## D9. 소스맵·해시 파일명·캐싱·압축(gzip/brotli)은 어떻게 엮이나요? 🟡

**💬 30초 답변**
> 빌드 산출물은 **압축(minify)** 되고 **gzip/brotli로 전송 압축**되며, 파일명에 **콘텐츠 해시**(`app.3f9a2c.js`)를 붙여 **장기 캐싱**을 안전하게 합니다. 파일 내용이 바뀌면 해시가 바뀌어 URL이 달라지므로 브라우저가 새 파일을 받고, 안 바뀐 파일은 캐시에서 즉시 로드됩니다(캐시 무효화 자동화). 그리고 minify로 알아보기 힘들어진 코드를 디버깅하려고 **소스맵(source map)** 을 함께 만들어 원본 코드와 매핑합니다. 네 가지가 "작게 만들고(minify) → 더 작게 보내고(gzip) → 오래 캐시하되 바뀌면 자동 갱신(해시) → 디버깅은 원본으로(소스맵)"로 협력합니다.

**📖 핵심 개념**

🎯 **비유**: 책을 요약 압축하고(minify), 진공포장해 배송하고(gzip), 표지에 개정판 번호를 찍어 도서관이 최신본만 다시 들이게 하고(contenthash), 원문 대조표를 따로 보관(source map)하는 것.

📌 **각 요소 정리**

- **minify(압축)**: 공백·주석 제거, 변수명 축약, 죽은 코드 제거(Terser/esbuild). 파일 자체를 작게.
- **gzip/brotli(전송 압축)**: 서버가 응답을 압축해 보냄. brotli가 gzip보다 보통 더 작다. 텍스트 자산에 큰 효과.
- **contenthash 파일명**: 내용이 바뀔 때만 파일명이 바뀐다. 그래서 `Cache-Control: max-age=31536000, immutable`로 **1년 장기 캐싱**을 걸어도 안전(← 07-23 캐싱 자료와 연결).
- **source map(.map)**: 압축된 코드 ↔ 원본 코드 매핑. 프로덕션에선 보통 브라우저에 자동 노출하지 않고(별도 업로드해 에러 추적 도구가 사용) 소스 보호.

📌 **HTML은 캐시하면 안 된다(주의)**: 해시가 붙은 JS/CSS는 오래 캐시하되, 그 파일들을 참조하는 `index.html`은 **캐시하지 않거나 짧게** 해야 새 해시 파일을 가리키는 최신 HTML을 받는다. "HTML은 짧게, 해시 자산은 길게"가 원칙.

**🔥 예상 꼬리질문**

**Q. 왜 `[contenthash]`가 캐싱에 중요한가요?**
A. 파일명이 고정이면 내용을 바꿔도 브라우저가 캐시된 옛 파일을 쓸 수 있습니다. 콘텐츠 해시는 내용이 바뀌면 파일명이 바뀌어 **자동으로 캐시가 무효화**되고, 안 바뀐 파일은 캐시를 계속 써 효율적입니다. 캐시 무효화 문제를 파일명으로 해결하는 표준 기법입니다.

**Q. 프로덕션에 소스맵을 올려도 되나요?**
A. 소스맵을 공개하면 원본 코드가 노출됩니다. 보통 **소스맵을 공개 배포하지 않고**, Sentry 같은 에러 추적 도구에만 업로드해 스택트레이스를 원본 기준으로 보게 합니다. 내부 도구/오픈소스면 공개해도 무방합니다.

**Q. gzip은 빌드 때 하나요, 서버가 하나요?**
A. 둘 다 가능합니다. 서버/CDN이 실시간 압축하거나, 빌드 시 `.gz`/`.br`을 미리 만들어 두고 서버가 그대로 서빙(pre-compression)합니다. 후자가 CPU를 아끼고 더 강한 압축률을 쓸 수 있습니다.

<details><summary>📝 한 줄 요약</summary>
minify(작게)→gzip/brotli(전송 압축)→contenthash(바뀔 때만 파일명 변경→장기 캐싱 안전)→source map(디버깅은 원본). HTML은 짧게 캐시, 해시 자산은 immutable 장기 캐시.
</details>

---

## D10. 트랜스파일(Babel/SWC)과 번들링은 어떻게 다른가요? polyfill은? 🟢

**💬 30초 답변**
> **트랜스파일(transpile)** 은 최신 문법·언어(ES2023, TypeScript, JSX)를 **구형 브라우저가 이해하는 문법으로 변환**하는 것이고, **번들링**은 그렇게 변환된 여러 모듈을 **의존성 따라 묶는 것**입니다. 둘은 별개 단계지만 빌드 파이프라인에서 함께 돕니다(Webpack은 babel-loader로 트랜스파일 후 번들). **Babel**은 오랜 표준 트랜스파일러이고, **SWC**(Rust)·**esbuild**(Go)는 훨씬 빠른 차세대 대안입니다. 한편 **polyfill**은 문법이 아니라 **없는 API/기능 자체를 런타임에 채워 넣는 것**(예: 구형 브라우저에 `Promise`·`fetch` 구현 제공)으로, 트랜스파일과 구분됩니다.

**📖 핵심 개념**

🎯 **비유**: 트랜스파일은 최신 표준어로 쓴 글을 **옛날 사람도 읽는 어휘로 바꿔 쓰는 번역**이고, polyfill은 그 사람 집에 **없는 도구(예: 전자레인지)를 아예 하나 놓아주는 것**입니다. 문장을 바꾸는 것(문법)과 도구를 채우는 것(기능)은 다릅니다.

📌 **트랜스파일 vs polyfill (자주 헷갈림)**

- **트랜스파일 = 문법 변환**: 화살표 함수·옵셔널 체이닝·클래스 필드 같은 **새 문법**을 옛 문법으로. 코드를 다시 쓴다.
- **polyfill = 기능 채우기**: `Array.prototype.flat`, `Promise`, `fetch` 같은 **런타임 API**를 구현체로 주입한다. `core-js`가 대표.
- `@babel/preset-env` + `browserslist` + `core-js`를 조합하면 **타겟 브라우저에 맞춰** 필요한 트랜스파일과 polyfill만 넣는다.

📌 **browserslist**: `package.json`이나 `.browserslistrc`에 지원 브라우저 범위를 선언하면(`"> 0.5%, last 2 versions, not dead"`) Babel·Autoprefixer·번들러가 이를 읽어 **어디까지 변환/폴리필할지** 결정한다. 타겟을 좁히면(최신만 지원) 번들이 작아진다.

📌 **왜 SWC/esbuild로 갈아타나**: Babel은 JS로 작성돼 대규모 코드에서 느리다. SWC(Next.js 기본)·esbuild(Vite)는 각각 Rust·Go로 짜여 **수십 배 빠르다**. Next.js는 babel 대신 SWC를 기본 트랜스파일러로 쓴다.

**🔥 예상 꼬리질문**

**Q. TypeScript 컴파일과 트랜스파일은 같은 건가요?**
A. `tsc`는 타입 검사 + JS로 변환을 모두 하지만, 빌드 속도를 위해 실무에선 **타입 검사는 `tsc --noEmit`(또는 IDE/CI)로, 실제 변환은 esbuild/SWC/babel로** 나눠 하는 경우가 많습니다. esbuild/SWC는 **타입 검사 없이** 타입 표기만 제거해 변환하므로 매우 빠릅니다(그래서 타입 검사는 별도로 돌려야 함).

**Q. polyfill을 다 넣으면 번들이 커지지 않나요?**
A. 그래서 `core-js` + `@babel/preset-env`의 `useBuiltIns: 'usage'`로 **실제 코드에서 쓰는 API만** 폴리필을 넣습니다. 또 타겟 브라우저를 최신으로 좁히면 폴리필 자체가 거의 필요 없어집니다.

**Q. "differential serving"이 뭔가요?**
A. 최신 브라우저에는 트랜스파일을 덜 한 가벼운 modern 번들을, 구형 브라우저에는 legacy 번들을 각각 제공하는 전략입니다. `<script type="module">`(modern)과 `nomodule`(legacy)로 나눠 최신 사용자에게 더 작은 번들을 줍니다(Vite `@vitejs/plugin-legacy`).

<details><summary>📝 한 줄 요약</summary>
트랜스파일=새 문법을 옛 문법으로 번역(Babel/SWC/esbuild), 번들링=모듈을 묶기, polyfill=없는 런타임 API를 채우기(core-js). browserslist로 타겟을 정해 필요한 만큼만 변환·폴리필한다.
</details>

---

## ✅ 핵심 요약 (면접 직전 15초 복습)

- **번들러 존재 이유**: 요청 폭발·전역 충돌·npm 미지원·최적화 부재를 해결. 모듈 그래프를 묶고 트리셰이킹·스플리팅·압축을 붙인다.
- **ESM vs CJS**: ESM은 정적 → 트리셰이킹 가능. 트리셰이킹 원하면 ESM 진입점(`lodash-es`).
- **Vite가 빠른 이유**: dev는 번들링 없이 네이티브 ESM + esbuild 즉석 변환, prod는 Rollup. 초기 구동이 크기와 무관.
- **트리셰이킹**: 안 쓰는 export 제거. ESM+프로덕션+사이드 이펙트 없음이 조건. `sideEffects: false`로 돕고, `import *`·CJS에서 깨진다.
- **코드 스플리팅**: 동적 `import()`·라우트 분리·vendor 분리로 초기 번들↓. React는 `lazy`+`Suspense`(+Error Boundary), Next는 `next/dynamic`.
- **최적화 원칙**: 추측 말고 bundle-analyzer로 측정 → 큰 것부터(무거운 의존성 교체·스플리팅). 전송은 gzip/brotli, 캐싱은 contenthash + immutable, 디버깅은 source map.
- **트랜스파일 ≠ polyfill**: 문법 변환 vs 런타임 API 채우기. browserslist로 타겟 결정. Babel → SWC/esbuild로 고속화.

> 관련 자료: 초기 로딩·렌더링은 `2026-07-20_browser-rendering-performance.md`, 캐시 헤더 설계는 `2026-07-23_network-http-caching-http2-http3-cors.md`, Next.js 스트리밍/청크는 `2026-07-25_nextjs-caching-streaming-isr-ppr.md`, 리렌더 최적화는 `2026-07-16_react-rerender-optimization.md`와 함께 보면 "코드가 사용자 화면이 되기까지"의 전 계층이 연결됩니다.
