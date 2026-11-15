# AtMem AI Architect for Orca

Explore a complete AI project, then create your own architecture inside Orca.

![AtMem AI Architect](assets/workspace-cover.png)

[Complete reference Delivery](assets/complete-example-delivery.png)

[Public listing](https://orca.dev/plugins/aetna000/atmem-ai-architect-orca) · [atmem.ai](https://atmem.ai) · [Contact us: hello@atmem.ai](mailto:hello@atmem.ai)

## Install

Requires Orca 1.4.257+, Node.js 22+ and Orca CLI on PATH.

```sh
orca plugin install aetna000/atmem-ai-architect-orca@v0.2.0 --json
```

Orca shows the exact worker permissions before enabling the plugin.

## First project

1. Open **AtMem AI Architect** in Orca's sidebar.
2. Press **Start new** to explore the complete AI knowledge assistant. No name or model connection is required.
3. Open **Delivery** to review the sample checks and download the complete reference ZIP.
4. Choose **Create new project** when ready. Connect your model to start chatting.

Templates offer other starting designs. A personal blank project requires a name. **Open folder** reopens an existing Orca folder's saved design. Folders are listed newest first with dates. Template previews have been removed.

The complete example includes Sydney/Australia settings, an illustrative AWS cost worksheet with official price snapshots, requirements, generated application and Terraform source, a built Python 3.13/ARM64 runtime, and local test evidence. Its 13 application tests and two Terraform mock plans do not establish live deployment or real tenant integration. Usage assumptions are included; the estimate is not a bill or client quote.

The portable reference ZIP is supplied by Architect 0.2.2. It works on a new installation without a pre-existing engineering session. Current-project checks remain separate from the immutable reference download. Chat stays compact, its introduction is retractable, and introduction/voice controls share the top toolbar. **Reset board** creates a fresh board, chat, requirements and decision context, preserving saved projects and the model connection.

## Saved designs

A folder's root or `design-documents/` may contain `*.atmem-ai-architect.json` or `*.atforma.json`. Select a file if several exist. Invalid designs are reported without replacing them. Subsequent opens preserve live saved edits. Missing linked designs must be restored from Architect's Projects.

New folders live under `~/.atmem-architect/orca-projects/`. Designs are saved in Architect's configured data store. Existing source repositories are not changed. Reusing a project name resumes its linked folder. Delivery also supports **Open in Orca** for generated handoffs.

Startup reports progress and verifies the local service. Older plugin-owned runtimes are restarted to load the pinned version; independently started instances are left alone. Slow first installation may require retrying after setup completes. **Stop** closes only the plugin-recorded terminal. Port conflicts can be resolved in plugin settings. Default port is 5176; the browser opens and focuses `http://localhost:<port>` inside Orca.

## Access and compatibility

This trusted worker runs Node code with your account's access. Orca grants local workspace read/write, terminal commands, and private plugin storage/settings. The implementation rejects remote workspaces, document traversal/symlink escapes, and ports serving another application. No telemetry, automatic model requests or cloud deployment is added.

The plugin pins `@atmem/architect@0.2.2`, including AtMem 2.3.14. The npm runtime is checked through the linked GitHub Actions workflow. Orca execution is tested on macOS arm64; Windows/Linux Orca execution remains unqualified.

## Develop

```sh
npm ci
orca plugin types . --json
npm run typecheck
npm test
npm run check
npm run test:panel
```

Use `orca plugin dev load . --json` for local development. Local plugins use `local.atmem-architect`; Git installations use `aetna000.atmem-architect`. Public releases use versioned immutable Git tags and Orca's directory indexer.

AtMem code is Apache-2.0. DM Sans is bundled under its SIL Open Font License in `assets/fonts/DM-Sans-OFL.txt`. This is an AtMem integration, not an Orca endorsement.
