export interface INativeBridge {
    handleCallback(results: any[][]): void;
    handleEvent(parameters: any[]): void;
    handleInvocation(parameters: any[]): void;
}
