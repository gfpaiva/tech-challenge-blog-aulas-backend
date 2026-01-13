# Git Workflow & Standards

> **STRICT:** Agents must follow these rules before creating branches or committing code. Consistency is mandatory.

## 1. Branching Strategy
Branches must be named based on the **Intent** and the **Module/Context** (Vertical Slicing).

### Format
`type/module/short-description`

### Allowed Types
- `feat`: New features.
- `fix`: Bug fixes.
- `refactor`: Code restructuring without behavior change.
- `docs`: Documentation only changes.
- `chore`: Build process, dependency updates, config.

### Examples
- ✅ `feat/posting/create-post` (Feature in Posting module)
- ✅ `fix/auth/jwt-expiration` (Fix in Auth module)
- ✅ `refactor/infra/drizzle-client` (Refactor in Infra layer)
- ❌ `add-login` (Missing type and module)
- ❌ `dev/guilherme/stuff` (Personal names forbidden)

## 2. Commit Convention
Follow **Conventional Commits** strictly.

### Format
`type(scope): description`

- **type:** Same as branch types (`feat`, `fix`, etc.).
- **scope:** The specific file, class, or sub-feature changed (optional but recommended).
- **description:** Imperative, lower case, no dot at the end.

### Atomic Commits Rules
1.  **Single Context:** Do not mix a "fix" for Auth with a "feat" for Posts in the same commit.
2.  **Formatting:** If you ran Prettier, commit it as `style:` or `chore:`, do not mix with logic changes.
3.  **History Check:** Before committing, analyze `git log` to ensure your style matches the project's history.

### Examples
- ✅ `feat(posting): add create post endpoint`
- ✅ `fix(auth): handle expired token error`
- ✅ `chore(deps): update nestjs to v10`

## 3. Pre-Push Quality Gate
**NEVER** push code that breaks the build. Before pushing, the Agent/Developer MUST run:

1.  **Lint:** Ensure no ESLint warnings/errors.
2.  **Build:** Ensure `pnpm run build` succeeds.
3.  **Test:** Ensure `pnpm run test` (and `test:e2e` if applicable) passes.

## 4. Pull Requests
1.  Open PR targeting the `main` branch.
2.  Title must follow Conventional Commits.
3.  **MANDATORY:** Fill the `PULL_REQUEST_TEMPLATE.md` completely.
4.  Self-review your code before requesting review.