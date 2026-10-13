export default {
  "addTitle": "Connect AI",
  "addDescription": "Select a provider and enter your API key to connect AI services. Multiple protocols can be enabled for providers that support them.",
  "editTitle": "Edit AI Config",
  "addButton": "Connect",
  "protocol": {
    "label": "Protocols",
    "openAILabel": "OpenAI Compatible",
    "anthropicLabel": "Anthropic Compatible",
    "helperOpenAI": "Supports models from OpenAI, Google and many other OpenAI-compatible providers",
    "helperAnthropic": "For Anthropic-compatible AI providers, commonly used with Claude Code",
    "fromTemplate": "from template",
    "recommendedBadge": "Recommended"
  },
  "candidates": {
    "title": "Matching providers — click to fill URLs"
  },
  "keyName": {
    "label": "Name",
    "placeholder": "e.g., OpenAI",
    "default": "Default Provider",
    "helper": "Leave blank to use the auto-generated name. You can rename later.",
    "editAction": "Edit name",
    "fallback": "Custom Provider"
  },
  "providerOrUrl": {
    "label": "Provider or Custom Base URL",
    "placeholder": "Select a provider or enter custom URL"
  },
  "apiKey": {
    "label": "API Key",
    "placeholderAdd": "Your API key",
    "placeholderEdit": "Leave empty to keep current key",
    "helperEdit": "Leave empty to keep current key"
  },
  "enabled": "Enabled",
  "export": {
    "action": "Copy Export",
    "copying": "Copying...",
    "base64": "Copy Base64",
    "jsonl": "Copy JSONL"
  },
  "advanced": {
    "title": "Advanced",
    "proxyUrl": {
      "label": "HTTP/SOCKS Proxy URL (Optional)",
      "placeholder": "http://127.0.0.1:7890 or socks5://127.0.0.1:7890",
      "helper": "Optional: Use a proxy to bypass region restrictions. Saved for future use.",
      "useGlobal": "Use quick proxy ({{url}})",
      "useGlobalNotSet": "Use quick proxy (not configured — set in System Settings)",
      "applyGlobal": "Apply quick proxy ({{url}})",
      "applyGlobalApplied": "Quick proxy applied"
    }
  },
  "verification": {
    "verifying": "Verifying...",
    "verifyButton": "Verify",
    "missingFields": "Please fill in all required fields (API Style, Name, API Base URL, API Key)",
    "failed": "Connection check failed",
    "networkError": "Unable to connect. Please check your network and proxy settings.",
    "failureHint": "You can still add this provider using the 'Add Anyway' button if you're sure the configuration is correct.",
    "responseTime": "Response time: {{time}}ms",
    "modelsAvailable": "{{count}} models available",
    "testResult": "Test result: {{result}}"
  },
  "forceAdd": {
    "title": "Add Provider Anyway?",
    "providerInfo": "Please confirm your provider configuration:",
    "message": "The connection check failed. This could be due to network issues, incorrect API key, or the provider not supporting standard verification methods.",
    "explanation": "Some providers may not pass standard checks but still work correctly.",
    "whyFailed": "Connection check failed:",
    "errorDetails": "Error details",
    "noKey": "Not provided",
    "confirmNoteTitle": "Are you sure you want to continue?",
    "confirmNote": "Please verify that your Base URL and API Key are correct before adding. You can still add this provider, but it may not work properly if the configuration is incorrect.",
    "cancel": "Go Back",
    "confirm": "Confirm to Add"
  },
  "provider": {
    "placeholder": "Base URL"
  },
  "v1Hint": {
    "apply": "Append /v1",
    "message": "Most OpenAI-compatible APIs need a /v1 suffix."
  }
};
