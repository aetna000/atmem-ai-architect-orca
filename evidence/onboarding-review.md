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

Start now opens the configured local URL using `localhost`, then explicitly switches to the returned browser page with `--focus`. Live testing confirmed the active Orca tab was `http://localhost:5176/?project=<id>`, loaded without error, and showed the existing “my first project” name. The internal authenticated project API continues using its canonical loopback URL so existing associations are preserved. Added https://atmem.ai and mailto:hello@atmem.ai footer links using Orca’s user-gesture external-link API. Nine regression tests, five browser checks (including link destinations), TypeScript and manifest validation pass. No capabilities changed.

## Model setup and smaller typography — local.4

Reduced heading, input, button, supporting and footer font sizes while preserving the approved layout. Start now waits for the selected project to finish loading and the initial welcome dialog to close, then opens Connect a model if unconnected. Existing model selections and existing dialogs are preserved. The integration uses a fixed page-scoped DOM action against pinned Architect 0.2.1; it does not supply credentials or select a model. Changed app DOM/storage contracts require requalification.

The live Orca test showed the existing project name and the `connections` dialog together at localhost:5176. Nine regression tests and six browser checks pass. The additional browser case covers the initial-welcome race, project readiness, automatic opening, an already-open dialog, and an already-connected model. Smaller typography screenshots inspected at 360/560px. No additional permissions or model calls.

## Folder recency and visible composer — local.5

Folder entries now include local date/time and sort descending by recorded successful open, with folder modification time as fallback. Unknown dates sort last. Friendly names recorded on creation survive reopening. A new worker regression verifies timestamp ordering, missing-folder fallback, and successful-open recency; the browser check verifies dated option labels.

The reported typing failure reproduced at 893×738: the enabled textarea was below the viewport (top 928px) because Architect’s <=900px stacked layout made the document taller than the Orca pane. A plugin-owned, media-scoped stylesheet now bounds the embedded grid and keeps the chat composer inside the pane, with scrolling inside the conversation. Existing deployed/generated artifacts and npm package files are unchanged. The same compatibility adjustment is applied on every plugin open. Existing tabs acquire it when reopened; reloading a tab directly bypasses the plugin’s page setup.

Live isolated-browser checks typed an unsent draft against the public saved sample at widths 893/560/400/1200 and confirmed both message and Send rectangles fit the viewport. Draft cleared; no prompt sent. The reported live tab was also corrected in place, and its textarea bottom measured 627px in a 738px viewport. Ten worker/project tests, six panel browser checks, and the live embedded-layout check pass. The adapter depends on the pinned Architect DOM/CSS contracts; no global app release is claimed.

## Required project name — local.6

The empty-name action now reads “Enter a project name” and uses a neutral disabled style. Entering a nonblank name changes it to the enabled pink “Start designing” action. Six panel/browser checks pass and the installed native panel capture settled without errors.

## Expanded workspace and templates — local.7

Expanded the current Orca workspace by hiding its sidebars; the app viewport increased from 893px to 1469px and uses its desktop canvas/chat layout. A successful panel launch now closes the plugin sidebar via Orca’s built-in right-sidebar toggle; the plugin remains available from the sidebar. Existing left-sidebar preferences are preserved during subsequent launches.

Added a Templates tab and Start from template entry with three bundled public AWS examples: Private file storage (2 components), Document processing (6), and Knowledge assistant (10). Users see a schematic preview and scope description before naming an independent project. Copies have new IDs/timestamps and template provenance; retry associations distinguish different templates with the same name. Unrecognized template IDs and mixing a template with an existing workspace are rejected. These are synthetic sample designs requiring review, not deployed systems.

Eleven worker/project tests and seven browser checks pass. All three copied templates independently pass the pinned Architect project reader. Live worker testing created “Knowledge assistant example” and the real Orca browser showed all 10 components at 1469px width. Browser preview decoding and template selection/request are checked. No model prompts or cloud operations were performed. Capabilities unchanged.

## Entry layout cleanup — local.8

Removed the duplicate Start from template button; Templates remains in the main tabs. Shortened the folder tab to Open folder, prevented label wrapping and reduced tab padding/type. Reset browser-default button chrome. Seven browser checks pass; actual installed 360px native capture inspected with no render errors.

## Ready AI example first — local.9

The initial Start action opens the bundled Knowledge assistant example with no name entry required. Its 10-component design appears immediately, without the connection dialog blocking exploration. The original personal-project and selectable-template paths remain available; connection setup remains automatic on their normal entry. This is a sample architecture, not a deployed app or generated implementation.

A page-scoped example marker and Create new project action use Architect’s native new-project flow. After confirmation, the example marker and deep link are removed, avoiding a reload that would reopen the example. Native project switching preserves the saved example. The helper does not fill model credentials or send prompts.

Eleven worker/project tests and eight browser checks pass. The live desktop test opened the 10-component example with its marker and Create new project control, followed that native action into a blank board, confirmed zero components and removal of the example/deep-link parameters, then reopened the saved example. The default panel Start request is checked without a name or model. No model or cloud operations.

## Visible reset and simpler entry — local.10

Added a visible bin + Reset board action in the board toolbar. It uses Architect’s native project transition with a confirmation explaining the cleared scope. This creates a new project ID, clearing nodes, edges, requirements, decisions, conversation and draft input rather than merely hiding messages or removing diagram nodes. Prior saved projects and model selection remain. The old node-only Clear board and chat-view-only bin are hidden to avoid misleading alternatives. Active work uses the native guard and visible working/queued states.

The live isolated-browser test verifies cancellation preserves the original ID, and confirmation creates a new ID with zero nodes/edges/requirements/decisions/user chat turns and an empty composer. The current live tab also shows the enabled labeled bin; its contents were not reset. No model prompts sent. TypeScript, manifest validation and the responsive embedded checks pass.

Removed the initial schematic image and review caption at the owner’s request. Primary entry reads Start new. Templates retains its previews; browser checks now exercise every template button, preview decoding and corresponding open request (10 panel checks total).


## Complete reference example, local.11

Start opens versioned `atmem-ai-ready-example-v1` with region/model/usage decisions and a complete 22-line AWS price worksheet (all nine non-note components accounted for). Original source templates remain intact. Official catalog snapshots, extracted meters and assumptions are retained. A real completed native engineering session captured a 17 MB immutable package containing generated source, prebuilt runtime ZIP, documentation and qualification logs. Capture itself is not acceptance.

Verified: 13 application/source-contract tests, Terraform schema validation, two AWS mock plans, 12 plugin tests, 10 panel browser checks. ZIP CRC, runtime inclusion and every retained qualification file hash checked. Prepared checklist explicitly labels external local evidence and is separate from current project checks. Template previews removed. No cloud deployment or real tenant integration run. Local backend download binding must be re-created for a different installation.


## Public 0.2.0 release

Owner authorized publication of all latest changes. Architect 0.2.2 now owns the native compact composer/header, top introduction and voice controls, retractable introduction, idle sizing, fresh-context reset and complete reference download. The plugin no longer injects those features or depends on an engineering session from this machine. Its default port is 5176; existing configured ports remain respected. The sample design is still imported through the authenticated API, preserving saved edits. Runtime pin: @atmem/architect@0.2.2. Local-session receipts and duplicate built ZIPs were removed from the plugin distribution; the public runtime serves the immutable portable example.

Plugin checks: TypeScript, 14 worker/bridge/template/runtime tests and 10 panel browser checks pass. Native runtime checks and portability evidence are retained in Architect's specs/031-first-use-release. Cloud deployment and real tenant integration remain not run.

A portable-runtime probe distinguishes old Architect from a current runtime. Only a plugin-recorded terminal may be restarted automatically; independent instances receive an actionable upgrade message.


## Folder location and copy (local follow-up)

Local workspace listings expose the host-provided absolute folder path. The folder selector and options use it as a hover title. A compact read-only path and copy button follow the selected folder. Clipboard writes happen only on a click; a selected-text fallback handles embedded browsers without the Clipboard API. When copying is blocked, the path stays selected for keyboard copying. No new worker capabilities or external access were added.

Validated TypeScript, 14 worker/bridge/template/runtime tests and 14 browser checks. Cases include exact path copying, spaces/Unicode, changing the selected folder, unavailable clipboard, blocked copying and clearing selection. Public tags and the npm version are unchanged.


## Browse a local project folder (local follow-up)

Added a native local-folder picker and explicit absolute-path entry to Open folder. A valid directory is reused if already registered, otherwise added through the existing fixed-argument Orca repo-add command. Saved design discovery and project import remain the same reviewed flow; multiple design files still require selection. Cancellation or invalid paths do not start Architect or register a folder. Picker processes receive the request abort signal, and pasted paths are never evaluated by a shell.

Checks: TypeScript; 16 worker/bridge/runtime tests; 17 panel browser checks; plugin check; macOS picker AppleScript compiled without opening an unsolicited dialog. Live worker request successfully selected an existing local folder. Native picker UI remains user initiated. Windows/Linux picker adapters are provided but not platform-qualified. Installed in the isolated local preview; public tags and npm version unchanged.


## Orca 0.2.1 publication

Owner requested submission of the folder browsing and absolute-path copy changes to Orca. Plugin patch version is 0.2.1; the Architect npm dependency remains 0.2.2. Public version tags are immutable. TypeScript, 16 worker/bridge/runtime tests, 17 browser checks and manifest/panel validation are required before publishing. CI now includes the panel browser checks. Orca directory listing is a separate maintainer-controlled review, not implied by a successful GitHub release.


## Timed plugin-star invitation (publishing paused)

Added an optional invitation to the verified Architect tab opened by the plugin, after 60 seconds of visible use. It links to the plugin repository's GitHub Star control. Hidden time does not count; dialogs, model work and drafts defer the invitation. Not now/close/Escape snooze 30 days, permanent opt-out is available, and opening the link suppresses future prompts without claiming a star. No requests read or change a user's GitHub account.

Eight accelerated browser checks cover the exact delay, snooze, permanent opt-out, link destination/state, Escape, drafts/modals, hidden time and active-generation deferral. Native dialog focus handling keeps the default action on Not now. Public release/tag publication remains stopped at the owner's request.


## Orca-first invitation

Owner clarified that Orca should be the primary destination. The invitation now offers Open on Orca first and Star on GitHub second. The Orca listing currently exposes GitHub-star metrics, not a separately available native star action; the primary label accurately opens the listing. Nine accelerated browser checks verify both destinations, ordering, preferences and existing timing/dismissal behavior. Publication remains paused.
