import 'mocha';
import * as sinon from 'sinon';

import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Overlay } from 'Views/Overlay';
import { EndScreen } from 'Views/EndScreen';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'AdUnits/PerformanceAdUnit';
import { PerformanceOverlayEventHandler } from 'EventHandlers/PerformanceOverlayEventHandler';
import { Platform } from 'Constants/Platform';
import { AdUnitContainer, ForceOrientation } from 'AdUnits/Containers/AdUnitContainer';
import { Activity } from 'AdUnits/Containers/Activity';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Video } from 'Models/Assets/Video';
import { Request } from 'Utilities/Request';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ClientInfo } from 'Models/ClientInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { SessionManager } from 'Managers/SessionManager';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { MetaDataManager } from 'Managers/MetaDataManager';

describe('PerformanceOverlayEventHandlersTest', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge, overlay: Overlay, endScreen: EndScreen | undefined;
    let container: AdUnitContainer;
    let performanceAdUnit: PerformanceAdUnit;
    let video: Video;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let performanceOverlayEventHandler: PerformanceOverlayEventHandler;
    let request: Request;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        overlay = <Overlay><any> {};

        endScreen = <EndScreen><any> {
            show: sinon.spy(),
        };

        const metaDataManager = new MetaDataManager(nativeBridge);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getDeviceInfo(Platform.ANDROID);
        const focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        container = new Activity(nativeBridge, TestFixtures.getDeviceInfo(Platform.ANDROID));
        video = new Video('');
        const thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const sessionManager = new SessionManager(nativeBridge);
        const operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);

        performanceAdUnitParameters = {
            forceOrientation: ForceOrientation.LANDSCAPE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: <PerformanceCampaign><any>{
                getVideo: () => video,
                getStreamingVideo: () => video,
                getSession: () => TestFixtures.getSession()
            },
            configuration: TestFixtures.getConfiguration(),
            request: request,
            options: {},
            endScreen: endScreen,
            overlay: overlay,
            video: video
        };

        performanceAdUnit = new PerformanceAdUnit(nativeBridge, performanceAdUnitParameters);
        performanceOverlayEventHandler = new PerformanceOverlayEventHandler(nativeBridge, performanceAdUnit, performanceAdUnitParameters);
    });

    describe('with onSkip', () => {
        it('should show end screen', () => {
            performanceOverlayEventHandler.onOverlaySkip(1);

            endScreen = performanceAdUnit.getEndScreen();
            if(endScreen) {
                sinon.assert.called(<sinon.SinonSpy>endScreen.show);
            }
        });

        it('should trigger onFinish', () => {
            const spy = sinon.spy(performanceAdUnit.onFinish, 'trigger');

            performanceOverlayEventHandler.onOverlaySkip(1);

            sinon.assert.called(spy);
        });
    });

});
