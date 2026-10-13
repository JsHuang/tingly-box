export default {
  "addTitle": "连接 AI",
  "addDescription": "选择提供商并输入您的 API 密钥以连接 AI 服务。支持多种协议的提供商可以启用多个协议。",
  "editTitle": "编辑 AI 配置",
  "addButton": "连接",
  "protocol": {
    "label": "协议",
    "openAILabel": "OpenAI 兼容",
    "anthropicLabel": "Anthropic 兼容",
    "helperOpenAI": "支持来自 OpenAI、Google 和许多其他 OpenAI 兼容提供商的模型",
    "helperAnthropic": "用于 Anthropic 兼容的 AI 提供商，通常与 Claude Code 一起使用",
    "fromTemplate": "来自模板",
    "recommendedBadge": "推荐"
  },
  "candidates": {
    "title": "匹配的提供商 — 点击填充 URL"
  },
  "keyName": {
    "label": "名称",
    "placeholder": "例如：OpenAI",
    "default": "默认供应商",
    "helper": "留空将使用上方自动生成的名称，创建后可随时重命名。",
    "editAction": "编辑名称",
    "fallback": "自定义服务商"
  },
  "providerOrUrl": {
    "label": "提供商或自定义基础 URL",
    "placeholder": "选择提供商或输入自定义 URL"
  },
  "apiKey": {
    "label": "API 密钥",
    "placeholderAdd": "您的 API 密钥",
    "placeholderEdit": "留空以保留当前密钥",
    "helperEdit": "留空以保留当前密钥"
  },
  "enabled": "已启用",
  "export": {
    "action": "复制导出",
    "copying": "复制中...",
    "base64": "复制 Base64",
    "jsonl": "复制 JSONL"
  },
  "advanced": {
    "title": "高级",
    "proxyUrl": {
      "label": "HTTP/SOCKS 代理 URL（可选）",
      "placeholder": "http://127.0.0.1:7890 或 socks5://127.0.0.1:7890",
      "helper": "可选：使用代理绕过区域限制。将保存以供将来使用。",
      "useGlobal": "使用常用代理（{{url}}）",
      "useGlobalNotSet": "使用常用代理（未配置 — 请在系统设置中配置）",
      "applyGlobal": "应用常用代理（{{url}}）",
      "applyGlobalApplied": "已应用常用代理"
    }
  },
  "verification": {
    "verifying": "验证中...",
    "verifyButton": "验证",
    "missingFields": "请填写所有必填字段（API 风格、名称、API 基础 URL、API 密钥）",
    "failed": "连接检查失败",
    "networkError": "无法连接。请检查您的网络和代理设置。",
    "failureHint": "如果您确定配置正确，仍可以通过'仍要添加'按钮添加此提供商。",
    "responseTime": "响应时间：{{time}}ms",
    "modelsAvailable": "可用 {{count}} 个模型",
    "testResult": "测试结果：{{result}}"
  },
  "forceAdd": {
    "title": "仍要添加提供商？",
    "providerInfo": "请确认您的提供商配置：",
    "message": "连接检查失败。这可能是由于网络问题、API 密钥错误或提供商不支持标准验证方法。",
    "explanation": "某些提供商可能无法通过标准检查，但仍能正常工作。",
    "whyFailed": "连接检查失败：",
    "errorDetails": "错误详情",
    "noKey": "未提供",
    "confirmNoteTitle": "您确定要继续吗？",
    "confirmNote": "添加前请验证您的基础 URL 和 API 密钥是否正确。您仍可以添加此提供商，但如果配置不正确，可能无法正常工作。",
    "cancel": "返回",
    "confirm": "确认添加"
  },
  "provider": {
    "placeholder": "Base URL"
  },
  "v1Hint": {
    "message": "大多数 OpenAI 兼容 API 需要 /v1 后缀。",
    "apply": "追加 /v1"
  }
};
