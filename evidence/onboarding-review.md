# Local onboarding preview — 2026-11-15

Branch: `fix/orca-first-use-journey`. Separate worktree: `atmem-ai-architect-orca-onboarding`. Public 0.1.5 and its source checkout are unchanged.

## Behavior

New users can name a project and choose Start designing without having a folder. Existing folders import their saved Architect design and open `/?project=<actual-id>`, or explicitly start a named blank design if no design file exists. Startup and readiness are coordinated in one action. Runtime maintenance controls are secondary. Delivered design folders registered while the panel is open are detected on workspace events; reload remains available.

Source files are read, not modified. Existing saved designs win over exported snapshots, preventing a reopen from replacing later work. Invalid, ambiguous, oversized, linked or missing designs fail visibly. Local association records survive plugin reloads. No model calls or cloud deployment are introduced.

## Validation

- TypeScript passes against installed Orca types.
- Twelve regression tests pass: newcomer entry, empty folders, multiple designs/failures, design-file boundaries, authenticated import, preservation of live edits, missing-link recovery, fixed command, local-only workspaces, safe document handling, port validation, and coordinated startup/readiness/project URL.
- Native checks cover welcome, available folders, and overview failure.
- Real Orca worker created a named project folder, saved its blank design through the running local Architect API, and opened the project URL. The actual browser screen showed the requested project name.
- Real Orca worker opened the public enterprise sample’s saved design. Browser inspection confirmed “Enterprise knowledge assistant”, ten rendered components, and no alert errors.
- Real 360px native welcome capture inspected: clear heading, three short steps, New project / Existing folder, named input, one primary action, collapsed runtime controls; no render errors or pending requests.

The real worker started pinned Architect 0.2.1 in its dedicated Orca terminal on the configured port, then reused it for the saved-design test. Managed dependencies were already installed; first-ever dependency download timing was not measured. No model generation, cloud execution or deployment was tested. Linux/Windows remain unqualified. Browser UI requires the existing project-link support in pinned Architect 0.2.1.

## Manual check

1. New project → enter a name → Start designing. Confirm the same name in Architect’s project field.
2. Existing folder → choose an exported project → Open design in Architect. Confirm components and requirements load.
3. Edit and save in Architect, then reopen from the plugin. Confirm edits remain.
4. Delivery → Open in Orca. Confirm the delivered folder is detected, or reload folders and select it; open its specification.
5. Help and runtime → Stop local Architect, then Continue in Architect. Confirm startup and opening use one action.

## Rollback

Disable `local.atmem-architect`, then enable the original installed `aetna000.atmem-architect` in Orca Settings → Plugins. Both retain separate settings/storage. Keep created designs and project folders; rollback does not require deleting user work. Nothing was published.

## Reference layout — local.2

Replaced the native components panel with a bundled HTML/CSS panel matching the owner’s supplied reference: Midnight hero, pink primary action, two project tabs, named input, three journey cards and a bottom runtime footer. Preserved the project bridge and worker actions. Runtime text now uses an actual probe; “Local preview” is shown instead of an unverified “up to date” claim. No additional capabilities.

Nine worker/project regression tests, TypeScript and manifest/native validation pass. Five browser checks pass: new-project request, stop/status update, keyboard tab navigation, selected-design failure, and no horizontal overflow at 280/360/400/560px. Browser screenshots at 360px and 560px and the actual 360px Orca HTML panel were inspected. Native panel screenshot settled without errors. HTML panels are not rendered by the components check; real capture and browser tests cover that surface. DM Sans and its OFL license are bundled locally; the panel loads no external fonts or assets.

## Focus and contact links — local.3

Start now opens the configured local URL using `localhost`, then explicitly switches to the returned browser page with `--focus`. Live testing confirmed the active Orca tab was `http://localhost:5176/?project=<id>`, loaded without error, and showed the existing “my first project” name. The internal authenticated project API continues using its canonical loopback URL so existing associations are preserved. Added https://atmem.ai and mailto:info@atmem.ai footer links using Orca’s user-gesture external-link API. Nine regression tests, five browser checks (including link destinations), TypeScript and manifest validation pass. No capabilities changed.
