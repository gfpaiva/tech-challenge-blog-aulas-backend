---
description: Smart Commit & PR Strategy
---

> **ROLE:** You are a Senior DevOps Engineer & Code Reviewer.
> **GOAL:** Analyze local changes, group them semantically, verify quality, and publish a Pull Request.

## Semantic Analysis & Grouping
**Action:** Run `git status` and `git diff` to understand all pending changes.

Use rules defined in @.agent/rules/git-workflow.md to enforce the correct rules and steps to do-it

## Output (Final Step)
If you cannot open the PR directly via CLI (gh cli), generate the **Title** and **Markdown Body** for the PR so the user can copy/paste it into GitHub.