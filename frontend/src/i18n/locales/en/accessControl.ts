export default {
  "pageTitle": "Access Control",
  "pageDescription": "Manage your authentication tokens for control panel and API access.",
  "userToken": {
    "title": "User Token (Control Panel)",
    "description": "This token protects access to the web control panel. Keep it secure and don't share it with API users.",
    "resetToken": "Reset User Token",
    "resetTitle": "Reset User Token",
    "resetConfirm": "Are you sure you want to reset your user token?",
    "resetPoints": {
      "new": "A new random token will be generated",
      "session": "Your current session will be updated automatically",
      "other": "Any other browsers/devices will need to log in again",
      "stop": "The old token will immediately stop working"
    },
    "resetWarning": "Make sure you have access to this device before resetting.",
    "resetCancel": "Cancel",
    "resetConfirmButton": "Reset",
    "resetSuccess": "User Token Reset Successfully",
    "resetSuccessMessage": "Your new user token has been generated and saved to your session.",
    "saved": "I've Saved My Token",
    "pullToken": "Pull latest token from server"
  },
  "modelToken": {
    "title": "Model Token (API Proxy)",
    "description": "Share this token with users who need API access to LLM endpoints.",
    "sharing": "Share the Model Token (above) with users who need to access the LLM API. Keep the User Token private.",
    "resetToken": "Reset Model Token",
    "resetTitle": "Reset Model Token",
    "resetConfirm": "Are you sure you want to reset the model token?",
    "resetPoints": {
      "new": "A new random token will be generated",
      "stop": "The old token will immediately stop working - all API clients will need to update"
    },
    "resetWarning": "Make sure all API clients have been notified before resetting.",
    "resetCancel": "Cancel",
    "resetConfirmButton": "Reset",
    "resetSuccess": "Model Token Reset Successfully",
    "resetSuccessMessage": "Your new model token has been generated. Make sure to update your API clients.",
    "saved": "I've Updated My Clients",
    "pullToken": "Pull latest token from server"
  },
  "securityInfo": {
    "title": "Token Security",
    "description": "Understanding the difference between User Token and Model Token:",
    "point1": "User Token: Protects the web control panel and administrative functions",
    "point2": "Model Token: Used by API clients to access LLM endpoints (/openai/*, /anthropic/*, /tingly/*)",
    "point3": "Share Model Token with API users, but never share User Token"
  },
  "copy": "Copy",
  "copied": "Copied!",
  "resetting": "Resetting...",
  "viewFullToken": "View Full Token",
  "fullTokenWarning": "Keep your token secure. Anyone with this token can access your control panel.",
  "secure": "Token is secure (randomly generated)",
  "warning": {
    "default": "You are using the default user token. This is a security risk!",
    "description": "The default token is publicly known and should be replaced with a secure random token.",
    "resetNow": "Reset Now"
  },
  "success": {
    "title": "Token Reset Successfully",
    "message": "Your new user token has been generated and saved to your session. Make sure to save it securely.",
    "saved": "I've Saved My Token"
  }
};
