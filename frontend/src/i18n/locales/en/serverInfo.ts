export default {
  "title": "API Endpoints",
  "openAI": {
    "label": "OpenAI Base URL",
    "copyTooltip": "Copy OpenAI Base URL",
    "copyCurlTooltip": "Copy OpenAI cURL Example"
  },
  "anthropic": {
    "label": "Anthropic Base URL",
    "copyTooltip": "Copy Anthropic Base URL",
    "copyCurlTooltip": "Copy Anthropic cURL Example"
  },
  "docker": {
    "tooltip": "Docker mode. To access from container, configure network: --network=host on Linux, or use host.docker.internal on Docker Desktop (Mac/Windows)"
  },
  "authentication": {
    "title": "Authentication",
    "apiKeyLabel": "API Key",
    "showTokenTooltip": "Show token",
    "hideTokenTooltip": "Hide token",
    "copyTokenTooltip": "Copy Token",
    "generateTooltip": "Generate New Token"
  },
  "notifications": {
    "copied": "{{label}} copied to clipboard!",
    "copyFailed": "Failed to copy to clipboard",
    "generateFailed": "Failed to generate token: {{error}}"
  }
};
