import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as http from 'node:http';
import { fileURLToPath } from 'node:url';
import { logger } from '../utils/logger.js';
import { exec } from 'node:child_process';

const CONFIG_DIR = path.join(os.homedir(), '.puter-mcp');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const PROJECT_CONFIG_DIR = path.join(process.cwd(), '.puter-mcp');
const PROJECT_CONFIG_FILE = path.join(PROJECT_CONFIG_DIR, 'config.json');
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(MODULE_DIR, '..', '..');
const MODULE_CONFIG_FILE = path.join(PROJECT_ROOT, '.puter-mcp', 'config.json');

const findProjectConfigFile = (): string | null => {
  let current = process.cwd();
  while (true) {
    const candidate = path.join(current, '.puter-mcp', 'config.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
};

interface Config {
  authToken?: string;
  apiBase?: string;
}

export class AuthManager {
  private config: Config = {};

  constructor() {
    this.loadConfig();
  }

  private normalizeToken(value?: string): string | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (trimmed.toLowerCase().startsWith('bearer ')) {
      return trimmed.slice(7).trim();
    }
    return trimmed;
  }

  private loadConfig(): void {
    try {
      let merged: Config = {};
      if (fs.existsSync(CONFIG_FILE)) {
        const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
        merged = { ...merged, ...JSON.parse(raw) };
      }
      const projectConfigFile = findProjectConfigFile();
      if (projectConfigFile) {
        const raw = fs.readFileSync(projectConfigFile, 'utf-8');
        merged = { ...merged, ...JSON.parse(raw) };
      } else if (fs.existsSync(MODULE_CONFIG_FILE)) {
        const raw = fs.readFileSync(MODULE_CONFIG_FILE, 'utf-8');
        merged = { ...merged, ...JSON.parse(raw) };
      }
      this.config = merged;
    } catch (err) {
      logger.warn('Failed to load config:', err);
    }
  }

  private saveConfig(): void {
    const writeConfig = (dir: string, file: string): void => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
      }
      fs.writeFileSync(file, JSON.stringify(this.config, null, 2), {
        mode: 0o600,
      });
    };
    try {
      writeConfig(CONFIG_DIR, CONFIG_FILE);
    } catch (_err) {
      try {
        writeConfig(PROJECT_CONFIG_DIR, PROJECT_CONFIG_FILE);
      } catch (fallbackErr) {
        logger.error('Failed to save config:', fallbackErr);
      }
    }
  }

  /**
   * Get auth token.
   * Priority: 1) env var, 2) config file
   */
  async getToken(): Promise<string | undefined> {
    const envToken = this.normalizeToken(process.env.PUTER_AUTH_TOKEN);
    if (envToken) {
      logger.debug('Auth token source: env');
      return envToken;
    }
    const fileToken = this.normalizeToken(this.config.authToken);
    if (fileToken) {
      logger.debug('Auth token source: config');
      return fileToken;
    }
    return undefined;
  }

  /**
   * Store auth token persistently.
   */
  setToken(token: string): void {
    this.config.authToken = token;
    this.saveConfig();
    logger.info('Auth token saved');
  }

  /**
   * Browser-based login flow:
   * 1. Start a local HTTP server on a random port
   * 2. Open the Puter auth URL in the user's default browser
   * 3. Puter redirects back to our local server with the token
   * 4. We capture and store the token
   *
   * This mirrors how `getAuthToken()` works in the Puter.js SDK.
   */
  async loginViaBrowser(): Promise<string> {
    return new Promise((resolve, reject) => {
      const server = http.createServer((req, res) => {
        const url = new URL(req.url || '/', `http://localhost`);

        // Handle the callback from Puter with the auth token
        const token = url.searchParams.get('token');

        if (token) {
          this.setToken(token);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <!DOCTYPE html>
            <html>
            <body style="font-family: system-ui; display: flex; justify-content: center;
                         align-items: center; height: 100vh; margin: 0;
                         background: #1a1a2e; color: #e0e0e0;">
              <div style="text-align: center;">
                <h1 style="color: #00d4aa;">✅ puterMCP Authenticated!</h1>
                <p>You can close this window and return to your terminal.</p>
              </div>
            </body>
            </html>
          `);
          server.close();
          resolve(token);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing token parameter');
        }
      });

      server.listen(0, () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          reject(new Error('Failed to start local server'));
          return;
        }

        const port = address.port;
        const callbackUrl = `http://localhost:${port}/callback`;
        const authUrl = `https://puter.com/action/request-auth?callback=${encodeURIComponent(callbackUrl)}`;

        logger.info(`Opening browser for authentication...`);
        logger.info(`If browser doesn't open, visit: ${authUrl}`);

        // Open browser (cross-platform)
        const cmd = process.platform === 'darwin' ? 'open'
          : process.platform === 'win32' ? 'start'
          : 'xdg-open';
        exec(`${cmd} "${authUrl}"`);
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('Authentication timed out after 5 minutes'));
      }, 300_000);
    });
  }

  hasToken(): boolean {
    return !!(process.env.PUTER_AUTH_TOKEN || this.config.authToken);
  }
}
