import { NativeBridge } from 'Native/NativeBridge';
import { ThirdParty } from 'Views/ThirdParty';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { Campaign } from 'Models/Campaign';
import { Placement } from 'Models/Placement';
import { Platform } from '../Constants/Platform';
import { ScreenOrientation } from '../Constants/Android/ScreenOrientation';
import { KeyCode } from '../Constants/Android/KeyCode';
import { SystemUiVisibility } from '../Constants/Android/SystemUiVisibility';
import { UIInterfaceOrientationMask } from '../Constants/iOS/UIInterfaceOrientationMask';
import { FinishState } from '../Constants/FinishState';
import { AndroidAdUnitError } from '../Native/Api/AndroidAdUnit';

export class HtmlAdUnit extends AbstractAdUnit {

    private static ActivityId = 1;

    private _thirdParty: ThirdParty;
    private _isShowing: boolean;
    private _options: any;

    constructor(nativeBridge: NativeBridge, placement: Placement, campaign: Campaign, thirdParty: ThirdParty, options: any) {
        super(nativeBridge, placement, campaign);
        this._thirdParty = thirdParty;
        this._isShowing = false;
        this._options = options;
    }

    public show(): Promise<void> {
        this._isShowing = true;
        this._thirdParty.show();
        this.onStart.trigger();

        const platform = this._nativeBridge.getPlatform();
        if(platform === Platform.ANDROID) {
            let orientation: ScreenOrientation = this._options.requestedOrientation;
            if(!this._placement.useDeviceOrientationForVideo()) {
                orientation = ScreenOrientation.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
            }

            let keyEvents: any[] = [];
            if(this._placement.disableBackButton()) {
                keyEvents = [KeyCode.BACK];
            }

            let hardwareAccel: boolean = true;
            if(this._nativeBridge.getApiLevel() < 17) {
                hardwareAccel = false;
            }

            this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation + ', hardware acceleration ' + (hardwareAccel ? 'enabled' : 'disabled'));

            return this._nativeBridge.AndroidAdUnit.open(HtmlAdUnit.ActivityId++, ['webview'], orientation, keyEvents, SystemUiVisibility.LOW_PROFILE, hardwareAccel);
        } else if(platform === Platform.IOS) {
            let orientation: UIInterfaceOrientationMask = this._options.supportedOrientations;
            if(!this._placement.useDeviceOrientationForVideo()) {
                if((orientation & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE) {
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE;
                } else if((orientation & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT) {
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_LEFT;
                } else if((orientation & UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) === UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT) {
                    orientation = UIInterfaceOrientationMask.INTERFACE_ORIENTATION_MASK_LANDSCAPE_RIGHT;
                }
            }

            this._nativeBridge.Sdk.logInfo('Opening game ad with orientation ' + orientation);

            return this._nativeBridge.IosAdUnit.open(['webview'], orientation, true, true);
        }

        return Promise.resolve(void(0));
    }

    public hide(): Promise<void> {
        this._isShowing = false;
        this._thirdParty.hide();
        this.onFinish.trigger();
        this.onClose.trigger();
        this._thirdParty.container().parentElement.removeChild(this._thirdParty.container());
        this.unsetReferences();

        const platform = this._nativeBridge.getPlatform();
        if(platform === Platform.ANDROID) {
            this._nativeBridge.Listener.sendFinishEvent(this._placement.getId(), FinishState.COMPLETED);

            return this._nativeBridge.AndroidAdUnit.close().catch(error => {
                // activity might be null here if we are coming from onDestroy observer so just cleanly ignore the error
                if(error !== AndroidAdUnitError[AndroidAdUnitError.ACTIVITY_NULL]) {
                    throw new Error(error);
                }
            });
        } else if(platform === Platform.IOS) {
            return this._nativeBridge.IosAdUnit.close();
        }

        return Promise.resolve(void(0));
    }

    public isShowing(): boolean {
        return this._isShowing;
    }

    private unsetReferences() {
        delete this._thirdParty;
    }

}
