# Projects 的统一模型：一切会话都是 Thread

> 状态：已定方向，待实现。取代 [projects-im.md](./projects-im.md) 里“统一到 Project ID”一节，
> 也取代 [projects-desk-absorption.md](./projects-desk-absorption.md) 的数据模型决定。图见
> [projects-im.pencil.md](./projects-im.pencil.md) 的 “Threads as the unit”。文件名沿用 `projects-sessions.md`。

## 为什么

IM 要并进 Projects，需要回答“一个聊天绑到哪”。先后试过绑项目、绑项目或工作目录、给项目加 `kind`，
每次都发现同一件事：**项目对话、项目里的线程、文件夹里的会话、IM 里的一次聊天，本质上都是用户与 agent 的一次交互**，
区别只是有没有父、有没有分支、谁在听。现在的代码把它们分在三处：`project_messages`、`threads`、
`project_id` 为空的 `threads`，各有各的接口、事件和等待信号；`Thread.Worktree` 在文件夹会话里其实是文件夹路径，名字也不对。

这一版把设计、模式、迁移和变更一次做完，不分期留旧路径。

## Claude 自己怎么做（调研）

查的是 Claude Code 在本机落盘的结构（会话转录 jsonl、子 agent 目录、session 注册信息）：

- **会话是唯一单位**：一次交互就是一份转录，带 `sessionId`。
- **子 agent 也是一份独立转录**：有自己的 `agentId`，`meta` 里记着 `spawnDepth`、触发它的 `toolUseId`、自己的 worktree 和分支。
  和主会话的区别只有一个“父指针”，存储和消息格式一样。
- **渠道是消息的属性**：每条消息有 `origin`（`human`、`peer`、`task-notification`），每个会话有 `entrypoint`。
  Web、IM、子 agent 回报，对会话来说都只是“这条消息从哪来”。
- **会话之间可以互发消息**，不分上下级。

结论：层级、渠道、隔离方式（worktree）都是会话的**属性**，不是不同的实体。

## 模型：沿用 Thread，只有三样东西

```
Project   一组线程共享的上下文（目标、指令、仓库、记忆、文件库）；type = project | folder
Thread    唯一的会话单位；parent_id、cwd、分支、agent 都是属性
Event     线程里的一步（消息、工具调用、审批……）；来源是属性
```

**不引入 role。** 名字都用现有的：项目的对话是它的“主线程”，它派生出来的是“线程”，文件夹里的也是线程。
有没有父、有没有分支，看属性，不看另一个类别。

### Project

- `type=project`：有目标、指令、仓库、记忆；`main_thread_id` 指向它的主线程（原来的 coordinator 对话），
  主线程派生子线程，每个子线程一个分支。
- `type=folder`：一个文件夹；没有主线程，下面是若干平级线程；`path` 是规范化后的文件夹路径，唯一。

今天的 `Workdir` 表和 `project_id` 为空的文件夹会话都变成它。新的类别只是多一个 `type`。
`type` 只管 Project 级的东西（有没有目标和记忆、侧栏分哪一组、能不能 review 合并），**不管路由**，路由只看线程。

### Thread

| 字段 | 变化 | 含义 |
|---|---|---|
| `project_id` | 必填 | 原来文件夹会话为空 |
| `parent_id` | 新增 | 子线程指向它的主线程；主线程和文件夹线程为空 |
| `seq` | 新增 | 项目内编号，自增不复用，给 `@N` 用 |
| `agent` | 新增 | 谁在跑：`llm`（主线程的循环）或 `claude-code`；以后加别的 |
| `cwd` | 由 `worktree` 改名 | agent 运行的目录。文件夹线程是文件夹本身，子线程是它的隔离目录，主线程是项目目录 |
| `repo_path`、`base_branch`、`branch` | 不变 | 有 `branch` 才表示在独立分支上 |
| `session_id` | 不变 | Claude Code 的会话 id，用于续接 |
| `origin`、`title`、`task`、`status`、`model`、`profile`、… | 不变 | |

界面上：主线程叫“项目对话”，其余都叫“线程”，文件夹页里也是“线程”。

### Event

`ProjectMessage` 并入 `thread_events`（`ThreadEvent` 的列不变：`kind`、`content`、`payload`、`request_id`、`parent`、`created_at`），
主线程的消息就是主线程的事件，`thread_started`、`suggestions`、`thread_update` 直接作为事件 `kind`，payload 不变。
来源用已有的 `source` 一组字段泛化，取代 `From`：

| 字段 | 含义 |
|---|---|
| `source` | 空（Web）/ `im` / `thread`（别的线程发来，如主线程给子线程的指令、子线程的汇报）/ `system` |
| `source_ref` | `thread` 时是发送方线程 id |
| `source_platform`、`source_chat_id` | `im` 时的平台和 chat |

### 绑定

```
ChannelBinding(platform, chat_id) ──▶ thread_id
```

一个 chat 绑定一个线程，唯一键 `(platform, chat_id)`；没有 `target_kind`、`workdir_id`、`focus_thread_id`。

- 绑项目：`thread_id` 是它的主线程，**界面上选项目，后端解析成主线程**。
- 绑文件夹：`thread_id` 是文件夹里的当前线程。`/new` 开新线程并把绑定移过去，旧线程留在文件夹里。
- `/focus #2` 是改绑到子线程；`/back` 是改绑到 `parent_id`。不需要“聚焦”这个单独的状态。
- `@2 …`、引用回复**只送这一条**，不改绑定。
- 收件规则只有一条：**chat 收到它绑定的线程的外发事件，以及这个线程所有后代的“需要你”事件（审批、提问）**。
  子线程的汇报本来就是主线程里的事件，所以绑主线程的 chat 自然收到。
- Web 项目页页头的“已绑定的 IM”，是绑在这个项目主线程上的 chat；线程页同理显示绑在它自己上的。

### 地址和消息

给任何线程发消息只有一个操作：`Send(thread_id, text, source)`。用户在 Web 发、IM 发、主线程给子线程发、
子线程向主线程汇报，都是它，差别只在 `source`。排队、暂停和归档检查、事件推送自然一致。

## 命名收拾

| 现在 | 之后 | 原因 |
|---|---|---|
| `Thread.Worktree` | `cwd` | 在文件夹线程里它不是 worktree |
| `ProjectMessage` + `ThreadEvent` | `thread_events` | 同一种东西 |
| `ThreadEvent.From` | `source` 一组字段 | 来源是事件的属性 |
| `workdirs` 表、`Workdir` | `projects.type=folder` + `path` | 不再有第二套身份 |
| `project_id == ""` 的 12 处判断 | `project.type` 或 `thread.parent_id` | 判断依据是显式字段 |
| `/projects/sessions/:sid/*`、`/projects/:id/threads/:tid/*`、`/projects/workdirs`、`/projects/:id/messages*` | 见下“接口”：按 ID 平铺 | 一套接口 |
| 新线程的 `<project>/worktrees/<id>/` | `<project>/threads/<id>/`；旧线程的 `cwd` 不动 | 磁盘上的目录不搬，`cwd` 记全路径 |

`kind` 不用了，字段叫 `type`；`folder` 代替 `workdir`，避免和 worktree 混淆。

## 接口：按 ID 寻址，不按类别分路

入口都能用 ID 标识，ID 查回来就知道它是什么（`type`、是不是主线程），所以 URL 的形状对所有类别一致，API 里没有 `type` 过滤：

- `GET /projects` 返回全部项目（两种 `type`），每项带 `type`、`path`、`main_thread_id`；由客户端分组。
  `POST /projects` 创建任一类（body 带 `type`，文件夹带 `path`）。`GET/PATCH/DELETE /projects/:id` 对两类相同，`DELETE` 一律是归档。
- 线程按线程 id 平铺，一套路径：`/threads/:id`、`/threads/:id/events`、`POST /threads/:id/messages`（即 `Send`）、
  `/respond`、`/stop`、`/archive`、`/reopen`、`/permission-mode`、`/auto-answer`、`/profile`、`/model`、`/handoff`、`/tasks/...`、`/attachments`。
  所属项目从线程读出。列出和新建仍挂在项目下：`GET/POST /projects/:id/threads`。
- 项目的对话就是主线程：`/projects/:id/messages*` 去掉，改用 `/threads/:main_thread_id/messages`；项目级的事件流、记忆、文件库、用量不变。
- 绑定：`PUT /projects/channel-bindings` 收 `thread_id` 或 `project_id`（解析成主线程），响应两者都带。

## 迁移（升级时一次，幂等）

1. `projects` 加 `type`（默认 `project`）、`path`、`main_thread_id`；`threads` 加 `parent_id`、`seq`、`agent`，`worktree` 改名 `cwd`；
   `thread_events` 加 `source`、`source_ref`、`source_platform`、`source_chat_id`。
2. `workdirs` 的每个路径、以及 `project_id` 为空的线程用到的每个 `cwd`，各建一个 `type=folder` 的项目
   （名字取文件夹名；路径规范化后唯一），回填这些线程的 `project_id`。
3. 每个 `type=project` 的项目建一个主线程（`agent=llm`，`cwd` 为项目目录），写入 `main_thread_id`；该项目原有线程的 `parent_id` 指向它。
4. `project_messages` → `thread_events`：挂到主线程，**保留 id 和 `created_at`**，`Source*` 原样映射；
   原 `thread_events.from` 映射成 `source`（`coordinator` → `thread` + 主线程 id，`user` → 空）。
5. 按创建顺序给每个项目的线程回填 `seq`。
6. `channel_bindings`：`project_id` + `focus_thread_id` 折成 `thread_id`（有聚焦用它，否则用项目的主线程）；去掉 `target_kind`、`workdir_id`。
7. 校验：线程总数 = 原线程数 + 项目数；事件总数 = 原两表之和；每个线程都有项目；`session_id` 一个不丢。
   任何一项不符就**不提交**，保持旧库不变并报错。
8. 旧表（`project_messages`、`workdirs`）保留一个版本，只读不写，下个版本删除。

不动的东西：磁盘上的 worktree、Claude Code 的会话文件、附件。迁移在服务启动、运行时起来之前做，不会碰到正在跑的会话。

## 影响面

- **后端**：`projects/internal/db`、`project` 包（threads/sessions/coordinator/transcript/attachment/channels）、`server/module` 的 handler；
  Coordinator 的消息读写换成主线程的事件；`Relay`、`ChatBridge` 按线程路由；M1 的绑定接口改收 `thread_id`（仍可传 `project_id`，由服务解析为主线程）。
- **前端**：`@tingly/projects` 里文件夹会话和工作目录相关的类型、页面、hooks 并入项目和线程；项目页和文件夹页共用布局，按 `type` 隐藏项目才有的区块；
  侧栏两组按 `type` 过滤同一个列表，等待信号合成一份。
- **API**：必要的破坏，不做兼容别名，发布说明里写明。前端的线程调用全部换成按线程 id 的路径。

## 交付

一次变更，两个 PR 叠放，一起合：
1. **后端**：模型、迁移与校验、旧库快照测试、`project` 包和 HTTP 接口、`task codegen`。
2. **前端**：基于 1 的生成客户端，页面、侧栏、绑定弹窗。

之后才是 IM 行为：M2b（文件夹绑定、`/new`、`/stop`）、M3 审批、M4 `@N`/`/focus`/`/back`、M5 收尾、M6 路由。

## 风险

- **迁移写错会让对话消失**：校验必须在提交前跑；测试用一份带文件夹会话、旧绑定和 coordinator 对话的旧库快照。
- **coordinator 消息的形状**：`role` 和 `kind` 要无损映射到事件；`payload` 原样保留。
- **路径重复**：大小写、末尾斜杠、软链接不一致会产生重复的文件夹项目；入库前统一规范化，唯一索引兜底。
- **事件表变大**：两张表合一，按 `thread_id` 建索引；本地 SQLite 的量级可以接受。

## 现在不做，但模型留了口子

- 独立聊天（`Conversation`/`Message`）也是一次与 agent 的交互，将来可以落成 `agent=llm` 的线程，不需要新表。
- 线程之间的 peer 消息：`Send` 和 `source=thread` 已经能表达，不开放。
- 其他 agent（codex 等）：`agent` 字段。

## 已定

- 名字沿用 Thread，不引入 role；界面：主线程“项目对话”，其余“线程”。
- 字段叫 `type`，取值 `project | folder`。
- API 不做兼容，接受必要的破坏；按 ID 寻址，不按 `type` 分路、不做类别过滤。
- 文件夹“移除”一律只归档，会话保留。
- 设计、模式、迁移和变更这一版一次完成。
