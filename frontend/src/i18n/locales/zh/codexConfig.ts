export default {
  "title": "配置 Codex",
  "subtitle": "通过 `~/.codex/config.toml` 和 `~/.codex/auth.json` 配置 Codex 使用 Tingly Box",
  "resetTooltip": "将模型与推理设置重置为默认值",
  "tabQuick": "快速配置",
  "tabManual": "手动配置",
  "applySuccess": "Codex 配置已应用到 ~/.codex",
  "applyFailed": "应用配置失败",
  "selectOAuthProvider": "请选择要导出的 Codex OAuth 账号。",
  "authMode": {
    "title": "认证方式",
    "apikey": {
      "label": "Tingly Box 网关",
      "captionPrefix": "codex 通过 Tingly Box 路由。网关密钥写入"
    },
    "hybrid": {
      "label": "Tingly Box 网关 + 保留官方 ChatGPT 登录",
      "caption": "通过 Tingly Box 路由，但网关密钥移入 config.toml，使 auth.json 中的 ChatGPT 登录保持不变——Codex App 仍能识别你的账号（远程控制、插件、账号展示）。"
    },
    "chatgpt": {
      "label": "直连 OpenAI",
      "caption": "codex 使用你的官方 ChatGPT 登录直接与 OpenAI 通信，不经过网关。"
    }
  },
  "oauthAccount": {
    "title": "ChatGPT 账号",
    "tooltipHybrid": "网关令牌会写入 config.toml 的 provider 区块（experimental_bearer_token）。选择一个已保存的 Codex 登录以（重新）写入 auth.json，或保持「保留现有」以不修改该文件。",
    "tooltipChatgpt": "将 OAuth 令牌导出到 ~/.codex/auth.json，并从 config.toml 中移除 tingly 网关密钥，使 codex CLI 直接与 OpenAI 通信。此后 Tingly Box 将不再管理令牌刷新——由 codex CLI 自行负责令牌生命周期。如果导出的文件中缺少 id_token，请通过 OAuth 页面重新认证后再次应用。",
    "noProvider": "暂无 Codex OAuth 账号——请先登录",
    "selectProvider": "选择一个 Codex OAuth 账号",
    "keepExisting": "保留现有 auth.json（不修改）"
  }
};
