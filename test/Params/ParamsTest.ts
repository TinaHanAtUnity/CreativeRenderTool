/*
import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { Request } from 'Utilities/Request';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { CampaignManager } from 'Managers/CampaignManager';
import { VastParser } from 'Utilities/VastParser';
import { Platform } from 'Constants/Platform';

describe('Parameter specification test', () => {
    let deviceInfo: DeviceInfo;
    let nativeBridge: NativeBridge;
    let request: Request;

    it('Ad request', () => {
        nativeBridge = TestFixtures.getNativeBridge();
        request = sinon.spy();
        let campaignManager: CampaignManager = new CampaignManager(nativeBridge, request, TestFixtures.getClientInfo(), TestFixtures.getDeviceInfo(Platform.ANDROID), new VastParser());
        campaignManager.request();

        console.log(request.getCall(0).args[0]);
    });
});
    */