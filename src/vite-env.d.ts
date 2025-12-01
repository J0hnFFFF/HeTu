/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 河图 API 网关 (推荐方式)
  readonly VITE_HETU_API_URL?: string;
  readonly VITE_HETU_API_KEY?: string;

  // Gemini API (开发/自托管方式)
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
