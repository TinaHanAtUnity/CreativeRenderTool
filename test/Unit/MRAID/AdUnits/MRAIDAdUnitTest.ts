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
import { ARUtil } from 'AR/Utilities/ARUtil';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';

describe('MraidAdUnit', () => {
    const sandbox = sinon.createSandbox();
    let mraidAdUnitParameters: IMRAIDAdUnitParameters;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let ads: IAdsApi;
    let operativeEventManager: OperativeEventManager;

    let containerOpen: sinon.SinonSpy;
    let containerClose: sinon.SinonSpy;
    let operativeEventStartStub: sinon.SinonStub;
    let operativeEventViewStub: sinon.SinonStub;
    let operativeEventThirdQuartileStub: sinon.SinonStub;
    let operativeEventSkipStub: sinon.SinonStub;

    afterEach(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        const platform = Platform.ANDROID;
        const backend = TestFixtures.getBackend(platform);
        const nativeBridge = TestFixtures.getNativeBridge(platform, backend);

        ads = TestFixtures.getAdsApi(nativeBridge);
        mraidView = sinon.createStubInstance(MRAID);

        (<sinon.SinonSpy>mraidView.container).restore();
        sandbox.stub(mraidView, 'container').returns(document.createElement('div'));

        const userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
        const core = TestFixtures.getCoreApi(nativeBridge);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const storageBridge = new StorageBridge(core);
        const clientInfo = TestFixtures.getClientInfo(platform);
        const deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
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
            purchasing: TestFixtures.getPurchasingApi(nativeBridge),
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: new FocusManager(platform, core),
            container: sinon.createStubInstance(Activity),
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: new ThirdPartyEventManager(core, request),
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
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
        };

        containerOpen = (<sinon.SinonStub>mraidAdUnitParameters.container.open).returns(Promise.resolve());
        containerClose = (<sinon.SinonStub>mraidAdUnitParameters.container.close).returns(Promise.resolve());

        operativeEventStartStub = sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
        operativeEventViewStub = sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
        operativeEventThirdQuartileStub = sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
        operativeEventSkipStub = sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());

        mraidAdUnit = new MRAIDAdUnit(mraidAdUnitParameters);
    });

    describe('on show', () => {
        let onStartObserver: sinon.SinonSpy;
        let sendStartEventStub: sinon.SinonStub;
        let mraidViewShowSpy: sinon.SinonSpy;

        describe('for Mraid', () => {
            beforeEach(() => {
                onStartObserver = sinon.spy();
                mraidViewShowSpy = <sinon.SinonSpy>mraidView.show;
                mraidAdUnit.onStart.subscribe(onStartObserver);
                sendStartEventStub = sandbox.stub(ads.Listener, 'sendStartEvent').returns(Promise.resolve(void(0)));

                return mraidAdUnit.show();
            });

            afterEach(() => {
                return mraidAdUnit.hide();
            });

            it('should trigger onStart', () => {
                sinon.assert.calledOnce(onStartObserver);
                sinon.assert.called(operativeEventStartStub);
                sinon.assert.called(sendStartEventStub);
            });

            it('should open the container', () => {
                sinon.assert.calledWith(containerOpen, mraidAdUnit, ['webview'], true, Orientation.NONE, true, false, true, false, {});
            });

            it('should open the view', () => {
                sinon.assert.called(mraidViewShowSpy);
            });
        });

        describe('for AR', () => {

            beforeEach(() => {
                onStartObserver = sinon.spy();
                mraidAdUnit.onStart.subscribe(onStartObserver);
                sandbox.stub(ARUtil, 'isARCreative').returns(true);
                sandbox.stub(ARUtil, 'isARSupported').returns(Promise.resolve(true));

                return mraidAdUnit.show();
            });

            afterEach(() => {
                return mraidAdUnit.hide();
            });

            it('should set up the ar View if AR is supported', () => {
                sinon.assert.calledOnce(onStartObserver);
                sinon.assert.calledWith(containerOpen, mraidAdUnit, ['arview', 'webview'], true, Orientation.NONE, true, false, true, false, {});

            });
        });
    });

    describe('on hide', () => {
        let onCloseObserver: sinon.SinonSpy;
        let sendFinishEventStub: sinon.SinonStub;
        let hideViewSpy: sinon.SinonSpy;

        beforeEach(() => {
            onCloseObserver = sinon.spy();
            mraidAdUnit.onClose.subscribe(onCloseObserver);
            hideViewSpy = <sinon.SinonSpy>mraidView.hide;
        });

        it('should resolve when isShowing is false', () => {
            const setShowingStub = sandbox.stub(mraidAdUnit, 'setShowing');
            const setShowingMRAIDStub = sandbox.stub(mraidAdUnit, 'setShowingMRAID');

            return mraidAdUnit.hide().then(() => {
                sinon.assert.notCalled(onCloseObserver);
                sinon.assert.notCalled(setShowingStub);
                sinon.assert.notCalled(setShowingMRAIDStub);
            });
        });

        it('should trigger on close', () => {
            return mraidAdUnit.show().then(() => mraidAdUnit.hide()).then(() => {
                sinon.assert.called(containerClose);
                sinon.assert.called(onCloseObserver);
            });
        });

        it('should send the finish events if finish state is complete', () => {
            mraidAdUnit.setFinishState(FinishState.COMPLETED);
            sendFinishEventStub = sandbox.stub(ads.Listener, 'sendFinishEvent').returns(Promise.resolve(void(0)));

            return mraidAdUnit.show().then(() => mraidAdUnit.hide()).then(() => {
                sinon.assert.calledWith(sendFinishEventStub, mraidAdUnitParameters.placement.getId(), FinishState.COMPLETED);
                sinon.assert.called(operativeEventThirdQuartileStub);
                sinon.assert.called(operativeEventViewStub);
            });
        });

        it('should send the skip events if finish state is skipped', () => {
            mraidAdUnit.setFinishState(FinishState.SKIPPED);
            sendFinishEventStub = sandbox.stub(ads.Listener, 'sendFinishEvent').returns(Promise.resolve(void(0)));

            return mraidAdUnit.show().then(() => mraidAdUnit.hide()).then(() => {
                sinon.assert.calledWith(sendFinishEventStub, mraidAdUnitParameters.placement.getId(), FinishState.SKIPPED);
                sinon.assert.called(operativeEventSkipStub);
            });
        });

        it('should close the view', () => {
            return mraidAdUnit.show().then(() => mraidAdUnit.hide()).then(() => {
                sinon.assert.called(hideViewSpy);
            });
        });
    });

    describe('setOrientationProperties', () => {
        const properties = {
            allowOrientationChange: false,
            forceOrientation: Orientation.NONE
        };

        afterEach(() => {
            return mraidAdUnit.hide();
        });

        it('should change the orientation properties used by container open', () => {
            mraidAdUnit.setOrientationProperties(properties);
            return mraidAdUnit.show().then(() => {
                sinon.assert.calledWith(containerOpen, mraidAdUnit, ['webview'], false, Orientation.NONE, true, false, true, false, {});
            });
        });
    });

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

    describe('setShowingMraid', () => {
        it('should set the value passed to it', () => {
            mraidAdUnit.setShowingMRAID(false);
            assert.equal(mraidAdUnit.isShowingMRAID(), false);
        });
    });

    describe('isShowingMraid', () => {
        beforeEach(() => {
            return mraidAdUnit.show();
        });

        afterEach(() => {
            return mraidAdUnit.hide();
        });

        it('should return the true showing MRAID value if show is called', () => {
            assert.equal(mraidAdUnit.isShowingMRAID(), true);
        });
    });

    describe('onContainerDestroy', () => {
        let adUnitHideSpy: sinon.SinonSpy;
        let setFinishStateSpy: sinon.SinonSpy;

        beforeEach(() => {
            setFinishStateSpy = sandbox.spy(mraidAdUnit, 'setFinishState');
            adUnitHideSpy = sandbox.spy(mraidAdUnit, 'hide');
        });

        afterEach(() => {
            mraidAdUnit.hide();
        });

        it('should set finish state and hide the view if adunit is showing', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerDestroy();
                sinon.assert.calledWith(setFinishStateSpy, FinishState.SKIPPED);
                sinon.assert.called(adUnitHideSpy);
            });
        });

        it('should do nothing if adunit is not showing', () => {
            mraidAdUnit.onContainerDestroy();
            sinon.assert.notCalled(setFinishStateSpy);
            sinon.assert.notCalled(adUnitHideSpy);
        });
    });

    describe('onContainerBackground', () => {
        let setViewableSpy: sinon.SinonSpy;

        beforeEach(() => {
            setViewableSpy = <sinon.SinonSpy>mraidView.setViewableState;
        });

        afterEach(() => {
            mraidAdUnit.hide();
        });

        it('should set viewable state to false', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerBackground();
                sinon.assert.calledWith(setViewableSpy, false);
            });
        });

        it('should do nothing if adunit is not showing', () => {
            mraidAdUnit.onContainerBackground();
            sinon.assert.notCalled(setViewableSpy);
        });
    });

    describe('onContainerShow', () => {
        let setViewableSpy: sinon.SinonSpy;

        beforeEach(() => {
            setViewableSpy = <sinon.SinonSpy>mraidView.setViewableState;
        });

        afterEach(() => {
            mraidAdUnit.hide();
        });

        it('should send the true viewable event over the bridge', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerShow();
                sinon.assert.calledWith(setViewableSpy, true);
            });
        });
    });

    describe('onContainerForeground', () => {
        let setViewableSpy: sinon.SinonSpy;

        beforeEach(() => {
            setViewableSpy = <sinon.SinonSpy>mraidView.setViewableState;
        });

        afterEach(() => {
            mraidAdUnit.hide();
        });

        it ('should send the true viewable event over the bridge when mraid is set as showing', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerForeground();
                sinon.assert.calledWith(setViewableSpy, true);
            });
        });
    });
});
