export default {
  "name": "Название",
  "connect": "Подключить",
  "connected": "Провайдер успешно подключён!",
  "connectFailed": "Не удалось подключить провайдера",
  "showAdvanced": "Дополнительно (необязательно)",
  "hideAdvanced": "Скрыть дополнительное",
  "awsAuthHint": "Аутентификация через пару Access Key ID + Secret либо только через Bedrock API Key.",
  "validation": {
    "awsEitherOr": "Укажите либо Access Key ID + Secret Access Key, либо Bedrock API Key",
    "badRegion": "Регион должен выглядеть как «us-east-1» (строчные буквы, цифры, дефисы)",
    "badLocation": "Локация должна выглядеть как «us-east5» или «global» (строчные буквы, цифры, дефисы)",
    "badSaJson": "Service Account JSON невалиден — вставьте содержимое файла ключа целиком",
    "badEndpoint": "Endpoint должен быть полным URL, например https://my-resource.openai.azure.com"
  },
  "fields": {
    "region": {"label": "Регион"},
    "access_key_id": {"label": "Access Key ID"},
    "secret_access_key": {"label": "Secret Access Key"},
    "bearer_token": {"label": "Bedrock API Key", "helper": "Альтернатива паре ключей — укажите одно или другое"},
    "session_token": {"label": "Session Token", "helper": "Необязательно — для временных учётных данных (STS)"},
    "project_id": {"label": "ID проекта"},
    "location": {"label": "Локация"},
    "service_account_json": {"label": "Service Account JSON"},
    "endpoint": {"label": "Endpoint"},
    "api_version": {"label": "Версия API"},
    "api_key": {"label": "API-ключ"}
  }
};
