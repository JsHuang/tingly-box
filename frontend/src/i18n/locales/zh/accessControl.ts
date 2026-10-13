export default {
  "pageTitle": "访问控制",
  "pageDescription": "管理您的控制面板和 API 访问的身份验证令牌。",
  "userToken": {
    "title": "用户令牌（控制面板）",
    "description": "此令牌保护对 Web 控制面板的访问。请保持安全，不要与 API 用户分享。",
    "resetToken": "重置用户令牌",
    "resetTitle": "重置用户令牌",
    "resetConfirm": "您确定要重置您的用户令牌吗？",
    "resetPoints": {
      "new": "将生成一个新的随机令牌",
      "session": "您当前的会话将自动更新",
      "other": "任何其他浏览器/设备都需要重新登录",
      "stop": "旧令牌将立即停止工作"
    },
    "resetWarning": "重置前请确保您可以访问此设备。",
    "resetCancel": "取消",
    "resetConfirmButton": "重置",
    "resetSuccess": "用户令牌重置成功",
    "resetSuccessMessage": "您的新用户令牌已生成并保存到您的会话中。",
    "saved": "我已经保存了我的令牌",
    "pullToken": "从服务器拉取最新令牌"
  },
  "modelToken": {
    "title": "模型令牌（API 代理）",
    "description": "与需要 LLM 端点 API 访问权限的用户分享此令牌。",
    "sharing": "与需要访问 LLM API 的 API 用户分享模型令牌（上方）。请保密用户令牌。",
    "resetToken": "重置模型令牌",
    "resetTitle": "重置模型令牌",
    "resetConfirm": "您确定要重置模型令牌吗？",
    "resetPoints": {
      "new": "将生成一个新的随机令牌",
      "stop": "旧令牌将立即停止工作 - 所有 API 客户端都需要更新"
    },
    "resetWarning": "重置前请确保已通知所有 API 客户端。",
    "resetCancel": "取消",
    "resetConfirmButton": "重置",
    "resetSuccess": "模型令牌重置成功",
    "resetSuccessMessage": "您的新模型令牌已生成。请确保更新您的 API 客户端。",
    "saved": "我已经更新了我的客户端",
    "pullToken": "从服务器拉取最新令牌"
  },
  "securityInfo": {
    "title": "令牌安全",
    "description": "了解用户令牌和模型令牌的区别：",
    "point1": "用户令牌：保护 Web 控制面板和管理功能",
    "point2": "模型令牌：API 客户端用于访问 LLM 端点（/openai/*、/anthropic/*、/tingly/*）",
    "point3": "与 API 用户分享模型令牌，但绝不分享用户令牌"
  },
  "copy": "复制",
  "copied": "已复制！",
  "resetting": "重置中...",
  "viewFullToken": "查看完整令牌",
  "fullTokenWarning": "请保护好您的令牌。任何拥有此令牌的人都可以访问您的控制面板。",
  "secure": "令牌是安全的（随机生成）",
  "warning": {
    "default": "您正在使用默认的用户令牌。这是一个安全风险！",
    "description": "默认令牌是公开的，应替换为安全的随机令牌。",
    "resetNow": "立即重置"
  },
  "success": {
    "title": "令牌重置成功",
    "message": "您的新用户令牌已生成并保存到您的会话中。请确保安全保存。",
    "saved": "我已经保存了我的令牌"
  }
};
