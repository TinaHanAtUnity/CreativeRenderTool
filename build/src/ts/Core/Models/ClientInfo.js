import { Model } from 'Core/Models/Model';
export class ClientInfo extends Model {
    constructor(data) {
        super('ClientInfo', {
            gameId: ['string'],
            testMode: ['boolean'],
            applicationName: ['string'],
            applicationVersion: ['string'],
            sdkVersion: ['number'],
            sdkVersionName: ['string'],
            debuggable: ['boolean'],
            configUrl: ['string'],
            webviewUrl: ['string'],
            webviewHash: ['string', 'null'],
            webviewVersion: ['string', 'null'],
            initTimestamp: ['number'],
            reinitialized: ['boolean'],
            monetizationInUse: ['boolean'],
            usePerPlacementLoad: ['boolean']
        });
        this.set('gameId', data[0]);
        this.set('testMode', data[1]);
        this.set('applicationName', data[2]);
        this.set('applicationVersion', data[3]);
        this.set('sdkVersion', data[4]);
        this.set('sdkVersionName', data[5]);
        this.set('debuggable', data[6]);
        this.set('configUrl', data[7]);
        this.set('webviewUrl', data[8]);
        this.set('webviewHash', data[9]);
        this.set('webviewVersion', data[10]);
        this.set('initTimestamp', data[11]);
        this.set('reinitialized', data[12]);
        this.set('usePerPlacementLoad', !!data[13]);
        this.set('monetizationInUse', false);
    }
    getGameId() {
        return this.get('gameId');
    }
    getTestMode() {
        return this.get('testMode');
    }
    getApplicationVersion() {
        return this.get('applicationVersion');
    }
    getApplicationName() {
        return this.get('applicationName');
    }
    getSdkVersion() {
        return this.get('sdkVersion');
    }
    getSdkVersionName() {
        return this.get('sdkVersionName');
    }
    isDebuggable() {
        return this.get('debuggable');
    }
    getConfigUrl() {
        return this.get('configUrl');
    }
    getWebviewUrl() {
        return this.get('webviewUrl');
    }
    getWebviewHash() {
        return this.get('webviewHash');
    }
    getWebviewVersion() {
        return this.get('webviewVersion');
    }
    getInitTimestamp() {
        return this.get('initTimestamp');
    }
    getUsePerPlacementLoad() {
        return this.get('usePerPlacementLoad');
    }
    isReinitialized() {
        return this.get('reinitialized');
    }
    isMonetizationInUse() {
        return this.get('monetizationInUse');
    }
    setMonetizationInUse(using) {
        this.set('monetizationInUse', using);
    }
    getDTO() {
        return {
            'gameId': this.getGameId(),
            'testMode': this.getTestMode(),
            'bundleId': this.getApplicationName(),
            'bundleVersion': this.getApplicationVersion(),
            'sdkVersion': this.getSdkVersion(),
            'sdkVersionName': this.getSdkVersionName(),
            'encrypted': !this.isDebuggable(),
            'configUrl': this.getConfigUrl(),
            'webviewUrl': this.getWebviewUrl(),
            'webviewHash': this.getWebviewHash(),
            'webviewVersion': this.getWebviewVersion(),
            'initTimestamp': this.getInitTimestamp(),
            'reinitialized': this.isReinitialized(),
            'monetizationInUse': this.isMonetizationInUse(),
            'usePerPlacementLoad': this.getUsePerPlacementLoad()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50SW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL01vZGVscy9DbGllbnRJbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQXFCMUMsTUFBTSxPQUFPLFVBQVcsU0FBUSxLQUFrQjtJQUU5QyxZQUFZLElBQW9CO1FBQzVCLEtBQUssQ0FBQyxZQUFZLEVBQUU7WUFDaEIsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ2xCLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNyQixlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDM0Isa0JBQWtCLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDOUIsVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3RCLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUMxQixVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDdkIsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3JCLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN0QixXQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDO1lBQy9CLGNBQWMsRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUM7WUFDbEMsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3pCLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUMxQixpQkFBaUIsRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUM5QixtQkFBbUIsRUFBRSxDQUFDLFNBQVMsQ0FBQztTQUNuQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM5QixJ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