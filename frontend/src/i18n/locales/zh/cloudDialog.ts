export default {
  "name": "名称",
  "connect": "连接",
  "connected": "提供商连接成功！",
  "connectFailed": "连接提供商失败",
  "showAdvanced": "高级选项（可选）",
  "hideAdvanced": "收起高级选项",
  "awsAuthHint": "使用 Access Key ID + Secret 密钥对认证，或仅使用 Bedrock API Key。",
  "validation": {
    "awsEitherOr": "请提供 Access Key ID + Secret Access Key，或提供 Bedrock API Key",
    "badRegion": "Region 格式应形如 \"us-east-1\"（小写字母、数字、连字符）",
    "badLocation": "Location 格式应形如 \"us-east5\" 或 \"global\"（小写字母、数字、连字符）",
    "badSaJson": "Service Account JSON 不是有效的 JSON——请粘贴完整的密钥文件内容",
    "badEndpoint": "Endpoint 应为完整 URL，例如 https://my-resource.openai.azure.com"
  },
  "fields": {
    "region": {"label": "Region"},
    "access_key_id": {"label": "Access Key ID"},
    "secret_access_key": {"label": "Secret Access Key"},
    "bearer_token": {"label": "Bedrock API Key", "helper": "与密钥对二选一——提供其中一种即可"},
    "session_token": {"label": "Session Token", "helper": "可选——用于临时（STS）凭证"},
    "project_id": {"label": "Project ID"},
    "location": {"label": "Location"},
    "service_account_json": {"label": "Service Account JSON"},
    "endpoint": {"label": "Endpoint"},
    "api_version": {"label": "API Version"},
    "api_key": {"label": "API Key"}
  }
};
