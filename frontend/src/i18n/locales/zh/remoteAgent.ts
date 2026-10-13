export default {
  "card": {
    "manageAccess": "管理访问",
    "messageHint": "还没有人能遥控这个 bot。先私聊 bot 发一条消息，再给该会话开通遥控权限。",
    "pairHint": "还没有人能遥控这个 bot。在私聊中把下面这条发给 bot：",
    "pendingChats": "有 {{count}} 个私聊会话连上了这个 bot，但都没有遥控权限。给正确的会话开通遥控权限。",
    "statusChecking": "正在检查访问权限…",
    "statusControllers": "{{count}} 个会话可遥控",
    "statusNobody": "还没有人能遥控",
    "statusOff": "遥控已关闭",
    "hideSettings": "收起设置",
    "showSettings": "设置",
    "statusError": "无法检查谁能遥控",
    "statusNoModel": "@tb 还没有配置模型"
  },
  "title": "{{platform}} 远程控制",
  "subtitle": "把 {{platform}} Bot 挂载给远程控制，通过聊天操控 Claude Code / SmartGuide，并配置 Agent 行为。Bot 连接本身在机器人页面管理。",
  "notify": {
    "agentSettingsSaved": "Agent 设置已保存",
    "ccProfileUpdated": "Claude Code 配置方案已更新",
    "ccProfileUpdateFailed": "更新 Claude Code 配置方案失败",
    "persistentSessionUpdateFailed": "更新常驻会话设置失败"
  },
  "pageTitle": "远程控制",
  "ccProfile": {
    "default": "默认",
    "defaultSecondary": "主 claude_code 场景",
    "dialogTitle": "@cc 使用的 Claude Code 配置方案",
    "dialogSubtitle": "远程 @cc 会话会走所选方案 —— 包括它的规则、模型映射与设置覆盖。",
    "empty": "还没有 Claude Code 配置方案。请先在 Claude Code 场景页创建一个。",
    "persistentSession": "在消息之间保持进程常驻",
    "persistentSessionCaption": "实验性功能：复用同一个 Claude Code 进程处理同一会话的多轮消息，省去每条消息的进程启动开销。",
    "separate": "分离",
    "unified": "统一",
    "chip": "方案",
    "defaultTooltip": "使用主 claude_code 场景。点击可让 @cc 走某个 Claude Code 配置方案。",
    "missingTooltip": "方案「{{id}}」已不存在 —— @cc 回退到默认 claude_code 场景。点击可另选一个。",
    "profileTooltip": "Claude Code 配置方案",
    "scenario": "场景"
  },
  "emptyTitle": "还没有 bot",
  "emptyDescription": "连接一个 Telegram、飞书、钉钉等聊天 bot，然后就能在聊天里驱动 Claude Code 和 SmartGuide。",
  "pageSubtitle": "每个 bot 谁能遥控，以及 @tb 和 @cc 消息发往哪里。"
};
