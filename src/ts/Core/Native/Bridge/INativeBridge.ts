export interface INativeBridge {
    handleCallback(results: unknown[][]): void;
    handleEvent(parameters: unknown[]): void;
    handleInvocation(parameters: unknown[]): void;
}
