/// <reference types="astro/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    HOST?: string;
    PORT?: string;
    NODE_ENV?: "development" | "production";
    PUBLIC_SITE_URL?: string;

    UMAMI_SCRIPT_URL?: string;
    UMAMI_WEBSITE_ID?: string;
  }
}
