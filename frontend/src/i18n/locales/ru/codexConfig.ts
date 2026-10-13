export default {
  "title": "Настройка Codex",
  "subtitle": "Настройте Codex на работу через Tingly Box с помощью `~/.codex/config.toml` и `~/.codex/auth.json`",
  "resetTooltip": "Сбросить модель и рассуждения к значениям по умолчанию",
  "tabQuick": "Быстрая настройка",
  "tabManual": "Вручную",
  "applySuccess": "Конфигурация Codex записана в ~/.codex",
  "applyFailed": "Не удалось применить конфигурацию",
  "selectOAuthProvider": "Выберите OAuth-провайдера Codex для экспорта.",
  "authMode": {
    "title": "Аутентификация",
    "apikey": {
      "label": "Шлюз Tingly Box",
      "captionPrefix": "codex работает через Tingly Box. Ключ шлюза записывается в"
    },
    "hybrid": {
      "label": "Шлюз Tingly Box + сохранить официальный вход ChatGPT",
      "caption": "Запросы идут через Tingly Box, но ключ шлюза переносится в config.toml, поэтому вход в ChatGPT в auth.json остаётся нетронутым — приложение Codex по-прежнему видит вашу учётную запись (удалённое управление, плагины, отображение аккаунта)."
    },
    "chatgpt": {
      "label": "Напрямую в OpenAI",
      "caption": "codex обращается к OpenAI напрямую, используя ваш официальный вход ChatGPT. Без шлюза."
    }
  },
  "oauthAccount": {
    "title": "Учётная запись ChatGPT",
    "tooltipHybrid": "Токен шлюза записывается в блок провайдера в config.toml (experimental_bearer_token). Выберите сохранённый вход Codex, чтобы (пере)записать его в auth.json, или оставьте «Оставить как есть», чтобы не трогать файл.",
    "tooltipChatgpt": "Экспортирует OAuth-токены в ~/.codex/auth.json и удаляет ключи шлюза tingly из config.toml, чтобы codex CLI обращался к OpenAI напрямую. После этого Tingly Box не будет обновлять токены — за их жизненный цикл отвечает codex CLI. Если в экспортированном файле нет id_token, авторизуйтесь заново на странице OAuth и примените настройки ещё раз.",
    "noProvider": "Нет OAuth-провайдера Codex — сначала войдите",
    "selectProvider": "Выберите OAuth-провайдера Codex",
    "keepExisting": "Оставить текущий auth.json (не изменять)"
  }
};
