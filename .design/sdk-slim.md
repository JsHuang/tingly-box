# sdk-slim：把 fork 的 SDK 裁剪到"我们真正用到的范围"

> 状态：**原型，可复现，未合入。** 代码在 `scripts/sdk-slim/`，一键复现 `scripts/sdk-slim/reproduce.sh`。
> 结论与数字都是在 `libs/` 三个 submodule（openai-go `f893e0f`、anthropic-sdk-go `58c963d`、go-genai `bfe8a87`）上实测的。

## 为什么要做

三个 SDK 是 submodule + `replace` 引入的 fork，内容绝大部分是 Stainless 生成的 API 面，我们只用其中一小部分。
这带来两个问题，**性质不同**，不要混在一起：

| 问题 | 性质 | 本文是否解决 |
|---|---|---|
| 体积/噪音：同步上游时 diff 巨大、IDE/编译慢 | 维护成本 | 是，见"裁剪" |
| **不能被第三方复用**：协议层想做成公开包，但 `replace` 只对主 module 生效，第三方 `go get` 拿到的是上游原版 | 分发 | **否**，裁剪不解决它；需要 fork 变成真实 module（改 module 路径、打 tag），见"后续" |

约束（来自讨论）：fork 必然存在；要最大化跟随上游并保持类型一致；`internal/` 不是障碍。

## 结论摘要

| SDK | 裁剪前（非测试 Go 行） | 裁剪后 | 目录大小 | module 依赖 |
|---|---|---|---|---|
| openai-go | 174,294 | **62,611**（−64%） | 15M → 7.5M | 4（tidwall 系列），本来就轻 |
| anthropic-sdk-go | 129,748 | **58,906**（−55%） | 9M → 3.6M | 根包 9 个轻依赖；保留 bedrock/vertex 子包时共 41 |
| go-genai | 31,519 | **25,055**（−20%，其中大头是打 no-auth patch + 删 tokenizer） | 2.3M → 1.4M | **17 → 2**（`cloud.google.com/go` 的 civil、`gorilla/websocket`） |

- 以上三个裁剪后，`tingly-box` 主 module `go build ./...`、`go vet ./...`、`go test ./... -count=1` **全部通过**，
  子 module（`ai imbot agentboot afk swagger`）测试也全部通过。
- 另有一个"只给协议层用"的 **types-only 变体**（见下）：genai 缩到 **2,772 行、1 个依赖**。

## 裁剪后是否正常可用（验证记录）

两层证据，都在 `libs/*` 上从干净状态用 `reproduce.sh` 裁剪后得到：

1. **使用方验证**：tingly-box `go build ./...`、`go vet ./...`、`go test ./... -count=1` 全部通过，子 module（`ai imbot agentboot afk swagger`）测试通过。
   协议层转换测试大量构造/解析 SDK 的请求、响应和流式事件类型，是对"保留部分行为不变"最直接的验证。
2. **差分验证**（`scripts/sdk-slim/verify/`）：把上游自带的测试文件放回裁剪后的树，丢掉引用了已被裁掉符号的文件，
   对剩下的测试，与**未裁剪的原始 submodule** 里同名测试逐个对比结果。

| SDK | 裁剪后仍可编译的测试 | 与原版同名测试结果一致 | 退化（原版过、裁剪后挂） |
|---|---|---|---|
| openai-go | 335 | 332 通过 + 3 同样失败 | **0** |
| anthropic-sdk-go | 1,091 | 1,088 通过 + 2 跳过 + 1 同样失败 | **0** |
| go-genai | 352 | 346 通过 + 6 跳过 | **0** |

那 4 个"同样失败"在原版里也失败，与裁剪无关：openai 的 `TestStreamingAccumulatorWithToolCalls` 需要本地 mock 服务（`localhost:4010`）、
`TestChatCompletionMessageConversionUsesCurrentFields/decoded` 的 JSON key 顺序断言；anthropic 的 `TestLoadConfig_EnvFillsMissingWorkspaceID` 会真实访问 OAuth 服务。

这些差分测试主要覆盖**底层机制**：`apijson`/`apiform`/`apiquery` 编解码、union 解码、SSE、`param`、请求构造、option、genai 的类型与转换。
上游针对被裁掉的 API 面的测试（openai 约 2,400 个、anthropic 约 1,800 个、genai 约 290 个）无法编译，没有被验证——它们对应的正是我们不用的接口。

**没有被证明的**：被保留的 API 面里，上游没写测试、tingly-box 也没覆盖到的路径；反射或接口隐式满足导致的运行时依赖（见"局限"）。
凡是裁剪结果要给第三方用，应当把 `surface/` 白名单对应的行为补成测试。

## 关键发现

1. **genai 的"重依赖"副作用几乎全是一个很小的 patch 就能消掉。**
   `google.golang.org/genai` 之所以拖进 grpc、protobuf、`cloud.google.com/go/auth`、opencensus 等约 15 个 module，
   只因为 `client.go`（ADC 自动发现、`httptransport`）、`live.go`（`Credentials.Token`）、`files.go`（`RegisterFiles(creds *auth.Credentials)`）三个文件
   import 了 `cloud.google.com/go/auth`。tingly-box 自己总是传入已鉴权的 `HTTPClient`，用不到这些。
   `patches/genai-no-auth.patch`（约 190 行 diff，3 个文件）把 `ClientConfig.Credentials` 改成一个只含 `QuotaProjectID` 的小接口
   （`*auth.Credentials` 仍满足它，**tingly-box 应用代码零改动**），删掉 ADC 与自动建 client 的分支、`UseDefaultCredentials`、`RegisterFiles`、Live API 的 token 分支。
   打完 patch 后 genai 的依赖从 17 个 module 降到 2 个，**不需要任何裁剪**就达到。
2. **入口集合决定结果。** 入口取"整个 tingly-box（含测试）"时，openai 保留 36%、anthropic 保留 48%；
   入口收窄到 `internal/protocol/...` 生产代码时，openai/anthropic 几乎不变（协议层本身就用了应用用到的绝大部分），
   genai 则从 92% 降到 20%（协议层只用 48 个纯数据类型符号）。
3. **types-only 的 genai 受限于应用层：** `internal/protocol/stage/upstream` 依赖 `internal/client`，后者用了 `genai.Client/NewClient/ClientConfig`，
   所以应用不能直接换成 types-only 版本；协议层 21 个包里 20 个用 types-only 版本编译并通过测试（临时改 import 验证，已还原）。
   发现 1 之后，这个拆分的必要性大幅降低：no-auth patch 后的完整 genai 已经只有 2 个轻依赖。
4. **入口必须是显式白名单。** 公开给第三方的 SDK 不能按"我们当前用了什么"裁剪，否则第三方一用到我们没引用的符号就编译失败。
   `surfacegen` 生成 `surface/surface.go`（每个用到的导出符号一行 `var _ = pkg.X`），它既是裁剪入口也是对外承诺，由编译器检查。

## 方法：声明级可达性分析（`scripts/sdk-slim/measure`）

用 `golang.org/x/tools/go/packages` 加载入口代码和 SDK 全部包（带类型信息），对 SDK 里每个顶层声明（类型/函数/方法/var/const spec）建节点，
`TypesInfo.Uses` 里 SDK 对象的引用建边，从入口代码引用到的 SDK 对象出发做可达性，输出：
(a) 每个文件的总行数与可达行数；(b) 不可达声明的行区间（`*.spans`）。`apply` 按区间删行、删整文件，再用 `x/tools/imports` 清理 import。

规则（每一条都来自一次真实失败）：

- **可达的类型保留其全部方法**（接口满足、JSON 反射、union 的 `AsAny` 等隐式依赖看不见）。`CLOSEDMETHODS=1` 是"闭世界"模式，只保留被引用的方法和一组固定的接口约定方法，丢弃的方法写进 `*.dropped_methods`——这是**选择而不是确定**，应当报告而不是静默。
- **`Client` / `*Service` 结构体的字段按使用裁剪**（Stainless 风格：`client.Beta.Messages.New`）：只保留被访问的字段和对应的 `New…Service`，`NewClient`/`New…Service` 函数体里对未用服务的赋值语句一并删除。
  **这条规则不适用 genai**（它的 `Client` 用结构体字面量构造，会报 `unknown field`），用 `NOSVC=1` 关闭。
- **`iota` 常量组和隐式重复的常量组整组保留**，只删其中一项会改变其余项的值或破坏编译（`internal/apijson/exactness.go` 踩过）。
- `init` 函数和 `var _ = …` 在可达的包里一律保留。
- **测试文件也是入口**（枚举常量如 `openai.ReasoningEffort…` 只在测试里用）；上游自带的 `*_test.go` 一律删除。
- **从未被入口 import 的包不会被分析**，但它们里面的代码仍会引用被删掉的内部包而编译失败，所以要整包删除：
  openai 的 `bedrock`；anthropic 的 `aws toolrunner mcp tools googlecloud foundry lib/betafallback lib/environments`；genai 的 `tokenizer`（并带走 `go-sentencepiece` 依赖）。
  **这份清单目前是手工维护的**，是流程里最不自动的一步。

## 复现

前置：`git submodule update --init --depth 1`，`libs/*` 工作区必须干净。

```bash
scripts/sdk-slim/reproduce.sh            # 裁剪三个 SDK 并 build/vet/test tingly-box，约 3 分钟
scripts/sdk-slim/reproduce.sh --no-test  # 只裁剪 + build + vet
# 只改 libs/ 工作区，不提交、不推送。还原：
for d in openai-go anthropic-sdk-go go-genai; do git -C libs/$d reset -q && git -C libs/$d checkout -q . && git -C libs/$d clean -fdq; done

# types-only 变体：把 genai 裁成只含协议层用到的类型，输出到新目录并改 module 路径
scripts/sdk-slim/genai-types-only.sh /tmp/google-api [github.com/tingly-dev/google-api]
```

`reproduce.sh` 的步骤：A）以整个 tingly-box（含测试）为入口，对 openai/anthropic 做可达性分析并删除，再删未分析的包；
B）给 genai 打 `genai-no-auth.patch`，以 `NOSVC=1` 对 genai 做可达性分析并删除；C）`go build/vet`；D）全量测试。
`genai-types-only.sh` 从 submodule 已提交的版本（`git archive HEAD`）出发，不碰 `libs/`。

目录：

```
scripts/sdk-slim/
  measure/      可达性分析（环境变量见文件头注释）
  apply/        按 measure 的输出删文件/删行并修 import
  surfacegen/   从入口代码生成 surface/surface.go
  patches/genai-no-auth.patch
  reproduce.sh  genai-types-only.sh
  verify/       restore_tests.py（把上游测试放回并剔除不能编译的）、diff_tests.py（与未裁剪版本逐测试对比）
```

工具各自是独立 module（`GOWORK=off go build`），不在 tingly-box 的 go.work 里。

## 踩过的坑（别再踩）

- tingly-box 的 `go.work` 会让 `libs/<sdk>` 里直接 `go build` 找不到依赖，需要 `GOWORK=off`。
- `tingly-go prune` 只加载**目标所在的 module**：对 `libs/*/message.go:MessageNewParams` 报 0 引用（实际上百处）；而且不会删除，导出符号永远不判"可安全删除"。所以裁剪引擎不能直接用 `prune`，需要多 module 可达性分析。
  `tingly-go move` 跨 module 是 `cross_module` blocker（设计如此）。
- 把成品复制到别的仓库时，**不要 `cp -r src/. dst/`**：会连 `.git`、`LICENSE`、`README.md` 一起覆盖掉目标仓库自己的（本次原型踩过一次，重新 clone 恢复）。用 `tar --exclude` 并明确排除这些。
- `Tests: false` 加载入口会漏掉只在测试里用的枚举常量，之后 `go vet` 会因为 `undefined: openai.ImageGenerateParamsSize1024x1024` 一类错误失败。

## 局限

- 声明级分析**不追踪接口实现和反射**。目前靠"可达类型保留全部方法"兜底，闭世界模式不兜底。裁剪后必须跑 build + vet + 全量测试。
- 默认 build tag 与平台：只分析当前平台的文件。
- 清单类步骤（未分析的包要整包删除、genai 的 patch）依赖人工判断，上游升级后要重新验证。
- 裁剪后 API 面 ≠ 上游：第三方使用时需要明确"这是协议子集"。
- 未处理 LICENSE/NOTICE：openai-go、go-genai 是 Apache-2.0，anthropic-sdk-go 是 MIT；被修改的文件要保留许可证并注明修改。

## 后续（未做）

1. **分发**：fork 改成真实 module（改 `go.mod` module 路径与 import、打 tag），才能被第三方 `go get`。目标仓库 `tingly-dev/openai-api`、`anthropic-api`、`google-api` 已建（目前只有 README/LICENSE）。建议每个仓库保留一条纯镜像分支（上游原样 tag），`main` 由流水线生成。
2. **把流水线沉淀进 `tingly-go`**：新增 `slim` 命令（闭世界模式 + 删除 + 清理 import + `followup` 报告被丢弃的方法），按它的惯例先加 `e2e/conformance_test.go` 用例并写 `.design/`。`move` 本身不适合这件事（它的契约是 module 内重构）。
3. 把 `reproduce.sh` 里的"未分析包清单"自动化：删完后迭代 `go build ./...`，把只因被删符号而失败、且 tingly-box 不 import 的包整包删除。
4. 评估是否仍需要 types-only 的 genai（见"关键发现 3"）。
5. 给 openai/anthropic 同样做 `surface` 白名单版本，看协议层入口能否比整个应用再缩小。
6. LICENSE/NOTICE 与修改声明。

## 原型产物（本地，未提交）

`/home/user/tingly-dev/google-api` 的本地克隆里放着一次早期 genai types-only 原型的输出（未提交、未推送；该仓库只读挂载）。以脚本重新生成为准。
