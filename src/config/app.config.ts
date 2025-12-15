export interface IAppConfig {
    port: number;
    peerJsPort: number;
    peerJsPath: string;
    corsOrigin: string;
    environment: string;
}

export const appConfig: IAppConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    peerJsPort: parseInt(process.env.PEERJS_PORT || '3001', 10),
    peerJsPath: process.env.PEERJS_PATH || '/peerjs',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    environment: process.env.NODE_ENV || 'development',
};
