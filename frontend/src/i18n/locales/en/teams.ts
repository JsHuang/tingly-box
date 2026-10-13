export default {
  "accessTitle": "Team Access",
  "keyScopeSummary": "Sharing keys for {{team}} ({{slug}}) work only with /tingly/team and /tingly/team/v1. They cannot access other Teams, scenario endpoints, or management APIs.",
  "allKeysScopeSummary": "Each Team Key works only for the Team it belongs to, via /tingly/team and /tingly/team/v1. Moving a key to another Team takes effect immediately, without rotating it.",
  "keyScopeInfoLabel": "Sharing key access scope",
  "editTeam": "Team settings",
  "name": "Team name",
  "inactive": "Inactive",
  "disabledHint": "This team is disabled. Its Team Keys cannot access model endpoints until the team is enabled.",
  "enableTeam": "Enable team",
  "disableTeam": "Disable team",
  "deleteTeam": "Delete team",
  "deleteConfirm": "Delete {{team}}? Move or delete all of its Team Keys first.",
  "loadFailed": "Failed to load teams",
  "saveFailed": "Failed to save team",
  "createSuccess": "Team created",
  "updateSuccess": "Team updated",
  "deleteSuccess": "Team deleted",
  "deleteFailed": "Team cannot be deleted while it owns Team Keys",
  "enabled": "Team enabled",
  "disabled": "Team disabled",
  "guide": {
    "trigger": "How Team works",
    "title": "How Team works",
    "subtitle": "Step {{current}} of {{total}}",
    "previous": "Previous",
    "next": "Next",
    "gotIt": "Got it!",
    "steps": {
      "usage": {
        "title": "What a Team is for",
        "content": "A Team is an isolated slice of this instance — its own rules, Team Keys, and usage, separate from your other scenarios and Teams.",
        "bullet1": "Give a group — a customer, a sub-team, an external app — model access without sharing your main setup.",
        "bullet2": "Add rules to this Team below, just like on any other scenario page."
      },
      "isolation": {
        "title": "How it's separated",
        "content": "A Team Key belongs to exactly one Team and can only reach /tingly/team[/v1].",
        "bullet1": "Moving or disabling a key or Team takes effect immediately.",
        "bullet2": "Your Global model token isn't Team-scoped — it still has full access."
      },
      "keys": {
        "title": "Configure a Team Key",
        "content": "Click \"Team Keys\" above to create one for this Team.",
        "bullet1": "Name it, then copy the tb-share-… value — shown only once.",
        "bullet2": "Move it to another Team anytime, without rotating it."
      },
      "principles": {
        "title": "How it's used",
        "content": "Point the client at this Team's Base URL, using its Team Key as the API key.",
        "bullet1": "Base URL and API key are shown in the Team Access panel above.",
        "bullet2": "Requests route through the rules below — only models added there are reachable."
      }
    }
  }
};
