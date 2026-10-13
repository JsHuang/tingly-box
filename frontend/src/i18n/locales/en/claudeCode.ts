export default {
  "configModes": {
    "unified": {
      "label": "Unified Model",
      "description": "Config unified model for all claude code requests"
    },
    "separate": {
      "label": "Separate Model",
      "description": "Config different models for claude code scenario, like subagent, summary, default, ..."
    }
  },
  "modeChange": {
    "title": "Change Configuration Mode?",
    "body": "You are about to switch from {{from}} to {{to}} mode.",
    "hint": "After changing the mode, you will need to reapply the configuration to Claude Code for the changes to take effect.",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "success": "Configuration mode changed to {{mode}}. Please reapply the configuration to Claude Code.",
    "failed": "Failed to save configuration mode",
    "applyFailed": "Failed to apply configurations"
  },
  "configPath": "Add env config to Claude Code config file",
  "copyConfig": "Config",
  "oneClickScript": "One-Click Script",
  "jsonConfig": "JSON Config",
  "step1": "1. Configure Model",
  "step2": "2. Skip Onboarding - Make Claude Code directly usable",
  "step3": "3. Status Line Integration (Optional)",
  "unifiedConfig": "Unified Configuration",
  "separateConfig": "Separate Configuration",
  "switchToSeparate": "Switch to Separate",
  "switchToUnified": "Switch to Unified",
  "quickApply": "Auto Config",
  "quickApplyWithStatusLine": "Auto Config & Status Line",
  "statusLine": {
    "description": "Install status line integration to show real-time request information in your terminal.",
    "jsonDescription": "Configure the status line integration to display real-time request information in your terminal prompt.",
    "addToSettingsJson": "Add the statusLine section to your ~/.claude/settings.json (alongside the env section):",
    "manualSetup": "Or manually download and install the status line script:",
    "downloadLink": "Download Status Line Script"
  },
  "modal": {
    "title": "Claude Code Configuration Guide",
    "subtitle": "Follow these steps to configure Claude Code to use Tingly Box as your AI proxy",
    "dontRemindAgain": "Do not remind again"
  },
  "profile": {
    "renameProfile": "Rename profile",
    "deleteProfile": "Delete profile",
    "quickStart": "Start",
    "commandGlobal": "Global",
    "settingsFile": "Settings",
    "settingsFileWarning": "Generated runtime settings. Manual edits are overwritten by Profile Overrides and Model Rules.",
    "resolvingSettingsFile": "Resolving generated settings path…",
    "settingsGenerated": "Generated",
    "settingsNotGenerated": "Not generated yet",
    "copySettingsFile": "Copy settings file path",
    "switchToGlobal": "Switch to global command",
    "switchToNpm": "Switch to npm command",
    "copyCommand": "Copy command",
    "clickToCopy": "Click to copy command",
    "renameTitle": "Rename Profile",
    "profileName": "Profile Name",
    "save": "Save",
    "deleteTitle": "Delete Profile",
    "deleteConfirm": "Are you sure you want to delete profile {{name}}?",
    "deleteWarning": "This will remove the profile and all its associated rules and flags. This action cannot be undone.",
    "profileRenamed": "Profile renamed",
    "profileDeleted": "Profile deleted",
    "renameFailed": "Failed to rename profile",
    "deleteFailed": "Failed to delete profile",
    "mode": "Mode",
    "unified": "Unified",
    "separate": "Separate"
  },
  "defaultModeLabel": "Default Mode"
};
