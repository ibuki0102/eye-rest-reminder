# AGENTS.md

## Project Overview

This is a desktop eye-break reminder application built with:

- Tauri
- Vue 3
- TypeScript
- Rust

Keep implementations simple and appropriate for a small desktop utility.

## Frontend

Frontend code is located under `src/`.

- Use Vue 3 Composition API.
- Use `<script setup lang="ts">`.
- Prefer TypeScript over JavaScript.
- Follow the existing component structure and naming conventions.
- Avoid unnecessary dependencies.

## Tauri / Rust

Tauri code is located under `src-tauri/`.

- Follow idiomatic Rust conventions.
- Prefer existing Tauri APIs and plugins before introducing custom native code.
- Keep Rust-side logic minimal unless native functionality requires it.

## Formatting

Always format modified source files before completing a task.

For frontend files:

    npm run format

For Rust files:

    cargo fmt

Do not leave minified, compressed, or single-line source code.

## Validation

Before completing a task:

1. Format all modified files.
2. Run the relevant lint/typecheck/test commands available in the project.
3. Fix errors introduced by your changes.
4. Do not modify unrelated code solely to make validation pass.

## Scope

- Make the smallest reasonable change required for the task.
- Do not refactor unrelated code without asking.
- Do not introduce new dependencies unless they provide a clear benefit.
- Preserve existing behavior unless the task explicitly requires changing it.
