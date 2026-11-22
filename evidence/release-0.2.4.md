# Orca plugin 0.2.4 — Architect 0.2.7

The plugin pins Architect 0.2.7 using its immutable GitHub release URL, and rejects older browser bundles before reuse. It restarts only its recorded terminal; independent instances require their owner to stop them.

- Source: https://github.com/aetna000/atmem-ai-architect/pull/1
- Package qualification: https://github.com/aetna000/atmem-ai-architect/actions/runs/45018330453
- Public archive SHA-256: `7ed6046fadc82be7f3b56a22c60df7509badce65a5f6ae5cc800d2e1ddc5a2ae`.
- Browser fingerprint: `/assets/index-Di7AHGel.js`.

The public GitHub archive matches the accepted tagged CI artifact and the earlier candidate byte for byte. Clean installed UI and real AtMem startup passed on macOS, Linux and Windows. A cold npm-exec cache using the immutable GitHub URL reported 0.2.7. npm registry processing is tracked separately; plugin startup uses GitHub. Directory indexing and review remain separate from immutable GitHub installation.

## Changes and validation

Architect supplies a compact collapsible toolbar, left Properties rail, faster dense-diagram routing, undoable Arrange page repair, waiting feedback, direct nesting and named groups. The reference ZIP and local project data remain separate from model or cloud execution.

Local macOS validation: TypeScript, native manifest/plugin checks, 16 action/security tests, 21 panel browser checks and 12 support-prompt checks passed. Worker tests passed again with the final runtime fingerprint. Capabilities and model/cloud behavior are unchanged. Windows/Linux Orca execution remains unqualified.
