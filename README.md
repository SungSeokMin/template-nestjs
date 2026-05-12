# NestJS Template

NestJS 프로젝트 초기 셋팅용 보일러플레이트 템플릿.

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | NestJS 11 |
| Language | TypeScript 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Auth | JWT (access 24h / refresh 30d) |
| Logging | Winston |
| API Docs | Swagger |
| Package Manager | pnpm |
| Container | Docker (multi-stage) |
| CI | GitHub Actions |

## 프로젝트 구조

```
src/
├── main.ts                          # 앱 진입점 (Swagger, ValidationPipe, CORS)
├── app.module.ts                    # 루트 모듈 (ConfigModule, BearerTokenMiddleware)
├── app.controller.ts                # GET /health
├── common/
│   ├── common.module.ts             # @Global 모듈
│   ├── const/
│   │   └── env.const.ts             # 환경변수 키 상수
│   ├── decorators/
│   │   ├── user-id.decorator.ts     # @UserId() — 인증된 userId 주입
│   │   ├── authorization.decorator.ts # @Authorization() — raw Authorization 헤더 추출
│   │   ├── bearer.decorator.ts      # @BearerRequired(), @BearerOptional()
│   │   ├── skip-logging.decorator.ts  # @SkipLogging() — 로깅 제외
│   │   └── api-error-response.decorator.ts # @ApiErrorResponse(...errors)
│   ├── dto/
│   │   ├── page-request.dto.ts      # 페이지네이션 요청 (page, pageSize, skip)
│   │   └── page-result.dto.ts       # 페이지네이션 응답 (items, hasNext)
│   ├── exceptions/
│   │   ├── business.exception.ts    # BusinessException (HttpException 확장)
│   │   └── error-code.enum.ts       # ErrorCode 정의
│   ├── filters/
│   │   └── http-exception.filter.ts # 전역 예외 필터 → { code, message }
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # 인증 필수 가드
│   │   └── jwt-auth-optional.guard.ts # 인증 선택 가드
│   ├── interceptors/
│   │   └── logging.interceptor.ts   # HTTP 요청/응답 로깅
│   ├── logger/
│   │   └── winston.config.ts        # Winston 설정 (local: colorize / prod: JSON)
│   ├── middleware/
│   │   └── bearer-token.middleware.ts # Bearer 토큰 → req.user 파싱
│   └── services/
│       ├── jwt-util.service.ts      # JWT 발급/검증
│       └── prisma.service.ts        # PrismaClient 래퍼
└── auth/
    ├── auth.module.ts
    ├── auth.service.ts
    ├── auth.controller.ts           # POST /auth/refresh
    ├── decorator/
    │   └── auth-docs.decorator.ts   # @ApiRefreshAuth
    └── dto/
        ├── refresh.dto.ts
        └── token-response.dto.ts
```

## 시작하기

### 사전 요구사항

- Node.js 20+
- pnpm 9+
- Docker

### 1. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 값을 채운다.

```env
ENV=local
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/template_db"
JWT_SECRET=your-secret-key-here
HASH_ROUNDS=10
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 데이터베이스 실행

```bash
docker-compose up -d
```

### 4. 마이그레이션 적용

```bash
pnpm prisma:migrate:dev --name init
```

### 5. 개발 서버 실행

```bash
pnpm start:dev
```

- API: http://localhost:3000
- Swagger: http://localhost:3000/docs
- Health: http://localhost:3000/health

## 환경별 실행

| 환경 | ENV 값 | 환경변수 파일 | 실행 명령 |
|------|--------|--------------|----------|
| 로컬 | `local` | `.env` | `pnpm start:dev` |
| 개발 | `dev` | `.env.development` | `ENV=dev node dist/main` |
| 운영 | `prod` | `.env.production` | `ENV=prod node dist/main` |

## 주요 명령어

```bash
# 개발
pnpm start:dev          # 개발 서버 (watch mode)
pnpm start:debug        # 디버그 모드

# 빌드
pnpm build
pnpm start:prod         # 빌드 후 실행

# 테스트
pnpm test               # 단위 테스트
pnpm test:cov           # 커버리지

# 코드 품질
pnpm format             # Prettier 포맷
pnpm lint               # ESLint

# Prisma
pnpm prisma:generate              # 클라이언트 생성
pnpm prisma:migrate:dev --name <slug>  # 마이그레이션 생성
pnpm prisma:migrate:deploy        # 마이그레이션 적용 (운영)
pnpm prisma:studio                # Prisma Studio
```

## 아키텍처 규칙

### 에러 처리

`HttpException`을 직접 throw하지 않는다. 반드시 `BusinessException`을 사용한다.

```typescript
// ❌
throw new HttpException('Not found', 404);

// ✅
throw new BusinessException(ErrorCode.NOT_FOUND_USER);
```

새 에러 코드는 `src/common/exceptions/error-code.enum.ts`의 `ErrorCode`에 추가한다.

```typescript
NOT_FOUND_USER: {
  code: 'NOT_FOUND_USER',
  message: '사용자를 찾을 수 없습니다.',
  status: HttpStatus.NOT_FOUND,
},
```

에러 응답 형식은 항상 `{ code, message }`다.

### 인증/인가

| 컴포넌트 | 역할 |
|---------|------|
| `BearerTokenMiddleware` | 모든 요청에서 Bearer 토큰 파싱 → `req.user = { userId }` |
| `JwtAuthGuard` | 인증 필수 엔드포인트에 `@UseGuards(JwtAuthGuard)` |
| `JwtAuthOptionalGuard` | 인증 선택 엔드포인트에 `@UseGuards(JwtAuthOptionalGuard)` |
| `@UserId()` | 컨트롤러 파라미터에서 `userId`(BigInt) 추출 |

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
@ApiBearerRequired()
getMe(@UserId() userId: bigint) {
  return this.userService.findById(userId);
}
```

### Swagger 문서화

각 모듈에 `decorator/[module]-docs.decorator.ts`를 두고 엔드포인트별 `@ApiXXX` 데코레이터를 합성한다.
컨트롤러에는 `@ApiTags`와 합성 데코레이터만 사용한다.

```typescript
// user/decorator/user-docs.decorator.ts
export const ApiGetMe = () =>
  applyDecorators(
    BearerRequired(),
    ApiOperation({ summary: '내 정보 조회' }),
    ApiResponse({ status: HttpStatus.OK, type: UserResponseDto }),
    ApiErrorResponse(ErrorCode.UNAUTHORIZED, ErrorCode.NOT_FOUND_USER),
  );

// user/user.controller.ts
@ApiTags('User')
@Controller('users')
export class UserController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiGetMe()
  getMe(@UserId() userId: bigint) { ... }
}
```

### 페이지네이션

```typescript
// Controller
@Get()
async list(@Query() query: PageRequestDto) {
  const items = await this.service.findMany({
    skip: query.skip,
    take: query.pageSize + 1,  // hasNext 판단을 위해 +1
  });
  return PageResultDto.of(items, query.page, query.pageSize);
}
```

### 새 모듈 추가 체크리스트

- [ ] `nest g module [name]` / `nest g service [name]` / `nest g controller [name]`
- [ ] `[name]/decorator/[name]-docs.decorator.ts` 생성
- [ ] `app.module.ts`에 모듈 등록
- [ ] 필요한 에러 코드 `error-code.enum.ts`에 추가
- [ ] `prisma/schema.prisma` 스키마 추가 후 마이그레이션

## Docker

```bash
# 로컬 빌드 및 실행
docker build -t template-nestjs .
docker run -p 3000:3000 --env-file .env.production template-nestjs
```

컨테이너 시작 시 `prisma migrate deploy`가 자동 실행된다.

## CI

`main`, `dev` 브랜치로의 PR 시 자동 실행된다.

```
install (--ignore-scripts) → prisma generate → build → test
```
