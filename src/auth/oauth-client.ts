import { OAuthConfig, TokenResponse, OAuthErrorResponse } from './types';

export class OAuthClient {
  constructor(private config: OAuthConfig) {}

  // Generate authorization URL with GitHub-specific options
  getAuthorizationUrl(options?: {
    state?: string;
    allowSignup?: boolean;
  }): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope.join(' ')
    });

    // Add state parameter if provided (recommended for security)
    if (options?.state) {
      params.append('state', options.state);
    }

    // Add GitHub-specific allow_signup parameter
    if (options?.allowSignup !== undefined) {
      params.append('allow_signup', options.allowSignup.toString());
    }

    return `${this.config.authorizationEndpoint}?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: code,
      redirect_uri: this.config.redirectUri,
    });

    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json() as TokenResponse & OAuthErrorResponse;

    if (data.error) {
      throw new Error(data.error_description || 'Failed to get access token');
    }

    return data.access_token;
  }
} 