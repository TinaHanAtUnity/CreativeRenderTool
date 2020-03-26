import 'mocha';
import * as sinon from 'sinon';
import { IPrivacySDKViewParameters, PrivacySDKView } from 'Ads/Views/Privacy/PrivacySDKView';
import { ConsentPage } from 'Ads/Views/Privacy/Privacy';
import { Platform } from 'Core/Constants/Platform';
import { LegalFramework, UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Core } from 'Core/Core';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { PrivacyMethod } from 'Privacy/Privacy';
import { IPrivacySettings } from 'Privacy/IPrivacySettings';

import PrivacySDKFlow from 'json/privacy/PrivacySDKFlow.json';
import PrivacyWebUI from 'html/PrivacyWebUI.html';

describe('PrivacySDKViewTest', () => {
    let params: IPrivacySDKViewParameters;
    let privacyView: PrivacySDKView;
    const config = new PrivacyConfig(PrivacySDKFlow,
        {
            ads: false,
            external: false,
            gameExp: false,
            agreedOverAgeLimit: false,
            agreementMethod: ''
        },
        {
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
        },
        PrivacyWebUI);

    beforeEach(() => {
        const core = <Core>sinon.createStubInstance(Core);
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
                onPrivacyCompleted: (userSettings: IPrivacySettings): void => {
                    // TODO: Empty
                },
                onPrivacyOpenUrl: (url: string): void => {
                    // TODO: Empty
                },
                onPrivacyMetric: (data: string): void => {
                    // TODO: Empty
                },
                onPrivacyFetch: (url: string, data: { [key: string]: unknown }): void => {
                    // TODO: Empty
                },
                onPrivacyViewError: (event: string | Event) => {
                    // TODO: Empty
                }
            });

            privacyView.setPrivacyConfig(config);
            privacyView.render();
            document.body.appendChild(privacyView.container());
        });
    });
});
