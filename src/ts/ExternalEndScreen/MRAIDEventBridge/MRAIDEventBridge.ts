import { ICoreApi } from 'Core/ICore';

export interface IMRAIDEventBridgeHandler {
    onReady(): void;
    onClose(): void;
    onOpen(url: string): void;
    onLoaded(): void;
}

export abstract class MRAIDEventBridge {
    protected _handler: IMRAIDEventBridgeHandler;
    protected _core: ICoreApi;

    constructor(handler: IMRAIDEventBridgeHandler, core: ICoreApi) {
        this._handler = handler;
        this._core = core;

        this.setupEventListener();
    }

    protected abstract setupEventListener(): void;

    protected abstract postMessage(event: string, data?: unknown): void;

    public sendViewableEvent(viewable: boolean) {
        this.postMessage('viewable', viewable);
    }

    public sendResizeEvent(width: number, height: number) {
        this.postMessage('resize', { width: width, height: height });
    }

    public abstract close(): void;
}
