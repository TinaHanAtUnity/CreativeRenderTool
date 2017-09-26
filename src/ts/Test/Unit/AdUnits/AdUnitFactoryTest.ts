import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { AdUnitFactory } from 'AdUnits/AdUnitFactory';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { Platform } from 'Constants/Platform';
import { Configuration } from 'Models/Configuration';
import { DeviceInfo } from 'Models/DeviceInfo';
import { SessionManager } from 'Managers/SessionManager';
import { VastVideoEventHandlers } from 'EventHandlers/VastVideoEventHandlers';
import { PerformanceVideoEventHandlers } from 'EventHandlers/PerformanceVideoEventHandlers';
import { NativeBridge } from 'Native/NativeBridge';

import { VastAdUnit } from 'AdUnits/VastAdUnit';
import { PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { Activity } from 'AdUnits/Containers/Activity';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { MRAIDAdUnit } from 'AdUnits/MRAIDAdUnit';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { FinishState } from 'Constants/FinishState';
import { FocusManager } from 'Managers/FocusManager';

import { DisplayInterstitialAdUnit } from 'AdUnits/DisplayInterstitialAdUnit';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';

describe('AdUnitFactoryTest', () => {

    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let focusManager: FocusManager;
    let container: AdUnitContainer;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let sessionManager: SessionManager;
    let operativeEventManager: OperativeEventManager;
    let config: Configuration;
    let metaDataManager: MetaDataManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        sandbox.stub(container, 'close').returns(Promise.resolve());
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        config = new Configuration(JSON.parse(ConfigurationJson));
        deviceInfo = <DeviceInfo>{getLanguage: () => 'en'};
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        sessionManager = new SessionManager(nativeBridge);
        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());
        sandbox.spy(thirdPartyEventManager, 'thirdPartyEvent');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Performance AdUnit', () => {
        it('should call onVideoError on video controller error ', () => {
            sandbox.stub(PerformanceVideoEventHandlers, 'onVideoError').returns(null);
            const videoAdUnit = <PerformanceAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.LANDSCAPE, container, deviceInfo, clientInfo, thirdPartyEventManager, operativeEventManager, TestFixtures.getPlacement(), TestFixtures.getCampaign(), config, request, {});
            videoAdUnit.onError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>PerformanceVideoEventHandlers.onVideoError);
        });
    });

    describe('VAST AdUnit', () => {
        it('should call onVideoError on video controller error', () => {
            sandbox.stub(VastVideoEventHandlers, 'onVideoError').returns(null);
            const vast = new Vast([], []);
            sandbox.stub(vast, 'getVideoUrl').returns('http://www.google.fi');
            const vastCampaign = new VastCampaign(vast, 'campaignId', TestFixtures.getSession(), 'gamerId', 1);
            const videoAdUnit = <VastAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.NONE, container, deviceInfo, clientInfo, thirdPartyEventManager, operativeEventManager, TestFixtures.getPlacement(), vastCampaign, config, request, {});
            videoAdUnit.onError.trigger();

            sinon.assert.calledOnce(<sinon.SinonSpy>VastVideoEventHandlers.onVideoError);
        });
    });

    describe('MRAID AdUnit', () => {
        let adUnit: MRAIDAdUnit;
        let testThirdPartyEventManager: any;
        let campaign: MRAIDCampaign;

        beforeEach(() => {
            testThirdPartyEventManager = {
                thirdPartyEvent: sinon.stub().returns(Promise.resolve())
            };

            campaign = TestFixtures.getProgrammaticMRAIDCampaign();
            const resourceUrl = campaign.getResourceUrl();
            if(resourceUrl) {
                resourceUrl.setFileId('1234');
            }

            adUnit = <MRAIDAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.NONE, container, deviceInfo, clientInfo, thirdPartyEventManager, operativeEventManager, TestFixtures.getPlacement(), campaign, config, request, {});
        });

        describe('on hide', () => {
            it('should trigger onClose when hide is called', (done) => {
                adUnit.setShowing(true);
                adUnit.onClose.subscribe(() => {
                    assert.equal(adUnit.isShowing(), false);
                    done();
                });

                adUnit.hide();
            });

            it('should trigger onFinish when hide is called', (done) => {
                adUnit.setShowing(true);
                adUnit.onFinish.subscribe(() => {
                    done();
                });

                adUnit.hide();
            });

            it('should call trackers on on finish state completed', () => {
                adUnit.setShowing(true);
                adUnit.setFinishState(FinishState.COMPLETED);

                adUnit.hide();

                sinon.assert.calledOnce(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile);
                sinon.assert.calledOnce(<sinon.SinonSpy>operativeEventManager.sendView);
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.thirdPartyEvent, 'mraid complete', '12345', 'http://test.complete.com/complete1');
            });

            it('should call sendSkip on finish state skipped', () => {
                adUnit.setShowing(true);
                adUnit.setFinishState(FinishState.SKIPPED);

                adUnit.hide();

                sinon.assert.calledOnce(<sinon.SinonSpy>operativeEventManager.sendSkip);
            });
        });

        describe('on show', () => {
            it('should trigger onStart', (done) => {
                adUnit.onStart.subscribe(() => {
                    adUnit.hide();
                    done();
                });

                adUnit.show();
            });

            it('should call sendStart', () => {
                adUnit.show();
                sinon.assert.calledOnce(<sinon.SinonSpy>operativeEventManager.sendStart);
                adUnit.hide();
            });

            it('should send impressions', () => {
                adUnit.show();
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.thirdPartyEvent, 'mraid impression', '12345', 'http://test.impression.com/blah1');
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.thirdPartyEvent, 'mraid impression', '12345', 'http://test.impression.com/blah2');
                adUnit.hide();
            });

            it('should replace macros in the postback impression url', () => {
                adUnit.show();
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.thirdPartyEvent, 'mraid impression', '12345', 'http://test.impression.com/fooId/blah?sdkVersion=2000');
                adUnit.hide();
            });
        });

        it('should call click tracker', () => {
            adUnit.sendClick();
            sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.thirdPartyEvent, 'mraid click', '12345', 'http://test.complete.com/click1');
        });
    });

    describe('DisplayInterstitialAdUnit', () => {
        let adUnit: DisplayInterstitialAdUnit;
        let campaign: DisplayInterstitialCampaign;

        beforeEach(() => {
            campaign = TestFixtures.getDisplayInterstitialCampaign();
            adUnit = <DisplayInterstitialAdUnit>AdUnitFactory.createAdUnit(nativeBridge, ForceOrientation.NONE, container, deviceInfo, clientInfo, thirdPartyEventManager, operativeEventManager, TestFixtures.getPlacement(), campaign, config, request, {});
        });

        describe('on click', () => {
            it('should open an intent on Android', () => {
                sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                sandbox.stub(nativeBridge.Intent, 'launch');
                adUnit.onRedirect.trigger('http://google.com');

                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'http://google.com'
                });
            });

            it('should open the url on iOS', () => {
                sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
                sandbox.stub(nativeBridge.UrlScheme, 'open');
                adUnit.onRedirect.trigger('http://google.com');

                sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.UrlScheme.open, 'http://google.com');
            });

            it('should send a tracking event', () => {
                sandbox.stub(operativeEventManager, 'sendClick');

                adUnit.onRedirect.trigger('http://google.com');

                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendClick);
            });

            it('should not redirect if the protocol is whitelisted', () => {
                sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
                sandbox.stub(nativeBridge.Intent, 'launch');
                adUnit.onRedirect.trigger('tel://127.0.0.1:5000');

                sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Intent.launch);
            });
        });

        describe('on close', () => {
            it('should hide the adUnit', () => {
                sandbox.stub(adUnit, 'hide');

                adUnit.onClose.trigger();

                sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
            });
            it('should send the view diagnostic event', () => {
                adUnit.onClose.trigger();
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendView);
            });
            it('should send the third quartile diagnostic event', () => {
                adUnit.onClose.trigger();
                sinon.assert.called(<sinon.SinonSpy>operativeEventManager.sendThirdQuartile);
            });
        });

        describe('on skip', () => {
            it('should hide the adUnit', () => {
                sandbox.stub(adUnit, 'hide');

                adUnit.onSkip.trigger();

                sinon.assert.called(<sinon.SinonSpy>adUnit.hide);
            });
        });

        describe('on start', () => {
            let testThirdPartyEventManager: any;

            beforeEach(() => {
                testThirdPartyEventManager = {
                    thirdPartyEvent: sinon.stub().returns(Promise.resolve())
                };
            });

            it('should send tracking events', () => {
                adUnit.onStart.trigger();

                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.thirdPartyEvent, 'display impression', campaign.getSession().getId(), 'https://unity3d.com/impression');
            });
        });
    });
});
