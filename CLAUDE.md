## 언어

모든 응답은 한국어로 대답한다.

## 개발 워크플로우

모든 API 기능은 아래 순서를 고정으로 따른다. 단계를 건너뛰거나 순서를 바꾸지 않는다.

### 1. API 설명 (사용자 → Claude)

사용자가 API의 목적, 요청/응답 구조, 비즈니스 규칙, 엣지 케이스를 설명한다.
모호한 부분이 있으면 다음 단계로 넘어가기 전에 반드시 질문한다.

### 2. 플랜 작성 및 컨펌

- 플랜 모드에서 관련 코드를 탐색하고 구체적인 구현 계획을 작성한다.
- 계획에는 예상 에러 포인트(타입 불일치, null 가능성, 트랜잭션 경계, 권한 누락 등)를 함께 정리한다.
- 계획을 사용자에게 제시하고, **명시적인 승인을 받은 후에만** 코드를 작성한다.

### 3. 구현

- 2단계에서 승인된 범위만 구현한다. 임의로 범위를 확장하지 않는다.
- 이 파일의 아키텍처 규칙(에러 처리, 인증, Prisma 컨벤션 등)을 모두 준수한다.

### 4. 자체 코드 검토 (에러 포인트 점검)

구현 직후, 아래 항목을 코드에서 직접 확인하고 발견된 문제는 즉시 수정한다.

- **null / undefined 접근**: 없을 수 있는 값을 체크 없이 사용하는 곳
- **타입 불일치**: DTO ↔ 서비스 ↔ DB 간 필드 타입이 맞는지
- **트랜잭션 누락**: 두 개 이상의 DB 쓰기가 atomic하게 묶여 있는지
- **권한 / 인증 누락**: 가드가 빠진 엔드포인트 없는지
- **enum 오타**: 정의된 enum 값과 실제 사용 값이 일치하는지
- **비동기 처리**: `await` 누락, Promise 미처리 없는지
- **엣지 케이스**: 빈 배열, 0, 중복 요청 등 경계값에서 코드가 올바르게 동작하는지

점검 결과(이상 없음 또는 수정 내역)를 사용자에게 간략히 보고한다.

### 5. 테스트 코드 작성

- 4단계에서 식별된 에러 포인트를 포함해 테스트 케이스를 작성한다.
- 정상 흐름(happy path)과 주요 실패 케이스를 모두 커버해야 한다.

### 6. 테스트 실행 및 API 검증

- 테스트 스위트를 실행하고 전부 통과하는지 확인한다 (`pnpm test`).
- 개발 서버를 실행하고 (`pnpm start:dev`) curl 또는 HTTP 클라이언트로 실제 API를 호출해 엔드투엔드 동작을 검증한다.
- 어떤 테스트가 통과했고, API가 어떤 응답을 반환했는지 결과를 보고한다.
- 실패가 발생하면 원인을 분석하고 수정 후 다시 검증한다.

### 7. 커밋 메시지 및 PR 설명 작성

- Conventional Commits 형식으로 커밋 메시지를 작성한다 (`type(scope): 요약`).
- PR 설명은 변경 내용, 변경 이유, 테스트 방법을 포함한다.
- 사용자의 승인 전에는 push하거나 PR을 열지 않는다.

## 코딩 컨벤션

### 패키지 매니저

반드시 pnpm을 사용한다.

- `npm install` → `pnpm add`
- `npm run` → `pnpm run` (또는 `pnpm <script>`)

### 마이그레이션

Prisma 마이그레이션 파일을 직접 생성하거나 수정하지 않는다.
스키마 변경 후 `pnpm prisma:migrate:dev --name <slug>`로 생성한다.
마이그레이션 적용은 사용자가 명시적으로 요청하지 않는 한 하지 않는다.

### 분기문 규칙

- `else` 금지. `if (condition) return;` 형태의 early return을 사용한다.
- `if ... return` 뒤의 `else` 사용 금지.
- 인라인 삼항 연산자는 허용. `x ? a : b` 는 사용 가능.

### TypeScript 스타일

- Line length: 100 (`.prettierrc` 기준)
- 사용자 대면 에러 메시지는 한국어로 작성
- 줄임말 사용 금지 — `org_type` → `organizationType`, `Org` → `Organization`

### 커밋 메시지

- 커밋 전 `pnpm format` 필수
- Conventional Commits 형식: `<type>[(<scope>)]: <description>`
- 허용 타입: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `ci`, `perf`, `build`
- description은 소문자로 시작, 마침표 없음

### 테스트

이 프로젝트는 Jest를 사용한다 (`pnpm test`). 커버리지 최소 80%.

## 에러 처리

`BusinessException` (`HttpException` 확장)을 사용하고, 에러 코드는 [`src/common/exceptions/error-code.enum.ts`](src/common/exceptions/error-code.enum.ts)의 `ErrorCode`에서 가져온다.
`HttpException`을 직접 throw하지 않는다.

새로운 에러 코드 추가 시 `ErrorCode` 객체에 `{ code, message, status }` 형태로 추가한다.

## 인증/인가

- **`BearerTokenMiddleware`**: 모든 요청에서 `Authorization: Bearer <token>` 헤더를 파싱해 `req.user = { userId }`에 저장한다.
- **`JwtAuthGuard`**: `req.user.userId`가 없으면 `UNAUTHORIZED` 예외를 던진다. 인증이 필요한 엔드포인트에 사용.
- **`JwtAuthOptionalGuard`**: 항상 통과. 인증 여부와 관계없이 접근 가능한 엔드포인트에 사용.
- **`@UserId()`**: 인증된 사용자의 `userId`(BigInt)를 파라미터로 주입. 없으면 자동으로 `UNAUTHORIZED` 예외 발생.

## Swagger 문서화

각 모듈은 `decorator/[module]-docs.decorator.ts` 파일을 갖는다.
엔드포인트별 `@ApiXXX` 데코레이터를 이 파일에서 `applyDecorators`로 합성하고,
컨트롤러에서는 합성 데코레이터 하나만 사용한다.

### 구조 원칙

- **컨트롤러**: 비즈니스 로직에 집중, Swagger 애노테이션 없음 (단, `@ApiTags`는 컨트롤러 클래스에 직접 사용)
- **docs 데코레이터**: `applyDecorators`로 `ApiOperation`, `ApiResponse`, `ApiErrorResponse` 합성

### 예시

```typescript
// feature/decorator/feature-docs.decorator.ts
export const ApiGetFeature = () =>
  applyDecorators(
    BearerRequired(),
    ApiOperation({ summary: '기능 조회' }),
    ApiResponse({ status: HttpStatus.OK, type: FeatureResponseDto }),
    ApiErrorResponse(ErrorCode.NOT_FOUND, ErrorCode.UNAUTHORIZED),
  );

// feature/feature.controller.ts
@ApiTags('Feature')
@Controller('features')
export class FeatureController {
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiGetFeature()
  getFeature(@Param('id') id: string) { ... }
}
```

### 사용 데코레이터

| 데코레이터                     | 위치            | 용도                                 |
| ------------------------------ | --------------- | ------------------------------------ |
| `@ApiTags`                     | 컨트롤러 클래스 | 태그 그룹핑                          |
| `@ApiOperation`                | docs decorator  | 엔드포인트 요약/설명                 |
| `@ApiResponse`                 | docs decorator  | 성공 응답 스키마                     |
| `@ApiErrorResponse(...errors)` | docs decorator  | 실패 응답 (ErrorCode 기반 자동 생성) |
| `@BearerRequired()`            | docs decorator  | Bearer 인증 필요 표시                |
| `@BearerOptional()`            | docs decorator  | Bearer 인증 선택 표시                |
