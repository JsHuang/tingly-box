# Native compaction contracts

Tracking proposal: [TEP-2160](https://github.com/tingly-dev/tingly-box/issues/2160).

Compaction is provider-owned state, not a new API style or scenario. Keep each
native contract on its own endpoint and preserve opaque state. In particular,
a chat summary is not an implementation of an encrypted compacted window.

## Surfaces

| Contract | Gateway surface | Handling |
| --- | --- | --- |
| OpenAI standalone compaction | `/tingly/:scenario[/v1]/responses/compact` | Native non-streaming JSON |
| Codex remote V2 | `/tingly/:scenario[/v1]/responses`, `compaction_trigger` input | Existing Responses streaming |
| OpenAI server-side compaction | `/responses`, `context_management` | Native Responses parameter and output passthrough |
| Codex local summary | `/responses`, ordinary summarization prompt | Existing normal inference path |
| Anthropic compaction controls | `/messages?beta=true`, native Beta parameters | Existing native Beta path; not an OpenAI compact endpoint |

The public standalone API is not deprecated merely because Codex CLI 0.163.0
uses different compaction mechanisms. Its documented output can include retained
messages as well as an encrypted compaction item: return the entire `output`
window unchanged, not just the encrypted item.

## Standalone forwarding

`HandleResponsesCompact` uses normal model authentication, team scope, rule
resolution and content-free service selection. It resolves the OpenAI dual URL,
rewrites only the model, sets non-streaming tracking, and uses
`ForwardOpenAIResponsesCompact` and `OpenAIClient.ResponsesCompact`. This is a
native gateway route, like images/decisions, not an admin/frontend SDK endpoint.

The request travels as raw JSON through the SDK's authenticated transport.
Typed input-union reserialization could invent IDs or lose fields on opaque
history. Do not run chat preprocessing, vision translation or Responses-create
defaults. Forwarding retains request cancellation and provider timeouts. Cache,
reasoning and output usage are normalized with the shared Responses usage helper.
Malformed successful upstream replies without an output array are gateway errors,
not fabricated successful compactions. Non-2xx upstream status is retained.

Codex OAuth rewrites the endpoint to
`/backend-api/codex/responses/compact`, maps the gateway's `:fast` model suffix,
and applies account/session affinity headers. It classifies the endpoint as JSON,
without forcing `stream=true`, adding `store=false`, or expecting SSE.
Images and ordinary Responses retain their existing protocol behavior.

Non-native API styles and explicitly chat-only providers return an explicit
`501 unsupported_operation`. Unknown OpenAI-compatible providers are allowed
to answer for their native endpoint; the gateway does not infer endpoint support
from a provider name or silently convert the request into a summary. The selected
service must support the operation; this endpoint does not add cross-provider
priority failover or advertise V2 globally.

The ordinary Responses attempt also rejects conversion of `compaction_trigger`,
opaque compaction input, and `context_management` compaction requests to another
API. Existing plain summarization requests can still use protocol conversion.

## Verification and limits

Tests exercise real gateway routes/auth/team handling and native dual URLs,
opaque item preservation, full response-window preservation, JSON path rewriting,
upstream 400/403/429/502, malformed successful responses, and unsupported backends.
The complete gateway harness also checks streaming and non-streaming native
Responses/Anthropic Beta compaction controls and rejects Responses-to-chat
compaction conversion.

These are mock upstream checks. They do not establish live model/account support
or fix the upstream `response protection is unavailable` service failure.
Anthropic's header-only dispatch and cross-protocol compaction semantics are
separate compatibility work; the existing Beta route uses `?beta=true`.

References: [OpenAI compaction](https://developers.openai.com/api/docs/guides/compaction),
[Anthropic compaction](https://platform.claude.com/docs/en/build-with-claude/compaction).
