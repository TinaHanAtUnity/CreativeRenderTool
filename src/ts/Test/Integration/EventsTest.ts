import 'mocha';

import { Platform } from 'Constants/Platform';
import { UnityAds } from 'Native/Backend/UnityAds';
import { IUnityAdsListener } from 'Native/Backend/IUnityAdsListener';
import { UnityAdsError } from 'Constants/UnityAdsError';
import { FinishState } from 'Constants/FinishState';

describe('IntegrationTest', () => {

    it('should handle happy path on Android', function(this: Mocha.ITestDefinition, done: MochaDone) {
        this.timeout(10000);
        let readyCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if(++readyCount === 2) {
                    done();
                }
            },
            onUnityAdsStart: (placement: string) => {
                return;
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                return;
            },
            onUnityAdsError: (error: UnityAdsError, message: string) => {
                return;
            }
        };
        UnityAds.initialize(Platform.ANDROID, '14851', listener, true);
    });

    it('should handle happy path on iOS', function(this: Mocha.ITestDefinition, done: MochaDone) {
        this.timeout(10000);
        let readyCount = 0;
        const listener: IUnityAdsListener = {
            onUnityAdsReady: (placement: string) => {
                if(++readyCount === 2) {
                    done();
                }
            },
            onUnityAdsStart: (placement: string) => {
                return;
            },
            onUnityAdsFinish: (placement: string, state: FinishState) => {
                return;
            },
            onUnityAdsError: (error: UnityAdsError, message: string) => {
                return;
            }
        };
        UnityAds.initialize(Platform.IOS, '14850', listener, true);
    });

});
