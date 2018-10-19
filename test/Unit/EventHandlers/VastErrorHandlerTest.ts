import { assert } from 'chai';
import 'mocha';
import { VastErrorHandler, VastErrorCode } from 'VAST/EventHandlers/VastErrorHandler';
import { VastAd } from 'VAST/Models/VastAd';
import { Vast } from 'VAST/Models/Vast';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import * as sinon from 'sinon';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { Request } from 'Core/Utilities/Request';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';

describe('VastErrorHandlerTest', () => {
    const errorUrl = 'https://insight.adsrvr.org/enduser/video/?ve=error&vec=[ERRORCODE]&ast=[ASSETURI]';
    const assetUrl = 'https://asset/url';
    let vastAd: VastAd;
    let vast: Vast;
    let nativeBridge: NativeBridge;
    let request: Request;
    let thirdPartyManager: ThirdPartyEventManager;

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        const focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        thirdPartyManager = new ThirdPartyEventManager(nativeBridge, request);

        const errorURLTemplates: string[] = [];
        errorURLTemplates.push(errorUrl);
        vastAd = new VastAd();
        vast = new Vast([vastAd], errorURLTemplates);
    });

    it('should send correctly formatted url through thirdparty event manager', () => {
        const sessionId = 'test_session_id';
        const mockEventManager = sinon.mock(thirdPartyManager);
        mockEventManager.expects('sendWithGet').withArgs(`VAST error code ${VastErrorCode.UNDEFINED_ERROR} tracking`, sessionId, `https://insight.adsrvr.org/enduser/video/?ve=error&vec=${VastErrorCode.UNDEFINED_ERROR}&ast=[ASSETURI]`);

        VastErrorHandler.sendVastErrorEventWithThirdParty(vast, thirdPartyManager, sessionId);
        mockEventManager.verify();
    });

    it('should send correctly formatted url through request', () => {
        const errorCode = VastErrorCode.WRAPPER_GENERAL_ERROR;
        const mockRequest = sinon.mock(request);
        mockRequest.expects('get').withArgs(`https://insight.adsrvr.org/enduser/video/?ve=error&vec=${errorCode}&ast=${assetUrl}`, []);

        VastErrorHandler.sendVastErrorEventWithRequest(vast, request, errorCode, assetUrl);
        mockRequest.verify();
    });
});
