import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { IMRAIDAdUnitParameters, MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { MRAID } from 'MRAID/Views/MRAID';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { Platform } from 'Core/Constants/Platform';
import { IObserver0 } from 'Core/Utilities/IObserver';
import { FinishState } from 'Core/Constants/FinishState';
import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { Observable2, Observable0 } from 'Core/Utilities/Observable';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfo } from 'Backend/Api/DeviceInfo';
import { Campaign } from 'Ads/Models/Campaign';

// import { MRAIDAdUnit, IMRAIDAdUnitParameters } from 'AdUnits/MRAIDAdUnit';
// import { NativeBridge } from 'Native/NativeBridge';
// import { MRAID } from 'Views/MRAID';
// import { MRAIDEndScreen } from 'Views/MRAIDEndScreen';
// import { FocusManager } from 'Managers/FocusManager';
// import { DeviceInfo } from 'Models/DeviceInfo';
// import { ClientInfo } from 'Models/ClientInfo';
// import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
// import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
// import { Activity } from 'AdUnits/Containers/Activity';
// import { Configuration } from 'Models/Configuration';
// import { Orientation } from 'AdUnits/Containers/AdUnitContainer';
// import { GdprManager } from 'Managers/GdprManager';
// import { ProgrammaticTrackingService } from 'ProgrammaticTrackingService/ProgrammaticTrackingService';
// import { WebPlayerApi } from 'Native/Api/WebPlayer';
// import { ListenerApi } from 'Native/Api/Listener';
// import { Observable0, Observable2 } from 'Utilities/Observable';
// import { Request } from 'Utilities/Request';
// import { Platform } from 'Constants/Platform';
// import { FinishState } from 'Constants/FinishState';
// import { IObserver0 } from 'Utilities/IObserver';
// import { OperativeEventManager } from 'Managers/OperativeEventManager';
// import { MetaDataManager } from 'Managers/MetaDataManager';
// import { SessionManager } from 'Managers/SessionManager';
// import { Campaign } from 'Models/Campaign';
// import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
// import { GDPRPrivacy } from 'Views/GDPRPrivacy';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { FocusManager } from 'Core/Managers/FocusManager';

describe('MraidAdUnit', () => {
    let sandbox: sinon.SinonSandbox;
    let nativeBridge: NativeBridge;
    let mraidAdUnitParameters: IMRAIDAdUnitParameters;
    let mraidAdUnit: MRAIDAdUnit;
    let mraidView: MRAID;
    let operativeEventManager: OperativeEventManager;
    let gdprManager: GdprManager;

    before(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);

        mraidView = sinon.createStubInstance(MRAID);
        (<sinon.SinonSpy>mraidView.container).restore();
        sinon.stub(mraidView, 'container').returns(document.createElement('div'));
        gdprManager = sinon.createStubInstance(GdprManager);

        // (<any>nativeBridge).Listener = sinon.createStubInstance(ListenerApi);
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: sinon.createStubInstance(NativeBridge),
            request: sinon.createStubInstance(Request),
            metaDataManager: sinon.createStubInstance(MetaDataManager),
            sessionManager: sinon.createStubInstance(SessionManager),
            clientInfo: sinon.createStubInstance(ClientInfo),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            configuration: sinon.createStubInstance(CoreConfiguration),
            campaign: sinon.createStubInstance(Campaign)
        });

        mraidAdUnitParameters = {
            forceOrientation: Orientation.LANDSCAPE,
            focusManager: sinon.createStubInstance(FocusManager),
            container: sinon.createStubInstance(Activity),
            deviceInfo: sinon.createStubInstance(DeviceInfo),
            clientInfo: sinon.createStubInstance(ClientInfo),
            thirdPartyEventManager: sinon.createStubInstance(ThirdPartyEventManager),
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: TestFixtures.getExtendedMRAIDCampaign(),
            configuration: TestFixtures.getCoreConfiguration(),
            request: sinon.createStubInstance(Request),
            options: {},
            mraid: mraidView,
            endScreen: undefined,
            privacy: new GDPRPrivacy(nativeBridge, gdprManager, false, true),
            gdprManager: sinon.createStubInstance(GdprManager),
            programmaticTrackingService: sinon.createStubInstance(ProgrammaticTrackingService)
        };

        // const webPlayer = sinon.createStubInstance(WebPlayerApi);
        // (<sinon.SinonStub>webPlayer.setSettings).returns(Promise.resolve());
        // (<sinon.SinonStub>webPlayer.setEventSettings).returns(Promise.resolve());
        // webPlayer.shouldOverrideUrlLoading = new Observable2<string, string>();
        // (<any>nativeBridge).WebPlayer = webPlayer;

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
        const onShowTests = () => {
            let onStartObserver: IObserver0;

            beforeEach(() => {
                onStartObserver = sinon.spy();
                mraidAdUnit.onStart.subscribe(onStartObserver);
                return mraidAdUnit.show();
            });

            it('should trigger onStart', () => {
                sinon.assert.calledOnce(<sinon.SinonSpy>onStartObserver);
            });

            // xit('should set up the web player', () => {
            //     sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.WebPlayer.setSettings);
            //     sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.WebPlayer.setEventSettings);
            // });

            it('should open the container', () => {
                sinon.assert.calledOnce(<sinon.SinonSpy>mraidAdUnitParameters.container.open);
            });

            afterEach(() => {
                return mraidAdUnit.hide();
            });
        };

        describe('on android', () => {
            beforeEach(() => {
                (<sinon.SinonStub>nativeBridge.getPlatform).returns(Platform.ANDROID);
            });
            onShowTests();
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

        // it('should resolve when isShowing is false', () => {
        //     return mraidAdUnit.hide().then(() => {
        //         sinon.assert.notCalled(<sinon.SinonSpy>onCloseObserver);
        //         sinon.assert.notCalled(<sinon.SinonSpy>nativeBridge.Listener.sendFinishEvent);
        //     });
        // });

        it('should trigger on close', () => {
            return mraidAdUnit.show().then(() => mraidAdUnit.hide()).then(() => {
                sinon.assert.called(<sinon.SinonSpy>onCloseObserver);
            });
        });

        // it('should send the finish event', () => {
        //     return mraidAdUnit.show().then(() => mraidAdUnit.hide()).then(() => {
        //         sinon.assert.calledWith(<sinon.SinonSpy>nativeBridge.Listener.sendFinishEvent, mraidAdUnitParameters.placement.getId(), finishState);
        //     });
        // });

        it('should hide the endscreen if endscreen exists', () => {
            // need to set it as defined in constructor
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
                sinon.assert.calledWith(<sinon.SinonSpy>mraidAdUnitParameters.container.open, mraidAdUnit, ['webplayer', 'webview'], false, Orientation.NONE, true, false, true, false, {});
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

    describe('onContainerShow', () => {
        // TODO
    });

    describe('onContainerDestroy', () => {
        beforeEach(() => {
            sandbox.stub(mraidAdUnit, 'setFinishState');
            sandbox.stub(mraidAdUnit, 'hide');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should set finish state and hide the view if adunit is showing', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerDestroy();
                sinon.assert.calledWith(<sinon.SinonSpy>mraidAdUnit.setFinishState, FinishState.SKIPPED);
                sinon.assert.called(<sinon.SinonSpy>mraidAdUnit.hide);
            }).then(() => mraidAdUnit.hide());
        });

        it('should do nothing if adunit is not showing', () => {
            mraidAdUnit.onContainerDestroy();
            sinon.assert.notCalled(<sinon.SinonSpy>mraidAdUnit.setFinishState);
            sinon.assert.notCalled(<sinon.SinonSpy>mraidAdUnit.hide);
        });
    });

    describe('onContainerBackground', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should set viewable state to false', () => {
            return mraidAdUnit.show().then(() => {
                mraidAdUnit.onContainerBackground();
                sinon.assert.calledWith(<sinon.SinonSpy>mraidView.setViewableState, false);
            }).then(() => mraidAdUnit.hide());
        });

        it('should do nothing if adunit is not showing', () => {
            mraidAdUnit.onContainerBackground();
            sinon.assert.notCalled(<sinon.SinonSpy>mraidView.setViewableState);
        });
    });

    describe('onContainerForeground', () => {
        // TODO
    });
});
