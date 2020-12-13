import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { Backend } from 'Backend/Backend';
import { UnityAds } from 'Backend/UnityAds';
import { RequestManager, AuctionProtocol } from 'Core/Managers/RequestManager';
import { Platform } from 'Core/Constants/Platform';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import 'mocha';
import { assert } from 'chai';
import { Observable1, Observable2, Observable3 } from 'Core/Utilities/Observable';
import { FinishState } from 'Core/Constants/FinishState';
import { fakeARUtils } from 'TestHelpers/FakeARUtils';
import * as sinon from 'sinon';
class TestListener {
    constructor() {
        this.onReady = new Observable1();
        this.onStart = new Observable1();
        this.onFinish = new Observable2();
        this.onError = new Observable2();
        this.onClick = new Observable1();
        this.onPlacementStateChanged = new Observable3();
    }
    onUnityAdsReady(placement) {
        this.onReady.trigger(placement);
    }
    onUnityAdsStart(placement) {
        this.onStart.trigger(placement);
    }
    onUnityAdsFinish(placement, state) {
        this.onFinish.trigger(placement, state);
    }
    onUnityAdsError(error, message) {
        this.onError.trigger(error, message);
    }
    onUnityAdsClick(placement) {
        this.onClick.trigger(placement);
    }
    onUnityAdsPlacementStateChanged(placement, oldState, newState) {
        this.onPlacementStateChanged.trigger(placement, newState, oldState);
    }
}
describe('AndroidVastTest', () => {
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
        fakeARUtils(sandbox);
    });
    afterEach(() => {
        sandbox.restore();
    });
    let listener;
    let readyPlacement;
    before(() => {
        return new Promise((resolve) => {
            listener = new TestListener();
            const readyObserver = listener.onReady.subscribe((placement) => {
                readyPlacement = placement;
                listener.onReady.unsubscribe(readyObserver);
                resolve();
            });
            UnityAds.setBackend(new Backend(Platform.ANDROID));
            UnityAds.getBackend().Api.Request.setPassthrough(true);
            UnityAds.getBackend().Api.DeviceInfo.setAdvertisingTrackingId('78db88cb-2026-4423-bfe0-07e9ed2701c3');
            UnityAds.getBackend().Api.DeviceInfo.setManufacturer('LGE');
            UnityAds.getBackend().Api.DeviceInfo.setModel('Nexus 5');
            UnityAds.getBackend().Api.DeviceInfo.setOsVersion('6.0.1');
            UnityAds.getBackend().Api.DeviceInfo.setScreenWidth(1080);
            UnityAds.getBackend().Api.DeviceInfo.setScreenHeight(1776);
            UnityAds.getBackend().Api.DeviceInfo.setTimeZone('GMT+02:00');
            ConfigManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
            CampaignManager.setBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
            ProgrammaticOperativeEventManager.setTestBaseUrl('https://fake-ads-backend.unityads.unity3d.com');
            RequestManager.setTestAuctionProtocol(AuctionProtocol.V4);
            UnityAds.initialize(Platform.ANDROID, '333', listener, true);
        });
    });
    it('should handle the happy path for initialization on Android', () => {
        assert.isNotFalse(readyPlacement);
    });
    const clickElementWhenPresent = (sel) => {
        return new Promise((resolve) => {
            const checkEl = () => {
                const el = document.querySelector(sel);
                if (el) {
                    el.click();
                    resolve();
                }
                else {
                    window.setTimeout(checkEl, 20);
                }
            };
            checkEl();
        });
    };
    describe('After showing a vast ad', () => {
        let finishState;
        before(function () {
            this.timeout(35000);
            const adFinished = new Promise((resolve) => {
                const finishListener = listener.onFinish.subscribe((placement, state) => {
                    listener.onFinish.unsubscribe(finishListener);
                    resolve(state);
                });
            });
            return new Promise((resolve, reject) => {
                adFinished.then((state) => {
                    try {
                        finishState = state;
                        resolve();
                    }
                    catch (e) {
                        reject(e);
                    }
                });
                listener.onStart.subscribe((placement) => {
                    clickElementWhenPresent('.call-button');
                });
                if (UnityAds.isReady('video')) {
                    UnityAds.show('video');
                }
            });
        });
        it('should not send impression event more than once', () => {
            const log = UnityAds.getBackend().Api.Request.getLog('GET');
            const impressions = log.filter((s) => s.indexOf('event=vast-tracking-url') > -1);
            assert.equal(impressions.length, 1);
        });
        it('should have finished with COMPLETED', () => {
            assert.equal(finishState, FinishState[FinishState.COMPLETED], 'Finish stats were not equal');
        });
        it('should not send click event more than once', () => {
            const log = UnityAds.getBackend().Api.Request.getLog('GET');
            const clicks = log.filter((s) => s.indexOf('event=tracking_click') > -1);
            assert.equal(clicks.length, 1);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5kcm9pZFZhc3RUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9JbnRlZ3JhdGlvbi9BbmRyb2lkL0FuZHJvaWRWYXN0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGlDQUFpQyxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDbkcsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxPQUFPLENBQUM7QUFFZixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2xGLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDdEQsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFL0IsTUFBTSxZQUFZO0lBQWxCO1FBRW9CLFlBQU8sR0FBd0IsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUN6RCxZQUFPLEdBQXdCLElBQUksV0FBVyxFQUFVLENBQUM7UUFDekQsYUFBUSxHQUFnQyxJQUFJLFdBQVcsRUFBa0IsQ0FBQztRQUMxRSxZQUFPLEdBQWdDLElBQUksV0FBVyxFQUFrQixDQUFDO1FBQ3pFLFlBQU8sR0FBd0IsSUFBSSxXQUFXLEVBQVUsQ0FBQztRQUN6RCw0QkFBdUIsR0FBd0MsSUFBSSxXQUFXLEVBQTBCLENBQUM7SUF3QjdILENBQUM7SUF0QlUsZUFBZSxDQUFDLFNBQWlCO1FBQ3BDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFTSxlQUFlLENBQUMsU0FBaUI7UUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUNNLGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsS0FBYTtRQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLGVBQWUsQ0FBQyxLQUFhLEVBQUUsT0FBZTtRQUNqRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLGVBQWUsQ0FBQyxTQUFpQjtRQUNwQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRU0sK0JBQStCLENBQUMsU0FBaUIsRUFBRSxRQUFnQixFQUFFLFFBQWdCO1FBQ3hGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4RSxDQUFDO0NBQ0o7QUFFRCxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO0lBQzdCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUV0QyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUNYLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUVILElBQUksUUFBc0IsQ0FBQztJQUMzQixJQUFJLGNBQXNCLENBQUM7SUFFM0IsTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUNSLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtZQUMzQixRQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztZQUM5QixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFO2dCQUMzRCxjQUFjLEdBQUcsU0FBUyxDQUFDO2dCQUMzQixRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDNUMsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztZQUVILFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbkQsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXZELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDdEcsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN6RCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0QsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzFELFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7WUFFOUQsYUFBYSxDQUFDLGNBQWMsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO1lBQzlFLGVBQWUsQ0FBQyxVQUFVLENBQUMsK0NBQStDLENBQUMsQ0FBQztZQUM1RSxpQ0FBaUMsQ0FBQyxjQUFjLENBQUMsK0NBQStDLENBQUMsQ0FBQztZQUNsRyxjQUFjLENBQUMsc0JBQXNCLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBRTFELFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pFLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsNERBQTRELEVBQUUsR0FBRyxFQUFFO1FBQ2xFLE1BQU0sQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUM7SUFDdEMsQ0FBQyxDQUFDLENBQUM7SUFFSCxNQUFNLHVCQUF1QixHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUU7UUFDNUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1lBQzNCLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtnQkFDakIsTUFBTSxFQUFFLEdBQXNCLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFELElBQUksRUFBRSxFQUFFO29CQUNKLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDWCxPQUFPLEVBQUUsQ0FBQztpQkFDYjtxQkFBTTtvQkFDSCxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDbEM7WUFDTCxDQUFDLENBQUM7WUFDRixPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDO0lBRUYsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtRQUNyQyxJQUFJLFdBQW1CLENBQUM7UUFFeEIsTUFBTSxDQUFDO1lBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwQixNQUFNLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUMvQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRTtvQkFDcEUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQzlDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7Z0JBQ25DLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFhLEVBQUUsRUFBRTtvQkFDOUIsSUFBSTt3QkFDQSxXQUFXLEdBQUcsS0FBSyxDQUFDO3dCQUNwQixPQUFPLEVBQUUsQ0FBQztxQkFDYjtvQkFBQyxPQUFPLENBQUMsRUFBRTt3QkFDUixNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2I7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtvQkFDckMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLENBQUM7Z0JBQzVDLENBQUMsQ0FBQyxDQUFDO2dCQUVILElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDM0IsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDMUI7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFFLGlEQUFpRCxFQUFFLEdBQUcsRUFBRTtZQUN4RCxNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUQsTUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakYsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtZQUMzQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLDZCQUE2QixDQUFDLENBQUM7UUFDakcsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsNENBQTRDLEVBQUUsR0FBRyxFQUFFO1lBQ2xELE1BQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUM1RCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUMsQ0FBQyxDQUFDIn0=