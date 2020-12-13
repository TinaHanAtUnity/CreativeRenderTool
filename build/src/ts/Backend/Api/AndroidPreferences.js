import { BackendApi } from 'Backend/BackendApi';
export class AndroidPreferences extends BackendApi {
    constructor() {
        super(...arguments);
        this._unityEngineRunning = false;
    }
    setUnityEngineRunning(running) {
        this._unityEngineRunning = running;
    }
    getString(name, key) {
        if (this._unityEngineRunning) {
            if (key === 'unity.cloud_userid') {
                return '123456acbdef';
            }
            else if (key === 'unity.player_sessionid') {
                return '12345';
            }
        }
        throw ['COULDNT_GET_VALUE', name, key];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZFByZWZlcmVuY2VzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0JhY2tlbmQvQXBpL0FuZHJvaWRQcmVmZXJlbmNlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFaEQsTUFBTSxPQUFPLGtCQUFtQixTQUFRLFVBQVU7SUFBbEQ7O1FBQ1ksd0JBQW1CLEdBQVksS0FBSyxDQUFDO0lBaUJqRCxDQUFDO0lBZlUscUJBQXFCLENBQUMsT0FBZ0I7UUFDekMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE9BQU8sQ0FBQztJQUN2QyxDQUFDO0lBRU0sU0FBUyxDQUFDLElBQVksRUFBRSxHQUFXO1FBQ3RDLElBQUksSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzFCLElBQUksR0FBRyxLQUFLLG9CQUFvQixFQUFFO2dCQUM5QixPQUFPLGNBQWMsQ0FBQzthQUN6QjtpQkFBTSxJQUFJLEdBQUcsS0FBSyx3QkFBd0IsRUFBRTtnQkFDekMsT0FBTyxPQUFPLENBQUM7YUFDbEI7U0FDSjtRQUVELE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDM0MsQ0FBQztDQUNKIn0=