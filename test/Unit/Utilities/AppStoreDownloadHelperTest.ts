import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AppStoreDownloadHelper, IAppStoreDownloadParameters } from 'Ads/Utilities/AppStoreDownloadHelper';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import 'mocha';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';

describe('AppStoreDownloadHelper', () => {

    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;
    let focusManager: FocusManager;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let wakeUpManager: WakeUpManager;
    let request: Request;
    let downloadParameters: IAppStoreDownloadParameters;

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        }, Platform.ANDROID);

        focusManager = new FocusManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
    });

    describe('onDownload', () => {
        describe('with PerformanceCampaign', () => {
            let campaign: PerformanceCampaign;
            let adUnit: PerformanceAdUnit;
            let downloadHelper: AppStoreDownloadHelper;

            beforeEach(() => {
                campaign = TestFixtures.getCampaign();
                adUnit = TestFixtures.getPerformanceAdUnit();
                downloadHelper = TestFixtures.getAppStoreDownloadHelper(campaign, adUnit, thirdPartyEventManager, nativeBridge);
                downloadParameters = TestFixtures.getAppStoreDownloadParameters(campaign);
            });

            it('should call nativeBridge.Listener.sendClickEvent', () => {
                sinon.spy(nativeBridge.Listener, 'sendClickEvent');
                downloadHelper.onDownload(downloadParameters);
                sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Listener.sendClickEvent);
            });
        });

        describe('with XPromoCampaign', () => {
            let xPromoAdUnit: XPromoAdUnit;
            let campaign: XPromoCampaign;
            let downloadHelper: AppStoreDownloadHelper;

            beforeEach(() => {
                campaign = TestFixtures.getXPromoCampaign();
                xPromoAdUnit = TestFixtures.getXPromoAdUnit();
                downloadHelper = TestFixtures.getAppStoreDownloadHelper(campaign, xPromoAdUnit, thirdPartyEventManager);
                downloadParameters = TestFixtures.getAppStoreDownloadParameters(campaign);
            });

            it('should call nativeBridge.Listener.sendClickEvent', () => {
                sinon.spy(nativeBridge.Listener, 'sendClickEvent');
                downloadHelper.onDownload(downloadParameters);
                sinon.assert.calledOnce(<sinon.SinonSpy>nativeBridge.Listener.sendClickEvent);
            });

            it('should not send a xpromo click when campaign has no tracking urls', () => {
                sinon.spy(thirdPartyEventManager, 'sendWithGet');
                downloadHelper.onDownload(downloadParameters);
                sinon.assert.notCalled(<sinon.SinonSpy>thirdPartyEventManager.sendWithGet);
            });

            it('should send a xpromo click when campaign has tracking urls', () => {
                const trackingUrl = 'http://fake-tracking-url.unity3d.com/';
                sinon.stub(campaign, 'getTrackingUrlsForEvent').returns([trackingUrl]);
                sinon.spy(thirdPartyEventManager, 'sendWithGet');
                downloadHelper.onDownload(downloadParameters);
                sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendWithGet, 'xpromo click', campaign.getSession().getId(), trackingUrl);
            });
        });
    });
});
