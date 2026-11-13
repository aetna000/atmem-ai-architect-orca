# Validation — 2026-11-13

Environment: macOS arm64, Orca 1.4.257, Node 26.5.0, npm Architect 0.2.0. No model or cloud deployment calls.

- Official Homebrew cask installed the desktop application and registered Orca CLI.
- Manifest validation and native panel checks passed; scenarios cover empty projects and an incomplete workspace list, with zero panel issues/warnings.
- Six tests cover local-only selection, fixed version startup, concurrent click idempotence, occupied ports, invalid ports, traversal/symlink rejection, document opening and visible action failures.
- TypeScript checks passed against this installed host’s generated types.
- With the owner’s explicit permission, the real development worker started Architect in an Orca terminal and opened http://127.0.0.1:5174 inside Orca’s browser. The tab reported the real Architect title and loaded successfully.
- A synthetic project was saved through the running Architect API. `completeProjectZip` built its handoff. The actual authenticated `/api/engineering/orca/open` endpoint returned HTTP 200 with `opened: true`; the real CLI registered the extracted folder.
- The plugin discovered that folder’s START_HERE, implementation specification, plan and implementation README. A real `editor.open` call opened the implementation specification in Orca.
- Native `plugin shot` reported a settled panel, zero errors and zero pending requests. No private workspace inventory, session token, memory records or credential material is included in this repository.

Static/mock tests and real desktop integration checks are distinct. The synthetic handoff is not evidence of model generation, implementation acceptance or a cloud deployment. Linux/Windows plugin behavior is not yet qualified. Catalog listing is separate from publishing a Git tag.

## 0.1.1 shutdown correction

Live testing found that sending Ctrl+C through the plugin host did not terminate the npm application. Version 0.1.1 resolves only the terminal id created by this plugin to Orca’s runtime-issued handle and closes that exact terminal through Orca CLI. A missing terminal is harmless; an incomplete/ambiguous inventory fails closed. No other workspace terminal is closed.

Actual 0.1.1 start/stop test passed: npm Architect became ready on port 5174; Stop closed the owned terminal and the port stopped responding. TypeScript, six regression tests and both native render scenarios passed. Capabilities did not increase. This replaces the earlier Ctrl+C implementation; 0.1.0 is superseded.


## 0.1.2 branding

The owner requested prominent AtMem branding. The panel title is now AtMem AI Architect. A bundled image uses the existing AtMem brain, pink palette and outlined DM Sans title; no external font/image requests are needed. Native controls sit in a spaced card. Assets are derived from AtMem’s own https://atmem.ai/brand/atmem-brain.svg and bundled DM Sans.

TypeScript, six tests (including branded image/name assertion), manifest validation and both render scenarios passed. Native screenshots at 807px and 360px widths settled with zero errors/pending requests. The narrow screenshot is [retained here](branded-panel.png). Access is unchanged: trusted worker, workspace read/write, terminal commands and own storage/settings. No new startup/model/cloud actions.


## 0.1.3 stable Architect pin and walkthrough

Starts stable npm Architect0.2.1 (AtMem2.3.14). TypeScript, six action/security regression tests, manifest validation and both native render scenarios passed. Capabilities and commands are unchanged.

The exact npm archive was independently checked against the successful Windows/macOS/Linux trusted-publisher workflow and registry integrity/provenance. A fresh registry install reports0.2.1. Live development worker actions selected a public sample folder, connected to the isolated0.2.1 service on a configured free port, opened Architect in an actual Orca browser tab, imported the actual design ZIP and opened its specification. No model or cloud calls.

The32-second,1280×800 H.264 walkthrough combines actual native panel captures, a real browser recording and the resulting specification editor. It is captioned and explicitly marked as an edited sample; no implementation/deployment is represented as complete. Private workspaces, paths and user data are excluded from published frames. The full MP4 decodes without errors; intro, browser, handoff and specification frames were visually inspected. The README poster links to its public release asset.

Community catalog inclusion was observed for0.1.1 at https://orca.dev/plugins/aetna000/atmem-ai-architect-orca. Newly tagged versions are ingested by Orca's automatic indexer; publishing is distinct from the directory's current indexed version.
