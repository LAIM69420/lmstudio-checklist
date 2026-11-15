# lmstudio-checklist

Persistent task checklists for multi-step work, with add, complete, and remove operations.

| | |
|---|---|
| Type | tools |
| Tools | 6 |
| Version | 1.0.0 |

## Tools

| Tool | What it does |
|---|---|
| `checklist_add` | Add an item |
| `checklist_delete` | Delete a checklist |
| `checklist_done` | Mark an item complete |
| `checklist_new` | Create a checklist |
| `checklist_remove_item` | Remove an item |
| `checklist_show` | Display a checklist |

## Requirements

| Requirement | Detail |
|---|---|
| Storage | JSON file at `dataFile` |

## Configuration

`dataFile`.

Configured in LM Studio under Integrations → lmstudio-checklist; field definitions live in `src/configSchematics.ts`.

## Privileged surface

Writes a local JSON file; `checklist_delete` is immediate and has no undo. State is plaintext.

## Failure modes

| Symptom | Cause |
|---|---|
| Checklist vanished | `dataFile` resolved to a transient path |

## Example prompts

- "Create a release checklist with five steps."
- "What is left on my checklist?"

## Development

```bash
npm install    # also runs `lms dev --install`
npm run build  # tsc
```

## Status

| Item | State |
|---|---|
| Compiles | verified with `tsc --noEmit` against the current toolchain |
| Tests | none — no smoke harness in this repo yet |
| Verified against | LM Studio 0.4.28 |
| Known gaps | no behavioural tests; docs written from source review |

## License

MIT
