# Contributing to Legal Watch Dogs

Thank you for considering contributing to **Legal Watch Dogs**!  
We welcome all kinds of contributions, including bug reports, feature requests, and code improvements.

---

## Table of Contents

- [Contributing to Legal Watch Dogs](#contributing-to-legal-watch-dogs)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [How to Contribute](#how-to-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Features](#suggesting-features)
    - [Code Contributions](#code-contributions)
  - [Development Workflow](#development-workflow)
  - [Branch Naming Rules](#branch-naming-rules)
    - [Allowed Prefixes](#allowed-prefixes)
    - [Rules](#rules)
    - [Examples](#examples)
  - [Commit Message Rules](#commit-message-rules)
    - [Allowed Types](#allowed-types)
    - [Examples](#examples-1)
    - [Important](#important)
  - [Submitting Pull Requests](#submitting-pull-requests)
  - [Code of Conduct](#code-of-conduct)
  - [License](#license)

---

## Getting Started

1. **Fork the repository.**
2. **Clone your forked repository:**
   ```sh
   git clone https://github.com/emerjent/legal-watch-dog-FE.git
   ```
3. **Navigate to the project directory:**
   ```sh
   cd legal-watch-dog-FE
   ```
4. **Enable corepack (for pnpm):**
   ```sh
   corepack enable
   ```
5. **Install dependencies:**
   ```sh
   pnpm install
   ```
6. **Start the local server:**
   ```sh
   pnpm run dev
   ```

> **Note:** This project uses `pnpm` as the package manager. Node.js version 20.19.0+ is required (see `.nvmrc`).

---

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue on [GitHub Issues](https://github.com/emerjent/legalwatchdog-fe/issues) and include:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Logs or screenshots

### Suggesting Features

If you have a feature idea, open an issue and describe:

- What the feature should do
- Why it is useful
- How you imagine it working

### Code Contributions

All code contributions should be done on your fork of the repository.

---

## Development Workflow

1. **Create a new branch for your work:**
   ```sh
   git checkout -b feat/HNG-2145-your-feature-name
   ```

---

## Branch Naming Rules

Branch names should follow this structure:

```
<prefix>/<TICKET-ID>-<description>
```

### Allowed Prefixes

- `feat/` — new feature
- `fix/` — bug fix
- `refactor/` — code restructuring
- `chore/` — routine tasks
- `docs/` — documentation changes

### Rules

- Include ticket or issue number when available (e.g., `HNG-2145`)
- Description should be lowercase and short
- If no ticket exists, omit the ticket number

### Examples

```
feat/HNG-1234-create-login-page
fix/HNG-5678-profile-update-bug
chore/remove-unused-variables
```

---

## Commit Message Rules

Commit messages follow this style:

```
type: commit message
```

Or, when including a ticket:

```
type(TICKET-ID): commit message
```

### Allowed Types

- `feat`
- `fix`
- `refactor`
- `chore`
- `docs`

### Examples

```
feat: add signup form
fix(HNG-1234): resolve login crash
refactor: simplify formData state logic
```

### Important

Use imperative tense:

- ✔️ "add login validation"
- ❌ "added login validation"
- ❌ "I added login validation"

---

## Submitting Pull Requests

1. **Make sure your branch is up to date with your remote main:**
   ```sh
   git checkout main
   git pull origin main
   git checkout <your-branch>
   git rebase main
   ```

2. **Sync your fork frequently with upstream to avoid conflicts.**

3. **Run tests and checks before submitting:**
   ```sh
   pnpm run ci
   ```
   This runs linting, type checking, unit tests, and builds the project.

4. **Open a pull request to the upstream repository.

5. **In your PR description, include:**
   - What you changed
   - Why you changed it

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/).

Please report unacceptable behavior at:

```
email@example.com
```

---

## License

By contributing, you agree that your contributions will be licensed under the:

```
Apache License
```