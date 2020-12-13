import { BackendApi } from 'Backend/BackendApi';
export class IosPreferences extends BackendApi {
    constructor() {
        super(...arguments);
        this._unityEngineRunning = false;
    }
    setUnityEngineRunning(running) {
        this._unityEngineRunning = running;
    }
    getString(key) {
        if (this._unityEngineRunning) {
            if (key === 'unity.cloud_userid') {
                return '123456acbdef';
            }
            else if (key === 'unity.player_sessionid') {
                return '12345';
            }
        }
        throw ['COULDNT_GET_VALUE', key];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zUHJlZmVyZW5jZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFja2VuZC9BcGkvSW9zUHJlZmVyZW5jZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRWhELE1BQU0sT0FBTyxjQUFlLFNBQVEsVUFBVTtJQUE5Qzs7UUFDWSx3QkFBbUIsR0FBWSxLQUFLLENBQUM7SUFpQmpELENBQUM7SUFmVSxxQkFBcUIsQ0FBQyxPQUFnQjtRQUN6QyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsT0FBTyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxTQUFTLENBQUMsR0FBVztRQUN4QixJQUFJLElBQUksQ0FBQyxtQkFBbUIsRUFBRTtZQUMxQixJQUFJLEdBQUcsS0FBSyxvQkFBb0IsRUFBRTtnQkFDOUIsT0FBTyxjQUFjLENBQUM7YUFDekI7aUJBQU0sSUFBSSxHQUFHLEtBQUssd0JBQXdCLEVBQUU7Z0JBQ3pDLE9BQU8sT0FBTyxDQUFDO2FBQ2xCO1NBQ0o7UUFFRCxNQUFNLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckMsQ0FBQztDQUNKIn0=