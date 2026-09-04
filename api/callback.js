function getClientId() {
  const candidates = [
    process.env.OAUTH_CLIENT_ID,
    process.env.GITHUB_CLIENT_ID,
    process.env.CLIENT_ID,
    process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID,
    process.env.OAUTH_ID,
    process.env.GITHUB_ID,
    process.env.oauth_client_id,
    process.env.github_client_id
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim()) return c.trim();
  }
  for (const key of Object.keys(process.env)) {
    if (/^(oauth|github)?_?client_?id$/i.test(key)) {
      const val = process.env[key];
      if (val && typeof val === 'string' && val.trim()) return val.trim();
    }
  }
  return null;
}

function getClientSecret() {
  const candidates = [
    process.env.OAUTH_CLIENT_SECRET,
    process.env.GITHUB_CLIENT_SECRET,
    process.env.CLIENT_SECRET,
    process.env.OAUTH_SECRET,
    process.env.GITHUB_SECRET,
    process.env.oauth_client_secret,
    process.env.github_client_secret
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim()) return c.trim();
  }
  for (const key of Object.keys(process.env)) {
    if (/^(oauth|github)?_?client_?secret$/i.test(key)) {
      const val = process.env[key];
      if (val && typeof val === 'string' && val.trim()) return val.trim();
    }
  }
  return null;
}

module.exports = async (req, res) => {
  const code = req.query.code;
  const clientId = getClientId();
  const clientSecret = getClientSecret();

  if (!code) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send('<p style="font-family: sans-serif; padding: 20px;">Code d\'autorisation manquant.</p>');
  }

  if (!clientId || !clientSecret) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<p style="font-family: sans-serif; padding: 20px;">OAUTH_CLIENT_ID ou OAUTH_CLIENT_SECRET non configuré sur Vercel.</p>');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await response.json();

    if (data.error || !data.access_token) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(400).send(`
        <div style="font-family: sans-serif; padding: 30px; max-width: 600px; margin: auto;">
          <h2 style="color: #e53e3e;">Erreur d'authentification GitHub</h2>
          <p>${data.error_description || data.error || 'Impossible d\'obtenir le jeton d\'accès.'}</p>
        </div>
      `);
    }

    const token = data.access_token;
    const provider = 'github';

    const content = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Connexion PassageS CMS</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #F6F2FF; color: #16121F;">
  <div style="text-align: center; background: #fff; padding: 30px 40px; border-radius: 16px; box-shadow: 0 10px 30px rgba(69,0,167,0.1);">
    <h3 style="color: #4500A7; margin: 0 0 10px;">Authentification réussie !</h3>
    <p style="margin: 0; color: #625A72;">Connexion au tableau de bord en cours...</p>
  </div>
  <script>
    (function () {
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:${provider}:success:' + JSON.stringify({
            token: '${token}',
            provider: '${provider}'
          }),
          e.origin
        );
        window.removeEventListener('message', receiveMessage, false);
        setTimeout(function() {
          window.close();
        }, 300);
      }
      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:${provider}', '*');
    })();
  </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(content);
  } catch (err) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(`<p style="font-family: sans-serif; padding: 20px;">Erreur de connexion serveur: ${err.message}</p>`);
  }
};
