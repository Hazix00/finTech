# Test Technique Klaro - Project Context (from PDF)

## 1) Context
- Role: Fullstack Developer test (Angular / NestJS).
- Product context: B2B SaaS platform helping 300k+ beneficiaries access financial aid.

## 2) Functional Scope
Build a mini module "Demandes d'aide financiere" where:
1. A beneficiary can submit an aid request.
2. A beneficiary can see their own requests and statuses.
3. A manager (back-office) can change request status.

## 3) Minimal Data Model
Entity: `AidRequest`
- `id` (uuid)
- `beneficiaryId` (uuid)
- `category` enum: `HOUSING`, `FOOD`, `HEALTH`, `ENERGY`, `OTHER`
- `amount` (decimal, in EUR)
- `description` (text)
- `status` enum: `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`
- `createdAt`, `updatedAt`

## 4) Backend Requirements (NestJS 9 + PostgreSQL)
Expected API endpoints:
- `POST /aid-requests`
  - Create request
  - Initial status must be `PENDING`
- `GET /aid-requests?beneficiaryId=...&status=...`
  - List requests
  - Filters + pagination required
- `PATCH /aid-requests/:id/status`
  - Update request status
  - Must enforce valid status transitions

Technical constraints:
- NestJS 9.x
- TypeScript strict mode
- PostgreSQL access approach is open (must justify in README)
- DTO validation with `class-validator`
- Clean error handling (coherent HTTP codes, clear errors)
- At least 3 relevant Jest unit tests (especially status transition logic)

Business rules to implement:
- `amount` must be strictly positive and <= 5000 EUR.
- Valid status transitions only:
  - `PENDING -> UNDER_REVIEW` or `REJECTED`
  - `UNDER_REVIEW -> APPROVED` or `REJECTED`
- Any other transition must return explicit HTTP 400.
- A beneficiary cannot have more than 2 active requests simultaneously:
  - active means `PENDING` or `UNDER_REVIEW`.

## 5) Frontend Requirements (Angular 15)
Expected deliverable:
- Angular 15 app with 2 screens:
  1. Beneficiary screen: submission form + own requests list.
  2. Manager screen: all requests list + "change status" action.

Technical constraints:
- Angular 15.2
- TypeScript strict mode
- UI library choice (only one): Angular Material 15 or PrimeNG 15.4
- State management: `BehaviorSubject` in a service (no NgRx)
- API calls via HttpClient + RxJS
- Proper subscription management (`async` pipe or `takeUntilDestroyed`)
- At least 1 relevant Jest unit test (component or service)

Explicitly not required:
- Real Firebase Auth implementation (mock current user ID is enough)
- Perfect responsive behavior
- Animations
- Real Hasura integration
