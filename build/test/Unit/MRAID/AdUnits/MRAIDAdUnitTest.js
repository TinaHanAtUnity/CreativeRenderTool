import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';
import { MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
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
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { Privacy } from 'Ads/Views/Privacy';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
describe('MraidAdUnit', () => {
    const sandbox = sinon.createSandbox();
    let mraidAdUnitParameters;
    let mraidAdUnit;
    let mraidView;
    let ads;
    let operativeEventManager;
    let webPlayerContainer;
    let containerOpen;
    let containerClose;
    let operativeEventStartStub;
    let operativeEventViewStub;
    let operativeEventThirdQuartileStub;
    let operativeEventSkipStub;
    let sendWithGetStub;
    let privacySDK;
    const orientationProperties = {
        allowOrientationChange: false,
        forceOrientation: Orientation.NONE
    };
    beforeEach(() => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        ads = TestFixtures.getAdsApi(nativeBridge);
        mraidView = sinon.createStubInstance(MRAID);
        webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        const viewContainer = document.createElement('div');
        mraidView.container.returns(viewContainer);
        const userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
        const core = TestFixtures.getCoreApi(nativeBridge);
        const store = TestFixtures.getStoreApi(nativeBridge);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const storageBridge = new StorageBridge(core);
        const thirdPartyEventMnager = new ThirdPartyEventManager(core, request);
        const clientInfo = TestFixtures.getClientInfo(platform);
        const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const mraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
        privacySDK = sinon.createStubInstance(PrivacySDK);
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
            store: store,
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
        sendWithGetStub = sandbox.stub(thirdPartyEventMnager, 'sendWithGet').returns(Promise.resolve());
        sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        mraidAdUnit = new MRAIDAdUnit(mraidAdUnitParameters);
    });
    afterEach(() => {
        sandbox.restore();
        mraidAdUnit.setShowing(true);
        return mraidAdUnit.hide();
    });
    it('should change the orientation properties used by container open', () => {
        mraidAdUnit.setOrientationProperties(orientationProperties);
        return mraidAdUnit.show().then(() => {
            sinon.assert.calledWith(containerOpen, mraidAdUnit, ['webview'], false, Orientation.NONE, true, false, true, false, {});
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
        describe('for MRAID content', () => {
            beforeEach(() => {
                mraidViewShowSpy = mraidView.show;
                sendStartEventStub = sandbox.stub(ads.Listener, 'sendStartEvent').returns(Promise.resolve(void (0)));
                return mraidAdUnit.show();
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
            it('should open the container with just webview', () => {
                assertViewsOpened(['webview']);
            });
            it('should open the view', () => {
                sinon.assert.called(mraidViewShowSpy);
            });
        });
        describe('for AR content', () => {
            describe('if AR supported', () => {
                beforeEach(() => {
                    sandbox.stub(ARUtil, 'isARCreative').returns(true);
                    sandbox.stub(ARUtil, 'isARSupported').returns(Promise.resolve(true));
                    return mraidAdUnit.show();
                });
                it('should open container with AR View', () => {
                    sinon.assert.calledOnce(onStartObserver);
                    assertViewsOpened(['arview', 'webview']);
                });
            });
            describe('if AR not supported', () => {
                beforeEach(() => {
                    sandbox.stub(ARUtil, 'isARCreative').returns(true);
                    sandbox.stub(ARUtil, 'isARSupported').returns(Promise.resolve(false));
                    return mraidAdUnit.show();
                });
                it('should open container without AR View', () => {
                    sinon.assert.calledOnce(onStartObserver);
                    assertViewsOpened(['webview']);
                });
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
            setViewableSpy = mraidView.setViewableState;
            setFinishStateSpy = sandbox.spy(mraidAdUnit, 'setFinishState');
            return mraidAdUnit.show();
        });
        describe('onContainerShow', () => {
            it('should send the true viewable state event', () => {
                mraidAdUnit.onContainerShow();
                sinon.assert.calledWith(setViewableSpy, true);
            });
        });
        describe('onContainerDestroy', () => {
            it('should set finish state to skipped', () => {
                mraidAdUnit.onContainerDestroy();
                sinon.assert.calledWith(setFinishStateSpy, FinishState.SKIPPED);
            });
        });
        describe('onContainerBackground', () => {
            it('should send the false viewable state event', () => {
                mraidAdUnit.onContainerBackground();
                sinon.assert.calledWith(setViewableSpy, false);
            });
        });
        describe('onContainerForeground', () => {
            it('should send the true viewable state event', () => {
                mraidAdUnit.onContainerForeground();
                sinon.assert.calledWith(setViewableSpy, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURBZFVuaXRUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdGVzdC9Vbml0L01SQUlEL0FkVW5pdHMvTVJBSURBZFVuaXRUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUvQixPQUFPLEVBQTBCLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ2hGLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUN6RixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUNyRSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2hFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUM3RCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTFELE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDNUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FB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