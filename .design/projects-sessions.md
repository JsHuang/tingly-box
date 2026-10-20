# Projects 的会话统一模型

> 状态：提案，待 YZ 拍板最后几处（见“需要拍板”）。取代 [projects-im.md](./projects-im.md) 里“统一到 Project ID”一节，
> 也取代 [projects-desk-absorption.md](./projects-desk-absorption.md) 的数据模型决定。图见
> [projects-im.pencil.md](./projects-im.pencil.md) 的 “Sessions”。

## 为什么

IM 要并进 Projects，需要回答“一个聊天绑到哪”。先后试过三种答案：绑项目、绑项目或工作目录、给项目加 `kind`。
每次都发现同一件事：**项目的 coordinator 对话、项目里的线程、文件夹里的会话、IM 里的一次聊天，本质上都是用户与 agent 的一次交互**，
区别只是有没有父、有没有分支、谁在听。现在的代码把它们分在三处：`project_messages`、`threads`、
`project_id` 为空的 `threads`，各有各的接口、事件和等待信号；`Thread.Worktree` 在文件夹会话里其实是文件夹路径，
`Thread.SessionID` 又是 Claude Code 的会话 id，名字都在互相打架。

大批量推广之前一次理顺，比之后带着旧数据再改便宜得多。

## Claude 自己怎么做（调研）

查的是 Claude Code 在本机落盘的结构（会话转录 jsonl、子 agent 目录、session 注册信息），不是猜的：

- **会话是唯一单位**：一次交互就是一份转录，带 `sessionId`。
- **子 agent 也是一份独立转录**：有自己的 `agentId`，`meta` 里记着 `spawnDepth`、触发它的 `toolUseId`、自己的 worktree 和分支。
  和主会话的区别只有一个“父指针”，存储和消息格式一样。
- **渠道是消息的属性**：每条消息有 `origin`（`human`、`peer`、`task-notification`），每个会话有 `entrypoint`
  （这个会话是 `remote_projects`）。Web、IM、子 agent 回报，对会话来说都只是“这条消息从哪来”。
- **会话之间可以互发消息**：每个会话有名字和通信端点，`peer` 消息不分上下级。

结论：层级、渠道、隔离方式（worktree）都是会话的**属性**，不是不同的实体。我们照这个做。

## 模型

只有三样东西：

```
Project     一组会话共享的上下文（目标、指令、仓库、记忆、文件库）；kind = project | folder
Session     唯一的会话单位；parent、role、cwd、分支都是属性
Event       会话里的一步（消息、工具调用、审批……）；来源是属性
```

### Project

`kind=project`：有目标、指令、仓库、记忆，下面有一个 coordinator 会话和若干 worker 会话。
`kind=folder`：一个文件夹，没有 coordinator，下面是若干 solo 会话。`path` 是规范化后的文件夹路径，唯一。
今天的 `Workdir` 表和 `project_id` 为空的文件夹会话都变成它。新的类别（例如只聊天的入口）只是多一个 `kind`。

`kind` 只管 Project 级的东西：有没有目标和记忆、侧栏分哪一组、能不能 review 合并。**它不管路由**，路由只看会话。

### Session

由 `Thread` 改名并扩展，coordinator 对话也落成一个会话：

| 字段 | 含义 | 备注 |
|---|---|---|
| `id` | 会话 id | 绑定、地址、事件都认它 |
| `project_id` | 所属项目 | 必填（原来文件夹会话为空） |
| `parent_id` | 父会话 | worker 的父是 coordinator；solo 和 coordinator 为空 |
| `role` | `coordinator` / `worker` / `solo` | 界面上的叫法按它定，见下 |
| `agent` | 谁在跑 | `llm`（coordinator 的循环）/ `claude-code`；以后加别的 |
| `seq` | 项目内编号 | 给 `@N` 用，自增不复用 |
| `cwd` | agent 运行的目录 | 取代 `Worktree`；文件夹会话就是文件夹，worker 是它的隔离目录，coordinator 是项目目录 |
| `repo_path`、`base_branch`、`branch` | 隔离分支 | 有 `branch` 才表示在独立分支上；文件夹会话为空 |
| `engine_session_id` | Claude Code 的会话 id，用于续接 | 取代 `SessionID`，不再和“会话”撞名 |
| `created_by` | `coordinator` / `suggestion` / `user` | 取代 `Thread.Origin`，让 `origin` 只留给事件 |
| 其余 | `title`、`task`、`status`、`wait_reason`、`model`、`profile`、`permission_mode`、`auto_answer`、用量、`last_report`… | 不变 |

界面上的叫法：`worker` 叫“线程”（和 Claude Projects 一致），`solo` 叫“会话”，`coordinator` 叫“项目对话”。
**一个实体，由 `role` 决定标签**，代码里不再有第二个词。

### Event

`ThreadEvent` 和 `ProjectMessage` 合成一张 `session_events`：`session_id`、`kind`、`content`、`payload`、`request_id`、
`parent`（子 agent 的 Agent 调用）、`created_at` 不变，新增来源：

| 来源字段 | 含义 |
|---|---|
| `origin` | `web` / `im` / `session` / `system` |
| `origin_ref` | `session` 时是发送方会话 id（coordinator→worker 的指令、worker→coordinator 的汇报都是它） |
| `origin_platform`、`origin_chat` | `im` 时的平台和 chat |

coordinator 特有的消息种类（`thread_started`、`suggestions`、`thread_update`）直接作为事件 `kind`，payload 不变。
原来的 `From`（`user`/`coordinator`）由 `origin` 取代。

### 绑定

```
ChannelBinding(platform, chat_id) ──▶ session_id
```

一个 chat 绑定一个会话，唯一键 `(platform, chat_id)`，没有 `target_kind`、`workdir_id`、`focus_thread_id`。

- 绑项目：`session_id` 是它的 coordinator 会话，**界面上选项目，后端解析成 coordinator**。
- 绑文件夹：`session_id` 是当前 solo 会话。`/new` 开新会话并把绑定移过去，旧会话留在文件夹里。
- `/focus #2` 是改绑到 worker；`/back` 是改绑到 `parent_id`。不需要“聚焦”这个单独的状态。
- `@2 …`、引用回复是**只送这一条**，不改绑定；送达的会话就是被点名的那个，`origin` 记 `im`。
- 收件规则只有一条：**chat 收到它绑定的会话的外发事件，以及这个会话所有后代的“需要你”事件（审批、提问）**。
  worker 的汇报本来就是 coordinator 里的事件，所以绑 coordinator 的 chat 自然收到；绑 worker 的 chat 只收那一个线程的。
- Web 项目页页头的“已绑定的 IM”，是绑在这个项目 coordinator 上的 chat；线程页同理显示绑在它自己上的。

### 地址和消息

给任何会话发消息只有一个操作：`Send(session_id, text, origin)`。用户在 Web 发、IM 发、coordinator 给 worker 发、
worker 向 coordinator 汇报，都是它，差别只在 `origin`。排队、暂停和归档检查、事件推送自然一致。

## 命名收拾

| 现在 | 之后 | 原因 |
|---|---|---|
| `Thread` | `Session` | 唯一单位；“线程”只是 worker 的界面叫法 |
| `Thread.Worktree` | `cwd` | 它在文件夹会话里根本不是 worktree，在 worker 里才是 |
| `Thread.SessionID` | `engine_session_id` | 避免和 `Session` 撞名 |
| `Thread.Origin` | `created_by` | `origin` 留给事件的来源 |
| `ThreadEvent` + `ProjectMessage` | `session_events` | 同一种东西 |
| `workdirs` 表、`Workdir` | `projects.kind=folder` + `path` | 不再有第二套身份 |
| `<project>/worktrees/<thread>/` | `<project>/sessions/<id>/`（新会话）；旧会话的 `cwd` 不动 | 磁盘上的目录不搬，`cwd` 记全路径 |
| `/projects/:id/threads`、`/projects/sessions`、`/projects/workdirs` | `/projects/sessions`（`?project_id=`、`?role=`） | 一套接口 |
| `project_id == ""` 的 12 处判断 | `project.kind` 或 `session.role` | 判断依据是显式字段 |

“工作目录”这个词和 worktree 太像，`kind` 用 `folder`，界面叫“文件夹”（代码里已经有 working folder 的说法）。

## 迁移（升级时一次，幂等）

1. `projects` 加 `kind`（默认 `project`）、`path`；`threads` 加新列。
2. `workdirs` 的每个路径、以及 `project_id` 为空的会话用到的每个 `worktree` 路径，各建一个 `kind=folder` 的项目
   （名字取文件夹名；路径规范化后唯一）。把这些会话的 `project_id` 回填。
3. 每个 `kind=project` 的项目建一个 coordinator 会话（`role=coordinator`，`agent=llm`，`cwd` 为项目目录）。
4. `project_messages` → `session_events`：挂到该项目的 coordinator 会话，**保留 id 和 `created_at`**，`Source*` 映射成 `origin*`；
   `thread_events` → `session_events`，`From` 映射成 `origin`。
5. `threads` 重命名为 `sessions`：`Worktree`→`cwd`，`SessionID`→`engine_session_id`，`Origin`→`created_by`；
   worker 填 `parent_id` 和 `role`；按创建顺序给每个项目回填 `seq`。
6. `channel_bindings`：`project_id` + `focus_thread_id` 折成 `session_id`（有聚焦用线程，否则用该项目的 coordinator 会话）；
   去掉 `target_kind`、`workdir_id`。
7. 校验：会话总数 = 原线程数 + 项目数；事件总数 = 原两表之和；每个会话都有归属；`engine_session_id` 一个不丢。
   任何一项不符就**不提交**，保持旧库不变并报错。
8. 旧表保留一个版本，只读不写，下个版本删除。

不动的东西：磁盘上的 worktree、Claude Code 的会话文件、附件。迁移在服务启动、运行时起来之前做，不会碰到正在跑的会话。

## 影响面

- **后端**：`projects/internal/db`、`project`（threads/sessions/coordinator/transcript/attachment/channels）、
  `server/module` 的 handler；Coordinator 的消息读写换成事件；`Relay`、`ChatBridge` 改按会话路由。
- **前端**：`@tingly/projects` 里 Thread 相关的类型、页面、hooks 改名；项目页和文件夹页共用布局，按 `kind` 隐藏项目才有的区块；
  侧栏两组按 `kind` 过滤同一个列表，等待信号合成一份。
- **IM**：绑定页和绑定弹窗列“项目”和“文件夹”，选中后后端解析成会话。
- **API**：这是一次破坏性改名。没有大批量推广，独立版 Projects 的外部使用者很少，所以**不做兼容别名**，只在发布说明里写。
  （见“需要拍板”。）

## 里程碑（替换 projects-im.md 里的 M2a/M2b）

| | 内容 | 说明 |
|---|---|---|
| **S1 数据模型** | `sessions`、`session_events`、`kind`/`path`、coordinator 会话、迁移和校验、旧库快照测试；`project` 包按新模型读写 | 先保持 HTTP 的路径和 JSON 形状不变（handler 里做映射），前端不动，PR 可独立合并 |
| **S2 接口与前端** | 接口收敛成 `/projects/sessions`，删除映射；前端改名、侧栏按 `kind`、项目页与文件夹页合并；`task codegen` | 破坏性改动都在这一步 |
| **M2b 文件夹绑定** | 绑定改为 `session_id`；绑文件夹、`/new`、`/stop`；弹窗列两类 | 取代原 M2b |
| M3 | 审批与提问进 IM（收件规则已定） | 不变 |
| M4 | `@N`、引用回复、`/threads`、`/focus`（= 改绑）、`/back`（= 绑到父） | `seq` 已在 S1 落地 |
| M5 | 未绑定走 coordinator；删 Remote 页面、SmartGuide、`remote/session`；旧绑定转换 | 不变 |
| M6 | coordinator 路由（`@opus`、`@codex`） | `agent` 字段是它的落点 |

S1 是风险最集中的一步（迁移），所以单独成 PR、带快照测试，并且不改任何外部行为。

## 风险

- **迁移写错会让对话消失**：事件总数、会话总数和归属的校验必须在提交前跑，测试用一份带文件夹会话、旧绑定和 coordinator 对话的旧库快照。
- **coordinator 消息的形状**：`ProjectMessage.role` 和 `kind` 要无损映射到事件；`Payload` 原样保留，渲染端按 `kind` 取，不依赖表。
- **路径重复**：大小写、末尾斜杠、软链接不一致会产生重复的文件夹项目；入库前统一规范化，唯一索引兜底。
- **事件表变大**：两张表合一，按 `session_id` 建索引；本地 SQLite 的量级可以接受。
- **M1 已合并的绑定接口**：`PUT /channel-bindings` 目前收 `project_id`。S1 里继续接受它（解析成 coordinator 会话），
  响应多一个 `session_id`；S2 再把请求改成 `session_id`。前端 #2146 因此不用跟着改。

## 现在不做，但模型留了口子

- 独立聊天（`Conversation`/`Message`）也是一次与 agent 的交互，将来可以落成 `role=solo`、`agent=llm` 的会话。
  这次不并，避免范围失控；并的时候不需要新表。
- 会话间的 peer 消息（worker 之间直接对话）：`Send` 和 `origin=session` 已经能表达，不开放。
- 其他 agent（codex 等）：`agent` 字段。

## 需要拍板

1. **界面叫法**：worker 叫“线程”、solo 叫“会话”、coordinator 叫“项目对话”，由 `role` 决定（建议）。还是全部叫“会话”？
2. **`kind` 的名字**：`folder`（建议，避开和 worktree 的相似）还是沿用 `workdir`？
3. **API 不做兼容别名**（建议，推广前破坏一次）。还是保留旧路径一个版本？
4. **文件夹的“移除”**：只归档项目、会话保留（建议，和现在一致）。
5. **S1 先不动 HTTP 形状、S2 再改**（建议，PR 小、可回退）。还是 S1 和 S2 一起？
