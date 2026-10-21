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

Opaque native compaction input and native `context_management` controls still
require a native Responses backend. A standalone compact request is never
silently replaced by a summary. V2 triggers have a separate TB summary adapter,
which is described below.

## Codex V2 on ordinary inference providers

Codex CLI 0.163.0 requires exactly one `compaction` output item delivered by
`response.output_item.done`, followed by `response.completed`. Returning a plain
assistant message cannot satisfy that contract. The client stores and resubmits
`encrypted_content` as an opaque string; decryption is a provider responsibility.

For a V2 request (a final `compaction_trigger` without native context-management
controls), Codex OAuth providers keep their original native request. Other
providers use TB's summary adapter, which sends an ordinary non-streaming
Responses request through the selected attempt's existing plan, transforms,
forwarding, usage accounting and error handling. Existing protocol conversion
also serves Chat Completions and Anthropic backends. This does not add support
for Google-style providers, which the Responses ingress already rejects.

The adapter serializes visible history and original instructions as reference
data and asks for an actionable text summary with a 4096-token output budget.
Tool calls/results are transcript data; source tools are removed, tool choice is
none, and MCP injection/execution is disabled. Binary media is replaced by a
placeholder and opaque reasoning ciphertext is omitted; visible reasoning
summaries survive. Original images/files cannot be recovered from a text summary.

Only a completed response with nonempty text becomes one compaction item. Its
wire `encrypted_content` contains `tingly-box:summary:v1:` followed by base64url
UTF-8 summary text. **This is encoding, not encryption or native OpenAI
ciphertext.** The payload is user-controlled reference material, never a system
message or a trusted instruction. It has a 256 KiB decoded limit and no server
cache, so resumes and TB restarts work without session storage or sticky routing.
Malformed, unknown-version and oversized TB payloads return a client error.

Every later `/responses` request expands TB envelopes to user-role summary
messages before any native forwarding or protocol conversion, including when
routing changes to Codex. This makes TB-owned summaries portable across supported
backend protocols; they require TB to interpret them and cannot be sent directly
to another gateway/provider. Native opaque compaction is never decoded or falsely
made portable. A summary request containing native opaque compaction, a
`previous_response_id`, or a server-side conversation is rejected because the
adapter cannot reconstruct that history. Continue such sessions with the native
provider. Capability-aware selection and native-ciphertext migration remain
separate work.

For a streaming V2 caller, TB emits created/item-added/item-done/completed events
only after summary validation. No partial summary can replace the caller's
history. The response includes `X-Tingly-Compaction: summary-v1`; errors and
truncation produce no completed compaction and retain upstream HTTP status.
The existing outer priority-failover loop can retry failed summary attempts;
there is no blanket single-provider retry and no native-protection-error fallback.
Native `context_management` thresholds are not emulated by this adapter.

## Verification and limits

Tests exercise real gateway routes/auth/team handling and native dual URLs,
opaque item preservation, full response-window preservation, JSON path rewriting,
upstream 400/403/429/502, malformed successful responses, and unsupported backends.
The complete gateway harness also checks streaming and non-streaming native
Responses/Anthropic Beta compaction controls and rejects Responses-to-chat
compaction conversion.

These are mock upstream checks. They do not establish live model/account support
or fix the upstream `response protection is unavailable` service failure.
Anthropic's header-only dispatch and automatic native thresholds are
separate compatibility work; the existing Beta route uses `?beta=true`.

References: [OpenAI compaction](https://developers.openai.com/api/docs/guides/compaction),
[Anthropic compaction](https://platform.claude.com/docs/en/build-with-claude/compaction).
