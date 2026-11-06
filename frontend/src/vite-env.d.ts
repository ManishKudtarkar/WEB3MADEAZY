/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_WORLD_ID_APP_ID?: string;
  readonly VITE_WORLD_ID_ACTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
