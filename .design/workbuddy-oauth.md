# WorkBuddy OAuth (Tencent CodeBuddy) — research & design

> Status: **OAuth: research / proposal — not implemented.** Do not start coding the
> impersonating login (Option A) before the compliance gate in §4 is cleared.
> **Agent support (Option D) is implemented** — see §9.
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

| **E** | **Official CodeBuddy OAuth2 open platform** (§5.1): register an app, Authorization Code (user login) or Client Credentials (enterprise/CI) | **Sanctioned** — documented by Tencent | Good if the token can reach chat | Small–medium; standard OAuth, fits existing `OAuthMethodAuthorizationCode` |

Note D is already possible: WorkBuddy's custom-model dialog accepts any
OpenAI-compatible endpoint, so Tingly-Box can be WorkBuddy's *upstream* today.

### 5.1 Option E — official OAuth2 (found after the first pass)

Tencent documents a real OAuth 2.0 / OIDC surface on `copilot.tencent.com`
(IAM docs: workbuddy.ai/docs/cli/iam; example app: cnb.cool/CNBshow/openapp_example,
a fork of `codebuddy/openapp_example`):

| | |
|---|---|
| Authorize | `https://copilot.tencent.com/oauth2/authorize` (`client_id`, `redirect_uri`, `state`, `scope=openid`, `response_mode=query`) |
| Token | `https://copilot.tencent.com/oauth2/token` — `authorization_code` (`client_id`, `client_secret`, `code`, `redirect_uri`) or `client_credentials` |
| Userinfo | `https://copilot.tencent.com/oauth2/userinfo` |
| Registration | enterprise app via `copilot.tencent.com/apiDocs/open-platform.html` → Client ID/Secret |
| Prereq | enterprise users must buy **CodeBuddy Premium** first |
| CLI use | token via `CODEBUDDY_AUTH_TOKEN` or `apiKeyHelper` (priority: AUTH_TOKEN > apiKeyHelper > API_KEY) |

Unknowns that decide whether E replaces A:

- The docs only show the token being consumed by CodeBuddy's own CLI/SDK and
  `userinfo`; they **do not say the token can call `/v2/chat/completions`**
  from a third-party gateway. Verify with a real app.
- Client Credentials is enterprise/server-side; the personal-user Authorization
  Code path may require an approved app, and how a project like Tingly-Box
  registers one (per-user app vs. a shared client) is unanswered.
- Token lifetime and refresh semantics are not documented.
- The docs also describe `CODEBUDDY_BASE_URL` for pointing the CLI at a third-party
  gateway — i.e. CodeBuddy-as-client → Tingly-Box, which is Option D from the
  CLI side and is explicitly supported.

If E's token works against the chat endpoint, it is the compliant path and
supersedes A; implementation is a standard `OAuthMethodAuthorizationCode`
provider (callback server already exists) rather than a ZCode-style poller.

## 6. Recommendation

0. **Verify Option E first** (§5.1): register a test app and check whether its
   token can call chat. This may make A unnecessary.
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

## 9. Implemented: WorkBuddy as an agent (Option D)

Decision (2026-10-11): ship WorkBuddy as a *client* of Tingly-Box, no WorkBuddy
OAuth. Same shape as Pi/Xcode: a scenario + a guide page.

- **Backend:** `typ.ScenarioWorkBuddy = "workbuddy"`, OpenAI transport,
  registered in `BuiltinScenarios()` / `scenario_registry.go`; endpoint
  `/tingly/workbuddy` (`tbclient`). Route mounting is generic
  (`/tingly/:scenario[/v1]/...`), so nothing else is needed.
- **Frontend:** `UseWorkBuddyPage` (`AgentPage` descriptor, guide-type setup),
  `WorkBuddyConfigModal`, nav entry, `/agent/workbuddy` route, `workbuddy`
  i18n (en/zh/ru), icon (`assets/icons/workbuddy.svg`, the official logo from
  workbuddy.ai, full colour), guardrail scope label, mock rule.
- **User-facing steps:** WorkBuddy → Settings → Model → Add model → Custom;
  URL = `{base}/tingly/workbuddy/v1/chat/completions`, API key = Tingly-Box
  token, Model ID = a request model from Model Rules; tick *Tool calling* only
  unless the routed model supports images/reasoning. This is the path WorkBuddy's
  own docs describe (Settings UI; with "Custom Protocol" off it validates /
  completes the `/chat/completions` path).
- **Shown by default** (v7 of the hidden-agents defaults; `custom` too). A
  one-time migration clears `custom`/`workbuddy` from stored hidden lists; hiding
  them afterwards is stored explicitly and respected.
- **No file-based config, and no auto-config — deliberately.** The official
  WorkBuddy doc says the UI needs "no configuration file editing" and mentions
  only the *legacy* `~/.codebuddy/models.json` (still honoured, migrated into the
  UI). The Tencent Cloud doc says "`workbuddy/models.json`" (no leading dot).
  `~/.workbuddy/models.json` appears only in third-party guides (apiyi, CloudBase,
  LongCat, CSDN), which also disagree on the top-level shape (`{"models":[…]}`
  vs a bare array) and on whether a full restart is needed. Until Tencent
  documents the file the desktop app actually reads and writes, writing it for
  the user could silently do nothing or clobber their config, so the guide
  shows UI steps only. Revisit auto-config (OpenCode/DSH pattern +
  client-config-status chip) if/when that is confirmed on a real install.
- **Unverified end to end:** SSE/tool-call behaviour against the routed models.

## Sources

- https://www.workbuddy.ai/document/term
- https://cloud.tencent.com/document/product/301/106125
- https://github.com/escapade0668/workbuddy2api
- https://github.com/WslzGmzs/workbuddy-cli-proxy
- https://cnb.cool/svn/workbuddy
- https://www.codebuddy.com/terms
