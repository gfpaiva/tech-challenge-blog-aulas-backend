---
trigger: model_decision
description: When writing code to enforce Coding Style, Naming, Drizzle usage
---

# Coding Standards

## 1. Naming Conventions
- **Classes:** `PascalCase` (e.g., `CreatePostService`).
- **Methods/Variables:** `camelCase`.
- **Files:** `kebab-case.ts` (e.g., `create-post.service.ts`).
- **Interfaces (Ports):** Prefix with `I` (e.g., `IPostRepository`).
- **DTOs:** Suffix with `Dto` (e.g., `CreatePostDto`).

## 2. TypeScript & Style
- Prefer `type` over `interface` for data structures.
- Always explicit return types for functions.
- Use `async/await` (avoid `.then()`).
- Use **Custom Decorators** for request context (e.g., `@CurrentUser()`).
- Prioritize path aliases for imports (e.g., `@common/ports/cache.port`).
- Avoid too many comments on code, keep code self-explanatory eliminating necessity for comments.
- Avoid to use interface or object as method/function parameters when arguments are less than 2.
- Prioritize every that a type is reusable create them in `src/common/types` and use it along the project.

## 3. Drizzle ORM Guidelines
- Define schema in `src/infra/database/schema.ts`.
- Use **Drizzle Query Builder** API.
- **NEVER** expose Database Entities directly to the Controller. Map them to Domain Entities or Response DTOs.
- Example:
  ```typescript
  // Good
  await db.select().from(posts).where(eq(posts.id, id));
  ```

## 4. Error Handling
- Always use custom Domain Exceptions on core layer, never use NestJS exceptions except on controllers or other NestJS layers.
- Do not let Database Errors leak to the Controller. Catch them in Repository and throw Domain Errors.