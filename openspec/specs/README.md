# Canonical Specs — HAL-ERP

This folder is the **source of truth for what the system DOES**, one capability per folder:

```
openspec/specs/
└── <capability>/
    └── spec.md
```

Each `spec.md` documents an existing feature so future changes are easier to scope. It is reverse-engineered from the real code, not aspirational.

## How to read a spec

Every `spec.md` has:

1. **Purpose** — one paragraph: what the capability is for.
2. **Implementation Map** — a table linking each Clean-Architecture layer (view → store → service → repository → entity → DTO → route) to its file, plus the API base path and endpoints.
3. **Requirements** — `### Requirement:` blocks written in SHALL/MUST, each followed by `#### Scenario:` blocks in WHEN/THEN form.

> Parser rules (from `openspec/AGENTS.md`): Requirements use **exactly three** hashtags, Scenarios use **exactly four**. Under `## ADDED Requirements` for a baseline spec.

## How to change a feature

1. Read the relevant `specs/<capability>/spec.md` to learn the current behavior.
2. Create a change under `openspec/changes/<change-name>/` (use `/opsx:propose`).
3. In the change's delta spec, copy the affected `### Requirement:` block under `## MODIFIED Requirements` before editing it.
4. After merge, fold the delta back into this canonical spec (`/opsx:archive`).

## The gold-standard example

`specs/authentication/spec.md` is the reference. It documents the full login → session → guard → logout flow across all layers. Match its structure when writing or updating any other spec.

## Capability index

See `INDEX.md` for the full list of capabilities and their status.
