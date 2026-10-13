export default {
  "menu": "提示词",
  "user": {
    "title": "用户录制",
    "subtitle": "浏览和管理您的 IDE 录制",
    "filters": "筛选",
    "searchPlaceholder": "搜索录制...",
    "userFilter": "用户",
    "allUsers": "所有用户",
    "projectFilter": "项目",
    "allProjects": "所有项目",
    "typeFilter": "类型",
    "allTypes": "所有类型",
    "recordingsFound": "找到 {{count}} 条录制",
    "recordingsFor": "{{date}} 的录制",
    "noRecordings": "此日期没有找到录制",
    "actions": {
      "play": "播放",
      "viewDetails": "查看详情",
      "delete": "删除"
    },
    "types": {
      "code-review": "代码审查",
      "debug": "调试",
      "refactor": "重构",
      "test": "测试",
      "custom": "自定义"
    }
  },
  "skill": {
    "title": "技能",
    "subtitle": "从您的 IDE 目录管理技能",
    "addPath": "添加路径",
    "autoDiscover": "自动发现",
    "refreshAll": "全部刷新",
    "adapterConfig": "适配器配置",
    "locations": "位置",
    "selectLocation": "选择位置以查看技能",
    "noLocations": "未添加技能位置",
    "noSkills": "此位置没有找到技能",
    "skillsCount": "{{count}} 个技能",
    "searchPlaceholder": "搜索技能...",
    "ideFilter": "IDE 来源",
    "allIdes": "所有 IDE",
    "openAll": "全部打开",
    "openFolder": "打开文件夹",
    "actions": {
      "refresh": "刷新",
      "remove": "移除",
      "open": "打开"
    },
    "ides": {
      "claude-code": "Claude Code",
      "opencode": "OpenCode",
      "vscode": "VS Code",
      "cursor": "Cursor",
      "codex": "Codex",
      "antigravity": "Antigravity",
      "amp": "Amp",
      "kilo-code": "Kilo Code",
      "roo-code": "Roo Code",
      "goose": "Goose",
      "gemini-cli": "Gemini CLI",
      "github-copilot": "GitHub Copilot",
      "clawdbot": "Clawdbot",
      "droid": "Droid",
      "windsurf": "Windsurf",
      "custom": "自定义"
    },
    "dialog": {
      "title": "添加技能路径",
      "nameLabel": "显示名称",
      "namePlaceholder": "例如：我的 Claude Code 技能",
      "pathLabel": "路径",
      "pathPlaceholder": "/path/to/skills",
      "ideSourceLabel": "IDE 来源",
      "cancel": "取消",
      "add": "添加"
    },
    "discoveryDialog": {
      "title": "发现 IDE 技能",
      "description": "扫描您的主目录以查找支持的 IDE 并导入其技能。",
      "scanning": "正在扫描已安装的 IDE...",
      "foundIdes": "找到 {{count}} 个 IDE",
      "foundWithSkills": "找到 {{ides}} 个 IDE，共 {{skills}} 个技能",
      "noIdesFound": "未找到支持的 IDE。手动添加技能路径。",
      "selectToImport": "选择要导入技能的 IDE",
      "selectAll": "全选",
      "deselectAll": "取消全选",
      "importSelected": "导入选中的（{{count}}）",
      "importButton": "导入选中的"
    },
    "detailDialog": {
      "title": "技能详情",
      "path": "路径",
      "fileType": "文件类型",
      "size": "大小",
      "modified": "最后修改时间",
      "contentHash": "内容哈希",
      "description": "描述",
      "preview": "预览",
      "openInEditor": "在编辑器中打开",
      "unknownSize": "未知",
      "unknownDate": "未知",
      "loadError": "加载技能内容失败"
    }
  },
  "command": {
    "title": "命令",
    "comingSoon": "命令管理功能即将推出..."
  }
};
