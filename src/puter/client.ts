import { AuthManager } from './auth.js';
import { PuterApiError, PuterAuthError } from './types.js';
import { logger } from '../utils/logger.js';

const PUTER_API_BASE = 'https://api.puter.com';

export interface DriverCallParams {
  interface: string;
  driver?: string;
  service?: string;
  method: string;
  args: Record<string, unknown>;
}

export interface DriverCallResult {
  success: boolean;
  result?: unknown;
  error?: { code: string; message: string };
}

export class PuterClient {
  private authManager: AuthManager;

  constructor(authManager: AuthManager) {
    this.authManager = authManager;
  }

  /**
   * Call the Puter driver API directly.
   *
   * Endpoint: POST /drivers/call
   * Auth: Bearer token in Authorization header
   * Content-Type: application/json
   *
   * The API uses an "interface/service/method/args" pattern where:
   * - interface: the driver type (e.g., "puter-image-generation")
   * - service/driver: the specific provider (e.g., "openai-image-generation")
   * - method: the operation (e.g., "generate")
   * - args: operation-specific parameters
   */
  async callDriver(params: DriverCallParams): Promise<DriverCallResult> {
    const token = await this.authManager.getToken();

    if (!token) {
      throw new PuterAuthError(
        'No auth token found. Run: puter-mcp --login to authenticate.'
      );
    }

    const body: Record<string, unknown> = {
      interface: params.interface,
      method: params.method,
      args: params.args,
    };

    // Puter API accepts both "driver" and "service" for specifying the provider
    if (params.driver) body.driver = params.driver;
    if (params.service) body.service = params.service;

    logger.debug('Calling Puter driver:', JSON.stringify(body));

    const response = await fetch(`${PUTER_API_BASE}/drivers/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': 'https://puter.com',
        'Referer': 'https://puter.com/',
      },
      body: JSON.stringify(body),
    });

    // Non-200 means transport-level error
    if (!response.ok) {
      throw new PuterApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const contentType = response.headers.get('content-type') || '';

    // If it looks like JSON, try to parse it as such
    if (contentType.includes('application/json')) {
      const data = await response.json() as { success: boolean; error?: { message: string; code: string } };

      if (data.success === false) {
        throw new PuterApiError(
          data.error?.message || 'Unknown Puter API error',
          200,
          data.error?.code
        );
      }
      return data as DriverCallResult;
    }

    // Otherwise, treat as binary/image
    const buffer = await response.arrayBuffer();

    // Check for JSON error in binary response (sometimes happens with 4xx/5xx but missing content-type)
    try {
      const text = Buffer.from(buffer).toString('utf-8');
      if (text.startsWith('{') && text.includes('"success":false')) {
         const data = JSON.parse(text);
         throw new PuterApiError(
          data.error?.message || 'Unknown Puter API error',
          200,
          data.error?.code
        );
      }
    } catch (e) {
      // Not JSON, proceed as image
      if (e instanceof PuterApiError) throw e;
    }

    const base64 = Buffer.from(buffer).toString('base64');
    // Default to png if mime type is generic/missing/undefined
    let mimeType = 'image/png';
    if (contentType && contentType !== 'undefined' && contentType.startsWith('image/')) {
      mimeType = contentType.split(';')[0].trim();
    }

    return {
      success: true,
      result: {
        base64,
        mimeType,
        dataUrl: `data:${mimeType};base64,${base64}`,
      },
    };
  }

  /**
   * Generate an image from a text prompt.
   * Returns the raw base64 image data and MIME type.
   */
  async generateImage(
    prompt: string,
    options: {
      model?: string;
      quality?: string;
      size?: string;
      inputImage?: string;       // base64 for img2img
      inputImageMimeType?: string;
    } = {}
  ): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
    // Build the args object
    const args: Record<string, unknown> = {
      prompt,
      model: options.model || 'dall-e-3'
    };

    if (options.quality) args.quality = options.quality;
    if (options.size) args.size = options.size;
    if (options.inputImage) {
      args.input_image = options.inputImage;
      args.input_image_mime_type = options.inputImageMimeType || 'image/png';
    }

    // Determine the driver/service from the model name
    const model = options.model || 'dall-e-3';
    const driverInfo = resolveModelToDriver(model);

    const result = await this.callDriver({
      interface: driverInfo.interface,
      driver: driverInfo.driver,
      method: 'generate',
      args: {
        ...args,
        ...(driverInfo.extraArgs || {}),
      },
    });

    if (!result.success || !result.result) {
      throw new PuterApiError('Image generation failed: no result returned');
    }

    return result.result as { base64: string; mimeType: string; dataUrl: string };
  }
}

/**
 * Map a user-friendly model name to the Puter driver interface/service.
 *
 * Puter's image gen uses the "puter-image-generation" interface.
 * The specific model/provider is determined by the "driver" field.
 *
 * This mapping may need updating as Puter adds models.
 * The txt2img function in Puter.js internally maps model names to services.
 */
interface DriverMapping {
  interface: string;
  driver: string;
  extraArgs?: Record<string, unknown>;
}

function resolveModelToDriver(model: string): DriverMapping {
  const base: DriverMapping = {
    interface: 'puter-image-generation',
    driver: 'openai-image-generation', // Default fallback
  };

  // OpenAI Models
  if (model.startsWith('dall-e') || model.startsWith('gpt-image')) {
    return { ...base, driver: 'openai-image-generation' };
  }

  // Google / Gemini Models
  if (model.startsWith('gemini-') || model.startsWith('google/')) {
    return { ...base, driver: 'gemini-image-generation' };
  }

  // Everything else (Flux, Stable Diffusion, Ideogram, etc.) is likely on Together AI
  // This covers: black-forest-labs, stabilityai, ideogram, etc.
  return { ...base, driver: 'together-image-generation' };
}
