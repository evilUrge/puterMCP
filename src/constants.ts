
export interface ModelInfo {
  id: string;
  displayName?: string;
  category: 'openai' | 'google' | 'flux' | 'stable-diffusion' | 'other';
  quality?: string[];  // Supported quality levels
  notes?: string;
}

export const SUPPORTED_MODELS: ModelInfo[] = [
  // OpenAI Models
  { id: 'gpt-image-1.5',     displayName: 'GPT Image 1.5',     category: 'openai',  quality: ['high', 'medium', 'low'] },
  { id: 'gpt-image-1',       displayName: 'GPT Image 1',       category: 'openai',  quality: ['high', 'medium', 'low'] },
  { id: 'gpt-image-1-mini',  displayName: 'GPT Image 1 Mini',  category: 'openai',  quality: ['high', 'medium', 'low'] },
  { id: 'dall-e-3',          displayName: 'DALL-E 3',           category: 'openai',  quality: ['hd', 'standard'] },
  { id: 'dall-e-2',          displayName: 'DALL-E 2',           category: 'openai' },

  // Google / Nano Banana Models
  { id: 'gemini-3.1-flash-image-preview', displayName: 'Nano Banana 2 (Gemini 3.1 Flash)', category: 'google', notes: 'Fast, pro-level quality' },
  { id: 'gemini-3-pro-image-preview',     displayName: 'Nano Banana Pro (Gemini 3 Pro)',    category: 'google', notes: 'Best text rendering' },
  { id: 'gemini-2.5-flash-image-preview', displayName: 'Nano Banana (Gemini 2.5 Flash)',    category: 'google', notes: 'Supports img2img' },
  { id: 'google/flash-image-2.5',         displayName: 'Google Flash Image 2.5',            category: 'google' },
  { id: 'google/imagen-4.0-fast',         displayName: 'Google Imagen 4.0 Fast',            category: 'google' },
  { id: 'google/imagen-4.0-preview',      displayName: 'Google Imagen 4.0 Preview',         category: 'google' },
  { id: 'google/imagen-4.0-ultra',        displayName: 'Google Imagen 4.0 Ultra',           category: 'google' },

  // Flux Models
  { id: 'black-forest-labs/FLUX.1-schnell',      displayName: 'Flux.1 Schnell',      category: 'flux', notes: 'Fast generation' },
  { id: 'black-forest-labs/FLUX.1-schnell-Free',  displayName: 'Flux.1 Schnell Free', category: 'flux' },
  { id: 'black-forest-labs/FLUX.1-dev',           displayName: 'Flux.1 Dev',          category: 'flux' },
  { id: 'black-forest-labs/FLUX.1-pro',           displayName: 'Flux.1 Pro',          category: 'flux' },
  { id: 'black-forest-labs/FLUX.1.1-pro',         displayName: 'Flux 1.1 Pro',        category: 'flux' },
  { id: 'black-forest-labs/FLUX.1-kontext-dev',   displayName: 'Flux.1 Kontext Dev',  category: 'flux' },
  { id: 'black-forest-labs/FLUX.1-kontext-max',   displayName: 'Flux.1 Kontext Max',  category: 'flux' },
  { id: 'black-forest-labs/FLUX.1-kontext-pro',   displayName: 'Flux.1 Kontext Pro',  category: 'flux' },
  { id: 'black-forest-labs/FLUX.1-Canny-pro',     displayName: 'Flux.1 Canny Pro',    category: 'flux' },
  { id: 'black-forest-labs/FLUX.1-dev-lora',      displayName: 'Flux.1 Dev LoRA',     category: 'flux' },
  { id: 'black-forest-labs/FLUX.1-krea-dev',      displayName: 'Flux.1 Krea Dev',     category: 'flux' },

  // Stable Diffusion Models
  { id: 'stabilityai/stable-diffusion-3-medium',       displayName: 'Stable Diffusion 3 Medium',  category: 'stable-diffusion' },
  { id: 'stabilityai/stable-diffusion-xl-base-1.0',    displayName: 'Stable Diffusion XL Base',   category: 'stable-diffusion' },

  // Other Models
  { id: 'ByteDance-Seed/Seedream-3.0',       displayName: 'ByteDance Seedream 3.0',     category: 'other' },
  { id: 'ByteDance-Seed/Seedream-4.0',       displayName: 'ByteDance Seedream 4.0',     category: 'other' },
  { id: 'HiDream-ai/HiDream-I1-Dev',         displayName: 'HiDream I1 Dev',             category: 'other' },
  { id: 'HiDream-ai/HiDream-I1-Fast',        displayName: 'HiDream I1 Fast',            category: 'other' },
  { id: 'HiDream-ai/HiDream-I1-Full',        displayName: 'HiDream I1 Full',            category: 'other' },
  { id: 'Lykon/DreamShaper',                  displayName: 'Lykon DreamShaper',          category: 'other' },
  { id: 'Qwen/Qwen-Image',                   displayName: 'Qwen Image',                 category: 'other' },
  { id: 'RunDiffusion/Juggernaut-pro-flux',   displayName: 'Juggernaut Pro Flux',        category: 'other' },
  { id: 'Rundiffusion/Juggernaut-Lightning-Flux', displayName: 'Juggernaut Lightning',   category: 'other' },
  { id: 'ideogram/ideogram-3.0',              displayName: 'Ideogram 3.0',               category: 'other' },
];

export const DEFAULT_MODEL = 'dall-e-3';
export const PUTER_API_BASE = 'https://api.puter.com';
export const MODEL_FALLBACK_CHAIN = [
  'dall-e-3',
  'gpt-image-1-mini',
  'black-forest-labs/FLUX.1-schnell',
  'stabilityai/stable-diffusion-3-medium',
];
export const FALLBACK_ERROR_PATTERNS = [
  'insufficient',
  'forbidden',
  'rate limit',
  'unavailable',
  'quota',
  'billing',
  'credit',
  'payment',
];
