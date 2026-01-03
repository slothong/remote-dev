# Remote Dev Client

브라우저 기반 원격 개발 환경의 프론트엔드 애플리케이션입니다.

## 기술 스택

- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구
- **Tailwind CSS v4** - 스타일링
- **xterm.js** - 터미널 에뮬레이터
- **Vitest** - 테스트 프레임워크

## 주요 기능

### SSH 연결 관리
- SSH 연결 정보 입력 폼
- 연결 상태 표시
- 세션 관리

### 터미널
- 브라우저 기반 터미널 인터페이스
- WebSocket을 통한 실시간 입출력
- xterm.js 기반 터미널 에뮬레이션

### Plan 체크리스트
- plan.md 파일 기반 작업 목록
- 체크박스로 진행 상황 관리
- Go 버튼으로 Claude Code CLI 명령 실행
- 항목 추가/삭제 기능

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

### 테스트

```bash
# 테스트 실행
npm test

# 테스트 watch 모드
npm run test
```

### Lint

```bash
# Lint 체크
npm run lint

# Lint 자동 수정
npm run fix
```

## 환경 변수

`.env` 파일을 생성하여 다음 환경 변수를 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
```

## 프로젝트 구조

```
client/
├── src/
│   ├── components/       # React 컴포넌트
│   │   ├── checklist.tsx
│   │   ├── ssh-connection-form.tsx
│   │   └── terminal.tsx
│   ├── services/         # 비즈니스 로직
│   │   ├── ssh-service.ts
│   │   └── websocket-manager.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
└── index.html
```

## 코드 스타일

- Google TypeScript Style (gts) 사용
- Prettier 포매팅 자동 적용
- ESLint 규칙 준수
