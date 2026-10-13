export default {
  "configModes": {
    "unified": {
      "label": "统一模型",
      "description": "为所有 Claude Code 请求配置同一个模型"
    },
    "separate": {
      "label": "分离模型",
      "description": "为 Claude Code 的不同场景（如子代理、摘要、默认等）分别配置模型"
    }
  },
  "modeChange": {
    "title": "切换配置模式？",
    "body": "即将从 {{from}} 切换到 {{to}} 模式。",
    "hint": "切换模式后，需要重新将配置应用到 Claude Code 才能生效。",
    "cancel": "取消",
    "confirm": "确认",
    "success": "配置模式已切换为{{mode}}，请重新应用配置到 Claude Code。",
    "failed": "保存配置模式失败",
    "applyFailed": "应用配置失败"
  },
  "configPath": "将环境配置添加到 Claude Code 配置文件",
  "copyConfig": "配置",
  "oneClickScript": "一键脚本",
  "jsonConfig": "JSON 配置",
  "step1": "1. 配置模型",
  "step2": "2. 跳过入门 - 让 Claude Code 直接可用",
  "step3": "3. 状态行集成（可选）",
  "unifiedConfig": "统一配置",
  "separateConfig": "分离配置",
  "switchToSeparate": "切换到分离",
  "switchToUnified": "切换到统一",
  "quickApply": "自动配置",
  "quickApplyWithStatusLine": "自动配置和状态行",
  "statusLine": {
    "description": "安装状态行集成以在您的终端中显示实时请求信息。",
    "jsonDescription": "配置状态行集成以在您的终端提示符中显示实时请求信息。",
    "addToSettingsJson": "将 statusLine 部分添加到 ~/.claude/settings.json（与 env 部分一起）：",
    "manualSetup": "或手动下载并安装状态行脚本：",
    "downloadLink": "下载状态行脚本"
  },
  "modal": {
    "title": "Claude Code 配置指南",
    "subtitle": "按照以下步骤配置 Claude Code 以使用 Tingly Box 作为您的 AI 代理",
    "dontRemindAgain": "不再提醒"
  },
  "profile": {
    "renameProfile": "重命名方案",
    "deleteProfile": "删除方案",
    "quickStart": "启动",
    "commandGlobal": "全局",
    "settingsFile": "设置",
    "settingsFileWarning": "这是生成的运行配置；手动修改会被配置方案覆盖和模型规则重新生成。",
    "resolvingSettingsFile": "正在计算生成文件位置…",
    "settingsGenerated": "已生成",
    "settingsNotGenerated": "尚未生成",
    "copySettingsFile": "复制设置文件路径",
    "switchToGlobal": "切换到全局命令",
    "switchToNpm": "切换到 npm 命令",
    "copyCommand": "复制命令",
    "clickToCopy": "点击复制命令",
    "renameTitle": "重命名方案",
    "profileName": "方案名称",
    "save": "保存",
    "deleteTitle": "删除方案",
    "deleteConfirm": "确定要删除方案 {{name}} 吗？",
    "deleteWarning": "这将删除该方案及其所有关联的规则和标志。此操作无法撤销。",
    "profileRenamed": "方案已重命名",
    "profileDeleted": "方案已删除",
    "renameFailed": "重命名方案失败",
    "deleteFailed": "删除方案失败",
    "mode": "模式",
    "unified": "统一",
    "separate": "分离"
  },
  "defaultModeLabel": "默认权限模式"
};
