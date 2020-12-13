import { Platform } from 'Core/Constants/Platform';
import { Model } from 'Core/Models/Model';
const SdkAndroidClassMap = {
    // 'com.google.ads.mediation.admob.AdMobAdapter': 'AdMob',
    // 'com.mopub.common.MoPub': 'MoPub',
    // 'com.ironsource.mediationsdk.IronSource': 'IronSource',
    // 'com.fyber.FairBid': 'Fyber',
    // 'com.safedk.android.SafeDK': 'SafeDK',
    'com.unity3d.player.UnityPlayer': 'UnityEngine'
};
const SdkiOSClassMap = {
    // 'GADMobileAds': 'AdMob',
    // 'MoPub': 'MoPub',
    // 'IronSource': 'IronSource',
    // 'FyberSDK': 'Fyber',
    // 'SafeDK': 'SafeDK',
    'UnityAppController': 'UnityEngine'
};
export class SdkDetectionInfo extends Model {
    constructor(platform, core) {
        super('SdkDetectionInfo', SdkDetectionInfo.Schema);
        this._platform = platform;
        this._core = core;
    }
    detectSdks() {
        const promises = [];
        let classNames;
        if (this._platform === Platform.ANDROID) {
            classNames = Object.keys(SdkAndroidClassMap);
        }
        else if (this._platform === Platform.IOS) {
            classNames = Object.keys(SdkiOSClassMap);
        }
        else {
            classNames = [];
        }
        promises.push(this._core.ClassDetection.areClassesPresent(classNames)
            .then(results => {
            results.forEach(r => {
                let name;
                if (this._platform === Platform.ANDROID) {
                    name = SdkAndroidClassMap[r.class];
                }
                else {
                    name = SdkiOSClassMap[r.class];
                }
                this.set(name, r.found);
            });
        }).catch(err => this.handleDeviceInfoError(err)));
        return Promise.all(promises);
    }
    getSdkDetectionJSON() {
        return this.toJSON();
    }
    handleDeviceInfoError(error) {
        this._core.Sdk.logWarning(JSON.stringify(error));
    }
    isMadeWithUnity() {
        return this.get('UnityEngine') === true;
    }
    getDTO() {
        return {
            // 'AdMob': this.get('AdMob'),
            // 'MoPub': this.get('MoPub'),
            // 'IronSource': this.get('IronSource'),
            // 'Fyber': this.get('Fyber'),
            // 'SafeDK': this.get('SafeDK'),
            'UnityEngine': this.get('UnityEngine')
        };
    }
}
SdkDetectionInfo.Schema = {
    // AdMob: ['boolean', 'undefined'],
    // MoPub: ['boolean', 'undefined'],
    // IronSource: ['boolean', 'undefined'],
    // Fyber: ['boolean', 'undefined'],
    // SafeDK: ['boolean', 'undefined'],
    UnityEngine: ['boolean', 'undefined']
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2RrRGV0ZWN0aW9uSW5mby5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL01vZGVscy9TZGtEZXRlY3Rpb25JbmZvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQVcsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFlbkQsTUFBTSxrQkFBa0IsR0FBVTtJQUM5QiwwREFBMEQ7SUFDMUQscUNBQXFDO0lBQ3JDLDBEQUEwRDtJQUMxRCxnQ0FBZ0M7SUFDaEMseUNBQXlDO0lBQ3pDLGdDQUFnQyxFQUFFLGFBQWE7Q0FDbEQsQ0FBQztBQUVGLE1BQU0sY0FBYyxHQUFVO0lBQzFCLDJCQUEyQjtJQUMzQixvQkFBb0I7SUFDcEIsOEJBQThCO0lBQzlCLHVCQUF1QjtJQUN2QixzQkFBc0I7SUFDdEIsb0JBQW9CLEVBQUUsYUFBYTtDQUN0QyxDQUFDO0FBRUYsTUFBTSxPQUFPLGdCQUFpQixTQUFRLEtBQXdCO0lBYzFELFlBQVksUUFBa0IsRUFBRSxJQUFjO1FBQzFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRU0sVUFBVTtRQUNiLE1BQU0sUUFBUSxHQUF1QixFQUFFLENBQUM7UUFDeEMsSUFBSSxVQUFvQixDQUFDO1FBQ3pCLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ3JDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7U0FDaEQ7YUFBTSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN4QyxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUM1QzthQUFNO1lBQ0gsVUFBVSxHQUFHLEVBQUUsQ0FBQztTQUNuQjtRQUNELFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDO2FBQ2hFLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNaLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ2hCLElBQUksSUFBNkIsQ0FBQztnQkFDbEMsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7b0JBQ3JDLElBQUksR0FBNEIsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUMvRDtxQkFBTTtvQkFDSCxJQUFJLEdBQTRCLGNBQWMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzNEO2dCQUNELElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1QixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEQsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTSxtQkFBbUI7UUFDdkIsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVTLHFCQUFxQixDQUFDLEtBQWM7UUFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRU0sZUFBZTtRQUNsQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssSUFBSSxDQUFDO0lBQzVDLENBQUM7SUFFTSxNQUFNO1FBQ1QsT0FBTztZQUNILDhCQUE4QjtZQUM5Qiw4QkFBOEI7WUFDOUIsd0NBQXdDO1lBQ3hDLDhCQUE4QjtZQUM5QixnQ0FBZ0M7WUFDaEMsYUFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO1NBQ3pDLENBQUM7SUFDTixDQUFDOztBQWpFYSx1QkFBTSxHQUErQjtJQUMvQyxtQ0FBbUM7SUFDbkMsbUNBQW1DO0lBQ25DLHdDQUF3QztJQUN4QyxtQ0FBbUM7SUFDbkMsb0NBQW9DO0lBQ3BDLFdBQVcsRUFBRSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7Q0FDeEMsQ0FBQyJ9