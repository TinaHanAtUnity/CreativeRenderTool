import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
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
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { Privacy } from 'Ads/Views/Privacy';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { WebPlayerMRAIDAdUnit } from 'MRAID/AdUnits/WebPlayerMRAIDAdUnit';
import { WebPlayerMRAID } from 'MRAID/Views/WebPlayerMRAID';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
describe('WebPlayerMraidAdUnit', () => {
    const sandbox = sinon.createSandbox();
    let mraidAdUnitParameters;
    let mraidAdUnit;
    let mraidView;
    let ads;
    let operativeEventManager;
    let webPlayerContainer;
    let deviceInfo;
    let containerOpen;
    let containerClose;
    let operativeEventStartStub;
    let operativeEventViewStub;
    let operativeEventThirdQuartileStub;
    let operativeEventSkipStub;
    let sendWithGetStub;
    const orientationProperties = {
        allowOrientationChange: false,
        forceOrientation: Orientation.NONE
    };
    afterEach(() => {
        sandbox.restore();
        mraidAdUnit.setShowing(true);
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
        const viewContainer = document.createElement('div');
        mraidView.container.returns(viewContainer);
        const userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const storageBridge = new StorageBridge(core);
        const thirdPartyEventMnager = new ThirdPartyEventManager(core, request);
        const clientInfo = TestFixtures.getClientInfo(platform);
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const mraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
        const privacySDK = sinon.createStubInstance(PrivacySDK);
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
            playerMetadataServerId: 'https://hi.com',
            privacySDK: privacySDK,
            userPrivacyManager: userPrivacyManager
        });
        mraidAdUnitParameters = {
            platform: platform,
            core: core,
            ads: ads,
            store: TestFixtures.getStoreApi(nativeBridge),
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
            privacy: new Privacy(platform, mraidCampaign, userPrivacyManager, false, false, 'en'),
            privacyManager: userPrivacyManager,
            webPlayerContainer: webPlayerContainer,
            privacySDK: privacySDK
        };
        containerOpen = mraidAdUnitParameters.container.open.returns(Promise.resolve());
        containerClose = mraidAdUnitParameters.container.close.returns(Promise.resolve());
        operativeEventStartStub = sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
        operativeEventViewStub = sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
        operativeEventThirdQuartileStub = sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
        operativeEventSkipStub = sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());
        sandbox.stub(mraidAdUnitParameters.campaign, 'getTrackingUrls').returns({
            'complete': ['http://booyahcomplete.com'],
            'impression': ['http://booyahimpression.com']
        });
        sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        sendWithGetStub = sandbox.stub(thirdPartyEventMnager, 'sendWithGet').returns(Promise.resolve());
        mraidAdUnit = new WebPlayerMRAIDAdUnit(mraidAdUnitParameters);
    });
    it('should change the orientation properties used by container open', () => {
        mraidAdUnit.setOrientationProperties(orientationProperties);
        return mraidAdUnit.show().then(() => {
            sinon.assert.calledWith(containerOpen, mraidAdUnit, ['webplayer', 'webview'], false, Orientation.NONE, true, false, true, false, {});
        });
    });
    const getAdUnitFromView = (view, mraidParams, plat) => {
        const container = document.createElement('div');
        view.container.returns(container);
        mraidParams.mraid = view;
        mraidParams.platform = plat;
        return new WebPlayerMRAIDAdUnit(mraidParams);
    };
    [Platform.ANDROID, Platform.IOS].forEach(platform => {
        describe(`${platform} when ad unit is shown for programmatic MRAID content`, () => {
            let adUnit;
            let webPlayerSetSettings;
            let webPlayerSetEventSettings;
            const assertViewsOpened = (views) => {
                sinon.assert.calledWith(containerOpen, adUnit, views, true, Orientation.NONE, true, false, true, false, {});
            };
            beforeEach(() => {
                const view = sinon.createStubInstance(WebPlayerMRAID);
                adUnit = getAdUnitFromView(view, mraidAdUnitParameters, platform);
                webPlayerSetSettings = webPlayerContainer.setSettings;
                webPlayerSetEventSettings = webPlayerContainer.setEventSettings;
                return adUnit.show();
            });
            afterEach(() => {
                adUnit.setShowing(true);
                return adUnit.hide();
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
        let onStartObserver;
        let sendStartEventStub;
        let mraidViewShowSpy;
        let onStartProcessedObserver;
        const assertViewsOpened = (views) => {
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
                mraidViewShowSpy = mraidView.show;
                sendStartEventStub = sandbox.stub(ads.Listener, 'sendStartEvent').returns(Promise.resolve(void (0)));
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
        let sendFinishEventStub;
        let hideViewSpy;
        describe('if it was completed', () => {
            let onCloseObserver;
            beforeEach(() => {
                mraidAdUnit.setFinishState(FinishState.COMPLETED);
                onCloseObserver = sinon.spy();
                mraidAdUnit.onClose.subscribe(onCloseObserver);
                sendFinishEventStub = sandbox.stub(ads.Listener, 'sendFinishEvent').returns(Promise.resolve(void (0)));
                hideViewSpy = mraidView.hide;
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
                sendFinishEventStub = sandbox.stub(ads.Listener, 'sendFinishEvent').returns(Promise.resolve(void (0)));
                hideViewSpy = mraidView.hide;
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
    describe('accessors', () => {
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
        let setViewableSpy;
        let setFinishStateSpy;
        beforeEach(() => {
            setFinishStateSpy = sandbox.spy(mraidAdUnit, 'setFinishState');
            return mraidAdUnit.show();
        });
        afterEach(() => mraidAdUnit.hide());
        describe('for viewable state', () => {
            beforeEach(() => {
                setViewableSpy = mraidView.setViewableState;
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
            it('should send the true viewable state event onContainerForeground', () => {
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
                adUnit.setShowing(true);
                return adUnit.hide();
            });
        });
        describe('onContainerForeground', () => {
            let adUnit;
            let view;
            let containerSetViewFrame;
            let loadWebplayerSpy;
            beforeEach(() => {
                view = sinon.createStubInstance(WebPlayerMRAID);
                adUnit = getAdUnitFromView(view, mraidAdUnitParameters, Platform.IOS);
                view.isLoaded.returns(false);
                sandbox.stub(mraidAdUnitParameters.deviceInfo, 'getScreenWidth').resolves(500);
                containerSetViewFrame = mraidAdUnitParameters.container.setViewFrame;
                loadWebplayerSpy = view.loadWebPlayer;
                return adUnit.onContainerForegroundMRAID();
            });
            afterEach(() => {
                adUnit.setShowing(true);
                return adUnit.hide();
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
        let setViewableSpy;
        let setFinishStateSpy;
        beforeEach(() => {
            setViewableSpy = mraidView.setViewableState;
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
            it('should do nothing if adunit is not showing', () => {
                mraidAdUnit.onContainerForeground();
                sinon.assert.notCalled(setViewableSpy);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViUGxheWVyTVJBSURBZFVuaXRUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01SQUlEL0FkVW5pdHMvV2ViUGxheWVyTVJBSURBZFVuaXRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUkvQixPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUN6RixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTFELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM1QyxPQUFPLEVBQUUsa0JBQWtCLEVBQUUs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