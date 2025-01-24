import express, { Request, Response, RequestHandler } from 'express';
import session from 'express-session';
import { OAuthClient } from './auth/oauth-client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize OAuth client
const oauthClient = new OAuthClient({
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  redirectUri: 'http://localhost:3000/callback',
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
  scope: ['repo', 'user']
});

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Serve static files
app.use(express.static('public'));

// Add type declarations for session
declare module 'express-session' {
  interface SessionData {
    state: string;
    token: string;
  }
}

// Login route
app.get('/login', (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  req.session.state = state;
  const authUrl = oauthClient.getAuthorizationUrl({ state });
  res.redirect(authUrl);
});

// Callback route
app.get('/callback', (async (req: Request<{}, {}, {}, { code?: string, state?: string }>, res: Response) => {
  const { code, state } = req.query;
  
  if (!code || typeof code !== 'string' || !state || typeof state !== 'string') {
    return res.status(400).send('Invalid request parameters');
  }

  // Verify state to prevent CSRF
  if (state !== req.session.state) {
    return res.status(400).send('Invalid state parameter');
  }

  try {
    const token = await oauthClient.getAccessToken(code);
    req.session.token = token;
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).send('Authentication failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}) as RequestHandler);

// API route to fetch repositories
app.get('/api/repos', (async (req: Request, res: Response) => {
  if (!req.session.token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const response = await fetch('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `Bearer ${req.session.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const repos = await response.json();
    res.json(repos);
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch repositories',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}) as RequestHandler);

// Move HTML template to a separate string
const dashboardTemplate = `
<!DOCTYPE html>
<html>
  <head>
    <title>GitHub Dashboard</title>
  </head>
  <body>
    <h1>Welcome to your GitHub Dashboard</h1>
    <div id="repos"></div>
    
    <script>
      fetch('/api/repos')
        .then(response => response.json())
        .then(repos => {
          const reposList = repos.map(repo => 
            \`<div>
              <h3>\${repo.name}</h3>
              <p>\${repo.description || 'No description'}</p>
              <a href="\${repo.html_url}" target="_blank">View on GitHub</a>
            </div>\`
          ).join('');
          document.getElementById('repos').innerHTML = reposList;
        })
        .catch(error => console.error('Error:', error));
    </script>
  </body>
</html>
`;

// Update dashboard route
app.get('/dashboard', (req: Request, res: Response) => {
  if (!req.session.token) {
    return res.redirect('/login');
  }
  res.send(dashboardTemplate);
});

// Add a basic root route handler
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running!');
});

// Add error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// Enhance the server startup with better error handling and validation
const startServer = async () => {
  try {
    // Validate required environment variables
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      throw new Error('Missing required environment variables: GITHUB_CLIENT_ID and/or GITHUB_CLIENT_SECRET');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log('Available routes:');
      console.log('  - GET  /');
      console.log('  - GET  /login');
      console.log('  - GET  /callback');
      console.log('  - GET  /api/repos');
      console.log('  - GET  /dashboard');
    }).on('error', (error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer(); 