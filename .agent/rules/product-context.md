---
trigger: model_decision
description: Understanding of general business rules from the project
---

# Product Context: Educational Blogging Platform

## 1. Goal
A high-performance backend for teachers to publish classes (posts) and students to consume them.

## 2. Actors (Roles)
- **Teacher (PROFESSOR):**
  - Can CREATE, EDIT, DELETE own posts.
  - Can manage Categories.
  - Can moderate comments on their posts.
- **Student (ALUNO):**
  - Can READ posts.
  - Can FILTER by Category.
  - Can COMMENT on posts.

## 3. Key Entities
- **User:** Has `id`, `email`, `role` (Teacher/Student).
- **Post:** Has `title`, `content`, `authorId`, `categoryId`.
- **Category:** Grouping entity for posts.
- **Comment:** Linked to a Post and a User.

## 4. Business Rules
- **Privacy:** Users can only edit/delete their OWN resources.
- **Media:** Images are NOT stored in DB. Assume external URLs.
- **Performance:** `GET /posts` (Home) MUST be cached via Redis.