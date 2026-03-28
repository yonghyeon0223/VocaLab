# Sprint 00 — 프로젝트 세팅

**기간**: Sprint 00
**목표**: 코드를 한 줄 짜기 전에 실행 가능한 기본 환경을 만들고, Expo Go에서 Hello World를 확인한 뒤 GitHub에 올린다

---

## 작업 목록

- [ ] 폴더 구조 생성 (app / server / shared / docs)
- [ ] TypeScript 설정 (tsconfig.json — app, server, shared 각각)
- [ ] server 기본 세팅 (Express 앱 진입점, 환경변수 로딩)
- [ ] MongoDB 연결 확인 (native driver로 ping 테스트)
- [ ] shared/types.ts 뼈대 작성 (도메인 용어 타입만, 구현 없음)
- [ ] app 기본 세팅 (Expo 초기화, 화면에 "Hello World" 출력)
- [ ] 환경변수 파일 (.env.example 작성, .gitignore 설정)
- [ ] GitHub 레포지토리에 초기 커밋 푸시

---

## 완료 조건 (Definition of Done)

- `server` 실행 시 "서버가 [PORT]에서 실행 중입니다" 로그 출력
- MongoDB 연결 성공 로그 출력
- Expo Go 앱에서 "Hello World" 텍스트 화면에 표시됨
- TypeScript 컴파일 에러 없음
- .env 파일이 git에 올라가지 않음
- GitHub 레포지토리에 코드가 올라가 있음

---

## 이번 스프린트에서 하지 않는 것

- 인증 구현 (→ Sprint 01)
- 실제 API 엔드포인트 구현 (→ Sprint 01~)
- UI 디자인 (→ 기능 구현 후)
- shared/types.ts 세부 타입 완성 (→ 각 스프린트마다 추가)
- 네비게이션 구조 (→ Sprint 01)

---

## 참고 정보

- **GitHub 레포**: https://github.com/yonghyeon0223/VocaLab.git