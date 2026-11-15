# Ready example: AI knowledge assistant

This package contains generated application code, Terraform, requirements, a detailed cost worksheet, a prebuilt Lambda artifact, and local validation evidence.

## Start here

1. Read `specification.md` for the bounded example and `evidence/price-ledger.json` for the cost assumptions and official AWS price sources.
2. Run `python3 -B scripts/check-example.py` using Python 3.13. The bundled runtime ZIP supplies the pinned pure-Python SDK dependencies. No package installation, model prompt or AWS call is made by these tests.
3. Review `evidence/qualification.json`: 13 application/source-contract tests, Terraform schema validation and two mock-provider plans. These are local checks, not deployed-system acceptance.
4. Use `terraform/prepared-example.tfvars.json.example` as the starting configuration. Sydney and Nova Lite are selected for this example. Supply your own AWS account ID and explicitly review the destination before enabling deployment.
5. Follow `terraform/BUILD.md`, `terraform/WEB.md` and `terraform/connectors/CONTRACT.md` for building, user onboarding and source synchronization.

The prepared Lambda ZIP is under `terraform/build/`; `artifact-hashes.json` records its SHA-256. The generated Python source, build script and hash-locked dependencies are included so the binary can be rebuilt.

## What the example implements

- A browser channel using Cognito sign-in, PKCE and software-token MFA.
- A JWT-protected HTTP API and bounded keyword-retrieval Lambda.
- A DynamoDB document catalog with explicit identity/region permissions, revision rechecks and tombstones.
- Bedrock Converse integration, cited answers, rejection of fabricated citations and abstention when authorized evidence is unavailable.
- Normalized source-contract synchronization with updates, deletion, conditional writes and recovery checkpoints.
- Scoped IAM, private static assets, CloudFront access control, encryption, finite log retention and point-in-time catalog recovery.

SharePoint and Confluence are represented by the original example's approved normalized **local test servers**. Real tenant adapters, inherited/group permissions, model/account access, quotas and cloud deployment require destination integration and checks. The Teams channel remains the original explicitly deferred feature. No cloud resources have been deployed.

## Cost scope

The detailed worksheet uses official AWS Price List snapshots and explicit monthly sample usage: 100 active users, 10,000 answers, 2,000 input and 1,000 output tokens per answer, 256 MiB ARM Lambda for 5 seconds, and documented storage/log/request quantities. Free-tier allowances and credits are not assumed.

The total is an illustrative incremental AWS estimate, not a bill or client quote. Existing browser/local fixtures have explicit zero-incremental-AWS lines. Real SaaS licences, tax, support plans and consulting are outside this sample. Change the usage assumptions before adapting it to a real client.

## Evidence boundaries

All application/source-contract checks use local fixtures and mocked AWS clients. Terraform plans use `mock_provider "aws"`. Actual account plans, real tenant integration, staging, production and live model-quality/drift monitoring have not been run. Preserve the generated review gate; the example does not authorize deployment.

The original compiler-generated handoff instructions are retained in `design-reference-START_HERE.md`. They describe the broader receiving-engineer workflow. This prepared package adds the built artifacts, local verification and documented sample inputs.
