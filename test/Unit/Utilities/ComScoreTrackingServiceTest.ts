import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import { NativeBridge } from 'Native/NativeBridge';
import { DeviceInfo } from 'Models/DeviceInfo';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { Platform } from 'Constants/Platform';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { Request } from 'Utilities/Request';

describe('ComScoreTrackingServiceTest', () => {
    const stubbedDateNowPlay: number = 3333;
    const stubbedDateNowEnd: number = 9999;
    const stubbedPlatform: number = 0;

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let deviceInfo: DeviceInfo;
    let request: Request;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let focusManager: FocusManager;

    let comscoreService: ComScoreTrackingService;
    let sha1edAdvertisingTrackingId: string;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        sinon.stub(nativeBridge, 'getPlatform').callsFake(() => stubbedPlatform);

        focusManager = new FocusManager(nativeBridge);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        comscoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);
        sha1edAdvertisingTrackingId = '55315d765868baf4ae1b54681af18d4db20a6056';
    });

    describe('when calling sendEvent', () => {
        let sendEventStub: sinon.SinonStub;
        beforeEach(() => {
            sendEventStub = sinon.stub(thirdPartyEventManager, 'sendEvent');
        });

        afterEach(() => {
            sendEventStub.restore();
        });

        it('thirdPartyManger\'s sendEvent is called', () => {
            comscoreService.sendEvent('play', TestFixtures.getSession().getId(), '20', 15, TestFixtures.getCampaign().getCreativeId(), undefined, undefined);
            sinon.assert.calledOnce(<sinon.SinonStub>thirdPartyEventManager.sendEvent);
        });
    });

    describe('when constructing url via setEventUrl()', () => {
        let sendEventStub: sinon.SinonStub;

        beforeEach(() => {
            sinon.stub(Date, 'now').onFirstCall().callsFake(() => stubbedDateNowPlay)
                .onSecondCall().callsFake(() => stubbedDateNowEnd);
            sendEventStub = sinon.stub(thirdPartyEventManager, 'sendEvent');
        });

        afterEach(() => {
            (<sinon.SinonStub>Date.now).restore();
            sendEventStub.restore();
        });

        let urlPlay: string;
        let urlEnd: string;
        let queryParamsDictPlay: any;
        let queryParamsDictEnd: any;

        const fillComscoreParams = () => {
            comscoreService.sendEvent('play', TestFixtures.getSession().getId(), '20', 0, TestFixtures.getCampaign().getCreativeId(), undefined, undefined);
            comscoreService.sendEvent('end', TestFixtures.getSession().getId(), '20', 15, TestFixtures.getCampaign().getCreativeId(), undefined, undefined);
            urlPlay = sendEventStub.firstCall.args[2];
            urlEnd = sendEventStub.secondCall.args[2];
            queryParamsDictPlay = getDictFromQueryString(urlPlay.split('?')[1]);
            queryParamsDictEnd = getDictFromQueryString(urlEnd.split('?')[1]);
        };

        it('should return the correct scheme, scorecardresearch hostname, and path', () => {
            fillComscoreParams();
            assert.isAbove(urlPlay.search('https://sb.scorecardresearch.com/p'), -1);
            assert.isAbove(urlEnd.search('https://sb.scorecardresearch.com/p'), -1);
        });

        it('the query parameters c1 should return the correct fixed value 19 in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.c1, '19');
            assert.equal(queryParamsDictEnd.c1, '19');
        });

        it('the query parameters c2 should return the correct client id in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.c2, '23027898');
            assert.equal(queryParamsDictEnd.c2, '23027898');
        });

        it('the query parameters ns_type should return the correct fixed value hidden in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_type, 'hidden');
            assert.equal(queryParamsDictEnd.ns_type, 'hidden');
        });

        it('the query parameters ns_st_ct should return the correct fixed value va00 in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_st_ct, 'va00');
            assert.equal(queryParamsDictEnd.ns_st_ct, 'va00');
        });

        it('the query parameters ns_ap_sv should return the correct fixed value 2.1602.11 in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_ap_sv, '2.1602.11');
            assert.equal(queryParamsDictEnd.ns_ap_sv, '2.1602.11');
        });

        it('the query parameters ns_st_it should return the correct fixed value a in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_st_it, 'a');
            assert.equal(queryParamsDictEnd.ns_st_it, 'a');
        });

        it('the query parameters ns_st_sv should return the correct fixed value 4.0.0 in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_st_sv, '4.0.0');
            assert.equal(queryParamsDictEnd.ns_st_sv, '4.0.0');
        });

        it('the query parameters ns_st_ad should return the correct fixed value 1 in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_st_ad, '1');
            assert.equal(queryParamsDictEnd.ns_st_ad, '1');
        });

        it('the query parameters ns_st_sq should return the correct fixed value 1 in url query parameter', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_st_sq, '1');
            assert.equal(queryParamsDictEnd.ns_st_sq, '1');
        });

        it('the query parameters should send sha1d adIdentifier when Device Limit Ad Tracking is turned off', () => {
            sinon.stub(deviceInfo, 'getLimitAdTracking').callsFake(() => false);
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.c12, sha1edAdvertisingTrackingId);
            assert.equal(queryParamsDictEnd.c12, sha1edAdvertisingTrackingId);
        });

        it('the query parameters should send deviceUniqueIdHash of "none" when Device Limit Ad Tracking is turned on', () => {
            sinon.stub(deviceInfo, 'getLimitAdTracking').callsFake(() => true);
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.c12, 'none');
            assert.equal(queryParamsDictEnd.c12, 'none');
        });

        it('the query parameters should return the correct platform', () => {
            const platform = TestFixtures.getNativeBridge(Platform.ANDROID).getPlatform();
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_ap_pn, Platform[platform].toLowerCase());
            assert.equal(queryParamsDictEnd.ns_ap_pn, Platform[platform].toLowerCase());
        });

        it('the query parameters should return the device model', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_ap_device, TestFixtures.getAndroidDeviceInfo().getModel());
            assert.equal(queryParamsDictEnd.ns_ap_device, TestFixtures.getAndroidDeviceInfo().getModel());
        });

        it('the query parameters should return the video eventName', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_st_ev, 'play');
            assert.equal(queryParamsDictEnd.ns_st_ev, 'end');
        });

        it('the query parameters should return the duration of the video', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_st_cl, '20');
            assert.equal(queryParamsDictEnd.ns_st_cl, '20');
        });

        it('the query parameters should send a Played Time value of "0" for the Playback Identity of "play"', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_st_pt, '0');
        });

        it('the query parameters should return the correct played time for the "end" playback identity constructed url', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictEnd.ns_st_pt, 15);
        });

        it('the query parameters should send a random number value equal to Date.now()', () => {
            fillComscoreParams();
            assert.equal(queryParamsDictPlay.ns_ts, stubbedDateNowPlay);
            assert.equal(queryParamsDictEnd.ns_ts, stubbedDateNowEnd);
        });
    });

    function getDictFromQueryString(queryString: string) {
        const keyValues: string[] = queryString.split('&');
        const dict: any = {};
        let splitKeyValue: string[];
        keyValues.forEach((el: string) => {
            splitKeyValue = el.split('=');
            dict[splitKeyValue[0]] = splitKeyValue[1];
        });

        return dict;
    }
});
