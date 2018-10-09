export interface IModule {
    isInitialized(): boolean;
    initialize(...parameters: any[]): void | Promise<void>;
}
