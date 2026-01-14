# Project Commands & Package Manager Rules

> **CRITICAL INSTRUCTION FOR AGENTS:**
> This project **STRICTLY** uses **pnpm** via Corepack.
> ❌ **DO NOT** use `npm` or `yarn` commands.
> ❌ **DO NOT** generate `package-lock.json` or `yarn.lock`.
> ✅ **ALWAYS** use `pnpm add`, `pnpm install`, and `pnpm run`.

## 1. Package Management
If you need to install dependencies, follow these patterns:

- **Install all dependencies:**
  ```bash
  pnpm install
  ```
- **Add a production dependency:**
  ```bash
  pnpm add <package-name>
  ```
- **Add a development dependency:**
  ```bash
  pnpm add -D <package-name>
  ```

## Project Scripts
Use the following commands to interact with the application. Always prefix with `pnpm run` (e.g., `pnpm run start:dev`).

**A. Development & Execution**
| Command | Script | Description | Use Case |
| :--- | :--- | :--- | :--- |
| `start:dev` | `nest start --watch` | Starts the app in watch mode. It restarts automatically upon file changes. | Primary command for local development and coding sessions. |
| `start:debug` | `nest start --debug --watch` | Starts the app in debug mode (attaches debugger port). | When you need to troubleshoot complex logic or inspect variables in runtime. |
| `start` | `nest start` | Runs the app once without watching for changes. | Rarely used in dev; mostly for quick checks. |
| `start:prod` | `node dist/main` | Runs the built application from the dist folder. | To simulate the production environment locally (requires `pnpm run build` first). |

**B. Quality Assurance & Testing**
| Command | Script | Description | Use Case |
| :--- | :--- | :--- | :--- |
| `lint` | `eslint ... --fix` | Runs static analysis and automatically fixes fixable style issues. | MANDATORY before committing any code. |
| `format` | `prettier --write ...` | Formats code style (indentation, quotes, etc.). | Run alongside lint to ensure code style compliance. |
| `test` | `jest` | Runs all unit tests once. | To verify logic correctness before pushing. |
| `test:watch` | `jest --watch` | Runs tests related to changed files in loop. | During TDD (Test Driven Development) cycles. |
| `test:cov` | `jest --coverage` | Generates a coverage report. | To check if the 80% coverage rule (Core Domain) is being met. |
| `test:e2e` | `jest ... e2e.json` | Runs End-to-End tests against a running instance/container. | To validate full API flows (Controller -> DB). |
| `test:debug` | `node --inspect-brk ... jest` | Runs Jest with inspector attached. | When a specific unit test is failing and you need to step through lines. |

**C. Build**
| Command | Script | Description | Use Case |
| :--- | :--- | :--- | :--- |
| `build` | `nest build` | Compiles TypeScript to JavaScript in the dist/ folder. | Before start:prod or when preparing Docker images. |

## 3. Agent Workflow Checklist
Before finishing a task or submitting a PR, the Agent must execute this sequence:

pnpm run format (Standardize style)

pnpm run lint (Fix static errors)

pnpm run test (Ensure no regressions)

pnpm run build (Ensure compilation validity)
