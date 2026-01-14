# Architecture & Folder Structure

## Pattern: Vertical Slicing with Hexagonal Arch

### 1. Directory Tree (example)
```text
src/
├── app.module.ts
├── main.ts
├── common/                  # Shared logic (Decorators, Filters, Global Pipes)
├── config/                  # Envs & Configuration
└── modules/
    ├── auth/                # Feature: Authentication
    └── posts/             # Feature: Blog Posts (Example)
        ├── api/             # PRIMARY ADAPTERS (Entry points)
        │   ├── controllers/
        │   └── dtos/        # Input Validation (class-validator)
        ├── core/            # DOMAIN LAYER (Pure TS, No NestJS deps)
        │   ├── entities/    # Domain Models (Rich models, methods allowed)
        │   ├── ports/       # Interfaces (e.g., IPostRepository)
        │   └── services/    # Use Cases / Application Services
        └── infra/           # SECONDARY ADAPTERS (External world)
            ├── database/    # Drizzle Repositories (implements Ports)
            └── mappers/     # Domain <-> Persistence Mappers
```

### 2. Dependency Rules
- API depends on Core.
- Infra depends on Core.
- Core depends on Nothing (Pure TypeScript).
- AppModule imports Feature Modules (PostingModule).

### NestJS Specifics
Dependency Injection: Bind `Ports` to `Adapters` in the Module's `providers` array using `{ provide: IPostRepository, useClass: DrizzlePostRepository }`. And can be switched by config if needed.
