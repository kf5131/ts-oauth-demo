# TypeScript OAuth GitHub Demo

A demonstration of OAuth 2.0 authentication with GitHub using TypeScript. This is a simple server that allows users to login with their GitHub account and see a list of their repositories. It uses the GitHub API to get the list of repositories. 

## Setup

1. Create a GitHub OAuth App
   - Go to GitHub Settings > Developer Settings > OAuth Apps
   - Click "New OAuth App"
   - Fill in the application details:
     - Application name: `TS OAuth Demo`
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/callback`
   - Register the application
   - Copy the Client ID and generate a Client Secret

2. Configure Environment Variables
   - Copy `.env.example` to `.env`
   - Fill in your GitHub OAuth credentials and generate a session secret (you can use this command in a bash window):
     ```bash
     openssl rand -hex 32
     ```

3. Install Dependencies
   ```bash
   npm install express express-session dotenv
   npm install -D @types/express @types/express-session
   ```

4. Start the Development Server
   ```bash
   npm run dev
   ```

## Usage

- Run the development server

Run Vite:
```bash
npm run dev
```

Run the server:
```bash
npm run start
```

- Open the browser and navigate to `http://localhost:3000`
- Click the "Login with GitHub" button
- Authorize the application to access your GitHub account
- You will be redirected back to the application and see a list of repositories

## Features

- GitHub OAuth authentication
- Access token management
- Basic user profile fetching
- TypeScript type safety

## Project Structure 

- `src/server.ts`: The main server file that sets up the Express application and routes.
- `src/auth/oauth-client.ts`: The OAuth client implementation.
- `src/auth/types.ts`: Type definitions for the OAuth client.
- `public/`: The public directory for static files.
- `node_modules/`: The dependencies for the project.
- `package.json`: The project configuration and dependencies.
- `tsconfig.json`: The TypeScript configuration.
- `.env`: The environment variables for the project.
- `.gitignore`: The files and directories to ignore in the repository.
- `README.md`: The README file for the project.
