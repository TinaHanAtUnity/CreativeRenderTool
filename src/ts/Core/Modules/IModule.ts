export interface IModule {
    isInitialized(): boolean;
    initialize(): void | Promise<void>;
}
