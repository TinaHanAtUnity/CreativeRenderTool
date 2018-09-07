import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { ProgrammaticOperativeEventManager } from 'Ads/Managers/ProgrammaticOperativeEventManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ListenerApi } from 'Ads/Native/Listener';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { Closer } from 'Ads/Views/Closer';
import { assert } from 'chai';
import { FinishState } from 'Core/Constants/FinishState';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Configuration } from 'Core/Models/Configuration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IObserver0 } from 'Core/Utilities/IObserver';
import { Observable0, Observable2 } from 'Core/Utilities/Observable';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAID } from 'VPAID/Views/VPAID';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { GDPRPrivacy } from 'Ads/Views/GDPRPrivacy';

describe('VPAIDAdUnit', () => {
    let nativeBridge: NativeBridge;
    let webPlayerContainer: WebPlayerContainer;
    let parameters: IVPAIDAdUnitParameters;
    let adUnit: VPAIDAdUnit;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);

        webPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        (<sinon.SinonStub>webPlayerContainer.setSettings).returns(Promise.resolve());
        (<sinon.SinonStub>webPlayerContainer.setEventSettings).returns(Promise.resolve());
        (<any>webPlayerContainer).shouldOverrideUrlLoading = new Observable2<string, string>();

        parameters = {
            webPlayerContainer,
            campaign: sinon.createStubInstance(VPAIDCampaign),
            closer: sinon.createStubInstance(Closer),
            vpaid: sinon.createStubInstance(VPAID),
            endScreen: sinon.createStubInstance(VPAIDEndScreen),
            focusManager: sinon.createStubInstance(FocusManager),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(ProgrammaticOperativeEventManager),
            placement: TestFixtures.getPlacement(),
            container: sinon.createStubInstance(Activity),
            configuration: sinon.createStubInstance(Configuration),
            request: sinon.createStubInstance(Request),
            privacy: sinon.createStubInstance(GDPRPrivacy),
            forceOrientation: Orientation.NONE,
            options: {},
            gdprManager: sinon.createStubInstance(GdprManager),
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
        };

        (<any>nativeBridge).Listener = sinon.createStubInstance(ListenerApi);

        (<any>parameters.focusManager).onAppForeground = new Observable0();
        (<any>parameters.focusManager).onAppBackground = new Observable0();
        (<any>parameters.container).onShow = new Observable0();
        (<any>parameters.container).onAndroidPause = new Observable0();
        (<sinon.SinonStub>parameters.container.open).returns(Promise.resolve());
        (<sinon.SinonStub>parameters.container.close).returns(Promise.resolve());
        (<sinon.SinonStub>parameters.container.setViewFrame).returns(Promise.resolve());

        (<sinon.SinonStub>parameters.deviceInfo.getScreenWidth).returns(Promise.resolve(320));
        (<sinon.SinonStub>parameters.deviceInfo.getScreenHeight).returns(Promise.resolve(480));

        const overlayEl = document.createElement('div');
        overlayEl.setAttribute('id', 'closer');
        (<sinon.SinonStub>parameters.closer.container).returns(overlayEl);

        adUnit = new VPAIDAdUnit(nativeBridge, parameters);
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
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
            });
            onShowTests();
        });

        xdescribe('on ios', () => {
            beforeEach(() => {
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.IOS);
            });
            onShowTests();
        });
    });

    describe('on hide', () => {
        const finishState = FinishState.COMPLETED;
        let onCloseObserver: IObserver0;

        beforeEach(() => {
            onCloseObserver = sinon.spy();
            adUnit.onClose.subscribe(onCloseObserver);
            adUnit.setFinishState(finishState);
            const elements = document.querySelectorAll('#closer');
            // tslint:disable-next-line:prefer-for-of
            for (let i = 0; i < elements.length; i++) {
                elements[i].parentNode!.removeChild(elements[i]);
            }
            return adUnit.show().then(() => adUnit.hide());
        });

        it('should trigger on close', () => {
            sinon.assert.called(<sinon.SinonSpy>onCloseObserver);
        });

        it('should send the finish event', () => {
            sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendFinishEvent, parameters.placement.getId(), finishState);
        });

        it('should remove the closer from the document', () => {
            assert.isNull(document.querySelector('#closer'));
        });
    });
});
