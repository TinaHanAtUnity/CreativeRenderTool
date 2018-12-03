import { BackendApi } from 'Backend/BackendApi';

export class IosPreferences extends BackendApi {
    private _unityEngineRunning: boolean = false;

    public setUnityEngineRunning(running: boolean) {
        this._unityEngineRunning = running;
    }

    public getString(key: string): string {
        if(this._unityEngineRunning) {
            if(key === 'unity.cloud_userid') {
                return '123456acbdef';
            } else if(key === 'unity.player_sessionid') {
                return '12345';
            }
        }

        throw ['COULDNT_GET_VALUE', key];
    }
}
