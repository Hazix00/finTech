# Klaro Test - Todo List

## A) Must Have (core scope)
- [x] Enforce backend business rules:
  - [x] amount > 0 and amount <= 5000
  - [x] valid status transitions only
  - [x] max 2 active requests per beneficiary (`PENDING`, `UNDER_REVIEW`)
- [x] Add explicit 400 errors for invalid transitions/rule violations.
- [x] Add backend unit tests (at least 3 relevant Jest tests).
- [x] Add frontend unit test (at least 1 relevant Jest test).

## B) Frontend Completion
- [x] Wire beneficiary form submit to `POST /aid-requests`.
- [x] Load beneficiary own requests with filters/pagination.
- [x] Wire manager screen to list all requests.
- [x] Wire manager status update action to `PATCH /aid-requests/:id/status`.
- [x] Show basic success/error messages to user.

## C) Quality and Docs
- [x] Review DTO validation messages for clarity.
- [x] Finalize README reflection answers (3 required questions).
- [x] Add "known limitations / what I would do with more time" section.

## D) Delivery Checklist
- [x] Verify app runs with `docker compose up --build`.
- [x] Verify local run commands still work for backend and frontend.
- [x] Quick manual test of main flow (create -> list -> status update).

## E) Notes
- Reference source requirements in `PROJECT_CONTEXT_PDF.md`.
- Keep this file updated after each work session.
