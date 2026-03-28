# Expo 앱 실행 트러블슈팅

**날짜**: 2026-03-29
**스프린트**: Sprint 00
**상태**: ✅ 완료

---

## 무엇을 했는가

초기 세팅 후 Expo Go에서 Hello World 화면이 뜨지 않았던 문제를 단계적으로 해결했다.
MongoDB Atlas 연결 문제도 함께 해결하여 Sprint 00의 모든 완료 조건을 충족했다.

---

## 왜 이렇게 했는가

- **SDK 버전 통일**: 폰에 설치된 Expo Go가 SDK 54인데 프로젝트는 SDK 52로 세팅돼 있어 호환이 안 됐다. `npx expo install` 로 모든 패키지를 SDK 54 기준으로 맞췄다.
- **진입점 명시**: `package.json`의 `main` 필드가 `expo-router/entry`로 돼 있었는데 expo-router를 쓰지 않아 충돌이 났다. `registerRootComponent`를 호출하는 `index.ts`를 만들고 `main`을 이걸로 바꿨다.
- **app.json 구조 수정**: `expo` 키 없이 최상위에 `plugins`만 있어서 Expo가 앱 이름·설정을 읽지 못했다. `expo` 키 안으로 모든 설정을 옮겼다.
- **MongoDB SRV DNS 우회**: `mongodb+srv://` 형식은 SRV DNS 쿼리를 쓰는데 네트워크에서 막혀 있었다. Atlas에서 직접 연결 주소(`mongodb://`)로 변경해 해결했다.

---

## 작업 흐름 (Workflow)

1. `npm start` 실행 시 `expo-asset` 누락 에러 → `npx expo install`로 설치
2. Expo Go에서 SDK 버전 불일치(52 vs 54) → `npx expo install expo@~54.0.0 --fix`로 업그레이드
3. `babel-preset-expo` 누락 → `npx expo install babel-preset-expo`로 설치
4. `"main" has not been registered` 에러 → `index.ts` 생성 + `main` 필드 수정
5. `app.json` 구조 오류(expo 키 누락) → 수정
6. 빈 흰 화면 → `.expo` 캐시 폴더 삭제 후 `--clear` 옵션으로 재실행 → Hello World 확인
7. MongoDB `querySrv ECONNREFUSED` → SRV 주소 대신 직접 연결 주소로 교체 → 연결 성공

---

## 변경된 파일

| 파일 | 변경 유형 | 설명 |
|------|-----------|------|
| `app/package.json` | 수정 | SDK 54로 업그레이드, main 필드 수정, babel-preset-expo 추가 |
| `app/app.json` | 생성 | expo 설정 키 추가 (name, slug, plugins 등) |
| `app/index.ts` | 생성 | registerRootComponent 진입점 |
| `docs/sprints/sprint-00/sprint-00.md` | 수정 | 작업 목록 완료 체크 |

---

## 다음 작업에서 고려할 것

- 새 프로젝트 시작 시 Expo Go 버전과 SDK 버전을 먼저 맞춰야 한다
- `app.json`은 반드시 `expo` 키 안에 설정을 넣어야 한다
- MongoDB Atlas 연결은 SRV 주소(`mongodb+srv://`) 대신 직접 주소(`mongodb://`) 사용
- `.expo` 캐시가 꼬이면 폴더 삭제 후 `--clear` 옵션으로 재실행
