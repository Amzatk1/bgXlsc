/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sanity project id — when set, the site pulls content from Sanity. Leave unset to use local fallback data. */
  readonly VITE_SANITY_PROJECT_ID?: string;
  /** Sanity dataset (default: "production"). */
  readonly VITE_SANITY_DATASET?: string;
  /** Sanity API version (default: "2024-01-01"). */
  readonly VITE_SANITY_API_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
