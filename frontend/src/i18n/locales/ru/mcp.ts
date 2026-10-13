export default {
  "pageTitle": "Инструменты MCP",
  "info": "Настройте инструменты MCP (Model Context Protocol), чтобы включить веб-поиск и загрузку веб-страниц. Сервер MCP запускается как локальный stdio-подпроцесс или подключается к удалённому HTTP-эндпоинту.",
  "connection": {
    "title": "Настройки подключения",
    "endpoint": "Эндпоинт сервера MCP",
    "endpointPlaceholder": "http://localhost:3000",
    "endpointHelp": "HTTP-эндпоинт сервера MCP (например, npx @modelcontextprotocol/server-filesystem)",
    "command": "Команда",
    "commandPlaceholder": "python3",
    "scriptPath": "Путь к скрипту",
    "scriptPathPlaceholder": "builtin",
    "scriptPathHelp": "Путь к скрипту сервера MCP (или «builtin» для встроенных инструментов на Go)",
    "workingDir": "Рабочий каталог",
    "timeout": "Таймаут запроса (секунды)",
    "timeoutHelp": "Таймаут вызовов инструментов MCP",
    "transportHttp": "Использовать транспорт HTTP (снимите галочку для stdio)",
    "transportStdio": "Использовать транспорт stdio"
  },
  "tools": {
    "title": "Настройка инструментов",
    "description": "Выберите, какие инструменты MCP включить:",
    "webSearch": "Веб-поиск",
    "webSearchDesc": "Поиск по веб-страницам через Serper API. Требуется переменная окружения SERPER_API_KEY.",
    "webFetch": "Загрузка страниц",
    "webFetchDesc": "Загрузка URL и преобразование в markdown через Jina Reader. JINA_API_KEY — по желанию."
  },
  "proxy": {
    "title": "Настройки прокси",
    "useGlobal": "Использовать глобальные настройки прокси",
    "useGlobalHelp": "Если включено, сервер MCP унаследует системные переменные окружения HTTP_PROXY, HTTPS_PROXY и NO_PROXY."
  },
  "actions": {
    "save": "Сохранить конфигурацию",
    "reset": "Сбросить к значениям по умолчанию",
    "reload": "Перезагрузить",
    "docs": "Документация протокола MCP",
    "saving": "Сохранение...",
    "savedSuccess": "Конфигурация MCP сохранена",
    "savedError": "Не удалось сохранить конфигурацию MCP"
  },
  "currentConfig": "Текущая конфигурация"
};
