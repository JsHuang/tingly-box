export default {
  "accessTitle": "Team 访问",
  "keyScopeSummary": "{{team}}（{{slug}}）的 Team 密钥仅可访问 /tingly/team 与 /tingly/team/v1，不能访问其他 Team、场景端点或管理 API。",
  "allKeysScopeSummary": "每个 Team 密钥只对其所属 Team 生效，通过 /tingly/team 与 /tingly/team/v1 访问。移动到其他 Team 会立即生效，密钥本身不变。",
  "keyScopeInfoLabel": "Team 密钥访问范围",
  "editTeam": "Team 设置",
  "name": "Team 名称",
  "inactive": "已停用",
  "disabledHint": "此 Team 已停用；重新启用前，其 Team 密钥无法访问模型接口。",
  "enableTeam": "启用 Team",
  "disableTeam": "停用 Team",
  "deleteTeam": "删除 Team",
  "deleteConfirm": "删除 {{team}}？请先移动或删除它的全部 Team 密钥。",
  "loadFailed": "加载 Team 失败",
  "saveFailed": "保存 Team 失败",
  "createSuccess": "Team 已创建",
  "updateSuccess": "Team 已更新",
  "deleteSuccess": "Team 已删除",
  "deleteFailed": "Team 仍有 Team 密钥，无法删除",
  "enabled": "Team 已启用",
  "disabled": "Team 已停用",
  "guide": {
    "trigger": "Team 使用说明",
    "title": "Team 使用说明",
    "subtitle": "第 {{current}} 步，共 {{total}} 步",
    "previous": "上一步",
    "next": "下一步",
    "gotIt": "知道了！",
    "steps": {
      "usage": {
        "title": "Team 是做什么用的",
        "content": "Team 是这个实例里一块独立的空间——有自己的规则、Team 密钥和用量，与其他场景、其他 Team 都是分开的。",
        "bullet1": "把模型访问权交给某个群体（客户、子团队、外部应用），而不必分享你的主配置。",
        "bullet2": "在下方为这个 Team 添加规则，方式和其他场景页一样。"
      },
      "isolation": {
        "title": "它是怎么被隔离的",
        "content": "一个 Team 密钥只能绑定一个 Team，且只能访问 /tingly/team[/v1]。",
        "bullet1": "移动密钥或停用 Team，都会立即生效。",
        "bullet2": "全局 model token 不受 Team 范围限制，仍拥有完整访问权限。"
      },
      "keys": {
        "title": "配置 Team 密钥",
        "content": "点击上方的\"Team 密钥\"按钮，为这个 Team 创建一个。",
        "bullet1": "起个名称，复制 tb-share-… 开头的密钥（仅显示一次）。",
        "bullet2": "之后可以随时移动到另一个 Team，无需重新生成。"
      },
      "principles": {
        "title": "怎么用",
        "content": "让客户端指向这个 Team 的 Base URL，用它的 Team 密钥作为 API Key。",
        "bullet1": "Base URL 和 API Key 都在上方的 Team Access 面板里。",
        "bullet2": "请求会按下方的规则路由——只有添加到规则里的模型才能被访问。"
      }
    }
  }
};
