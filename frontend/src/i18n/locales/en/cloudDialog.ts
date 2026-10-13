export default {
  "name": "Name",
  "connect": "Connect",
  "connected": "Provider connected successfully!",
  "connectFailed": "Failed to connect provider",
  "showAdvanced": "Advanced (optional)",
  "hideAdvanced": "Hide advanced",
  "awsAuthHint": "Authenticate with an Access Key ID + Secret pair, or a Bedrock API Key alone.",
  "validation": {
    "awsEitherOr": "Provide either Access Key ID + Secret Access Key, or a Bedrock API Key",
    "badRegion": "Region must look like \"us-east-1\" (lowercase letters, digits, hyphens)",
    "badLocation": "Location must look like \"us-east5\" or \"global\" (lowercase letters, digits, hyphens)",
    "badSaJson": "Service Account JSON is not valid JSON — paste the full key file content",
    "badEndpoint": "Endpoint must be a full URL like https://my-resource.openai.azure.com"
  },
  "fields": {
    "region": {"label": "Region"},
    "access_key_id": {"label": "Access Key ID"},
    "secret_access_key": {"label": "Secret Access Key"},
    "bearer_token": {"label": "Bedrock API Key", "helper": "Alternative to the access key pair — provide one or the other"},
    "session_token": {"label": "Session Token", "helper": "Optional — for temporary (STS) credentials"},
    "project_id": {"label": "Project ID"},
    "location": {"label": "Location"},
    "service_account_json": {"label": "Service Account JSON"},
    "endpoint": {"label": "Endpoint"},
    "api_version": {"label": "API Version"},
    "api_key": {"label": "API Key"}
  }
};
