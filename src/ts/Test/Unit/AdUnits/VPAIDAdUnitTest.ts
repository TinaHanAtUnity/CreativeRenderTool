import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { IVPAIDAdUnitParameters, VPAIDAdUnit } from 'AdUnits/VPAIDAdUnit';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { VPAIDParser } from 'Utilities/VPAIDParser';
import { VPAID } from 'Views/VPAID';
import { NativeBridge } from 'Native/NativeBridge';
import { ForceOrientation, AdUnitContainer } from 'AdUnits/Containers/AdUnitContainer';
import { Placement } from 'Models/Placement';
import { VPAIDEndScreen } from 'Views/VPAIDEndScreen';
import { AbstractOverlay } from 'Views/AbstractOverlay';
import { FocusManager } from 'Managers/FocusManager';
import { ClientInfo } from 'Models/ClientInfo';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { Configuration } from 'Models/Configuration';
import { Observable0 } from 'Utilities/Observable';
import { IObserver0 } from 'Utilities/IObserver';
import { WebPlayerApi } from 'Native/Api/WebPlayer';
import { Request } from 'Utilities/Request';
import { Activity } from 'AdUnits/Containers/Activity';
import { ListenerApi } from 'Native/Api/Listener';
import { FinishState } from 'Constants/FinishState';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { Closer } from 'Views/Closer';

describe('VPAIDAdUnit', () => {
    let nativeBridge: NativeBridge;
    let parameters: IVPAIDAdUnitParameters;
    let adUnit: VPAIDAdUnit;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);

        parameters = {
            campaign: sinon.createStubInstance(VPAIDCampaign),
            closer: sinon.createStubInstance(Closer),
            vpaid: sinon.createStubInstance(VPAID),
            endScreen: sinon.createStubInstance(VPAIDEndScreen),
            focusManager: sinon.createStubInstance(FocusManager),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: sinon.createStubInstance(OperativeEventManager),
            comScoreTrackingService: sinon.createStubInstance(ComScoreTrackingService),
            placement: TestFixtures.getPlacement(),
            container: sinon.createStubInstance(Activity),
            configuration: sinon.createStubInstance(Configuration),
            request: sinon.createStubInstance(Request),
            forceOrientation: ForceOrientation.NONE,
            options: {}
        };

        const webPlayer = sinon.createStubInstance(WebPlayerApi);
        (<sinon.SinonStub>webPlayer.setSettings).returns(Promise.resolve());
        (<sinon.SinonStub>webPlayer.setEventSettings).returns(Promise.resolve());
        (<any>nativeBridge).WebPlayer = webPlayer;

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
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.WebPlayer.setSettings);
            sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.WebPlayer.setEventSettings);
        });

        it('should open the container', () => {
            sinon.assert.calledOnce(<sinon.SinonSpy>parameters.container.open);
        });

        it('should show the closer', () => {
            assert.isNotNull(document.querySelector('#closer'));
        });

        afterEach(() => {
            return adUnit.hide();
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
