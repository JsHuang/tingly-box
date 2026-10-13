export default {
  "title": "IM 通知",
  "subtitle": "哪些机器人负责把场景通知和交互式提示投递到聊天。",
  "emptyTitle": "尚未连接机器人",
  "emptyDescription": "请先在机器人页面连接一个机器人，再回到这里查看它的通知情况。",
  "mounted": "通知中",
  "notMounted": "无路由",
  "attachComingSoon": "+ 添加路由（即将支持）",
  "attachComingSoonHint": "暂不支持从这里添加路由 —— 路由目前按场景单独配置。",
  "loadFailed": "加载通知目标失败",
  "toggleFailed": "更新通知设置失败",
  "chat": {
    "copied": "目标 UUID 已复制",
    "copyFailed": "复制失败 —— 请检查剪贴板权限",
    "deleted": "会话已删除"
  },
  "target": {
    "direct": "私聊",
    "group": "群组",
    "blocked": "目标已屏蔽",
    "unblocked": "目标已解除屏蔽"
  },
  "probe": {
    "showRaw": "查看原始载荷"
  },
  "group": {
    "allowAndTest": "允许通知并测试",
    "copyChatId": "复制内部目标 UUID",
    "custom": "自定义",
    "customHint": "编写自定义消息（自由格式）",
    "deleteChat": "删除这条私聊记录",
    "deleteChatTitle": "删除这个会话？",
    "deleteChatBody": "其配对、白名单和项目绑定都会被移除。如果它再次给 Bot 发消息，会作为全新会话重新注册（在强制配对时需要重新配对）。会话历史不受影响。若只想拦截，请改用「停用」。",
    "disableChat": "停用 —— 静默丢弃其消息",
    "disabledChat": "已停用",
    "disableHint": "停用此 Bot 的通知",
    "empty": "暂无会话。在 {{platform}} 上给这个 Bot 发送任意消息，其 Chat ID 就会出现在这里。",
    "emptyPairFirst": "暂无会话。请先配对这个 Bot，然后在 {{platform}} 上给它发消息 —— 其 Chat ID 会出现在这里。",
    "enableChat": "启用 —— 重新接收其消息",
    "enableHint": "启用通知。需要时 Bot 会自动启动。",
    "hideDisabled": "隐藏已停用",
    "paired": "已配对",
    "refresh": "刷新可达会话",
    "showDisabled": "显示已停用（{{count}}）",
    "statusChecking": "正在检查目标…",
    "statusError": "无法加载目标",
    "statusNoChats": "还没有会话",
    "statusNotAllowed": "还没有允许通知的目标",
    "statusOff": "通知已关闭",
    "statusReceivers": "{{count}} 个目标可接收"
  },
  "guide": {
    "title": "IM 通知 API 指南",
    "action": "API 指南",
    "description": "认证方式、请求示例与目标 ID",
    "auth": {
      "title": "1. 使用你的用户 Token 认证",
      "body": "任何集成都可以驱动 Bot 的会话。认证复用你现有的操作员用户 Token（与本 Web 界面所用相同），作为 Bearer 头传入 —— 无需另外申请凭据。交互式提示（/interact）与单向通知（/notify）是不同的 URL，因此请求形态本身就决定了模式。"
    },
    "send": {
      "title": "2. 发送一条单向通知",
      "body": "向 /api/v1/bots/{bot}/notify 发起 POST，路径中带上 Bot UUID。返回 200 即表示已投递。",
      "json": "请求体："
    },
    "chatid": {
      "title": "3. 从「投递目标」复制目标 UUID",
      "body": "本页每个会话节点都会显示便于识别的真实平台 Chat ID；其提示浮层还会显示 API 所需的稳定内部目标 UUID。使用节点旁的复制操作，或直接从测试台发送一条测试。"
    }
  },
  "test": {
    "title": "发送测试通知",
    "target": "目标",
    "targetPlaceholder": "尚无已授权的目标",
    "pickKnownChat": "请先选择一个已发现的会话",
    "level": "级别",
    "titleField": "标题（可选）",
    "bodyField": "正文（markdown）",
    "resetMarkdown": "重置为 markdown 示例",
    "send": "发送",
    "sent": "通知已发送",
    "sendFailed": "发送失败：{{error}}",
    "paired": "已配对"
  }
};
