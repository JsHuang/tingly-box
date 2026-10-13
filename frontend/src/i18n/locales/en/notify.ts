export default {
  "chat": {
    "copied": "Target UUID copied",
    "copyFailed": "Copy failed — check clipboard permissions",
    "deleted": "Chat deleted"
  },
  "emptyDescription": "Connect a bot on the Bots page first, then come back here to send it notifications.",
  "emptyTitle": "No bots connected yet",
  "group": {
    "allowAndTest": "Allow Notify & Test",
    "copyChatId": "Copy internal target UUID",
    "custom": "Custom",
    "customHint": "Compose a custom message (free-form)",
    "deleteChat": "Delete this Direct Chat record",
    "deleteChatBody": "Its pairing, whitelist, and project binding are removed. If it messages the bot again it re-registers as a brand-new chat (re-pairing required when pairing is enforced). Session history is untouched. To block it instead, use Disable.",
    "deleteChatTitle": "Delete this chat?",
    "disableChat": "Disable — silently drop its messages",
    "disableHint": "Disable Notify for this bot",
    "disabledChat": "disabled",
    "empty": "No chats yet. Send any message to this bot on {{platform}} and its Chat ID appears here.",
    "emptyPairFirst": "No chats yet. Pair this bot, then send it a message on {{platform}} — its Chat ID appears here.",
    "enableChat": "Enable — accept its messages again",
    "enableHint": "Enable Notify. The bot starts automatically if needed.",
    "hideDisabled": "Hide disabled",
    "paired": "paired",
    "refresh": "Refresh reachable chats",
    "showDisabled": "Show disabled ({{count}})",
    "statusChecking": "Checking targets…",
    "statusError": "Couldn't load targets",
    "statusNoChats": "No chats yet",
    "statusNotAllowed": "No target allowed yet",
    "statusOff": "Notify off",
    "statusReceivers_one": "{{count}} target can receive",
    "statusReceivers_other": "{{count}} targets can receive"
  },
  "guide": {
    "action": "API guide",
    "auth": {
      "body": "Any integration can drive a bot’s chat. Auth reuses your existing operator user token (the same one this web UI uses) as a Bearer header — no new credential to mint. Interactive prompts (/interact) and one-way notifications (/notify) are separate URLs, so the request shape is the mode.",
      "title": "1. Authenticate with your user token"
    },
    "chatid": {
      "body": "Each Chat node on this page shows the real platform Chat ID for recognition; its tooltip also shows the stable internal Target UUID required by the API. Use the copy action beside the node, or send a test directly from the probe bench.",
      "title": "3. Copy the target UUID from Delivery targets"
    },
    "description": "Authentication, request examples, and target IDs",
    "send": {
      "body": "POST to /api/v1/bots/{bot}/notify with the bot UUID in the path. A 200 means delivered.",
      "json": "Request body:",
      "title": "2. Send a one-way notification"
    },
    "title": "IM Notify API Guide"
  },
  "loadFailed": "Failed to load Notify targets",
  "probe": {
    "showRaw": "Show raw payload"
  },
  "subtitle": "Authorize a target, send through the production path, and see whether delivery worked.",
  "target": {
    "blocked": "Target blocked",
    "direct": "Direct",
    "group": "Group",
    "unblocked": "Target unblocked"
  },
  "test": {
    "bodyField": "Body (markdown)",
    "level": "Level",
    "paired": "paired",
    "pickKnownChat": "Select a discovered chat first",
    "resetMarkdown": "Reset to markdown sample",
    "send": "Send",
    "sendFailed": "Send failed: {{error}}",
    "sent": "Notification sent",
    "target": "Target",
    "targetPlaceholder": "No authorized targets yet",
    "title": "Send a test notification",
    "titleField": "Title (optional)"
  },
  "title": "IM Notify",
  "toggleFailed": "Failed to update Notify"
};
