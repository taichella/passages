module.exports = (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send(`
      <div style="font-family: sans-serif; padding: 30px; max-width: 600px; margin: auto;">
        <h2 style="color: #e53e3e;">Configuration Vercel Incomplète</h2>
        <p>La variable d'environnement <code>OAUTH_CLIENT_ID</code> (ou <code>GITHUB_CLIENT_ID</code>) n'est pas encore configurée sur votre tableau de bord Vercel.</p>
        <p>Ajoutez <strong>OAUTH_CLIENT_ID</strong> et <strong>OAUTH_CLIENT_SECRET</strong> dans les <em>Settings &gt; Environment Variables</em> de votre projet Vercel, puis relancez un déploiement.</p>
      </div>
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
