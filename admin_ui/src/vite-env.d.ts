/// <reference types="vite/client" />

declare module 'react-dom/client' {
    import { Container } from 'react-dom';

    export interface Root {
        render(children: React.ReactNode): void;
        unmount(): void;
    }

    export function createRoot(container: Container): Root;
    export function hydrateRoot(container: Container, children: React.ReactNode): Root;
}

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
