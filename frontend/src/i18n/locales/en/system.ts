export default {
  "pageTitle": "Server Status",
  "status": {
    "running": "Running",
    "stopped": "Stopped",
    "server": "Server",
    "keys": "Keys",
    "connected": "Connected",
    "uptime": "Uptime",
    "lastUpdated": "Last Updated: {{time}}",
    "loading": "Loading...",
    "unavailable": "Unavailable"
  },
  "prompts": {
    "enterPort": "Enter port for server:",
    "enterClientId": "Enter client ID (web):"
  },
  "confirmations": {
    "stopServer": "Are you sure you want to stop server?"
  },
  "notifications": {
    "startSuccess": "{{message}}",
    "stopSuccess": "{{message}}",
    "restartSuccess": "{{message}}",
    "startFailed": "{{error}}",
    "stopFailed": "{{error}}",
    "restartFailed": "{{error}}",
    "tokenGenerated": "Token generated successfully",
    "tokenGenerateFailed": "{{error}}"
  },
  "proxy": {
    "title": "Proxy Settings",
    "label": "Proxy",
    "respectEnvProxy": {
      "label": "Respect Environment Proxy",
      "helper": "When enabled, providers without explicit proxy configuration will use system proxy settings (HTTP_PROXY, HTTPS_PROXY, macOS system proxy, Clash, etc.)"
    },
    "globalProxyUrl": {
      "label": "Quick Proxy",
      "description": "Save a proxy you reuse often so providers and OAuth can pick it up with one click — per-provider proxy still wins if set.",
      "helper": "Reusable across providers and OAuth. Per-provider proxy takes priority.",
      "saveSuccess": "Quick proxy saved",
      "saveFailed": "Failed to save quick proxy"
    },
    "notifications": {
      "updateSuccess": "Proxy settings updated successfully",
      "updateFailed": "Failed to update proxy settings: {{error}}"
    }
  },
  "accessControl": {
    "userToken": "User Token (Control Panel)",
    "modelToken": "Model Token (API Proxy)",
    "userTokenDesc": "This token protects access to the web control panel. Share the Model Token with API users instead.",
    "modelTokenDesc": "Share this token with users who need API access.",
    "copy": "Copy",
    "copied": "Copied!",
    "resetToken": "Reset Token",
    "resetting": "Resetting...",
    "viewFullToken": "View Full Token",
    "fullTokenWarning": "Keep your token secure. Anyone with this token can access your control panel.",
    "secure": "Token is secure (randomly generated)",
    "warning": {
      "default": "You are using the default user token. This is a security risk! Please reset to a secure random token.",
      "resetNow": "Reset Now"
    },
    "reset": {
      "title": "Reset User Token",
      "confirm": "Are you sure you want to reset your user token?",
      "points": {
        "new": "A new random token will be generated",
        "session": "Your current session will be updated automatically",
        "other": "Any other browsers/devices will need to log in again",
        "stop": "The old token will immediately stop working"
      },
      "warning": "Make sure you have access to this device before resetting.",
      "cancel": "Cancel"
    },
    "success": {
      "title": "Token Reset Successfully",
      "message": "Your new user token has been generated and saved to your session.",
      "saved": "I've Saved My Token"
    }
  },
  "language": {
    "title": "Language",
    "description": "Select interface display language",
    "en": "English",
    "zh": "中文",
    "ru": "Русский",
    "current": "Current",
    "saveSuccess": "Language settings updated",
    "saveFailed": "Failed to update language settings"
  },
  "experimentalFeatures": {
    "desk": "Desk",
    "enableDesk": "Run Claude Code on this machine from a browser tab, in a folder you choose.",
    "deskEnabledInfo": "Anyone who can sign in to this tingly-box can now start Claude Code sessions on this machine and approve the tool calls they make.",
    "title": "Experimental Features",
    "description": "These experimental features apply globally to all scenarios. Individual scenarios can override these settings.",
    "skills": "Skills",
    "userPrompts": "User prompts",
    "guardrails": "Guardrails",
    "mcp": "MCP",
    "bench": "Bench",
    "enableUserPrompts": "Manage reusable instructions for user requests",
    "enableIdeSkills": "Manage code snippets and skills from your IDE",
    "enableGuardrails": "Block risky tool calls and filter sensitive outputs",
    "enableMCP": "MCP (Model Context Protocol) tools such as web search and web fetch",
    "enableBench": "The probe test workbench — raw client requests, flag overlays and payload editing",
    "on": "On",
    "off": "Off",
    "enabled": "enabled",
    "disabled": "disabled - Click to enable",
    "guardrailsEnabledInfo": "Guardrails is enabled. A \"Guardrails\" page is available in the sidebar for rule management.",
    "mcpEnabledInfo": "MCP Tools is enabled. An \"MCP Tools\" page is available under System in the sidebar for configuration.",
    "requiredMessage": "{{feature}} is off. Turn it on below to continue.",
    "enableFailed": "Could not enable this feature. Check the server connection and try again."
  },
  "about": {
    "title": "About",
    "version": "Version",
    "license": "License",
    "github": "GitHub",
    "devMode": "Dev Mode",
    "available": "available",
    "copyVersion": "Copy version",
    "versionCopied": "Version copied to clipboard",
    "checkUpdate": "Click to check for updates",
    "updateAvailable": "Version {{version}} available — click to view"
  },
  "serverStatus": {
    "title": "Server Status",
    "server": "Server",
    "forceLogout": "Force logout",
    "refreshStatus": "Refresh status"
  },
  "preferences": {
    "title": "Appearance & Language",
    "themePalette": "Palette preview"
  }
};
