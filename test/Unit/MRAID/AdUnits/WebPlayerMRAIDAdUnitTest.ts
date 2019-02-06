import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAID } from 'MRAID/Views/MRAID';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { Platform } from 'Core/Constants/Platform';
import { FinishState } from 'Core/Constants/FinishState';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { FocusManager } from 'Core/Managers/FocusManager';
import { IAdsApi } from 'Ads/IAds';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Privacy } from 'Ads/Views/Privacy';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { MRAIDView, IMRAIDViewHandler } from 'MRAID/Views/MRAIDView';
import { WebPlayerMRAIDAdUnit } from 'MRAID/AdUnits/WebPlayerMRAIDAdUnit';
import { WebPlayerMRAID } from 'MRAID/Views/WebPlayerMRAID';

describe('WebPlayerMraidAdUnit', () => {
    const sandbox = sinon.createSandbox();
    let mraidAdUnitParameters: IMRAIDAdUnitParameters;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let ads: IAdsApi;
    let operativeEventManager: OperativeEventManager;
    let webPlayerContainer: WebPlayerContainer;
    let deviceInfo: DeviceInfo;

    let containerOpen: sinon.SinonSpy;
    let containerClose: sinon.SinonSpy;
    let operativeEventStartStub: sinon.SinonStub;
    let operativeEventViewStub: sinon.SinonStub;
    let operativeEventThirdQuartileStub: sinon.SinonStub;
    let operativeEventSkipStub: sinon.SinonStub;
    let sendWithGetStub: sinon.SinonStub;

    const orientationProperties = {
        allowOrientationChange: false,
        forceOrientation: Orientation.NONE
    };

    afterEach(() => {
        sandbox.restore();
        return mraidAdUnit.hide();
    });

    beforeEach(() => {
        const platform = Platform.IOS;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        const core = TestFixtures.getCoreApi(nativeBridge);

        ads = TestFixtures.getAdsApi(nativeBridge);
        mraidView = sinon.createStubInstance(WebPlayerMRAID);
        webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);

        (<sinon.SinonSpy>mraidView.container).restore();
        sandbox.stub(mraidView, 'container').returns(document.createElement('div'));

        const userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const storageBridge = new StorageBridge(core);
        const thirdPartyEventMnager = new ThirdPartyEventManager(core, request);
        const clientInfo = TestFixtures.getClientInfo(platform);
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const mraidCampaign = TestFixtures.getExtendedMRAIDCampaign();

        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            platform: platform,
            core: core,
            ads: ads,
            request: request,
            metaDataManager: new MetaDataManager(core),
            sessionManager: new SessionManager(core, request, storageBridge),
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            storageBridge: storageBridge,
            campaign: mraidCampaign,
            playerMetadataServerId: 'https://hi.com'
        });

        mraidAdUnitParameters = {
            platform: platform,
            core: core,
            ads: ads,
            ar: TestFixtures.getARApi(nativeBridge),
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: new FocusManager(platform, core),
            container: sinon.createStubInstance(Activity),
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventMnager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: mraidCampaign,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            request: request,
            options: {},
            mraid: mraidView,
            endScreen: undefined,
            privacy: new Privacy(platform, mraidCampaign, userPrivacyManager, false, false),
            privacyManager: userPrivacyManager,
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService),
            webPlayerContainer: webPlayerContainer
        };

        containerOpen = (<sinon.SinonStub>mraidAdUnitParameters.container.open).returns(Promise.resolve());
        containerClose = (<sinon.SinonStub>mraidAdUnitParameters.container.close).returns(Promise.resolve());

        operativeEventStartStub = sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
        operativeEventViewStub = sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
        operativeEventThirdQuartileStub = sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
        operativeEventSkipStub = sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());

        sandbox.stub(mraidAdUnitParameters.campaign, 'getTrackingUrls').returns(
            {
                'complete':   ['http://booyahcomplete.com'],
                'impression': ['http://booyahimpression.com']
            }
        );

        sendWithGetStub = sandbox.stub(thirdPartyEventMnager, 'sendWithGet').returns(Promise.resolve());

        mraidAdUnit = new WebPlayerMRAIDAdUnit(mraidAdUnitParameters);
    });

    it('should change the orientation properties used by container open', () => {
        mraidAdUnit.setOrientationProperties(orientationProperties);
        return mraidAdUnit.show().then(() => {
            sinon.assert.calledWith(containerOpen, mraidAdUnit, ['webplayer', 'webview'], false, Orientation.NONE, true, false, true, false, {});
        });
    });

    const getAdUnitFromView = (view: MRAIDView<IMRAIDViewHandler>, mraidParams: IMRAIDAdUnitParameters, plat: Platform) => {
        (<sinon.SinonSpy>view.container).restore();
        sandbox.stub(view, 'container').returns(document.createElement('div'));

        mraidParams.mraid = view;
        mraidParams.platform = plat;
        return new WebPlayerMRAIDAdUnit(mraidParams);
    };

    [Platform.ANDROID, Platform.IOS].forEach(platform => {
        describe(`${platform} when ad unit is shown for programmatic MRAID content`, () => {

            let adUnit: WebPlayerMRAIDAdUnit;
            let webPlayerSetSettings: sinon.SinonSpy;
            let webPlayerSetEventSettings: sinon.SinonSpy;

            const assertViewsOpened = (views: string[]) => {
                sinon.assert.calledWith(containerOpen, adUnit, views, true, Orientation.NONE, true, false, true, false, {});
            };

            beforeEach(() => {
                const view = sinon.createStubInstance(WebPlayerMRAID);
                adUnit = getAdUnitFromView(view, mraidAdUnitParameters, platform);

                webPlayerSetSettings = <sinon.SinonSpy>webPlayerContainer.setSettings;
                webPlayerSetEventSettings = <sinon.SinonSpy>webPlayerContainer.setEventSettings;

                return adUnit.show();
            });

            it('should open the container with webview and webplayer', () => {
                assertViewsOpened(['webplayer', 'webview']);
            });

            it('should set the webplayercontainer settings', () => {
                sinon.assert.called(webPlayerSetSettings);
            });

            it('should set the webplayercontainer event settings', () => {
                sinon.assert.called(webPlayerSetEventSettings);
            });
        });
    });

    describe('when ad unit is shown', () => {
        let onStartObserver: sinon.SinonSpy;
        let sendStartEventStub: sinon.SinonStub;
        let mraidViewShowSpy: sinon.SinonSpy;
        let onStartProcessedObserver: sinon.SinonSpy;

        const assertViewsOpened = (views: string[]) => {
            sinon.assert.calledWith(containerOpen, mraidAdUnit, views, true, Orientation.NONE, true, false, true, false, {});
        };

        beforeEach(() => {
            onStartObserver = sinon.spy();
            mraidAdUnit.onStart.subscribe(onStartObserver);

            onStartProcessedObserver = sinon.spy();
            mraidAdUnit.onStartProcessed.subscribe(onStartProcessedObserver);

        });

        describe('for ExtendedMRAID content', () => {
            beforeEach(() => {
                mraidViewShowSpy = <sinon.SinonSpy>mraidView.show;
                sendStartEventStub = sandbox.stub(ads.Listener, 'sendStartEvent').returns(Promise.resolve(void(0)));

                return mraidAdUnit.show();
            });

            afterEach(() => {
                return mraidAdUnit.hide();
            });

            it('should trigger onStart event', () => {
                sinon.assert.calledOnce(onStartObserver);
            });

            it('should invoke Listener.sendStartEvent with placementId', () => {
                sinon.assert.calledWith(sendStartEventStub, 'fooId');
            });
            it('should send start operative event', () => {
                sinon.assert.calledOnce(operativeEventStartStub);
            });

            it('should send the impression tracking event', () => {
                sinon.assert.calledWith(sendWithGetStub, 'mraid impression', '12345', 'http://booyahimpression.com', true);
            });

            it('should trigger onStartProcessed after start operative event is sent', () => {
                sinon.assert.calledOnce(onStartObserver);
            });

            it('should return true for isShowing', () => {
                assert.isTrue(mraidAdUnit.isShowing());
            });

            it('should open the view', () => {
                sinon.assert.called(mraidViewShowSpy);
            });
        });
    });

    describe('when ad unit is hidden', () => {
        let sendFinishEventStub: sinon.SinonStub;
        let hideViewSpy: sinon.SinonSpy;

        describe('if it was completed', () => {
            let onCloseObserver: sinon.SinonSpy;

            beforeEach(() => {
                mraidAdUnit.setFinishState(FinishState.COMPLETED);
                onCloseObserver = sinon.spy();
                mraidAdUnit.onClose.subscribe(onCloseObserver);

                sendFinishEventStub = sandbox.stub(ads.Listener, 'sendFinishEvent').returns(Promise.resolve(void(0)));
                hideViewSpy = <sinon.SinonSpy>mraidView.hide;

                return mraidAdUnit.show().then(() => mraidAdUnit.hide());
            });

            it('should trigger onClose event', () => {
                sinon.assert.called(containerClose);
                sinon.assert.called(onCloseObserver);
            });

            it('should invoke Listener.sendFinishEvent with placementId and finish state', () => {
                sinon.assert.calledWith(sendFinishEventStub, mraidAdUnitParameters.placement.getId(), FinishState.COMPLETED);
            });

            it('should send 3rd quartile operative event', () => {
                sinon.assert.called(operativeEventThirdQuartileStub);
            });

            it('should send view operative event', () => {
                sinon.assert.called(operativeEventViewStub);
            });

            it('should send complete tracking event', () => {
                sinon.assert.calledWith(sendWithGetStub, 'mraid complete', '12345', 'http://booyahcomplete.com', true);
            });

            it('should close the view', () => {
                sinon.assert.called(hideViewSpy);
            });
        });

        describe('if it was skipped', () => {
            beforeEach(() => {
                mraidAdUnit.setFinishState(FinishState.SKIPPED);
                sendFinishEventStub = sandbox.stub(ads.Listener, 'sendFinishEvent').returns(Promise.resolve(void(0)));
                hideViewSpy = <sinon.SinonSpy>mraidView.hide;

                return mraidAdUnit.show().then(() => mraidAdUnit.hide());
            });

            it('should invoke Listener.sendFinishEvent with FinishState.SKIPPED', () => {
                sinon.assert.calledWith(sendFinishEventStub, mraidAdUnitParameters.placement.getId(), FinishState.SKIPPED);
            });

            it('should send skip operative event', () => {
                sinon.assert.called(operativeEventSkipStub);
            });

            it('should not send 3rd quartile operative event', () => {
                sinon.assert.notCalled(operativeEventThirdQuartileStub);
            });

            it('should not send view operative event', () => {
                sinon.assert.notCalled(operativeEventViewStub);
            });

            it('should not send complete tracking event', () => {
                const impressionCall = sendWithGetStub.getCall(0);
                assert.equal('mraid impression', impressionCall.args[0]);

                const completeCall = sendWithGetStub.getCall(1);
                assert.equal(null, completeCall);
            });

            it('should close the view', () => {
                sinon.assert.called(hideViewSpy);
            });
        });

        it('should do nothing and resolve when isShowing is false', () => {
            const setShowingStub = sandbox.stub(mraidAdUnit, 'setShowing');

            return mraidAdUnit.hide().then(() => {
                sinon.assert.notCalled(setShowingStub);
            });
        });
    });

    describe ('accessors', () => {
        describe('description', () => {
            it('should return the content type of the adunit', () => {
                const description = mraidAdUnit.description();
                assert.equal(description, 'mraid');
            });
        });

        describe('getEndScreen', () => {
            it('should return the endscreen set in the constructor', () => {
                assert.equal(mraidAdUnit.getEndScreen(), undefined);
            });
        });

        describe('getMraidView', () => {
            it('should return the view set in the constructor', () => {
                assert.equal(mraidAdUnit.getMRAIDView(), mraidView);
            });
        });
    });

    describe('ContainerListeners after ad unit shown', () => {
        let setViewableSpy: sinon.SinonSpy;
        let setFinishStateSpy: sinon.SinonSpy;

        beforeEach(() => {
            setFinishStateSpy = sandbox.spy(mraidAdUnit, 'setFinishState');

            return mraidAdUnit.show();
        });

        afterEach(() => mraidAdUnit.hide());

        describe('for viewable state', () => {

            beforeEach(() => {
                setViewableSpy = <sinon.SinonSpy>mraidView.setViewableState;
            });

            it('should send the true viewable state event onContainerShow', () => {
                mraidAdUnit.onContainerShow();
                sinon.assert.calledWith(setViewableSpy, true);
                sinon.assert.calledTwice(setViewableSpy);
            });

            it('should set finish state to skipped onContainerDestroy', () => {
                mraidAdUnit.onContainerDestroy();
                sinon.assert.calledWith(setFinishStateSpy, FinishState.SKIPPED);
                sinon.assert.calledOnce(setFinishStateSpy);
            });

            it('should send the false viewable state event onContainerBackground', () => {
                mraidAdUnit.onContainerBackground();
                sinon.assert.calledWith(setViewableSpy, false);
                sinon.assert.calledOnce(setViewableSpy);

            });

            it ('should send the true viewable state event onContainerForeground', () => {
                mraidAdUnit.onContainerForeground();
                sinon.assert.calledWith(setViewableSpy, true);
                sinon.assert.calledOnce(setViewableSpy);
            });
        });

        describe('onContainerShow', () => {
            it('should call onContainerForeground on IOS', () => {
                const view = sinon.createStubInstance(WebPlayerMRAID);
                const adUnit = getAdUnitFromView(view, mraidAdUnitParameters, Platform.IOS);

                const onContainerForegroundSpy = sandbox.spy(adUnit, 'onContainerForeground');
                adUnit.onContainerShow();
                sinon.assert.called(onContainerForegroundSpy);
            });
        });

        describe('onContainerForeground', () => {
            let adUnit: WebPlayerMRAIDAdUnit;
            let view: MRAID;
            let containerSetViewFrame: sinon.SinonSpy;
            let loadWebplayerSpy: sinon.SinonSpy;

            beforeEach(() => {
                view = sinon.createStubInstance(WebPlayerMRAID);

                adUnit = getAdUnitFromView(view, mraidAdUnitParameters, Platform.IOS);

                (<sinon.SinonStub>view.isLoaded).returns(false);
                sandbox.stub(mraidAdUnitParameters.deviceInfo, 'getScreenWidth').resolves(500);

                containerSetViewFrame = <sinon.SinonSpy>mraidAdUnitParameters.container.setViewFrame;
                loadWebplayerSpy = <sinon.SinonStub>view.loadWebPlayer;

                return adUnit.onContainerForegroundMRAID();
            });

            it('should set the webview view frame with a minimized height', () => {
                sinon.assert.calledWith(containerSetViewFrame, 'webview', 0, 0, 500, 74.03999999999999);
            });

            it('should load the webplayer for the mraid view', () => {
                sinon.assert.called(loadWebplayerSpy);
            });
        });
    });

    describe('ContainerListeners if ad unit not shown', () => {
        let setViewableSpy: sinon.SinonSpy;
        let setFinishStateSpy: sinon.SinonSpy;

        beforeEach(() => {
            setViewableSpy = <sinon.SinonSpy>mraidView.setViewableState;
            setFinishStateSpy = sandbox.spy(mraidAdUnit, 'setFinishState');
        });

        describe('onContainerDestroy', () => {
            it('should do nothing if adunit is not showing', () => {
                mraidAdUnit.onContainerDestroy();
                sinon.assert.notCalled(setFinishStateSpy);
            });
        });

        describe('onContainerBackground', () => {
            it('should do nothing if adunit is not showing', () => {
                mraidAdUnit.onContainerBackground();
                sinon.assert.notCalled(setViewableSpy);
            });
        });

        describe('onContainerForeground', () => {
            it ('should do nothing if adunit is not showing', () => {
                mraidAdUnit.onContainerForeground();
                sinon.assert.notCalled(setViewableSpy);
            });
        });
    });
});
