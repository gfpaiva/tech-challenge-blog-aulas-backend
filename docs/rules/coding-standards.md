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
- Use NestJS HttpException or custom Domain Exceptions.
- Do not let Database Errors leak to the Controller. Catch them in Repository and throw Domain Errors.