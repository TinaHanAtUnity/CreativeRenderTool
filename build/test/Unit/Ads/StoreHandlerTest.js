import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { RequestManager } from 'Core/Managers/RequestManager';
[Platform.ANDROID].forEach(platform => {
    describe('StoreHandler', () => {
        let backend;
        let nativeBridge;
        let core;
        let ads;
        let store;
        let ar;
        let focusManager;
        let thirdPartyEventManager;
        let wakeUpManager;
        let request;
        let downloadParameters;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);
            ar = TestFixtures.getARApi(nativeBridge);
            focusManager = new FocusManager(platform, core);
            wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        });
        describe('onDownload', () => {
            describe('with PerformanceCampaign', () => {
                let campaign;
                let adUnit;
                let storeHandler;
                beforeEach(() => {
                    campaign = TestFixtures.getCampaign();
                    adUnit = TestFixtures.getPerformanceAdUnit(platform, core, ads, store, ar);
                    storeHandler = TestFixtures.getStoreHandler(platform, core, ads, store, campaign, adUnit, thirdPartyEventManager, nativeBridge);
                    downloadParameters = TestFixtures.getStoreHandlerDownloadParameters(campaign);
                    return adUnit.show();
                });
                afterEach(() => {
                    return adUnit.hide();
                });
                it('should call nativeBridge.Listener.sendClickEvent', () => {
                    sinon.spy(ads.Listener, 'sendClickEvent');
                    storeHandler.onDownload(downloadParameters);
                    sinon.assert.calledOnce(ads.Listener.sendClickEvent);
                });
            });
            describe('with XPromoCampaign', () => {
                let xPromoAdUnit;
                let campaign;
                let storeHandler;
                beforeEach(() => {
                    campaign = TestFixtures.getXPromoCampaign();
                    xPromoAdUnit = TestFixtures.getXPromoAdUnit(platform, core, ads, store, ar);
                    storeHandler = TestFixtures.getStoreHandler(platform, core, ads, store, campaign, xPromoAdUnit, thirdPartyEventManager, nativeBridge);
                    downloadParameters = TestFixtures.getStoreHandlerDownloadParameters(campaign);
                    return xPromoAdUnit.show();
                });
                afterEach(() => {
                    return xPromoAdUnit.hide();
                });
                it('should call nativeBridge.Listener.sendClickEvent', () => {
                    sinon.spy(ads.Listener, 'sendClickEvent');
                    storeHandler.onDownload(downloadParameters);
                    sinon.assert.calledOnce(ads.Listener.sendClickEvent);
                });
                it('should not send a xpromo click when campaign has no tracking urls', () => {
                    sinon.stub(campaign, 'getTrackingUrlsForEvent').returns([]);
                    sinon.spy(thirdPartyEventManager, 'sendWithGet');
                    storeHandler.onDownload(downloadParameters);
                    sinon.assert.notCalled(thirdPartyEventManager.sendWithGet);
                });
                it('should send a xpromo click when campaign has tracking urls', () => {
                    sinon.spy(thirdPartyEventManager, 'sendWithGet');
                    storeHandler.onDownload(downloadParameters);
                    sinon.assert.calledWith(thirdPartyEventManager.sendWithGet, 'xpromo click', campaign.getSession().getId());
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmVIYW5kbGVyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvU3RvcmVIYW5kbGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUU3RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzFELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU1RCxPQUFPLE9BQU8sQ0FBQztBQUdmLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQU94RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFHOUQsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2xDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBRyxFQUFFO1FBRTFCLElBQUksT0FBZ0IsQ0FBQztRQUNyQixJQUFJLFlBQTBCLENBQUM7UUFDL0IsSUFBSSxJQUFjLENBQUM7UUFDbkIsSUFBSSxHQUFZLENBQUM7UUFDakIsSUFBSSxLQUFnQixDQUFDO1FBQ3JCLElBQUksRUFBVSxDQUFDO1FBQ2YsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksc0JBQThDLENBQUM7UUFDbkQsSUFBSSxhQUE0QixDQUFDO1FBQ2pDLElBQUksT0FBdUIsQ0FBQztRQUM1QixJQUFJLGtCQUFtRCxDQUFDO1FBRXhELFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUM1QyxZQUFZLEdBQUcsWUFBWSxDQUFDLGVBQWUs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