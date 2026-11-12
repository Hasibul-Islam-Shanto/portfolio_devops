1. Project Overview & Elevator Pitch
   High-Level Summary

A production-ready, enterprise-grade, serverless URL shortening and link management platform built on AWS. It features a React 19 single-page dashboard for authenticated users to create, manage, and monitor shortened URLs, backed by a high-throughput, low-latency TypeScript REST API running on AWS Lambda, API Gateway, and Amazon DynamoDB. The entire cloud topology is defined as Infrastructure as Code (Terraform) and deployed via continuous integration pipelines (GitHub Actions).

Key Metrics & Highlights
Architecture: Hexagonal (Ports & Adapters) with pure functional programming (no OOP classes, curried dependency injection).
Test Suite: 208 automated tests passing across unit, integration, and UI component layers (172 backend tests + 36 frontend tests).
Scale Potential: 7-character alphanumeric collision-resistant short codes yield ~3.52 trillion unique URLs (
62
7
62
7
).
Cloud Infrastructure: 100% Terraform-managed serverless stack (AWS Lambda, API Gateway HTTP API v2, DynamoDB on-demand, private S3, and CloudFront CDN with Origin Access Control).
Security Hardening: Zero public S3 access, Origin Access Control (OAC), scoped least-privilege IAM execution roles, strict origin-locked CORS, constant-time bcrypt password hashing, and stateless HS256 JWT authentication. 2. System Architecture & Request Flows
Cloud Topology Diagram
Request Flow Paths
Static App Delivery: User visits the dashboard domain
→
→ CloudFront CDN edge cache
→
→ S3 static bucket via Origin Access Control (OAC). Client-side router 403/404 errors are rewritten to 200 /index.html.
Public Link Redirection (GET /{shortCode}): User clicks a short link
→
→ API Gateway passes request to Lambda
→
→ Lambda queries DynamoDB URLs table by partition key (shortCode)
→
→ Lambda returns a fast HTTP 302 Found with the Location: <originalUrl> header.
Authenticated Management (POST /urls, GET /urls, etc.): User performs actions in the dashboard
→
→ Frontend sends Authorization: Bearer <jwt>
→
→ Lambda validates signature with HS256
→
→ extracts user identity from token claims (sub)
→
→ interacts with DynamoDB via secondary indexes (UserUrlsIndex). 3. Backend Architecture & Engineering Design

1. Hexagonal Architecture (Ports and Adapters)

The backend cleanly isolates business logic from external frameworks, AWS SDKs, and transport layers:

src/domain/: Pure entities (UrlRecord, User), domain errors, and repository interfaces/ports (UrlRepository, UserRepository). No AWS or library imports.
src/application/: Use cases (createShortUrl, resolveShortUrl, deleteShortUrl, listShortUrls, signUp, signIn, getCurrentUser). Use cases depend solely on repository ports.
src/infrastructure/: Adapters implementing the ports (DynamoDbUrlRepository, DynamoDbUserRepository, and in-memory test doubles).
src/lambda/: Entry points, HTTP route dispatching, request parsing, and error-to-status code translation.
src/composition.ts: Single composition root wiring concrete dependencies into use cases. 2. Pure Functional Paradigm
No Class Declarations: Use cases are curried higher-order functions: const useCase = (deps) => async (input) => Promise<Result<T, E>>.
Enforced via Linter: An explicit ESLint rule forbids class statements, enforcing referential transparency, modularity, and effortless unit testing.
Dependency Injection: Container dependencies (DynamoDB document client, crypto random generator, system clock) are instantiated once at Lambda cold start and injected into use case factories. 3. Explicit Result<T, E> Monad

Instead of throwing and catching runtime exceptions, expected domain/infrastructure failures return a strongly typed discriminated union:

typescript
type Result<T, E> =
| { success: true; value: T }
| { success: false; error: E };
Error Union: Plain object types: InvalidUrl, InvalidShortCode, UrlNotFound, ShortCodeGeneration, DuplicateEmail, and Repository.
Compile-Time Safety: TypeScript forces the developer to handle both branches.
Safe Error Boundaries: Infrastructure failures wrap low-level errors into generic messages ("A storage error occurred") with the underlying AWS exception retained in cause for private CloudWatch logging, preventing data leakage to clients. 4. Input Validation Boundary (Zod)

All external requests hit runtime schema validation before touching use cases:

URLs must be valid http: or https: protocols with a valid hostname, capped at 2,048 characters (parsed via WHATWG URL parser).
Emails are normalized (lowercased, trimmed) and validated.
Passwords enforce minimum length constraints (8+ characters). 5. Collision-Resistant Short-Code Generation
Alphabet: 62 characters ([a-zA-Z0-9]).
Length: 7 characters.
Entropy:
62
7
≈
3.52
×
10
12
62
7
≈3.52×10
12
(over 3.5 trillion possible codes).
RNG: Uses cryptographically secure pseudorandom number generation (node:crypto.randomInt).
Collision Strategy: ensureUniqueShortCode implements a bounded retry loop (up to 5 attempts). If DynamoDB detects a collision via conditional write (attribute_not_exists(shortCode)), it attempts another code before returning a 409 Conflict. 6. Authentication & Security
Password Storage: Passwords hashed with bcryptjs using a cost factor (salt rounds) of 10.
JWT Issuance: Signed via jose using HS256 HMAC. Access tokens expire in 1 hour (3600s).
Claims: Contains sub (User UUID), iat (issued at), and exp (expiration).
Identity Isolation: The caller's userId is always extracted from the verified token claims. Any client-provided userId in the HTTP request body is ignored. 4. Database Architecture & Data Modeling (DynamoDB)

The project leverages Amazon DynamoDB with on-demand billing (PAY_PER_REQUEST). Two specialized tables are used to decouple lifecycle concerns and simplify access patterns.

Table 1: url-shortener (URLs Table)
Primary Key: shortCode (String, Partition Key).
Global Secondary Index (GSI): UserUrlsIndex
Partition Key: userId (String)
Sort Key: createdAt (String ISO-8601)
Projection: ALL
Data Model:
json
{
"shortCode": "a8Kx92h",
"originalUrl": "https://example.com/very/long/destination/url",
"userId": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
"createdAt": "2026-09-28T12:00:00.000Z"
}
Access Patterns:
Resolve URL (GET /{shortCode}): Direct GetItem by shortCode (single-digit millisecond latency).
Create URL: PutItem with ConditionExpression: "attribute_not_exists(shortCode)" to prevent overwriting existing keys.
List User URLs (GET /urls): Query on UserUrlsIndex where userId = :userId sorted by createdAt DESC (avoids table scans).
Delete URL (DELETE /urls/{shortCode}): Fetches record, verifies ownership (record.userId === caller.userId), then calls DeleteItem.
Unowned URLs: Any legacy link created without a userId remains resolvable publicly but is hidden from dashboard queries.
Table 2: url-shortener-users (Users Table)
Primary Key: userId (String UUID, Partition Key).
Global Secondary Index (GSI): EmailIndex
Partition Key: email (String)
Projection: ALL
Data Model:
json
{
"userId": "usr_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
"email": "developer@example.com",
"passwordHash": "$2a$10$e8Tj4O1...",
"createdAt": "2026-09-28T10:00:00.000Z",
"updatedAt": "2026-09-28T10:00:00.000Z"
}
Access Patterns:
Sign Up: Queries EmailIndex to check uniqueness; writes user via PutItem.
Sign In: Queries EmailIndex by email to retrieve the record and verify password hash.
Profile Lookup (GET /auth/me): Direct GetItem by userId. 5. REST API Specification & HTTP Contract

The API is exposed via AWS API Gateway HTTP API (Payload Format 2.0).

Method Endpoint Access Level Success Code Response Body / Behavior
POST /auth/signup Public 201 Created { "message": "User created successfully" }
POST /auth/signin Public 200 OK { "accessToken": "...", "user": { "userId": "...", "email": "..." } }
GET /auth/me Authenticated 200 OK { "user": { "userId": "...", "email": "..." } }
POST /urls Authenticated 201 Created { "shortCode": "...", "originalUrl": "..." }
GET /urls Authenticated 200 OK { "count": 12, "items": [...] } (Newest first)
GET /urls/{shortCode} Authenticated 200 OK { "shortCode": "...", "originalUrl": "..." } (Owner only)
DELETE /urls/{shortCode} Authenticated 204 No Content Empty (Owner only)
GET /{shortCode} Public 302 Found Redirects via Location: <originalUrl>
Standardized Error Responses
400 Bad Request: Missing body, invalid JSON syntax, invalid URL format, or validation schema failure.
401 Unauthorized: Missing or expired JWT token, or incorrect email/password combination.
404 Not Found: Short code does not exist, or link is not owned by the requesting user.
409 Conflict: Email already registered, or short code collision exhausted retry limits.
500 Internal Server Error: Generic error response; stack traces and AWS SDK errors are suppressed.
CORS Security
Custom Lambda middleware checks incoming origin.
Access-Control-Allow-Origin is dynamically bound to FRONTEND_URL (the CloudFront domain or localhost:5173). Wildcard * is explicitly disallowed.
Preflight OPTIONS requests automatically resolve with 204 No Content and appropriate caching headers. 6. Frontend Architecture & UI/UX
Tech Stack
Framework: React 19 (Hooks, Suspense, Error Boundaries)
Build Tool: Vite 8 (Lightning-fast HMR and Rollup production bundling)
Language: TypeScript (Strict typing across components and API clients)
Routing: React Router 7 (Client-side routing with guarded route wrappers)
Styling: Tailwind CSS 4 (Modern utility-first CSS with CSS variables)
Icons: Lucide React
Testing: Vitest + React Testing Library + jsdom
Folder Architecture (frontend/src/)
app/: Router definition (router.tsx), root container (App.tsx), and context providers.
features/auth/: Auth provider (AuthProvider.tsx), token storage (authStorage.ts), route protection (ProtectedRoute.tsx), and Zod schemas.
features/urls/: Hook for URL state and optimistic updates (use-url-list.ts), and URL validation.
components/ui/: Atomic design system components (Button, Input, Card, Modal, Toast, Badge, Dropdown, Skeleton, EmptyState).
components/auth/: Presentation forms (SignInForm, SignUpForm).
components/urls/: Link management components (UrlForm, UrlList, UrlListItem, UrlStats, CopyButton, DeleteUrlDialog).
components/layout/: Responsive frame (PageFrame, Header, UserMenu, BrandLogo).
services/api/: Typed fetch abstraction layer (client.ts, auth.ts, urls.ts).
Key UI/UX Capabilities
State Management & Custom Hooks: useUrlList encapsulates server fetching, loading states, error handling, and manual revalidation.
Route Guards: ProtectedRoute intercepts navigation. Guests attempting to access /dashboard are routed to /signin. Authenticated users attempting to visit /signin or /signup are redirected to /dashboard.
Accessible Modals & Overlays: The Modal component implements proper WAI-ARIA attributes, traps focus, and listens for the Escape key while restoring focus to the trigger button upon close.
Micro-Interactions:
CopyButton provides instant visual confirmation ("Copied!" with checkmark) with a 2-second timeout return.
Skeleton screens during data loading instead of jarring empty states.
Toast notification system (ToastProvider) for asynchronous success/error reporting. 7. Cloud Infrastructure as Code (Terraform)

All AWS infrastructure is managed with Terraform 1.5+ in modular, reusable blocks.

text
terraform/
├── bootstrap/ # One-time backend provisioning
│ ├── main.tf # S3 state bucket + DynamoDB locks table
│ └── outputs.tf
├── environments/
│ └── prod/ # Root production environment module
│ ├── main.tf # Module invocations & parameter wiring
│ ├── backend.tf # S3 remote state configuration
│ └── outputs.tf # Exports API URL, CloudFront URL, Table names
└── modules/
├── dynamodb/ # Provisions url-shortener & url-shortener-users
├── api-lambda/ # Provisions Lambda, IAM, API Gateway v2
└── static-site/ # Provisions S3 Private Bucket & CloudFront OAC
Module Breakdown
bootstrap/:
Provisions an S3 bucket with server-side AES256 encryption, bucket versioning enabled, and all public access blocked.
Provisions a DynamoDB table terraform-locks (LockID partition key) to guarantee atomic state locking during CI/CD execution.
modules/dynamodb:
Deploys the URLs and Users tables with on-demand scaling.
Configures prevent_destroy = true lifecycle guards to prevent accidental deletion during automated pipelines.
modules/api-lambda:
Creates the Node.js 20 Lambda runtime pointing to backend/url-shortener-lambda.zip.
Uses archive_file / source code hash tracking (source_code_hash = filebase64sha256(...)) so Terraform only triggers updates when binary code changes.
Configures IAM role with least-privilege inline policies granting access only to specific DynamoDB table and GSI ARNs.
Creates HTTP API Gateway v2 with $default stage auto-deploy and sets routes matching the backend handlers.
modules/static-site:
Provisions a private S3 bucket holding Vite build output.
Sets up CloudFront distribution with Origin Access Control (OAC) to prevent direct S3 access.
Configures custom error responses (mapping HTTP 403 and 404 to HTTP 200 /index.html) to enable HTML5 History pushState client routing. 8. CI/CD DevOps Pipelines (GitHub Actions)

Four automated workflows in .github/workflows/ manage validation and continuous deployment:

Workflow Trigger Condition Pipeline Steps Safety Controls
terraform-plan.yml PR touching terraform/** or backend/** 1. Package Lambda zip. 2. Run terraform plan. 3. Output plan summary directly to PR markdown. Read-only; makes zero AWS modifications.
terraform-apply.yml Push to main touching terraform/** 1. Initialize remote state. 2. Execute terraform apply -auto-approve. Shared concurrency group; DynamoDB lock table guard.
deploy-backend.yml Push to main touching backend/** 1. Node 20 environment. 2. Run linter, typecheck, and full test suite. 3. Execute package-lambda.sh. 4. Run terraform apply targeting Lambda to update function code. Requires passing tests before deployment.
deploy-frontend.yml Push to main touching frontend/** 1. Node 22 environment. 2. Run linter, typecheck, and Vitest suite. 3. Extract api_invoke_url from Terraform output. 4. Inject VITE_API_BASE_URL and build static assets. 5. Sync frontend/dist to S3 bucket with --delete. 6. Create CloudFront cache invalidation (/*). Atomic cache invalidation guarantees users receive new assets. 9. Quality Assurance & Test Engineering

The codebase is backed by 208 automated tests:

Backend Test Coverage (172 Tests, 19 Suites)
Domain Tests (tests/domain/): Asserts immutability of UrlRecord and validation of error union types.
Validation Tests (tests/validation/): 32 distinct tests evaluating URI schemes, localhost edge cases, maximum length limits, query parameters, and WHATWG parser quirks.
Application Use Case Tests (tests/application/): Tests sign-up, sign-in, URL creation, URL listing, ownership validation, and bounded retry loops using deterministic fake clocks and fake generators.
Infrastructure Tests (tests/infrastructure/): Verifies DynamoDbUrlRepository commands (PutItem, GetItem, Query) using a mock DynamoDB document client without touching real AWS resources.
Lambda Integration Tests (tests/lambda/): Mocks API Gateway v2 payload events and validates exact HTTP status codes, CORS headers, JSON payloads, and 302 redirects.
Optional Live Integration (tests/integration/): Integration tests against a real DynamoDB instance configured via environment variables.
Frontend Test Coverage (36 Tests, 9 Suites)
Component Tests: Verifies rendering, accessibility, and interaction of SignInForm, SignUpForm, UrlForm, UrlList, and Modal.
Async & Feedback Tests: Tests clipboard copy timeout transitions, loading skeleton rendering, and inline validation error messages.
Route Guard Tests: Asserts navigation flow for authenticated vs. unauthenticated visitors across protected routes. 10. Key Talking Points for Interviews & Portfolio Showcase

When summarizing this project for your portfolio or discussing it in engineering interviews, emphasize these specific design decisions:

Architecture Over Hype (Hexagonal & Functional):

"I chose Hexagonal Architecture with pure functions rather than bloated OOP classes. This decoupled the business rules from AWS Lambda and DynamoDB, allowing me to run 172 backend unit tests in under 900ms without touching the network or mocking complex SDK classes."

Serverless Cost & Scale Optimization:

"The entire system is serverless and on-demand. DynamoDB uses pay-per-request capacity, Lambda scales to zero when idle, and frontend assets are distributed globally via CloudFront edge caches. Base running cost when idle is practically $0/month, yet it effortlessly scales to millions of redirects."

Production-Ready Security Discipline:

"Security was integrated into the foundational design: the S3 bucket is completely private behind CloudFront Origin Access Control, passwords use constant-time bcrypt hashing, JWT secrets are never exposed to the client, database writes enforce strict tenancy boundaries, and CORS explicitly locks down allowed origins."

Single Source of Truth with IaC:

"Every cloud resource—from IAM roles and DynamoDB global secondary indexes to the API Gateway routes and CloudFront distribution—is versioned in Terraform. Deployments are fully automated through GitHub Actions with remote state locking to eliminate human error."
