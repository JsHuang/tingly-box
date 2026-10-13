export default {
  "title": "Configure Codex",
  "subtitle": "Configure Codex to use Tingly Box through `~/.codex/config.toml` and `~/.codex/auth.json`",
  "resetTooltip": "Reset model & reasoning to defaults",
  "tabQuick": "Quick Config",
  "tabManual": "Manual",
  "applySuccess": "Codex configuration applied to ~/.codex",
  "applyFailed": "Failed to apply configuration",
  "selectOAuthProvider": "Select a Codex OAuth provider to export.",
  "authMode": {
    "title": "Authentication",
    "apikey": {
      "label": "Tingly Box gateway",
      "captionPrefix": "codex routes through Tingly Box. Gateway key written to"
    },
    "hybrid": {
      "label": "Tingly Box gateway + keep official ChatGPT login",
      "caption": "Routes through Tingly Box, but the gateway key moves into config.toml so your ChatGPT login in auth.json stays intact — Codex App still recognizes your account (remote control, plugins, account display)."
    },
    "chatgpt": {
      "label": "Direct to OpenAI",
      "caption": "codex talks to OpenAI directly using your official ChatGPT login. No gateway."
    }
  },
  "oauthAccount": {
    "title": "ChatGPT account",
    "tooltipHybrid": "The gateway token is written into config.toml's provider block (experimental_bearer_token). Pick a stored Codex login to (re)write it into auth.json, or leave it as \u201cKeep existing\u201d to not touch the file.",
    "tooltipChatgpt": "Exports the OAuth tokens to ~/.codex/auth.json and removes the tingly gateway keys from config.toml so codex CLI talks directly to OpenAI. Tingly Box will not manage token refresh after this — codex CLI owns the token lifecycle. If id_token is missing in the exported file, re-authenticate via the OAuth page and apply again.",
    "noProvider": "No Codex OAuth provider — log in first",
    "selectProvider": "Select a Codex OAuth provider",
    "keepExisting": "Keep existing auth.json (don\u2019t modify)"
  }
};
