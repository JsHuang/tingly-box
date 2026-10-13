export default {
  "pageTitle": "服务器状态",
  "status": {
    "running": "运行中",
    "stopped": "已停止",
    "server": "服务器",
    "keys": "密钥",
    "connected": "已连接",
    "uptime": "运行时间",
    "lastUpdated": "最后更新：{{time}}",
    "loading": "加载中...",
    "unavailable": "不可用"
  },
  "prompts": {
    "enterPort": "输入服务器端口：",
    "enterClientId": "输入客户端 ID（web）："
  },
  "confirmations": {
    "stopServer": "您确定要停止服务器吗？"
  },
  "notifications": {
    "startSuccess": "{{message}}",
    "stopSuccess": "{{message}}",
    "restartSuccess": "{{message}}",
    "startFailed": "{{error}}",
    "stopFailed": "{{error}}",
    "restartFailed": "{{error}}",
    "tokenGenerated": "令牌生成成功",
    "tokenGenerateFailed": "{{error}}"
  },
  "proxy": {
    "title": "代理设置",
    "label": "代理",
    "respectEnvProxy": {
      "label": "遵循环境代理",
      "helper": "启用后，没有显式代理配置的提供商将使用系统代理设置（HTTP_PROXY、HTTPS_PROXY、macOS 系统代理、Clash 等）"
    },
    "globalProxyUrl": {
      "label": "常用代理",
      "description": "保存一个常用的代理，配置 Provider 或 OAuth 时可一键复用；如果 Provider 单独设置了代理，会以 Provider 的为准。",
      "helper": "可在 Provider 和 OAuth 中一键复用，Provider 单独设置的代理优先级更高。",
      "saveSuccess": "常用代理已保存",
      "saveFailed": "保存常用代理失败"
    },
    "notifications": {
      "updateSuccess": "代理设置更新成功",
      "updateFailed": "更新代理设置失败：{{error}}"
    }
  },
  "accessControl": {
    "userToken": "用户令牌（控制面板）",
    "modelToken": "模型令牌（API 代理）",
    "userTokenDesc": "此令牌保护对 Web 控制面板的访问。请与 API 用户分享模型令牌。",
    "modelTokenDesc": "与需要 API 访问权限的用户分享此令牌。",
    "copy": "复制",
    "copied": "已复制！",
    "resetToken": "重置令牌",
    "resetting": "重置中...",
    "viewFullToken": "查看完整令牌",
    "fullTokenWarning": "请保护好您的令牌。任何拥有此令牌的人都可以访问您的控制面板。",
    "secure": "令牌是安全的（随机生成）",
    "warning": {
      "default": "您正在使用默认的用户令牌。这是一个安全风险！请重置为安全的随机令牌。",
      "resetNow": "立即重置"
    },
    "reset": {
      "title": "重置用户令牌",
      "confirm": "您确定要重置您的用户令牌吗？",
      "points": {
        "new": "将生成一个新的随机令牌",
        "session": "您当前的会话将自动更新",
        "other": "任何其他浏览器/设备都需要重新登录",
        "stop": "旧令牌将立即停止工作"
      },
      "warning": "重置前请确保您可以访问此设备。",
      "cancel": "取消"
    },
    "success": {
      "title": "令牌重置成功",
      "message": "您的新用户令牌已生成并保存到您的会话中。",
      "saved": "我已经保存了我的令牌"
    }
  },
  "language": {
    "title": "语言",
    "description": "选择界面显示语言",
    "en": "English",
    "zh": "中文",
    "ru": "Русский",
    "current": "当前语言",
    "saveSuccess": "语言设置已更新",
    "saveFailed": "语言设置更新失败"
  },
  "experimentalFeatures": {
    "desk": "工作台",
    "enableDesk": "在浏览器中运行本机的 Claude Code，并选择其工作文件夹。",
    "deskEnabledInfo": "任何能登录此 tingly-box 的用户都可以在本机启动 Claude Code 会话，并批准其工具调用。",
    "title": "实验性功能",
    "description": "这些实验性功能适用于所有场景。各个场景可以覆盖这些设置。",
    "skills": "Skills",
    "userPrompts": "用户提示词",
    "guardrails": "Guardrails",
    "mcp": "MCP",
    "bench": "Bench",
    "enableUserPrompts": "管理用户请求可复用的指令",
    "enableIdeSkills": "管理来自 IDE 的代码片段和技能",
    "enableGuardrails": "阻止有风险的工具调用并过滤敏感输出",
    "enableMCP": "MCP（Model Context Protocol）工具，如网页搜索和网页获取",
    "enableBench": "探针测试工作台 —— 原始客户端请求、flag 覆盖与 payload 编辑",
    "on": "On",
    "off": "Off",
    "enabled": "已启用",
    "disabled": "已禁用 - 点击启用",
    "guardrailsEnabledInfo": "Guardrails 已启用。侧边栏中提供了「Guardrails」页面用于规则管理。",
    "mcpEnabledInfo": "MCP Tools 已启用。侧边栏 System 下方提供了「MCP Tools」页面进行配置。",
    "requiredMessage": "{{feature}} 尚未开启，请在下方启用后继续。",
    "enableFailed": "无法启用此功能，请检查服务器连接后重试。"
  },
  "about": {
    "title": "关于",
    "version": "版本",
    "license": "许可证",
    "github": "GitHub",
    "devMode": "开发模式",
    "available": "可用",
    "copyVersion": "复制版本号",
    "versionCopied": "版本号已复制到剪贴板",
    "checkUpdate": "点击检查更新",
    "updateAvailable": "新版本 {{version}} 可用，点击查看"
  },
  "serverStatus": {
    "title": "服务器状态",
    "server": "服务器",
    "forceLogout": "强制登出",
    "refreshStatus": "刷新状态"
  },
  "preferences": {
    "title": "外观与语言",
    "themePalette": "配色预览"
  }
};
