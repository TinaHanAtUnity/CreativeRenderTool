import 'mocha';
import * as sinon from 'sinon';
import { PrivacySDKView } from 'Ads/Views/Privacy/PrivacySDKView';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { AgeGateChoice, LegalFramework, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Core } from 'Core/Core';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { PrivacyMethod } from 'Privacy/Privacy';
import PrivacySDKFlow from 'json/privacy/PrivacySDKFlow.json';
import PrivacyWebUI from 'html/PrivacyWebUI.html';
describe('PrivacySDKViewTest', () => {
    let params;
    let privacyView;
    const config = new PrivacyConfig({
        buildOsVersion: '10.0.3',
        platform: Platform.ANDROID,
        userLocale: 'en_EN',
        country: 'EN',
        subCountry: 'EN',
        privacyMethod: PrivacyMethod.UNITY_CONSENT,
        ageGateLimit: 13,
        legalFramework: LegalFramework.GDPR,
        isCoppa: false,
        apiLevel: 25,
        userSummary: {
            deviceModel: '-',
            country: '-',
            gamePlaysThisWeek: '-',
            adsSeenInGameThisWeek: '-',
            installsFromAds: '-'
        }
    }, {
        ads: false,
        external: false,
        gameExp: false,
        ageGateChoice: AgeGateChoice.NO,
        agreementMethod: ''
    }, '', PrivacyWebUI, PrivacySDKFlow, {});
    beforeEach(() => {
        const core = sinon.createStubInstance(Core);
        params = {
            ageGateLimit: 13,
            apiLevel: 25,
            consentABTest: false,
            landingPage: ConsentPage.HOMEPAGE,
            platform: Platform.ANDROID,
            language: 'en_EN',
            osVersion: '10.0.3',
            privacyManager: sinon.createStubInstance(UserPrivacyManager),
            core: core.Api
        };
    });
    describe('Creation', () => {
        it('Constructed properly', () => {
            privacyView = new PrivacySDKView(params);
        });
        it('Render can be called', () => {
            privacyView.setPrivacyConfig(config);
            privacyView.render();
        });
        it('onPrivacyReady is called', (done) => {
            privacyView.addEventHandler({
                onPrivacyReady: () => {
                    document.body.removeChild(privacyView.container());
                    done();
                },
                onPrivacyCompleted: (privacyParams) => {
                    // TODO: Empty
                },
                onPrivacyOpenUrl: (url) => {
                    // TODO: Empty
                },
                onPrivacyMetric: (data) => {
                    // TODO: Empty
                },
                onPrivacyFetchUrl: (data) => {
                    // TODO: Empty
                },
                onPrivacyViewError: (event) => {
                    // TODO: Empty
                }
            });
            privacyView.setPrivacyConfig(config);
            privacyView.render();
            document.body.appendChild(privacyView.container());
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVNES1ZpZXdUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ByaXZhY3kvUHJpdmFjeVNES1ZpZXdUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUE2QixjQUFjLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUM3RixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDcEcsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNqQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRWhELE9BQU8sY0FBYyxNQUFNLGtDQUFrQyxDQUFDO0FBQzlELE9BQU8sWUFBWSxNQUFNLHdCQUF3QixDQUFDO0FBRWxELFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7SUFDaEMsSUFBSSxNQUFpQyxDQUFDO0lBQ3RDLElBQUksV0FBMkIsQ0FBQztJQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FDNUI7UUFDRSxjQUFjLEVBQUUsUUFBUTtRQUN4QixRQUFRLEVBQUUsUUFBUSxDQUFDLE9BQU87UUFDMUIsVUFBVSxFQUFFLE9BQU87UUFDbkIsT0FBTyxFQUFFLElBQUk7UUFDYixVQUFVLEVBQUUsSUFBSTtRQUNoQixhQUFhLEVBQUUsYUFBYSxDQUFDLGFBQWE7UUFDMUMsWUFBWSxFQUFFLEVBQUU7UUFDaEIsY0FBYyxFQUFFLGNBQWMsQ0FB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