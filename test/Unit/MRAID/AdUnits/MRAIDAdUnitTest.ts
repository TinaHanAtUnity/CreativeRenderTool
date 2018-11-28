import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAID } from 'MRAID/Views/MRAID';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { Platform } from 'Core/Constants/Platform';
import { IObserver0 } from 'Core/Utilities/IObserver';
import { FinishState } from 'Core/Constants/FinishState';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Observable0 } from 'Core/Utilities/Observable';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { FocusManager } from 'Core/Managers/FocusManager';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';
import { IARApi } from 'AR/AR';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Privacy } from 'Ads/Views/Privacy';
import { ARUtil } from 'AR/Utilities/ARUtil';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';

describe('MraidAdUnit', () => {
    let sandbox: sinon.SinonSandbox;
    let mraidAdUnitParameters: IMRAIDAdUnitParameters;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let operativeEventManager: OperativeEventManager;
    let userPrivacyManager: UserPrivacyManager;

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let ar: IARApi;

    let purchasing: IPurchasingApi;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let focusManager: FocusManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;

    before(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);

        mraidView = sinon.createStubInstance(MRAID);
        (<sinon.SinonSpy>mraidView.container).restore();
        sinon.stub(mraidView, 'container').returns(document.createElement('div'));
        userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);

        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        ar = TestFixtures.getARApi(nativeBridge);
        const wakeUpManager = new WakeUpManager(core);
        const request = new RequestManager(platform, core, wakeUpManager);
        const storageBridge = new StorageBridge(core);
        focusManager = new FocusManager(platform, core);
        purchasing = TestFixtures.getPurchasingApi(nativeBridge);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        const sessionManager = new SessionManager(core, request, storageBridge);
        const metaDataManager = new MetaDataManager(core);
        const coreConfig = TestFixtures.getCoreConfiguration();
        const adsConfig = TestFixtures.getAdsConfiguration();
        const mraidCampaign = TestFixtures.getExtendedMRAIDCampaign();
        const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            platform,
            core,
            ads,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: coreConfig,
            adsConfig: adsConfig,
            storageBridge: storageBridge,
            campaign: mraidCampaign
        });

        mraidAdUnitParameters = {
            platform,
            core,
            ads,
            ar,
            purchasing,
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: focusManager,
            container: sinon.createStubInstance(Activity),
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
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
            programmaticTrackingService: programmaticTrackingService
        };

        (<any>mraidAdUnitParameters.container).onShow = new Observable0();
        (<any>mraidAdUnitParameters.container).onAndroidPause = new Observable0();
        (<sinon.SinonStub>mraidAdUnitParameters.container.open).returns(Promise.resolve());
        (<sinon.SinonStub>mraidAdUnitParameters.container.close).returns(Promise.resolve());
        (<sinon.SinonStub>mraidAdUnitParameters.container.setViewFrame).returns(Promise.resolve());

        sandbox.stub(operativeEventManager, 'sendStart').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendView').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendThirdQuartile').returns(Promise.resolve());
        sandbox.stub(operativeEventManager, 'sendSkip').returns(Promise.resolve());

        mraidAdUnit = new MRAIDAdUnit(mraidAdUnitParameters);
    });

    describe('on show', () => {
        let onStartObserver: IObserver0;

        describe('for Mraid', () => {
            beforeEach(() => {
                onStartObserver = sinon.spy();
                mraidAdUnit.onStart.subscribe(onStartObserver);
                return mraidAdUnit.show();
            });

            afterEach(() => {
                return mraidAdUnit.hide();
            });

            it('should trigger onStart', () => {
                sinon.assert.calledOnce(<sinon.SinonSpy>onStartObserver);
            });

            it('should open the container', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>mraidAdUnitParameters.container.open, mraidAdUnit, ['webview'], true, Orientation.NONE, true, false, true, false, {});
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
                sinon.assert.calledWith(<sinon.SinonSpy>mraidAdUnitParameters.container.open, mraidAdUnit, ['arview', 'webview'], true, Orientation.NONE, true, false, true, false, {});

            });
        });
    });

    describe('on hide', () => {
        const finishState = FinishState.COMPLETED;
        let onCloseObserver: IObserver0;

        beforeEach(() => {
            onCloseObserver = sinon.spy();
            mraidAdUnit.onClose.subscribe(onCloseObserver);
            mraidAdUnit.setFinishState(finishState);
        });

        it('should resolve when isShowing is false', () => {
            return mraidAdUnit.hide().then(() => {
                sandbox.stub(mraidAdUnit, 'setShowing');
                sandbox.stub(mraidAdUnit, 'setShowingMRAID');
                sinon.assert.notCalled(<sinon.SinonSpy>onCloseObserver);
                sinon.assert.notCalled(<sinon.SinonSpy>mraidAdUnit.setShowing);
                sinon.assert.notCalled(<sinon.SinonSpy>mraidAdUnit.setShowingMRAID);
            });
        });

        it('should trigger on close', () => {
            return mraidAdUnit.show().then(() => mraidAdUnit.hide()).then(() => {
                sinon.assert.called(<sinon.SinonSpy>onCloseObserver);
            });
        });

        it('should send the finish event', () => {
            sinon.stub(ads.Listener, 'sendFinishEvent').returns(Promise.resolve(void(0)));

            return mraidAdUnit.show().then(() => mraidAdUnit.hide()).then(() => {
                sinon.assert.calledWith(<sinon.SinonSpy>ads.Listener.sendFinishEvent, mraidAdUnitParameters.placement.getId(), finishState);
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
                sinon.assert.calledWith(<sinon.SinonSpy>mraidAdUnitParameters.container.open, mraidAdUnit, ['webview'], false, Orientation.NONE, true, false, true, false, {});
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
        beforeEach(() => {
            sandbox.stub(mraidAdUnit, 'setFinishState');
            sandbox.stub(mraidAdUnit, 'hide');
        });

        afterEach(() => {
            mraidAdUnit.hide();
        });

        it('should set finish state and hide the view if adunit is showing', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerDestroy();
                sinon.assert.calledWith(<sinon.SinonSpy>mraidAdUnit.setFinishState, FinishState.SKIPPED);
                sinon.assert.called(<sinon.SinonSpy>mraidAdUnit.hide);
            });
        });

        it('should do nothing if adunit is not showing', () => {
            mraidAdUnit.onContainerDestroy();
            sinon.assert.notCalled(<sinon.SinonSpy>mraidAdUnit.setFinishState);
            sinon.assert.notCalled(<sinon.SinonSpy>mraidAdUnit.hide);
        });
    });

    describe('onContainerBackground', () => {
        afterEach(() => {
            mraidAdUnit.hide();
        });

        it('should set viewable state to false', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerBackground();
                sinon.assert.calledWith(<sinon.SinonSpy>mraidView.setViewableState, false);
            });
        });

        it('should do nothing if adunit is not showing', () => {
            mraidAdUnit.onContainerBackground();
            sinon.assert.notCalled(<sinon.SinonSpy>mraidView.setViewableState);
        });
    });

    describe('onContainerShow', () => {
        afterEach(() => {
            mraidAdUnit.hide();
        });

        it('should send the true viewable event over the bridge', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerShow();
                sinon.assert.calledWith(<sinon.SinonSpy>mraidView.setViewableState, true);
            });
        });
    });

    describe('onContainerForeground', () => {
        afterEach(() => {
            mraidAdUnit.hide();
        });

        it ('should send the true viewable event over the bridge when mraid is set as showing', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerForeground();
                sinon.assert.calledWith(<sinon.SinonSpy>mraidView.setViewableState, true);
            });
        });
    });
});
