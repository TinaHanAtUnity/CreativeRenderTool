export interface IModule {
    isInitialized(): boolean;
    initialize(...parameters: any[]): any | Promise<any>;
}
