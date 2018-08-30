import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

import { Platform } from 'Constants/Platform';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { FocusManager } from 'Managers/FocusManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { Request } from 'Utilities/Request';
import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
import { DisplayInterstitialAdUnit, IDisplayInterstitialAdUnitParameters } from 'AdUnits/DisplayInterstitialAdUnit';
import { Activity } from 'AdUnits/Containers/Activity';
import { DisplayInterstitialEventHandler } from 'EventHandlers/DisplayInterstitialEventHandler';
import { GdprManager } from 'Managers/GdprManager';
import { Privacy } from 'Views/Privacy';
import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';

describe('DisplayInterstitialEventHandler', () => {
    let view: DisplayInterstitial;
    let nativeBridge: NativeBridge;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign;
    let sandbox: sinon.SinonSandbox;
    let displayInterstitialAdUnitParameters: IDisplayInterstitialAdUnitParameters;
    let displayInterstitialAdUnit: DisplayInterstitialAdUnit;
    let displayInterstitialEventHandler: DisplayInterstitialEventHandler;
    let operativeEventManager: OperativeEventManager;

    describe('on Display Interstitial Markup Campaign', () => {
        eventHandlerTests();
    });

    function eventHandlerTests() {
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

            campaign = TestFixtures.getDisplayInterstitialCampaign();

            sandbox.stub(nativeBridge, 'getApiLevel').returns(16);

            const container = new Activity(nativeBridge, TestFixtures.getAndroidDeviceInfo());
            const focusManager = sinon.createStubInstance(FocusManager);
            const request = sinon.createStubInstance(Request);
            const clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            const deviceInfo = TestFixtures.getAndroidDeviceInfo();
            const thirdPartyEventManager = sinon.createStubInstance(ThirdPartyEventManager);
            operativeEventManager = sinon.createStubInstance(OperativeEventManager);
            const gdprManager = sinon.createStubInstance(GdprManager);
            const configuration = TestFixtures.getConfiguration();
            const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());

            view = new DisplayInterstitial(nativeBridge, placement, campaign, privacy, false);

            displayInterstitialAdUnitParameters = {
                forceOrientation: Orientation.LANDSCAPE,
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
                view: view,
                gdprManager: gdprManager,
                programmaticTrackingService: programmaticTrackingService
            };

            displayInterstitialAdUnit = new DisplayInterstitialAdUnit(nativeBridge, displayInterstitialAdUnitParameters);
            displayInterstitialEventHandler = new DisplayInterstitialEventHandler(nativeBridge, displayInterstitialAdUnit, displayInterstitialAdUnitParameters);
            view.addEventHandler(displayInterstitialEventHandler);
            view.render();
            return view.show();
        });

        afterEach(() => {
            view.hide();
            sandbox.restore();
        });

        // TODO: Not sure about this test...
        /*
        it('should redirect when the redirect message is sent', () => {
            const spy = sinon.spy();

            displayInterstitialEventHandler.onDisplayInterstitialClick = spy;
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
        */

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
    }
});
