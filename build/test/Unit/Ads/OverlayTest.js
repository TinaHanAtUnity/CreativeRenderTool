import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Privacy } from 'Ads/Views/Privacy';
import { VideoOverlay } from 'Ads/Views/VideoOverlay';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { XPromoCampaign } from 'XPromo/Models/XPromoCampaign';
describe('OverlayTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let privacy;
    let videoOverlayParameters;
    let deviceInfo;
    let clientInfo;
    let coreConfig;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        privacy = new Privacy(platform, TestFixtures.getCampaign(), sinon.createStubInstance(UserPrivacyManager), false, false, 'en_FI');
        deviceInfo = { getLanguage: () => 'en', getAdvertisingIdentifier: () => '000', getLimitAdTracking: () => false, getOsVersion: () => '8.0' };
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        coreConfig = CoreConfigurationParser.parse(ConfigurationJson);
        const campaign = TestFixtures.getCampaign();
        const placement = TestFixtures.getPlacement();
        videoOverlayParameters = {
            platform,
            ads,
            deviceInfo: deviceInfo,
            campaign: campaign,
            coreConfig: coreConfig,
            placement: placement,
            clientInfo: clientInfo
        };
    });
    it('should render', () => {
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        overlay.render();
        assert.isNotNull(overlay.container().innerHTML);
        assert.isNotNull(overlay.container().querySelector('.skip-button'));
        assert.isNotNull(overlay.container().querySelector('.buffering-spinner'));
        assert.isNotNull(overlay.container().querySelector('.mute-button'));
        assert.isNotNull(overlay.container().querySelector('.debug-message-text'));
        assert.isNotNull(overlay.container().querySelector('.call-button'));
        assert.isNotNull(overlay.container().querySelector('.timer-button'));
        assert.isNotNull(overlay.container().querySelector('.gdpr-button'));
        assert.isNotNull(overlay.container().querySelector('.gdpr-pop-up'));
    });
    it('should render with translations', () => {
        videoOverlayParameters.deviceInfo.getLanguage = () => 'fi';
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        overlay.render();
        const callToActionElement = overlay.container().querySelectorAll('.call-button .download-text')[0];
        assert.equal(callToActionElement.innerHTML, 'Asenna nyt');
    });
    it('should render PerformanceCampaign with install button', () => {
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        overlay.render();
        assert.isNotNull(overlay.container().querySelector('.install-button'));
        assert.isNull(overlay.container().querySelector('.vast-button'));
    });
    it('should render VastCampaign with VAST call to action button', () => {
        videoOverlayParameters.campaign = TestFixtures.getCompanionStaticVastCampaign();
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        overlay.render();
        assert.isNotNull(overlay.container().querySelector('.vast-button'));
        assert.isNull(overlay.container().querySelector('.install-button'));
    });
    describe('triggerOnOverlayDownload', () => {
        let perfOverlayHandler;
        beforeEach(() => {
            perfOverlayHandler = sinon.createStubInstance(PerformanceOverlayEventHandler);
        });
        it('should call onOverlayDownload for performance campaign with correct parameters', () => {
            const campaign = sinon.createStubInstance(PerformanceCampaign);
            campaign.getClickAttributionUrl.returns('testClickAttributionUrl');
            campaign.getClickAttributionUrlFollowsRedirects.returns(false);
            campaign.getBypassAppSheet.returns(false);
            campaign.getAppStoreId.returns('testAppStore');
            campaign.getStore.returns(StoreName.STANDALONE_ANDROID);
            campaign.getAppDownloadUrl.returns('testAppDownloadUrl');
            videoOverlayParameters.campaign = campaign;
            const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            overlay.addEventHandler(perfOverlayHandler);
            overlay.triggerOnOverlayDownload();
            sinon.assert.called(perfOverlayHandler.onOverlayDownload);
            const firstCall = perfOverlayHandler.onOverlayDownload.args[0];
            const firstArg = firstCall[0];
            assert.equal(firstArg.clickAttributionUrl, 'testClickAttributionUrl');
            assert.equal(firstArg.clickAttributionUrlFollowsRedirects, false);
            assert.equal(firstArg.bypassAppSheet, false);
            assert.equal(firstArg.appStoreId, 'testAppStore');
            assert.equal(firstArg.store, StoreName.STANDALONE_ANDROID);
            assert.equal(firstArg.appDownloadUrl, 'testAppDownloadUrl');
            assert.equal(firstArg.videoProgress, undefined);
        });
        it('should call onOverlayDownload for xPromo campaign with correct parameters', () => {
            const campaign = sinon.createStubInstance(XPromoCampaign);
            campaign.getClickAttributionUrl.returns('testClickAttributionUrl');
            campaign.getClickAttributionUrlFollowsRedirects.returns(false);
            campaign.getBypassAppSheet.returns(false);
            campaign.getAppStoreId.returns('testAppStore');
            campaign.getStore.returns(StoreName.STANDALONE_ANDROID);
            videoOverlayParameters.campaign = campaign;
            const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            overlay.addEventHandler(perfOverlayHandler);
            overlay.triggerOnOverlayDownload();
            sinon.assert.called(perfOverlayHandler.onOverlayDownload);
            const firstCall = perfOverlayHandler.onOverlayDownload.args[0];
            const firstArg = firstCall[0];
            assert.equal(firstArg.clickAttributionUrl, 'testClickAttributionUrl');
            assert.equal(firstArg.clickAttributionUrlFollowsRedirects, false);
            assert.equal(firstArg.bypassAppSheet, false);
            assert.equal(firstArg.appStoreId, 'testAppStore');
            assert.equal(firstArg.store, StoreName.STANDALONE_ANDROID);
            assert.equal(firstArg.appDownloadUrl, undefined);
            assert.equal(firstArg.videoProgress, undefined);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3ZlcmxheVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL092ZXJsYXlUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBRXJFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUU1QyxPQUFPLEVBQUUsWUFBWSxFQUEyQixNQUFNLHdCQUF3QixDQUFDO0FBQy9FLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBSW5ELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBQy9FLE9BQU8saUJBQWlCLE1BQU0sbUNBQW1DLENBQUM7QUFJbEUsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sMERBQTBELENBQUM7QUFDMUcsT0FBTyxFQUFFLG1CQUFtQixFQUFFLFNBQVMsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3hGLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUU5RCxRQUFRLENBQUMsYUFBYSxFQUFFLEdBQUcsRUFBRTtJQUN6QixJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJQUMvQixJQUFJLElBQWMsQ0FBQztJQUNuQixJQUFJLEdBQVksQ0FBQztJQUNqQixJQUFJLE9BQXdCLENBQUM7SUFDN0IsSUFBSSxzQkFBeUQsQ0FBQztJQUM5RCxJQUFJLFVBQXNCLENBQUM7SUFDM0IsSUFBSSxVQUFzQixDQUFD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