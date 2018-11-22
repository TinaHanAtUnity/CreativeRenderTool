import { BackendApi } from 'Backend/BackendApi';

export class IosPreferences extends BackendApi {
    private _unityEngineRunning: boolean = false;

    public setUnityEngineRunning(running: boolean) {
        this._unityEngineRunning = running;
    }

    public getString(key: string): Promise<string> {
        if(this._unityEngineRunning) {
            if(key === 'unity.cloud_userid') {
                return Promise.resolve('123456acbdef');
            } else if(key === 'unity.player_sessionid') {
                return Promise.resolve('12345');
            }
        }

        return Promise.reject(['COULDNT_GET_VALUE', key]);
    }
}
