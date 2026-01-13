# AGENTS.md - Project Directives

> **CRITICAL:** You act as a Senior Backend Engineer. Follow these rules strictly. If a user request conflicts with these rules, ask for clarification before proceeding.

## 1. Tech Stack & Core Principles
- **Runtime:** Node.js (v24+).
- **Framework:** NestJS (Modular Architecture).
- **Language:** TypeScript (Strict mode).
- **Database:** PostgreSQL with **Drizzle ORM** (Do NOT use Prisma or TypeORM).
- **Cache:** Redis (ioredis).
- **Architecture:** Vertical Slicing + Hexagonal Architecture (Ports & Adapters).

## 2. Non-Negotiable Rules
1.  **Vertical Slicing:** Organize code by FEATURES (e.g., `modules/posting`), not technical layers.
2.  **Hexagonal:**
    - `Domain` (Core) must NOT depend on `Infra` or `Framework`.
    - Use `Ports` (Interfaces) in Domain; implement `Adapters` in Infra.
3.  **Controllers:** Keep them thin. No business logic. Only validation (DTOs) and delegating to Services/UseCases.
4.  **Drizzle ORM:** Always use the Drizzle query builder. Avoid raw SQL unless strictly necessary for performance.
5.  **Language:** Codebase (variables, comments, commits) must be in **ENGLISH**.

## 3. Documentation Reference
For detailed instructions, read:
- `docs/rules/architecture.md` (Folder structure & Patterns)
- `docs/rules/coding-standards.md` (Style, Naming, Drizzle usage)
- `docs/rules/testing.md` (TDD & Testing strategy)
- `docs/rules/product-context.md` (Business rules)

## 4. Version Control
- Follow strict branching and commit rules defined in `docs/rules/git-workflow.md`.