# WorkBuddy OAuth (Tencent CodeBuddy) — research & design

> Status: **research / proposal — not implemented.** Do not start coding the
> impersonating login (Option A) before the compliance gate in §4 is cleared.
> Closest existing flow: [`zcode-oauth.md`](./zcode-oauth.md) (`OAuthMethodServerPoll`).
> Researched 2026-10-11. Everything about the wire protocol is reverse-engineered
> by third parties; nothing here was verified against Tencent's servers.

## 1. What WorkBuddy is

WorkBuddy is Tencent's desktop AI agent; it shares its backend with
**CodeBuddy** (Tencent Cloud Code Assistant). The China edition authenticates
against `copilot.tencent.com`; the international edition has its own
`codebuddy.ai` / `workbuddy.ai` surfaces. A subscription / credit balance is tied
to the account, not to a user-visible API key — the same shape as ZCode's coding
plan, which is why a "log in once, point every client at Tingly-Box" flow is
attractive.

## 2. Wire protocol (community reverse-engineering, unofficial)

Sources: escapade0668/workbuddy2api, WslzGmzs/workbuddy-cli-proxy,
cnb.cool/svn/workbuddy. Field details and polling cadence are **unconfirmed**.

| Step | Request (host `copilot.tencent.com`) |
|---|---|
| Mint login | `POST /v2/plugin/auth/state?platform=CLI` → `state`, `authUrl` |
| User signs in | browser opens `authUrl` (QR / WeChat / etc.) |
| Poll | `GET /v2/plugin/auth/token?state=…` (~10 min budget) |
| Account | `GET /v2/plugin/login/account?state=…` |
| Refresh | `POST /v2/plugin/auth/token/refresh` |
| Chat | `POST /v2/chat/completions` (OpenAI-shaped, SSE) |
| Models | `GET /console/enterprises/personal/models` |

Stored credential: `accessToken`, `refreshToken`, `expiresAt` (unit unknown),
`domain`; account `uid`, `enterpriseId`, `nickname`. Requests present
`User-Agent: CLI/2.63.2 CodeBuddy/2.63.2` plus account headers (`X-User-Id`).

Upstream quirks that any adapter must handle:

- Non-streaming requests are rejected (`11101`) → force `stream:true`, aggregate locally.
- Body `model` must be the upstream ID, else `11102`.
- Reasoning arrives in `delta.reasoning_content`; tool-call deltas merge by `index`.
- Quota exhaustion = HTTP 429, code `14018`, ~30 min `Retry-After`.
- Model availability is per account (glm-5.x, kimi-k2.7, deepseek-v4-*, hy3-*, …).

An API-key mode also exists in third-party plugins (`Authorization: Bearer` +
`X-API-Key` to the same `/v2/chat/completions`), and CodeBuddy's own docs
mention `CODEBUDDY_API_KEY` / `CODEBUDDY_AUTH_TOKEN` env vars for its CLI/SDK.

## 3. Is it allowed? — terms review

**Short answer: no explicit permission was found, and several clauses plausibly
prohibit the impersonating-login approach. No clause names "OAuth proxy" or
"gateway" literally, so this is an interpretation, not a legal opinion.**

### 3.1 Tencent WorkBuddy Service Agreement (workbuddy.ai/document/term, updated Aug 2026)

| § | Text (excerpt) | Relevance |
|---|---|---|
| 6.4(a) | "…reverse engineer, decompile, translate, disassemble, or otherwise attempt to extract any or all of the source code of the Service" | The protocol is derived by reversing the client. Us re-implementing it is downstream of that. |
| 6.4(f) | "…collect or harvest any information or data from the Service or our systems **or attempt to decipher any transmissions to or from the servers**" | Directly on point for reverse-engineered `/v2/*` traffic. |
| 6.4(d) | "use any data mining, robots or similar data gathering or extraction methods" | Automated/headless use. |
| 6.4(l) | "other acts not expressly authorized by Tencent" | Catch-all: absent authorization, third-party clients fall here. |
| 6.4(j) / 5.2(a) | circumventing "restrictions or protective measures"; "will not seek to circumvent such technical precautions" | Presenting a spoofed CLI identity to pass client gating. |
| 6.3 | "You may not otherwise transfer or make available the Service to someone else, whether for money, for any other forms of consideration or for free." | A gateway that serves other people / machines is "making available". Single-user local use is the only defensible reading. |
| 6.4(k) | no using Output to develop products that compete with Tencent | Edge case for downstream users. |
| 3.4(c), 11.2, 12.1(c) | Tencent may suspend "immediately and without prior notice" | Account-ban risk is real. |

Not found: any clause *permitting* third-party clients, or any developer/OAuth
program for WorkBuddy. The Acceptable Use Policy and Subscription Policy are
separate documents and **were not read** (the fetched page was truncated).

### 3.2 腾讯云代码助手软件许可及服务协议 (cloud.tencent.com/document/product/301/106125)

This is the stronger, more explicit text (likely governs the `copilot.tencent.com`
China edition; applicability to WorkBuddy specifically is unconfirmed):

- 8.2.1(4): no connecting to the software or systems via "插件、外挂或**非腾讯云经授权的第三方工具/服务**接入", nor copying/modifying client↔server interaction data.
- 8.2.1(6): no logging in to or using the software/service "通过**非腾讯云开发、授权的第三方软件**、插件、外挂、系统", nor making/distributing such tools.
- 8.2.1(2): no reverse engineering. 8.2.1(5): no forging runtime instructions/data.
- 7.1.2: never disclose account/password to others. 8.4.1: Tencent may penalize violations.

8.2.1(6) is a near-direct prohibition on what Option A does.

### 3.3 Community signal

The reverse-proxy projects themselves ship disclaimers ("unofficial", "own
authorized accounts only", "no sharing or resale", "author not responsible for
bans"), and some work around upstream moderation by rewriting prompts — we must
not copy that.

## 4. Compliance gate

Before any impersonating-login code ships (even behind a flag), at least one of:

1. Written authorization / partner arrangement from Tencent, **or**
2. A documented official third-party auth surface (OAuth app registration, public
   API with terms permitting gateways), **or**
3. Product/legal sign-off that experimental, user-owned, local-only use with a
   clear warning is acceptable to the project.

Absent that, Option A does not ship. This is a decision for the maintainers, not
something to settle in code review.

## 5. Options

| | Approach | Compliance | UX | Effort |
|---|---|---|---|---|
| **A** | ZCode-style `OAuthMethodServerPoll` login replaying `/v2/plugin/auth/*`, chat via `/v2/chat/completions` with spoofed CLI UA | **High risk** (§3: 6.4(a)/(f), 8.2.1(4)/(6)) | Best: scan once, done | Medium + ongoing UA/version chasing |
| **B** | Plain API-key provider (`copilot.tencent.com`, user pastes key from their profile) | Lower risk **if** the key is an officially issued credential for programmatic use — *unverified*; official docs list `CODEBUDDY_API_KEY` for the SDK/CLI, not for gateways | Good (paste key) | Small — no OAuth code, reuse OpenAI provider + stream-forcing transform |
| **C** | Drive the **official** CodeBuddy CLI / Agent SDK as the client (user logs in with Tencent's own tool; Tingly-Box orchestrates, like `@cc`) | Lowest: Tencent's own binary and login | Medium (needs CLI installed) | Medium, but does not give a generic OpenAI endpoint |
| **D** | Don't integrate; document "use WorkBuddy's custom model" in the other direction (WorkBuddy accepts OpenAI-compatible models, so it can point at Tingly-Box) | None | n/a | Doc only |

Note D is already possible: WorkBuddy's custom-model dialog accepts any
OpenAI-compatible endpoint, so Tingly-Box can be WorkBuddy's *upstream* today.

## 6. Recommendation

1. **Do not implement Option A now.** Open a request to Tencent (or confirm
   whether an official third-party program exists) and decide at the §4 gate.
2. Ship **D** immediately as documentation (a "use Tingly-Box from WorkBuddy"
   how-to) — zero risk, real user value.
3. Investigate **B**: confirm with Tencent docs/support that the API key is
   intended for programmatic/gateway use and what its terms are. If yes, it's the
   cheapest compliant integration.
4. Consider **C** if Tencent's CLI/SDK is the only sanctioned path.
5. If A is ever approved, follow §7.

## 7. If Option A is approved — implementation sketch

Mirror `zcode.go`; touchpoints identical to ZCode's.

- `ai/issuer.go`: `IssuerWorkBuddy = "workbuddy"` (+ `ai/provider.go` predicate).
- `ai/oauth/workbuddy.go`: `state → authUrl → poll → account`, bounded poll
  interval and timeout (`WorkBuddyLoginTimeout` ≈ 10 min, cap server interval at
  30 s like `zcodeMaxPollInterval`); `Refresh` via `/auth/token/refresh`.
- `ai/oauth/registry.go` / `config.go`: register with `OAuthMethodServerPoll`,
  `AuthStyleInNone`, `Hook: &NoopHook{}`; add to `ParseIssuer`.
- `internal/server/module/oauth/handler.go` (~L1253), `internal/command/oauth.go`
  (~L587), `internal/client/pool.go` (~L76): add the issuer beside ZCode.
- Transform: force upstream `stream:true` + local aggregation; map model IDs;
  surface `reasoning_content`; map `14018` → 429 with `Retry-After`. **No prompt
  rewriting to evade moderation.**
- Hard limits in product: single-user local use, no account pooling/rotation, no
  "share this endpoint" affordance; UI states "unofficial, may violate Tencent
  terms, use at your own risk" (UX principle: embed education in the product).
- Version pinning of the spoofed UA lives in one constant, documented like
  `claude-code-oauth-compat.md`.
- Frontend: icon in `BrandIcons.tsx` / `ProviderIcon.tsx`; API via `task codegen`.

## 8. Open questions

- Which agreement actually governs a `copilot.tencent.com` WorkBuddy account
  (WorkBuddy Service Agreement vs. 腾讯云代码助手协议)? Read the Chinese WorkBuddy
  terms and the Acceptable Use / Subscription Policies in full.
- Is the profile-page API key licensed for programmatic use via third parties?
- `expiresAt` unit, required headers beyond UA/`X-User-Id`, refresh rotation.
- International (`codebuddy.ai`) vs China (`copilot.tencent.com`) login hosts —
  one issuer or two (as with `zcode` / `zcode_cn`)?
- `www.codebuddy.ai/docs/cli/*` was unreachable from the research sandbox (DNS);
  the official HTTP API / IAM pages should be re-read from a normal network.

## Sources

- https://www.workbuddy.ai/document/term
- https://cloud.tencent.com/document/product/301/106125
- https://github.com/escapade0668/workbuddy2api
- https://github.com/WslzGmzs/workbuddy-cli-proxy
- https://cnb.cool/svn/workbuddy
- https://www.codebuddy.com/terms
