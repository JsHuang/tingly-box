export default {
  "card": {
    "manageAccess": "Manage access",
    "messageHint": "Nobody can control this bot yet. Message the bot directly, then grant Remote Control to that chat.",
    "pairHint": "Nobody can control this bot yet. Send this to the bot in a direct message:",
    "pendingChats_one": "{{count}} direct chat reached this bot but can't control it. Grant it Remote Control if it's yours.",
    "pendingChats_other": "{{count}} direct chats reached this bot but none can control it. Grant Remote Control to the right one.",
    "statusChecking": "Checking access…",
    "statusControllers_one": "{{count}} chat can control",
    "statusControllers_other": "{{count}} chats can control",
    "statusNobody": "Nobody can control yet",
    "statusOff": "Remote Control off",
    "hideSettings": "Hide settings",
    "showSettings": "Settings",
    "statusError": "Couldn't check who can control",
    "statusNoModel": "@tb has no model yet"
  },
  "ccProfile": {
    "default": "Default",
    "defaultSecondary": "Main claude_code scenario",
    "dialogSubtitle": "Remote @cc sessions route through the selected profile — its rules, model mapping, and settings overrides.",
    "dialogTitle": "Claude Code Profile for @cc",
    "empty": "No Claude Code profiles yet. Create one on the Claude Code scenario page first.",
    "persistentSession": "Keep the process warm between messages",
    "persistentSessionCaption": "Experimental: skips process startup cost on every @cc message by reusing one Claude Code process across a chat's turns.",
    "separate": "separate",
    "unified": "unified",
    "chip": "Profile",
    "defaultTooltip": "Uses the main claude_code scenario. Click to route @cc through a Claude Code profile.",
    "missingTooltip": "Profile \"{{id}}\" no longer exists — @cc falls back to the default claude_code scenario. Click to pick another.",
    "profileTooltip": "Claude Code profile",
    "scenario": "Scenario"
  },
  "notify": {
    "ccProfileUpdateFailed": "Failed to update Claude Code profile",
    "ccProfileUpdated": "Claude Code profile updated",
    "persistentSessionUpdateFailed": "Failed to update persistent-session setting"
  },
  "pageTitle": "Remote Control",
  "emptyTitle": "No bots yet",
  "emptyDescription": "Connect a Telegram, Feishu, DingTalk or other chat bot, then drive Claude Code and SmartGuide from that chat.",
  "pageSubtitle": "Who can control each bot, and where @tb and @cc messages go."
};
