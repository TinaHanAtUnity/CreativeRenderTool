import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { StoreHandler, IStoreHandlerDownloadParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoAdUnit } from 'XPromo/AdUnits/XPromoAdUnit';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
import { IAdsApi } from 'Ads/IAds';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { IARApi } from 'AR/AR';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IPurchasingApi } from 'Purchasing/IPurchasing';

[Platform.ANDROID].forEach(platform => {
    describe('StoreHandler', () => {

        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let ads: IAdsApi;
        let ar: IARApi;
        let purchasing: IPurchasingApi;
        let focusManager: FocusManager;
        let thirdPartyEventManager: ThirdPartyEventManager;
        let wakeUpManager: WakeUpManager;
        let request: RequestManager;
        let downloadParameters: IStoreHandlerDownloadParameters;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            ar = TestFixtures.getARApi(nativeBridge);
            purchasing = TestFixtures.getPurchasingApi(nativeBridge);
            focusManager = new FocusManager(platform, core);
            wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        });

        describe('onDownload', () => {
            describe('with PerformanceCampaign', () => {
                let campaign: PerformanceCampaign;
                let adUnit: PerformanceAdUnit;
                let storeHandler: StoreHandler;

                beforeEach(() => {
                    campaign = TestFixtures.getCampaign();
                    adUnit = TestFixtures.getPerformanceAdUnit(platform, core, ads, ar, purchasing);
                    storeHandler = TestFixtures.getStoreHandler(platform, core, ads, campaign, adUnit, thirdPartyEventManager, nativeBridge);
                    downloadParameters = TestFixtures.getStoreHandlerDownloadParameters(campaign);
                });

                it('should call nativeBridge.Listener.sendClickEvent', () => {
                    sinon.spy(ads.Listener, 'sendClickEvent');
                    storeHandler.onDownload(downloadParameters);
                    sinon.assert.calledOnce(<sinon.SinonSpy>ads.Listener.sendClickEvent);
                });
            });

            describe('with XPromoCampaign', () => {
                let xPromoAdUnit: XPromoAdUnit;
                let campaign: XPromoCampaign;
                let storeHandler: StoreHandler;

                beforeEach(() => {
                    campaign = TestFixtures.getXPromoCampaign();
                    xPromoAdUnit = TestFixtures.getXPromoAdUnit(platform, core, ads, ar, purchasing);
                    storeHandler = TestFixtures.getStoreHandler(platform, core, ads, campaign, xPromoAdUnit, thirdPartyEventManager, nativeBridge);
                    downloadParameters = TestFixtures.getStoreHandlerDownloadParameters(campaign);
                });

                it('should call nativeBridge.Listener.sendClickEvent', () => {
                    sinon.spy(ads.Listener, 'sendClickEvent');
                    storeHandler.onDownload(downloadParameters);
                    sinon.assert.calledOnce(<sinon.SinonSpy>ads.Listener.sendClickEvent);
                });

                it('should not send a xpromo click when campaign has no tracking urls', () => {
                    sinon.stub(campaign, 'getTrackingUrlsForEvent').returns([]);
                    sinon.spy(thirdPartyEventManager, 'sendWithGet');
                    storeHandler.onDownload(downloadParameters);
                    sinon.assert.notCalled(<sinon.SinonSpy>thirdPartyEventManager.sendWithGet);
                });

                it('should send a xpromo click when campaign has tracking urls', () => {
                    sinon.spy(thirdPartyEventManager, 'sendWithGet');
                    storeHandler.onDownload(downloadParameters);
                    sinon.assert.calledWith(<sinon.SinonSpy>thirdPartyEventManager.sendWithGet, 'xpromo click', campaign.getSession().getId());
                });
            });
        });
    });
});
