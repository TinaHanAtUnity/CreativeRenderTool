import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { DisplayInterstitial } from "Views/DisplayInterstitial";
import { NativeBridge } from "Native/NativeBridge";
import { Placement } from "Models/Placement";
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from "Models/Campaigns/DisplayInterstitialCampaign";

import { Platform } from "Constants/Platform";
import { TestFixtures } from "Test/Unit/TestHelpers/TestFixtures";
import { FocusManager } from 'Managers/FocusManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Request } from 'Utilities/Request';
import { ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from 'AdUnits/DisplayInterstitialAdUnit';
import { Activity } from 'AdUnits/Containers/Activity';
import { DisplayInterstitialEventHandler } from 'EventHandlers/DisplayInterstitialEventHandler';

describe('DisplayInterstitialEventHandler', () => {
    let view: DisplayInterstitial;
    let nativeBridge: NativeBridge;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign<IDisplayInterstitialCampaign>;
    let sandbox: sinon.SinonSandbox;
    let displayInterstitialAdUnitParameters: IDisplayInterstitialAdUnitParameters;
    let displayInterstitialAdUnit: DisplayInterstitialAdUnit;
    let displayInterstitialEventHandler: DisplayInterstitialEventHandler;
    let operativeEventManager: OperativeEventManager;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        nativeBridge = TestFixtures.getNativeBridge();
        placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });

        // write tests to cover DisplayInterstitialMarkupUrlCampaign - programmatic/static-interstitial-url
        campaign = TestFixtures.getDisplayInterstitialCampaign();
        view = new DisplayInterstitial(nativeBridge, placement, campaign);

        sandbox.stub(nativeBridge, 'getApiLevel').returns(16);

        const container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        const focusManager = sinon.createStubInstance(FocusManager);
        const request = sinon.createStubInstance(Request);
        const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        const deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        const thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
        operativeEventManager = sinon.createStubInstance(OperativeEventManager);

        displayInterstitialAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: placement,
            campaign: campaign,
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            view: view
        };

        displayInterstitialAdUnit = new DisplayInterstitialAdUnit(nativeBridge, displayInterstitialAdUnitParameters);
        displayInterstitialEventHandler = new DisplayInterstitialEventHandler(nativeBridge, displayInterstitialAdUnit, displayInterstitialAdUnitParameters);
        view.addEventHandler(displayInterstitialEventHandler);
    });

    afterEach(() => {
        view.hide();
        sandbox.restore();
    });

    it('should redirect when the redirect message is sent', () => {

        const spy = sinon.spy();

        displayInterstitialEventHandler.onDisplayInterstitialClick = spy;

        view.render();
        view.show();

        window.postMessage({ type: 'redirect', href: 'https://unity3d.com' }, '*');

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    assert.isTrue(spy.calledWith('https://unity3d.com'));
                    view.hide();
                    resolve();
                } catch (e) {
                    view.hide();
                    reject(e);
                }
            }, 100);
        });
    });

    // Disabled because of missing .click() support on Android < 4.4
    xit('should redirect when the click catcher is clicked', () => {
        campaign.set('clickThroughUrl', 'https://unity3d.com');

        const spy = sinon.spy();
        displayInterstitialEventHandler.onDisplayInterstitialClick = spy;

        view.render();
        view.show();

        (<HTMLElement>view.container().querySelector('.iframe-click-catcher')!).click();

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    assert.isTrue(spy.calledWith('https://unity3d.com'));
                    view.hide();
                    resolve();
                } catch (e) {
                    view.hide();
                    reject(e);
                }
            }, 100);
        });
    });

    describe('on click', () => {
        it('should open an intent on Android', () => {
            sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sandbox.stub(nativeBridge.Intent, 'launch');
            displayInterstitialEventHandler.onDisplayInterstitialClick('http://google.com');

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                'action': 'android.intent.action.VIEW',
                'uri': 'http://google.com'
            });
        });

        it('should open the url on iOS', () => {
            sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            sandbox.stub(nativeBridge.UrlScheme, 'open');
            displayInterstitialEventHandler.onDisplayInterstitialClick('http://google.com');

            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://google.com');
        });

        it('should send a tracking event', () => {
            displayInterstitialEventHandler.onDisplayInterstitialClick('http://google.com');
            sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendClick);
        });

        it('should not redirect if the protocol is whitelisted', () => {
            sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sandbox.stub(nativeBridge.Intent, 'launch');
            displayInterstitialEventHandler.onDisplayInterstitialClick('tel://127.0.0.1:5000');

            sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
        });
    });

    describe('on skip', () => {
        it('should hide the adUnit', () => {
            sandbox.stub(displayInterstitialAdUnit, 'hide');
            displayInterstitialEventHandler.onDisplayInterstitialSkip();
            sinon.assert.called(<sinon.SinonSpy>displayInterstitialAdUnit.hide);
        });
    });

    describe('on close', () => {
        it('should hide the adUnit', () => {
            sandbox.stub(displayInterstitialAdUnit, 'hide');
            displayInterstitialEventHandler.onDisplayInterstitialClose();

            sinon.assert.called(<sinon.SinonSpy>displayInterstitialAdUnit.hide);
        });
        it('should send the view diagnostic event', () => {
            displayInterstitialEventHandler.onDisplayInterstitialClose();
            sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendView);
        });
        it('should send the third quartile diagnostic event', () => {
            displayInterstitialEventHandler.onDisplayInterstitialClose();
            sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile);
        });
    });

});
