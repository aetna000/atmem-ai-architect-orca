# Orca plugin 0.2.3 — Architect 0.2.6

This release launches the immutable public Architect 0.2.6 GitHub archive. It has
exactly the same bytes as the accepted release workflow and public npm package:

- Source tag: `aetna000/atmem-ai-architect@v0.2.6`.
- Release workflow: https://github.com/aetna000/atmem-ai-architect/actions/runs/44954751461
- Archive SHA-256: `e5d337a3755c0f8b06bb6fe4d0b71841b6725304752907cd0b2e502b2b8b6a06`.
- Runtime browser fingerprint: `/assets/index-BE2BW77J.js`, read from that archive.
- A cold npm-exec cache using the exact GitHub URL reported `0.2.6`.

The runtime supplies 28 diagram types, native shape editing, pages, Mermaid actions,
compact titles, numbered connections and linked properties. The plugin rejects
older browser bundles before reusing an instance. It restarts only its recorded
terminal; independently started services require the user to stop them.

Automatic model setup now opens collapsed chat before finding Connections.
Previously the narrow Orca workspace could open successfully while setup timed out.
No worker capabilities, provider credentials, model requests or cloud actions were
added. New-project transitions use Architect's own controls.

## Validation

Local environment: macOS arm64, Orca 1.4.267, Node 26.5.0.

- TypeScript against installed Orca types; manifest and native plugin validation.
- 16 action/security tests, including fixed startup, concurrent opens, occupied
  ports, saved edit preservation, path/symlink rejection and owned-runtime upgrade.
- 21 panel browser checks, including responsive layout and collapsed-chat model setup.
- 12 support-prompt browser checks.
- Installed 0.2.6 reference opens and its real ZIP downloads without an engineering session.
- Live installed-runtime model setup and draft visibility pass at 893, 560, 400 and
  1200 pixels; saved project preserved, no prompts sent.
- Release privacy scan: no matches against the private release policy.

The portable example is a bounded knowledge assistant with local source fixtures,
13 application tests and two Terraform mock plans. It does not prove complete
architecture coverage, real SaaS integration or deployment. Older gallery images
remain labelled recorded examples. Windows/Linux Orca desktop execution is not
qualified. Git tag/release publication and Orca directory indexing are separate.
