# AtMem AI Architect for Orca

Open AtMem AI Architect’s visual workspace inside Orca. Design applications, review requirements and inspect Terraform beside your code.

![AtMem AI Architect Midnight cover with floating Terraform](assets/workspace-cover.png)

[Explore the workspace](assets/architect-workspace.png) · [See Terraform in Orca](assets/terraform-orca.png)

[Public Orca listing](https://orca.dev/plugins/aetna000/atmem-ai-architect-orca)

## Watch the walkthrough

[![Watch the 32-second Orca walkthrough](assets/walkthrough-poster.png)](https://github.com/aetna000/atmem-ai-architect-orca/releases/download/v0.1.3/atmem-ai-architect-orca-walkthrough.mp4)

Select a project, open Architect, send the design handoff to Orca, and inspect its specifications. Captioned sample walkthrough.

## Install

Requires Orca 1.4.257+, Node.js 22+, and Orca CLI on PATH.

```sh
orca plugin install aetna000/atmem-ai-architect-orca@v0.1.5 --json
```

Orca prints the exact permissions and approval command. Review those before approving.

## Local onboarding preview (0.2.0-local.10)

This branch is a local preview; the public install command above still installs 0.1.5.

1. Open **AtMem AI Architect** in Orca’s right sidebar.
2. Choose **Start new** to open the ready AI Knowledge assistant example, with no project name or model connection required.
3. Explore its design, then choose **Create new project** in Architect to begin your own. The sidebar also offers a named blank-project shortcut and selectable templates. Model setup opens for personal work when needed.
4. To resume existing work, choose **Open folder**, select its Orca folder, and choose **Open design in Architect**.
5. In Architect, choose **Delivery → Open in Orca**. The panel detects newly registered design folders while open; **Reload folders and files** is the fallback.

A folder’s root or `design-documents/` can contain `*.atmem-ai-architect.json` or `*.atforma.json`. Choose a file when several exist. A folder without a saved design starts a named blank design; existing source code is not imported. Invalid designs are reported rather than replaced with a blank canvas.

Imported designs are saved through Architect’s authenticated local project API and opened using their actual project ID. Subsequent opens preserve edits already saved in Architect; they do not overwrite them with an older exported snapshot. Missing linked designs must be restored in Architect’s Projects instead of silently recreated.

New-project folders live in `~/.atmem-architect/orca-projects/`. Designs live in the configured Architect data store. No source repository files are modified. Reusing the same new-project name resumes its linked folder, including after a startup retry.

Startup shows progress and waits for readiness. Slow first-time installation can outlast the wait; retry after setup finishes. The footer shows the actual local runtime status and address. **Stop** appears only for the plugin’s recorded terminal session. **Reset** clears that session when the runtime is offline. It closes that recorded terminal, not an independent application. Change the port in Orca’s plugin settings if another app occupies it.

## Access

The trusted worker can run Node code with your account’s access. Orca also grants workspace read/write, terminal commands, and the plugin’s own storage/settings. Implementation restricts actions to local workspaces, plugin-created project folders, a fixed npm command, and listed design/document paths. It rejects remote workspaces, path traversal, symlink documents and a local port serving another app.

The panel has no direct network access. The worker checks the chosen loopback port and uses Orca CLI to open its browser. npm startup can download the pinned Architect and managed dependencies. Nothing runs automatically when the plugin is enabled. No telemetry, account tokens, project uploads or automatic model calls are added.

## Compatibility

Tested on macOS arm64 with Orca 1.4.257. This version starts stable Architect 0.2.1, including AtMem 2.3.14. Windows/Linux plugin execution remains unqualified.

This plugin opens and inspects a handoff; it does not prove generation quality, run project code or deploy cloud resources. [Validation](evidence/validation.md) · [Plan](docs/plan.md) · [Architect](https://atmem.ai/ai-architect/)

## Develop

```sh
npm ci
orca plugin types . --json
npm run typecheck
npm test
npm run check
npm run test:panel
```

For live development, use `orca plugin dev load . --json` and review its approval request. Development folders run as `local.atmem-architect`; a Git install runs as `aetna000.atmem-architect`.

AtMem-owned code: Apache-2.0. This is an AtMem integration, not an Orca-endorsed plugin.

The HTML panel bundles DM Sans under its SIL Open Font License; see `assets/fonts/DM-Sans-OFL.txt`. Browser checks use Playwright Chromium.

Start designing opens and explicitly focuses the project’s Orca browser tab at `http://localhost:<configured-port>/?project=<id>`. Footer links open https://atmem.ai and a mail draft addressed to hello@atmem.ai.

Folder choices are sorted newest first and show local date/time: “Opened” for a recorded successful plugin open, otherwise “Updated” from the folder timestamp. Unavailable dates sort last. The plugin supplies a narrow-pane layout adjustment to keep Architect’s composer and Send control visible.

Choose **Templates** to preview Private file storage, Document processing, or Knowledge assistant. Each uses a public AWS sample. **Use this template** creates an independent design with a new project ID; review the example’s requirements and assumptions before adapting it. Project opening closes the plugin sidebar to give Architect room. Reopen the plugin from Orca’s right sidebar when needed.

**Start new** now opens the ready Knowledge assistant example immediately, without naming a project or connecting a model first. The example is labeled as a sample design. **Create new project** in its toolbar opens Architect’s normal new-project flow; the example is preserved and the resulting blank board uses its own project ID. Model setup remains available when creating your own work.

The board toolbar includes a visible bin labeled **Reset board**. Confirmation starts a fresh project scope with an empty board, conversation, requirements and decisions; saved projects and the model connection remain. The initial screen no longer shows the example diagram preview; previews remain in Templates.


### Prepared local reference example

Start opens the complete AI knowledge assistant reference. It includes an Australia/Sydney AWS cost worksheet with official price snapshots, requirements and decisions, generated application and Terraform source, a built Python 3.13/ARM64 Lambda artifact and local qualification evidence. Delivery shows a separate prepared-reference checklist and downloads the immutable reference ZIP. Current project checks remain separate; editing a board does not silently alter the prepared download. Template thumbnails have been removed.

The local preparation uses `scripts/fetch-example-prices.py`, `scripts/prepare-ready-example.mjs` (set `ARCHITECT_SOURCE_DIR` to Architect 0.2.1), registration/seeding and `scripts/capture-ready-example.mjs`. Registration refuses to overwrite an existing design. The packaged `delivery.json` is bound to this local Architect session; it is not a portable or public deployment receipt. The exact ZIP is also retained in `assets/ready-example/complete-example.zip`. Re-register and capture a new real completed session before distributing a build for another Architect installation.

The 13 application tests and two Terraform mock plans are local fixture checks. Live AWS deployment, real tenant adapters and production acceptance have not run. The worksheet is illustrative usage, not a bill or client quote.
