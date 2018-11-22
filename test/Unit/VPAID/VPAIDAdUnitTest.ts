import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { IAdsApi } from 'Ads/IAds';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ListenerApi } from 'Ads/Native/Listener';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Closer } from 'Ads/Views/Closer';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IObserver0 } from 'Core/Utilities/IObserver';
import { Observable0, Observable2 } from 'Core/Utilities/Observable';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAID } from 'VPAID/Views/VPAID';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { IARApi } from 'AR/AR';
import { IPurchasingApi } from 'Purchasing/IPurchasing';

describe('VPAIDAdUnit', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let ar: IARApi;
    let purchasing: IPurchasingApi;
    let webPlayerContainer: WebPlayerContainer;
    let parameters: IVPAIDAdUnitParameters;
    let adUnit: VPAIDAdUnit;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        ar = TestFixtures.getARApi(nativeBridge);
        purchasing = TestFixtures.getPurchasingApi(nativeBridge);

        webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        (<sinon.SinonStub>webPlayerContainer.setSettings).returns(Promise.resolve());
        (<sinon.SinonStub>webPlayerContainer.setEventSettings).returns(Promise.resolve());
        (<unknown>webPlayerContainer).shouldOverrideUrlLoading = new Observable2<string, string>();

        parameters = {
            platform,
            core,
            ads,
            ar,
            purchasing,
            webPlayerContainer,
            campaign: sinon.createStubInstance(VPAIDCampaign),
            closer: sinon.createStubInstance(Closer),
            vpaid: sinon.createStubInstance(VPAID),
            endScreen: sinon.createStubInstance(VPAIDEndScreen),
            focusManager: sinon.createStubInstance(FocusManager),
            deviceInfo: sinon.createStubInstance(AndroidDeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(ProgrammaticOperativeEventManager),
            placement: TestFixtures.getPlacement(),
            container: sinon.createStubInstance(Activity),
            coreConfig: sinon.createStubInstance(CoreConfiguration),
            adsConfig: sinon.createStubInstance(AdsConfiguration),
            request: sinon.createStubInstance(RequestManager),
            privacy: sinon.createStubInstance(Privacy),
            forceOrientation: Orientation.NONE,
            options: {},
            gdprManager: sinon.createStubInstance(GdprManager),
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
        };

        (<unknown>nativeBridge).Listener = sinon.createStubInstance(ListenerApi);

        (<unknown>parameters.focusManager).onAppForeground = new Observable0();
        (<unknown>parameters.focusManager).onAppBackground = new Observable0();
        (<unknown>parameters.container).onShow = new Observable0();
        (<unknown>parameters.container).onAndroidPause = new Observable0();
        (<sinon.SinonStub>parameters.container.open).returns(Promise.resolve());
        (<sinon.SinonStub>parameters.container.close).returns(Promise.resolve());
        (<sinon.SinonStub>parameters.container.setViewFrame).returns(Promise.resolve());

        (<sinon.SinonStub>parameters.deviceInfo.getScreenWidth).returns(Promise.resolve(320));
        (<sinon.SinonStub>parameters.deviceInfo.getScreenHeight).returns(Promise.resolve(480));

        const overlayEl = document.createElement('div');
        overlayEl.setAttribute('id', 'closer');
        (<sinon.SinonStub>parameters.closer.container).returns(overlayEl);

        adUnit = new VPAIDAdUnit(parameters);
    });

    describe('on show', () => {

        const onShowTests = () => {
            let onStartObserver: IObserver0;

            beforeEach(() => {
                onStartObserver = sinon.spy();
                adUnit.onStart.subscribe(onStartObserver);
                return adUnit.show();
            });

            it('should trigger onStart', () => {
                sinon.assert.calledOnce(<sinon.SinonSpy>onStartObserver);
            });

            it('should set up the web player', () => {
                sinon.assert.calledOnce(<sinon.SinonSpy>webPlayerContainer.setSettings);
                sinon.assert.calledOnce(<sinon.SinonSpy>webPlayerContainer.setEventSettings);
            });

            it('should open the container', () => {
                sinon.assert.calledOnce(<sinon.SinonSpy>parameters.container.open);
            });

            afterEach(() => {
                return adUnit.hide();
            });
        };

        describe('on android', () => {
            beforeEach(() => {
                sinon.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            });
            onShowTests();
        });

        xdescribe('on ios', () => {
            beforeEach(() => {
                sinon.stub(nativeBridge, 'getPlatform').returns(Platform.IOS);
            });
            onShowTests();
        });
    });

    describe('on hide', () => {
        const finishState = FinishState.COMPLETED;
        let onCloseObserver: IObserver0;
        let finishSpy: sinon.SinonSpy;

        beforeEach(() => {
            onCloseObserver = sinon.spy();
            adUnit.onClose.subscribe(onCloseObserver);
            adUnit.setFinishState(finishState);
            const elements = document.querySelectorAll('#closer');
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < elements.length; i++) {
                elements[i].parentNode!.removeChild(elements[i]);
            }
            finishSpy = sinon.spy(ads.Listener, 'sendFinishEvent');
            return adUnit.show().then(() => adUnit.hide());
        });

        it('should trigger on close', () => {
            sinon.assert.called(<sinon.SinonSpy>onCloseObserver);
        });

        it('should send the finish event', () => {
            sinon.assert.calledWith(finishSpy, parameters.placement.getId(), finishState);
        });

        it('should remove the closer from the document', () => {
            assert.isNull(document.querySelector('#closer'));
        });
    });
});
