# Orca integration v0.1.0

Owner request, 2026-11-13: install Orca, test Architect integration, develop and publish an Orca plugin.

## Scope and dependencies

1. Install the official desktop app and discover its version-matched plugin API.
2. Test the existing saved-project → ZIP → Orca CLI boundary without a model or cloud operation.
3. Build a components panel backed by a trusted worker. Select a local project; start the pinned npm application in a dedicated terminal; open its verified local UI in Orca; inspect allowlisted exported specifications.
4. Validate manifests, TypeScript, success/failure tests, actual worker calls and native rendering. Request the user’s exact worker/capability approval before enabling. Approval was received in this session.
5. Publish a public Apache-2.0 Git repository, immutable v0.1.0 tag and `orca-plugin` topic. Check the directory. The generated community catalog is controlled by Orca’s indexer; do not edit it or claim listing before observation.

## Sources and constraints

- Installed host: Orca 1.4.257; bundled `orca-plugin-authoring` skill and generated `.orca/types` are authoritative for this build.
- Supplementary upstream reference revision: `ee99d584d98b5c7334fa8d57153311079ecee13c`. Main has methods absent from 1.4.257; this plugin does not use those newer methods.
- https://github.com/stablyai/orca/blob/main/docs/reference/plugin-authoring.md
- https://github.com/stablyai/orca/blob/main/docs/reference/plugin-listing-policy.md
- https://github.com/stablyai/orca-community-plugins

Least authority that covers terminal startup is `trusted-worker`; sandboxed panels cannot send terminal commands. No MCP, skills or agent-harness contribution is claimed: Orca reserves those manifest fields. Native browser opening uses the documented Orca CLI because the installed plugin host API has no browser-tab method.

## Follow-up

Qualify Windows/Linux, support a future independently released Architect runtime, and consider a memory-specific plugin only after choosing that scope. These are not part of v0.1.0 claims.

0.1.1 follow-up: actual Stop testing detected that host terminal text did not interrupt the npm app. Resolve and close only the plugin-created terminal through the documented CLI, then verify the app port closes. Keep the original release/tag immutable and publish a patch.


0.1.2 owner follow-up: replace the plain panel identity with AtMem AI Architect, the existing AtMem brain, pink header and native framed controls. Preserve action semantics and capabilities. Verify branding at a narrow sidebar width before publishing.


0.1.3 stable update: pin the public npm Architect0.2.1 maintenance release, verify startup/open/stop after registry publication, retain unchanged capabilities and publish an immutable tag. Community catalog inclusion is observed for0.1.1; newer tag ingestion is controlled by Orca's automatic indexer.


0.1.4 owner request: show the actual Architect workspace, a complex public example and Terraform/Orca in the plugin directory. Register a branded cover and screenshot gallery in the manifest, not only the README. Use public enterprise-connectors evidence and preserve all visible draft/review limitations; no private project capture or generated-image imitation of product UI.
