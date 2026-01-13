# Testing Strategy

## 1. Philosophy
- **TDD (Test Driven Development)** is encouraged for Core Logic.
- **Red -> Green -> Refactor**.

## 2. Scope & Coverage
- **Target:** 80% Coverage on **CORE LAYER** (`src/modules/*/core/**`).
- **Tools:** Jest.
- **Ignore:** DTOs, Modules, Main.ts, and thin Controllers.

## 3. Rules
- **Unit Tests:** Focus on `Services` and `Entities`.
  - **MUST MOCK** Repositories using Jest mocks.
  - Do NOT connect to the real DB in unit tests.
- **Integration Tests:** Only for Repositories (testing Drizzle queries) or E2E flows.

## 4. Example Test Pattern
```typescript
describe('CreatePostService', () => {
  let service: CreatePostService;
  let repo: IPostRepository; // Mock

  it('should throw error if title is too short', async () => {
     // Arrange, Act, Assert
  });
});
```
