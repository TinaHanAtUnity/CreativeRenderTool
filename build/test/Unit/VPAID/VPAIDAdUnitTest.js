import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { ListenerApi } from 'Ads/Native/Listener';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Closer } from 'Ads/Views/Closer';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { Observable0, Observable2 } from 'Core/Utilities/Observable';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAID } from 'VPAID/Views/VPAID';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { PrivacySDK } from 'Privacy/PrivacySDK';
describe('VPAIDAdUnit', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let store;
    let ar;
    let webPlayerContainer;
    let parameters;
    let adUnit;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(Platform.ANDROID);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        store = TestFixtures.getStoreApi(nativeBridge);
        ar = TestFixtures.getARApi(nativeBridge);
        webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        webPlayerContainer.setSettings.returns(Promise.resolve());
        webPlayerContainer.setEventSettings.returns(Promise.resolve());
        webPlayerContainer.shouldOverrideUrlLoading = new Observable2();
        parameters = {
            platform,
            core,
            ads,
            store,
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
            privacyManager: sinon.createStubInstance(UserPrivacyManager),
            privacySDK: sinon.createStubInstance(PrivacySDK)
        };
        nativeBridge.Listener = sinon.createStubInstance(ListenerApi);
        parameters.focusManager.onAppForeground = new Observable0();
        parameters.focusManager.onAppBackground = new Observable0();
        parameters.container.onShow = new Observable0();
        parameters.container.onAndroidPause = new Observable0();
        parameters.container.open.returns(Promise.resolve());
        parameters.container.close.returns(Promise.resolve());
        parameters.container.setViewFrame.returns(Promise.resolve());
        parameters.deviceInfo.getScreenWidth.returns(Promise.resolve(320));
        parameters.deviceInfo.getScreenHeight.returns(Promise.resolve(480));
        const overlayEl = document.createElement('div');
        overlayEl.setAttribute('id', 'closer');
        parameters.closer.container.returns(overlayEl);
        adUnit = new VPAIDAdUnit(parameters);
    });
    describe('on show', () => {
        const onShowTests = () => {
            let onStartObserver;
            beforeEach(() => {
                onStartObserver = sinon.spy();
                adUnit.onStart.subscribe(onStartObserver);
                return adUnit.show();
            });
            it('should trigger onStart', () => {
                sinon.assert.calledOnce(onStartObserver);
            });
            it('should set up the web player', () => {
                sinon.assert.calledOnce(webPlayerContainer.setSettings);
                sinon.assert.calledOnce(webPlayerContainer.setEventSettings);
            });
            it('should open the container', () => {
                sinon.assert.calledOnce(parameters.container.open);
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
        let onCloseObserver;
        let finishSpy;
        beforeEach(() => {
            onCloseObserver = sinon.spy();
            adUnit.onClose.subscribe(onCloseObserver);
            adUnit.setFinishState(finishState);
            const elements = document.querySelectorAll('#closer');
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < elements.length; i++) {
                elements[i].parentNode.removeChild(elements[i]);
            }
            finishSpy = sinon.spy(ads.Listener, 'sendFinishEvent');
            return adUnit.show().then(() => adUnit.hide());
        });
        it('should trigger on close', () => {
            sinon.assert.called(onCloseObserver);
        });
        it('should send the finish event', () => {
            sinon.assert.calledWith(finishSpy, parameters.placement.getId(), finishState);
        });
        it('should remove the closer from the document', () => {
            assert.isNull(document.querySelector('#closer'));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURBZFVuaXRUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZQQUlEL1ZQQUlEQWRVbml0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDM0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBRXJFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxpQ0FBaUMsRUFBRSxNQUFNLGdEQUFnRCxDQUFDO0FBQ25HLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUNoRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDMUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNwRCxPQUFPLEVBQUUsaUJB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