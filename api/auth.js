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

module.exports = (req, res) => {
  const clientId = getClientId();

  if (!clientId) {
    const visibleKeys = Object.keys(process.env)
      .filter(k => !k.startsWith('AWS_') && !k.startsWith('npm_') && !k.startsWith('NODE_') && !k.startsWith('LD_') && !k.startsWith('PATH'))
      .sort();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Configuration Vercel</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #F6F2FF; padding: 40px 20px; color: #16121F; }
          .card { background: #fff; max-width: 620px; margin: auto; padding: 32px; border-radius: 20px; box-shadow: 0 10px 30px rgba(69,0,167,0.1); }
          h2 { color: #4500A7; margin-top: 0; }
          code { background: #F2ECFC; color: #4500A7; padding: 3px 8px; border-radius: 6px; font-size: 15px; font-weight: bold; }
          .list { background: #fafafa; border: 1px solid #eee; padding: 14px 18px; border-radius: 12px; margin: 16px 0; font-family: monospace; font-size: 13px; }
          .btn { display: inline-block; background: #4500A7; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 999px; font-weight: bold; margin-top: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Variables Vercel non détectées</h2>
          <p>Le serveur n'a pas encore reçu la variable <code>OAUTH_CLIENT_ID</code>.</p>
          <p><strong>Variables actuellement visibles par la fonction Vercel :</strong></p>
          <div class="list">${visibleKeys.length > 0 ? visibleKeys.join('<br>') : '<em>(Aucune variable personnalisée trouvée)</em>'}</div>
          <p><strong>Comment corriger :</strong></p>
          <ol style="line-height: 1.8; padding-left: 20px;">
            <li>Dans Vercel &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong> :</li>
            <li>Assurez-vous que le nom est exactement <code>OAUTH_CLIENT_ID</code>.</li>
            <li>Assurez-vous que la case <strong>Production</strong> est bien cochée.</li>
            <li>Après avoir sauvegardé, ce nouveau commit va déclencher un <strong>nouveau déploiement automatique</strong>.</li>
          </ol>
        </div>
      </body>
      </html>
    `);
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const redirectUri = `${protocol}://${host}/api/callback`;

  const scope = req.query.scope || 'repo,user';
  const state = Math.random().toString(36).substring(2);
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  res.writeHead(302, { Location: authUrl });
  res.end();
};
