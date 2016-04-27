import { NativeApi } from 'Native/NativeApi';
import { Observable0 } from 'Utilities/Observable';
import { NativeBridge } from 'Native/NativeBridge';

enum BroadcastEvent {
    ACTION
}

export class BroadcastApi extends NativeApi {
    public onScreenOn: Observable0 = new Observable0();
    public onScreenOff: Observable0 = new Observable0();

    private _screenListenerName = 'screenListener';

    private ACTION_SCREEN_ON: string = 'android.intent.action.SCREEN_ON';
    private ACTION_SCREEN_OFF: string = 'android.intent.action.SCREEN_OFF';

    constructor(nativeBridge: NativeBridge) {
        super(nativeBridge, 'Broadcast');
    }

    public setListenScreenStatus(status: boolean): Promise<void> {
        if(status) {
            return this._nativeBridge.invoke<void>(this._apiClass, 'addBroadcastListener', [this._screenListenerName, [this.ACTION_SCREEN_ON, this.ACTION_SCREEN_OFF]]);
        } else {
            return this._nativeBridge.invoke<void>(this._apiClass, 'removeBroadcastListener', [this._screenListenerName]);
        }
    }

    public handleEvent(event: string, parameters: any[]): void {
        if(event === BroadcastEvent[BroadcastEvent.ACTION] && parameters[0] === this._screenListenerName) {
            switch (parameters[1]) {
                case this.ACTION_SCREEN_ON:
                    this.onScreenOn.trigger();
                    break;

                case this.ACTION_SCREEN_OFF:
                    this.onScreenOff.trigger();
                    break;

                default:
                    super.handleEvent(event, parameters);
            }
        } else {
            super.handleEvent(event, parameters);
        }
    }
}