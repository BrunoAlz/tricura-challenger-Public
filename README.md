# tricura-challenger

![CI](https://github.com/BrunoAlz/tricura-challenger-Public/actions/workflows/ci.yml/badge.svg)

---

> # ⚠️ IMPORTANT — PLEASE READ BEFORE EVALUATING
>
> ## This public repository is a **HEAVILY CENSORED** version of the submission.
>
> **At least 80% of the substantive content has been intentionally removed,
> redacted, or replaced with executive summaries.** The redaction was performed
> to prevent the leakage of puzzle solutions, discovery paths, cipher
> derivations, command sequences, fabricated content, recompute formulas, and
> case-anchored identifiers that other candidates of the same evaluation are
> still expected to discover independently.
>
> What has been removed or sanitized in this public repo:
>
> - Every literal puzzle anchor (operator names, subject IDs, role IDs,
>   chamber/apparatus IDs, document IDs, timestamps, values, paths,
>   commands, cipher keys, codewords, verbatim quotes) — moved to
>   environment variables loaded from `.env` (gitignored).
> - The audit memo, findings catalog, methodology statement, investigation
>   journal, open-doors register, scripts catalog, timeline, and
>   interactive investigation graph — replaced by **executive summaries**
>   that convey purpose and thematic coverage without revealing any
>   specific finding.
> - All explanatory comments inside test specs and Page Object Models —
>   removed wholesale to avoid contextual leakage.
>
> ## 🔒 The complete, unredacted repository has been delivered to the evaluator via email.
>
> **Please evaluate the email-delivered version** — it contains the real
> deliverables, the full bug catalog with severity rubric and reproduction
> evidence, the complete investigation trail, the populated `.env`, and the
> unredacted PDFs.
>
> This public version exists to demonstrate that:
>
> 1. The work was done (the runnable test suite is here in full).
> 2. The candidate respects the integrity of the evaluation by not
>    publishing the puzzle solutions where peers can find them.
> 3. The deliverable structure is well-organized and reviewable.

---

QA automation portfolio: a Playwright + TypeScript regression suite produced
as part of an independent black-box QA review of a deployed institutional
admin console. The repository ships the runnable suite plus public-safe
executive summaries of the audit deliverables. The full unredacted memos,
catalogs, and working artefacts are held privately and are available to the
evaluator on request.

---

## What's in this repo

- **`tests/`** — automated regression suite (API, UI, E2E, a11y). Runnable
  end-to-end via `npm test`.
- **`src/`** — POMs, API service objects, fixtures, env loader, and SPA
  helpers consumed by the suite.
- **`deliverables/`** — public-safe executive summaries of the audit memo,
  methodology statement, findings catalog, evidence pack, and the
  reward-issuance workflow artefact.
- **`investigation/`** — public-safe summaries of the candidate's working
  artefacts (investigation journal, open-doors register).
- **`.claude/`** — Claude Code skills, agents, slash commands, and hooks that
  codify the conventions used to grow the suite consistently.

> **Public repo / secrets.** All institution-specific identifiers, puzzle
> anchors, credentials, host URLs, and verbatim in-game strings have been
> moved out of the public source. Spec literals are loaded from `.env`
> (gitignored); `.env.example` ships only variable names. The full
> unredacted deliverables are held privately and available to the evaluator
> on request.

---

## Quick start

```bash
# 1. Clone & enter
git clone https://github.com/BrunoAlz/tricura-challenger-Public.git
cd tricura-challenger-Public

# 2. Install deps + browser
npm install
npx playwright install --with-deps chromium

# 3. Configure environment
cp .env.example .env
# Fill the case-specific values (URLs, case token, role credentials)
# and the spec literals (T_*_LITERAL_*) — the populated .env is supplied
# privately to the evaluator.

# 4. Run the suite
npm test

# 5. Open the HTML report
npm run report
```

### Prerequisites

- Node.js ≥ 20
- An evaluator-issued case URL + case token
- The populated `.env` (request from the candidate)

---

## Scripts

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm test`             | Run all tests (API + UI + E2E)          |
| `npm run test:api`     | API tests only                          |
| `npm run test:ui`      | UI tests only                           |
| `npm run test:e2e`     | End-to-end tests only                   |
| `npm run test:headed`  | Watch the browser run                   |
| `npm run test:debug`   | Step through with Playwright debugger   |
| `npm run test:ui-mode` | Open Playwright's UI mode (interactive) |
| `npm run report`       | Open the last HTML report               |
| `npm run lint`         | ESLint check                            |
| `npm run typecheck`    | TypeScript no-emit check                |
| `npm run format`       | Prettier write                          |

---

## Project layout

```
tricura-challenger-Public/
├── README.md                         # this file
├── package.json, playwright.config.ts, tsconfig.json
├── .env.example                      # variable names only — values live in .env (gitignored)
├── .github/workflows/ci.yml          # CI: lint + typecheck + format + test + artifact upload
│
├── src/                              # ─── suite production code ───
│   ├── pages/                        #   Page Object Model
│   ├── api/                          #   API service objects
│   ├── fixtures/                     #   Playwright fixtures (auth, apiClient)
│   ├── config/                       #   env loader + role-permissions matrix
│   └── utils/                        #   SPA navigation helpers
├── tests/                            # ─── spec files ───
│   ├── api/{auth,dashboard,role-matrix,security}/  #   HTTP-only assertions
│   ├── ui/{auth,landing,dashboard,legacy,a11y}/    #   Browser, single-page scope
│   └── e2e/{auth,dashboard}/                       #   Multi-page user journeys
├── playwright/                       # storageState per role (gitignored)
│
├── deliverables/                     # ═══ EXECUTIVE SUMMARIES (public-safe) ═══
│   ├── README.SUMMARY.md             #   deliverables overview
│   ├── AUDIT.SUMMARY.md              #   audit memo
│   ├── METHODOLOGY.SUMMARY.md        #   methodology statement
│   ├── BUGS-CATALOG.SUMMARY.md       #   findings catalog
│   ├── d03-disbursement/             #   reward-issuance workflow artefact (redacted PDF + summary)
│   └── evidence/                     #   per-bug supporting artefacts (redacted)
│
├── investigation/                    # ═══ WORKING ARTEFACT SUMMARIES (public-safe) ═══
│   ├── README.SUMMARY.md             #   investigation overview
│   ├── INVESTIGATION-JOURNAL.SUMMARY.md
│   ├── OPEN-DOORS.SUMMARY.md
│   └── observation-reports.csv       #   source-data extract used by one reconciliation argument
│
└── .claude/                          # Claude Code automation (see section below)
    ├── skills/, agents/, commands/, hooks/
    └── settings.local.json
```

---

## Test types

| Type     | Scope                           | Backend | Example                                        |
| -------- | ------------------------------- | ------- | ---------------------------------------------- |
| **API**  | HTTP-only, no browser           | Real    | `POST /api/auth/login` returns 200             |
| **UI**   | Single page/component           | Real    | Login form validates empty fields              |
| **E2E**  | Multi-page journey              | Real    | Junior creates → Senior approves               |
| **a11y** | Axe-core / WCAG 2.1 AA baseline | Real    | `/login` has zero violations (pinned baseline) |

## Modules

| Module        | Coverage                                                          |
| ------------- | ----------------------------------------------------------------- |
| **auth**      | Authentication, role-based access, session lifecycle              |
| **landing**   | Public-facing pages                                               |
| **dashboard** | Authenticated admin console (sessions, subjects, chambers, audit) |

## Conventions

- **POM** in `src/pages/` — all DOM interaction lives here, never in specs
- **Selectors** prefer `getByRole`/`getByLabel` over CSS — resistant to
  refactor
- **Specs** are declarative — `test()` blocks read like business scenarios
- **Fixtures** in `src/fixtures/` — for shared state (auth, apiClient)
- **Tags** in `describe()` titles — `@bug-XXX`, `@side-observation`,
  `@destructive`, `@smoke`
- **Latch pattern** — every regression spec pins the broken behavior so it
  fails the day it gets fixed
- **Tests run serially** (`fullyParallel: false`) — the backend is
  case-scoped and mutations leak across runs
- **Spec literals via env** — puzzle-anchor strings, credentials, and
  host-specific values are loaded from `.env` so the spec source ships clean

## Running by tag

```bash
# A specific cataloged bug
npx playwright test --grep "@bug-XXX"

# All exploratory side-observations
npx playwright test --grep "@side-observation"

# Skip destructive tests (mutate shared backend)
npx playwright test --grep-invert "@destructive"
```

---

## CI

GitHub Actions runs lint, typecheck, format-check, and the full test suite
on every PR and push to `main`. The HTML report is uploaded as an artifact
and retained for 14 days.

Required GitHub Secrets (mirror of `.env.example`):
- All `IRIS_*` variables (base URL, API URL, case token, role credentials)
- All `T_*_LITERAL_*` variables (spec literals — supplied by the candidate)

---

## Claude Code automation

The `.claude/` directory bundles skills, agents, slash commands, and hooks
that codify the conventions established during the audit. Browse it to see
how the suite stays consistent as it grows.

| Layer        | Components                                                                                                   | Purpose                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| **Skills**   | `tricura-test-standards`, `tricura-regression-test`, `tricura-exploratory-test`, `tricura-pom-extend`        | Canonical conventions + workflows.            |
| **Agents**   | `tricura-test-author`, `tricura-spec-reviewer`, `tricura-flake-hunter`, `tricura-coverage-mapper`            | Single-responsibility automation.             |
| **Commands** | `/tricura-regression`, `/tricura-explore`, `/tricura-review`, `/tricura-flake`, `/tricura-status`            | One-line wrappers that dispatch the right agent. |
| **Hooks**    | `lint-edited-spec`, `typecheck-project`, `preload-bug-context`, `session-bootstrap`, `stop-reminder`         | Advisory only — never block tool calls.       |

Install on a fresh clone:

```bash
chmod +x .claude/hooks/scripts/*.sh
cp .claude/hooks/config/settings.template.json .claude/settings.json
python3 -m json.tool .claude/settings.json > /dev/null   # validate
```

See [`.claude/hooks/HOOKS-README.md`](.claude/hooks/HOOKS-README.md) for the
per-hook contract and `.claude/skills/*/SKILL.md` for skill bodies.

---

## Tech stack & quality bar

- TypeScript `strict: true` + `noUncheckedIndexedAccess`
- Playwright (API + UI + E2E projects, serial execution)
- ESLint + Prettier
- Axe-core for a11y baselines
- 0 lint warnings · 0 typecheck errors · 0 `waitForTimeout` in test code

---

## License

Submission for an independent QA evaluation.
