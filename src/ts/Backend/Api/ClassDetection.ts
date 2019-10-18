import { BackendApi } from 'Backend/BackendApi';

export class ClassDetection extends BackendApi {

    private _unityEngineRunning: boolean = false;
    private _classIsPresent: boolean = false;

    public setUnityEngineRunning(running: boolean) {
        this._unityEngineRunning = running;
    }

    public setClassIsPresent(present: boolean) {
        this._classIsPresent = present;
    }

    public isClassPresent(className: string) {
        if (className === 'UnityAppController' || className === 'com.unity3d.player.UnityPlayer') {
            return this._unityEngineRunning;
        }
        return this._classIsPresent;
    }

    public isMadeWithUnity() {
        return this._unityEngineRunning;
    }

}
