export default {
  "pageTitle": "MCP 工具",
  "info": "配置 MCP（模型上下文协议）工具以启用网页搜索和网页获取功能。MCP 服务器作为本地 stdio 子进程运行或连接到远程 HTTP 端点。",
  "connection": {
    "title": "连接设置",
    "endpoint": "MCP 服务器端点",
    "endpointPlaceholder": "http://localhost:3000",
    "endpointHelp": "MCP 服务器的 HTTP 端点（例如 npx @modelcontextprotocol/server-filesystem）",
    "command": "命令",
    "commandPlaceholder": "python3",
    "scriptPath": "脚本路径",
    "scriptPathPlaceholder": "builtin",
    "scriptPathHelp": "MCP 服务器脚本的路径（或 Go 工具的 'builtin'）",
    "workingDir": "工作目录",
    "timeout": "请求超时（秒）",
    "timeoutHelp": "MCP 工具调用的超时时间",
    "transportHttp": "使用 HTTP 传输（取消选中以使用 stdio）",
    "transportStdio": "使用 Stdio 传输"
  },
  "tools": {
    "title": "工具配置",
    "description": "选择要启用的 MCP 工具：",
    "webSearch": "网页搜索",
    "webSearchDesc": "使用 Serper API 搜索网页。需要 SERPER_API_KEY 环境变量。",
    "webFetch": "网页获取",
    "webFetchDesc": "通过 Jina Reader 获取 URL 并转换为 markdown。可选 JINA_API_KEY。"
  },
  "proxy": {
    "title": "代理设置",
    "useGlobal": "使用全局代理配置",
    "useGlobalHelp": "启用后，MCP 服务器将从系统继承 HTTP_PROXY、HTTPS_PROXY 和 NO_PROXY 环境变量。"
  },
  "actions": {
    "save": "保存配置",
    "reset": "重置为默认值",
    "reload": "重新加载",
    "docs": "MCP 协议文档",
    "saving": "保存中...",
    "savedSuccess": "MCP 配置保存成功",
    "savedError": "保存 MCP 配置失败"
  },
  "currentConfig": "当前配置"
};
