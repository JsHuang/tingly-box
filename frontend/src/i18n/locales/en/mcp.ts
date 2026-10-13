export default {
  "pageTitle": "MCP Tools",
  "info": "Configure MCP (Model Context Protocol) tools to enable web search and web fetch capabilities. The MCP server runs as a local stdio subprocess or connects to a remote HTTP endpoint.",
  "connection": {
    "title": "Connection Settings",
    "endpoint": "MCP Server Endpoint",
    "endpointPlaceholder": "http://localhost:3000",
    "endpointHelp": "HTTP endpoint for the MCP server (e.g., npx @modelcontextprotocol/server-filesystem)",
    "command": "Command",
    "commandPlaceholder": "python3",
    "scriptPath": "Script Path",
    "scriptPathPlaceholder": "builtin",
    "scriptPathHelp": "Path to the MCP server script (or 'builtin' for Go tools)",
    "workingDir": "Working directory",
    "timeout": "Request Timeout (seconds)",
    "timeoutHelp": "Timeout for MCP tool calls",
    "transportHttp": "Use HTTP Transport (uncheck for stdio)",
    "transportStdio": "Use Stdio Transport"
  },
  "tools": {
    "title": "Tool Configuration",
    "description": "Select which MCP tools to enable:",
    "webSearch": "Web Search",
    "webSearchDesc": "Search web pages with Serper API. Requires SERPER_API_KEY environment variable.",
    "webFetch": "Web Fetch",
    "webFetchDesc": "Fetch and convert URLs to markdown via Jina Reader. Optional JINA_API_KEY."
  },
  "proxy": {
    "title": "Proxy Settings",
    "useGlobal": "Use Global Proxy Configuration",
    "useGlobalHelp": "When enabled, the MCP server will inherit HTTP_PROXY, HTTPS_PROXY, and NO_PROXY environment variables from the system."
  },
  "actions": {
    "save": "Save Configuration",
    "reset": "Reset to Default",
    "reload": "Reload",
    "docs": "MCP Protocol Docs",
    "saving": "Saving...",
    "savedSuccess": "MCP configuration saved successfully",
    "savedError": "Failed to save MCP configuration"
  },
  "currentConfig": "Current Configuration"
};
