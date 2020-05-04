import { BackendApi } from 'Backend/BackendApi';
import { Platform } from 'Core/Constants/Platform';

export class ClassDetection extends BackendApi {

    private _classesArePresent: boolean = false;
    private _platform: Platform = Platform.TEST;
    public setClassesArePresent(present: boolean) {
        this._classesArePresent = present;
    }
    public setPlatform(platform: Platform) {
       this._platform = platform;
    }

    public areClassesPresent(className: string[]) {
        if (this._classesArePresent) {
            if (this._platform === Platform.ANDROID) {
                return [{ class: 'com.unity3d.player.UnityPlayer', found: true }];
            }
            if (this._platform === Platform.IOS) {
                return [{ class: 'UnityAppController', found: true }];
            }
            return [];
        }
        if (this._platform === Platform.ANDROID) {
            return [{ class: 'com.unity3d.player.UnityPlayer', found: false }];
        }
        if (this._platform === Platform.IOS) {
            return [{ class: 'UnityAppController', found: false }];
        }
        return [];
    }
}
