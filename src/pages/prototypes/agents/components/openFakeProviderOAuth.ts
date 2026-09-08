import type { AgentToolAuthCard } from '../agentsData';

export const AGENTS_PROTO_OAUTH_MESSAGE = 'agents-proto-oauth' as const;

export type AgentsProtoOAuthResult = {
  type: typeof AGENTS_PROTO_OAUTH_MESSAGE;
  status: 'success' | 'cancel';
  toolId: string;
  provider: AgentToolAuthCard['provider'];
};

function providerChrome(provider: AgentToolAuthCard['provider']): {
  title: string;
  brand: string;
  accent: string;
  allowLabel: string;
} {
  if (provider === 'github') {
    return {
      title: 'GitHub',
      brand: 'GitHub',
      accent: '#24292f',
      allowLabel: 'Authorize Mattermost',
    };
  }
  if (provider === 'atlassian') {
    return {
      title: 'Atlassian',
      brand: 'Atlassian',
      accent: '#0052CC',
      allowLabel: 'Accept',
    };
  }
  return {
    title: 'Google',
    brand: 'Google',
    accent: '#1a73e8',
    allowLabel: 'Allow',
  };
}

/**
 * Opens a prototype-only OAuth window (not a real provider).
 * Posts {@link AGENTS_PROTO_OAUTH_MESSAGE} to the opener on allow/cancel.
 */
export function openFakeProviderOAuth(
  card: AgentToolAuthCard,
  account: { name: string; email: string },
): Window | null {
  const chrome = providerChrome(card.provider);
  const popup = window.open(
    '',
    'agents-proto-oauth',
    'popup=yes,width=480,height=640',
  );
  if (!popup) return null;

  const payload = JSON.stringify({
    type: AGENTS_PROTO_OAUTH_MESSAGE,
    toolId: card.toolId,
    provider: card.provider,
  });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign in · ${chrome.title}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: "Google Sans", Roboto, Arial, sans-serif;
      background: #f0f4f9;
      color: #1f1f1f;
    }
    .card {
      width: min(100% - 32px, 400px);
      background: #fff;
      border-radius: 28px;
      padding: 40px 36px 28px;
      box-shadow: 0 1px 3px rgba(60,64,67,.3), 0 4px 8px rgba(60,64,67,.15);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
      font-size: 16px;
      font-weight: 500;
      color: #3c4043;
    }
    .mark {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${chrome.accent};
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
    }
    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 400;
      line-height: 1.3;
    }
    .sub {
      margin: 0 0 28px;
      font-size: 14px;
      line-height: 1.5;
      color: #444746;
    }
    .account {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 12px;
      border: 1px solid #747775;
      border-radius: 8px;
      background: #fff;
      text-align: left;
      cursor: default;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #a142f4;
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 600;
      flex: 0 0 auto;
    }
    .account strong {
      display: block;
      font-size: 14px;
      font-weight: 500;
    }
    .account span {
      display: block;
      font-size: 12px;
      color: #444746;
    }
    .scope {
      margin: 20px 0 0;
      padding: 16px;
      border-radius: 12px;
      background: #f8fafc;
      font-size: 13px;
      line-height: 1.5;
      color: #444746;
    }
    .scope strong { color: #1f1f1f; }
    .note {
      margin: 16px 0 0;
      font-size: 11px;
      color: #747775;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 28px;
    }
    button {
      font: inherit;
      border: 0;
      border-radius: 24px;
      padding: 10px 20px;
      cursor: pointer;
    }
    .cancel {
      background: transparent;
      color: ${chrome.accent};
      font-weight: 500;
    }
    .allow {
      background: ${chrome.accent};
      color: #fff;
      font-weight: 500;
    }
    .allow:hover { filter: brightness(1.05); }
    .cancel:hover { background: rgba(26,115,232,.08); }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">
      <span class="mark">${chrome.brand.slice(0, 1)}</span>
      <span>Sign in with ${chrome.brand}</span>
    </div>
    <h1>Choose an account</h1>
    <p class="sub">to continue to Mattermost Agents</p>
    <div class="account" aria-label="Selected account">
      <span class="avatar">${account.name.trim().charAt(0) || 'P'}</span>
      <span>
        <strong>${account.name}</strong>
        <span>${account.email}</span>
      </span>
    </div>
    <div class="scope">
      <strong>Mattermost Agents</strong> wants access to
      <strong>${card.toolLabel}</strong>.
      This is a prototype consent screen — no real ${chrome.brand} login.
    </div>
    <p class="note">Prototype only. Nothing is sent to ${chrome.brand}.</p>
    <div class="actions">
      <button type="button" class="cancel" id="cancel">Cancel</button>
      <button type="button" class="allow" id="allow">${chrome.allowLabel}</button>
    </div>
  </div>
  <script>
    var base = ${payload};
    function send(status) {
      var message = Object.assign({}, base, { status: status });
      try {
        if (window.opener) {
          window.opener.postMessage(message, '*');
        }
      } catch (e) {}
      window.close();
    }
    document.getElementById('allow').addEventListener('click', function () {
      send('success');
    });
    document.getElementById('cancel').addEventListener('click', function () {
      send('cancel');
    });
  </script>
</body>
</html>`;

  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  return popup;
}

export function isAgentsProtoOAuthResult(
  data: unknown,
): data is AgentsProtoOAuthResult {
  if (!data || typeof data !== 'object') return false;
  const value = data as Partial<AgentsProtoOAuthResult>;
  return (
    value.type === AGENTS_PROTO_OAUTH_MESSAGE &&
    (value.status === 'success' || value.status === 'cancel') &&
    typeof value.toolId === 'string' &&
    (value.provider === 'google' ||
      value.provider === 'github' ||
      value.provider === 'atlassian')
  );
}
