# Remote Dev

브라우저에서 원격 서버에 SSH로 접속하여 개발할 수 있는 웹 기반 원격 개발 환경입니다. Claude Code CLI와 통합하여 AI 기반 개발 워크플로우를 지원합니다.

## 주요 기능

- **브라우저 기반 터미널** - 웹에서 SSH 터미널 사용
- **SSH 연결 관리** - 간편한 SSH 접속 및 세션 관리
- **Plan 체크리스트** - plan.md 파일 기반 작업 관리
- **Claude Code 통합** - Go 버튼으로 Claude CLI 명령 실행
- **실시간 통신** - WebSocket 기반 터미널 입출력

## 스크린샷

### SSH 연결 화면
원격 서버 접속 정보를 입력하여 SSH 연결을 생성합니다.

### 터미널
xterm.js 기반의 완전한 터미널 에뮬레이터를 브라우저에서 사용할 수 있습니다.

### Plan 체크리스트
plan.md 파일의 작업 목록을 체크리스트로 표시하고, Go 버튼으로 Claude Code 명령을 실행할 수 있습니다.

## 기술 스택

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- xterm.js

### Backend
- Express.js
- TypeScript
- ssh2
- WebSocket (ws)

### Testing
- Vitest (단위 테스트)
- Playwright (E2E 테스트)

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn
- SSH 접속 가능한 원격 서버

### 설치

```bash
# 저장소 클론
git clone https://github.com/slothong/remote-dev.git
cd remote-dev

# 의존성 설치
npm install --prefix client
npm install --prefix server
```

### 환경 설정

#### Client 환경 변수

`client/.env` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
```

#### Server 환경 변수 (선택사항)

```bash
export PORT=3000
export WS_PORT=3001
```

### 실행

#### 개발 모드

```bash
# 터미널 1: 서버 실행
cd server
npm run dev

# 터미널 2: 클라이언트 실행
cd client
npm run dev
```

- 클라이언트: http://localhost:5173
- API 서버: http://localhost:3000
- WebSocket: ws://localhost:3001

#### 프로덕션 모드

```bash
# 빌드
npm run build --prefix client
npm run build --prefix server

# 서버 실행
npm start --prefix server

# 클라이언트는 정적 파일 서버로 서빙 (예: nginx, Apache)
```

## 사용법

### 1. SSH 연결

1. 브라우저에서 http://localhost:5173 접속
2. SSH 연결 정보 입력:
   - Host: 원격 서버 주소
   - Port: SSH 포트 (기본 22)
   - Username: 사용자 이름
   - Password 또는 Private Key
3. "Connect" 버튼 클릭

### 2. 터미널 사용

- SSH 연결 후 자동으로 터미널 화면 표시
- 일반 터미널처럼 명령어 입력 가능
- Claude Code CLI가 자동으로 실행됨

### 3. Plan 체크리스트

1. 원격 서버의 `~/remote-dev-workspace/plan.md` 파일 생성
2. 마크다운 형식으로 작업 목록 작성:

```markdown
## Setup
- [ ] 프로젝트 초기화
- [ ] 의존성 설치

## Development
- [ ] 기능 구현
- [x] 테스트 작성
```

3. 웹 UI에서 체크리스트 확인
4. 체크박스 클릭으로 완료 상태 변경
5. Go 버튼으로 해당 항목에 대한 Claude 명령 실행

### 4. Go 버튼 사용

- 각 체크리스트 항목에 Go 버튼 표시
- 클릭하면 `/go [섹션].[항목]` 명령이 터미널로 전송
- 예: 2번째 섹션의 3번째 항목 → `/go 2.3`
- Claude Code CLI가 해당 작업을 자동으로 수행

## 테스트

### 단위 테스트

```bash
# 클라이언트 테스트
npm test --prefix client

# 서버 테스트
npm test --prefix server
```

### E2E 테스트

```bash
# 전체 E2E 테스트
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui

# 특정 브라우저만
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

## 프로젝트 구조

```
remote-dev/
├── client/                 # 프론트엔드
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── services/      # 비즈니스 로직
│   │   └── ...
│   └── package.json
├── server/                # 백엔드
│   ├── src/
│   │   ├── api-server.ts
│   │   ├── ssh-*.ts       # SSH 관련
│   │   └── ...
│   └── package.json
├── e2e/                   # E2E 테스트
├── plan.md                # 프로젝트 계획
└── package.json
```

## 개발

### 코드 스타일

Google TypeScript Style (gts)을 사용합니다:

```bash
# Lint 체크
npm run lint --prefix client
npm run lint --prefix server

# 자동 수정
npm run fix --prefix client
npm run fix --prefix server
```

### 타입 체크

```bash
npm run typecheck
```

## 라이선스

ISC

## 기여

이슈와 PR을 환영합니다!

## 문의

- GitHub Issues: https://github.com/slothong/remote-dev/issues
