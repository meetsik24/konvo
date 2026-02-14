/// <reference types="vite/client" />

interface Window {
    APP_CONFIG?: {
        VITE_DEVELOPMENT_API_URL?: string;
        VITE_PRODUCTION_API_URL?: string;
        [key: string]: string | undefined;
    };
}
