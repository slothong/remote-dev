# Remote Dev Server

SSH 연결과 WebSocket 통신을 관리하는 백엔드 서버입니다.

## 기술 스택

- **Express.js** - 웹 프레임워크
- **TypeScript** - 타입 안전성
- **ssh2** - SSH 클라이언트
- **ws** - WebSocket 서버
- **Vitest** - 테스트 프레임워크

## 주요 기능

### SSH 세션 관리
- SSH 연결 생성 및 관리
- 인증 처리 (비밀번호/키 기반)
- 세션 상태 추적

### WebSocket 브릿지
- SSH 셸과 WebSocket 간 양방향 통신
- 터미널 입출력 실시간 전달
- 단일 WebSocket 인스턴스로 효율적 관리

### API 엔드포인트

#### SSH 연결
- `POST /api/ssh/connect` - SSH 연결 생성
- `POST /api/ssh/shell` - 셸 세션 시작
- `POST /api/ssh/disconnect` - SSH 연결 종료

#### Plan 관리
- `GET /api/plan` - plan.md 파싱 결과 조회
- `POST /api/plan/update-check` - 체크박스 상태 업데이트
- `POST /api/plan/add-item` - 항목 추가
- `DELETE /api/plan/delete-item` - 항목 삭제

#### 파일 작업
- `GET /api/file` - 파일 읽기
- `POST /api/file` - 파일 쓰기

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

서버가 다음 포트에서 실행됩니다:
- HTTP API: http://localhost:3000
- WebSocket: ws://localhost:3001

### 빌드

```bash
npm run build
```

빌드된 파일은 `build` 폴더에 생성됩니다.

### 프로덕션 실행

```bash
npm start
```

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

환경 변수를 설정하여 서버 포트를 변경할 수 있습니다:

```bash
PORT=3000              # API 서버 포트
WS_PORT=3001          # WebSocket 서버 포트
```

## 프로젝트 구조

```
server/
├── src/
│   ├── api-server.ts              # Express API 서버
│   ├── websocket-server.ts        # WebSocket 서버
│   ├── ssh-client.ts              # SSH 클라이언트
│   ├── ssh-session.ts             # SSH 세션 관리
│   ├── ssh-shell.ts               # SSH 셸
│   ├── ssh-websocket-bridge.ts    # SSH-WebSocket 브릿지
│   ├── ssh-file-operations.ts     # 파일 작업
│   ├── plan-parser.ts             # plan.md 파서
│   └── index.ts                   # 서버 엔트리포인트
└── build/                         # 빌드 출력
```

## 아키텍처

### SSH 연결 흐름

1. 클라이언트가 `/api/ssh/connect`로 연결 요청
2. 서버가 ssh2를 사용하여 원격 서버에 연결
3. 세션 ID 생성 및 세션 저장
4. 클라이언트에 세션 ID 반환

### WebSocket 통신 흐름

1. 클라이언트가 WebSocket 연결
2. `/api/ssh/shell`로 셸 세션 요청
3. SSH 셸과 WebSocket 브릿지 생성
4. 양방향 데이터 전송 시작

### Plan 파싱

`plan.md` 파일을 파싱하여 섹션과 항목으로 구조화합니다:

```markdown
## 섹션 제목
- [ ] 미완료 항목
- [x] 완료 항목
```

## 코드 스타일

- Google TypeScript Style (gts) 사용
- Prettier 포매팅 자동 적용
- ESLint 규칙 준수

## 보안 고려사항

- SSH 연결 정보는 메모리에만 저장
- 세션은 서버 재시작 시 초기화
- 프로덕션 환경에서는 적절한 인증/인가 구현 필요
